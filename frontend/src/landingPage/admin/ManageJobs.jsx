import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateJobPost from './CreateJobPost';
import './Post.css';
import { FaUsers, FaFileCsv, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';

const DEPARTMENTS = [
    'AIDS', 'BME', 'CHEM', 'CIVIL', 'CSE', 'AIML', 'Cyber Security', 
    'CSBS', 'ECE', 'EEE', 'IT', 'Mechanical', 'Mechatronics'
];

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMsg, setActionMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // State for eligible students
    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');
    const [showStudentsGrid, setShowStudentsGrid] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentSearchTerm, setStudentSearchTerm] = useState('');

    // State for editing
    const [editingJob, setEditingJob] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Modal handlers
    const openStudentModal = (student) => setSelectedStudent(student);
    const closeStudentModal = () => setSelectedStudent(null);

    // Filter students based on search term
    useEffect(() => {
        const results = eligibleStudents.filter(student =>
            student.fullName.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
            student.collegeEmail.toLowerCase().includes(studentSearchTerm.toLowerCase())
        );
        setFilteredStudents(results);
    }, [studentSearchTerm, eligibleStudents]);

    // Fetch all job posts
    const fetchJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('You must be logged in as an admin.');
                return;
            }
            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    role: 'admin'
                } 
            };
            const { data } = await axios.get('http://localhost:3002/api/jobs', config);
            setJobs(data);
        } catch (err) {
            setError('Failed to fetch job posts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // Handler to view eligible students
    const handleViewEligible = async (jobId, title) => {
        setLoadingStudents(true);
        setEligibleStudents([]);
        setFilteredStudents([]);
        setSelectedJobTitle(title);
        setSelectedJobId(jobId);
        setActionMsg('');
        setShowStudentsGrid(true);
        setStudentSearchTerm('');

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('You must be logged in as an admin.');
                return;
            }
            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    role: 'admin'
                } 
            };
            const { data } = await axios.get(`http://localhost:3002/api/jobs/${jobId}/eligible-students`, config);
            setEligibleStudents(data.students);
            setFilteredStudents(data.students);
        } catch (err) {
            setActionMsg(err.response?.data?.message || 'Failed to fetch students.');
        } finally {
            setLoadingStudents(false);
        }
    };

    // Handler to download CSV for currently viewed students
    const handleDownloadCurrentStudentsCSV = async () => {
        if (!selectedJobId) return;
        
        setActionMsg('Preparing download...');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('You must be logged in as an admin.');
                return;
            }
            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    role: 'admin'
                },
                responseType:'blob'
            };
            const response = await axios.get(`http://localhost:3002/api/jobs/${selectedJobId}/eligible-students/download`, config);

            // Create a link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const safeTitle = selectedJobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.setAttribute('download', `eligible_students_${safeTitle}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setActionMsg('Download started successfully!');
        } catch (err) {
            setActionMsg('Failed to download CSV.');
        }
    };

    // Handler to close students grid
    const handleCloseStudentsGrid = () => {
        setShowStudentsGrid(false);
        setEligibleStudents([]);
        setFilteredStudents([]);
        setSelectedJobTitle('');
        setSelectedJobId('');
        setActionMsg('');
        setStudentSearchTerm('');
        closeStudentModal();
    };

    // Handler to download CSV for a specific job
    const handleDownloadCSV = async (jobId, title) => {
        setActionMsg('Preparing download...');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('You must be logged in as an admin.');
                return;
            }
            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    role: 'admin'
                },
                responseType:'blob'
            };
            const response = await axios.get(`http://localhost:3002/api/jobs/${jobId}/eligible-students/download`, config);

            // Create a link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.setAttribute('download', `eligible_students_${safeTitle}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setActionMsg('Download started successfully!');
        } catch (err) {
            setActionMsg('Failed to download CSV.');
        }
    };

    // Handler to start editing
    const handleEditClick = (job) => {
        setEditingJob(job._id);
        setEditFormData({
            title: job.title,
            companyName: job.companyName,
            package: job.package,
            role: job.role,
            description: job.description,
            eligibleDepartments: job.eligibleDepartments || [],
            minCgpa: job.minCgpa,
            maxArrears: job.maxArrears,
            lastDate: job.lastDate ? job.lastDate.split('T')[0] : '',
            location: job.location
        });
    };

    // Handler to save edit
    const handleEditSave = async (jobId) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('You must be logged in as an admin.');
                return;
            }
            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            };
            await axios.put(`http://localhost:3002/api/jobs/${jobId}`, editFormData, config);
            setActionMsg('Job updated successfully!');
            setEditingJob(null);
            setEditFormData({});
            fetchJobs(); // Refresh the jobs list
        } catch (err) {
            setActionMsg(err.response?.data?.message || 'Failed to update job.');
        }
    };

    // Handler to cancel edit
    const handleEditCancel = () => {
        setEditingJob(null);
        setEditFormData({});
    };

    // Handler to delete job
    const handleDelete = async (jobId, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('You must be logged in as an admin.');
                return;
            }
            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`
                } 
            };
            await axios.delete(`http://localhost:3002/api/jobs/${jobId}`, config);
            setActionMsg('Job deleted successfully!');
            fetchJobs(); // Refresh the jobs list
        } catch (err) {
            setActionMsg(err.response?.data?.message || 'Failed to delete job.');
        }
    };

    // Handler for edit form changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handler for departments change in edit form
    const handleEditDeptChange = (e) => {
        const value = Array.from(e.target.selectedOptions, (option) => option.value);
        setEditFormData(prev => ({
            ...prev,
            eligibleDepartments: value
        }));
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <CreateJobPost onJobCreated={fetchJobs} />
            <div className="form-container" style={{ marginTop: '2rem', maxWidth: '1200px' }}>
                <div className="form-header">
                    <h2>Manage Job Posts</h2>
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search jobs by title..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {actionMsg && <p className={actionMsg.includes('success') ? 'success-message' : 'error-message'}>{actionMsg}</p>}
                
                {/* Jobs Grid */}
                {!showStudentsGrid && (
                    <>
                        {loading ? <p>Loading jobs...</p> : error ? <p className="error-message">{error}</p> : (
                            <div className="posts-grid">
                                {filteredJobs.length === 0 ? <p>No job posts found.</p> : (
                                    filteredJobs.map(job => (
                                        <div key={job._id} className="post-card">
                                            {/* Edit and Delete Icons in top right */}
                                            <div className="card-actions-top">
                                                <button 
                                                    className="icon-btn edit-icon" 
                                                    onClick={() => handleEditClick(job)}
                                                    title="Edit Job"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className="icon-btn delete-icon" 
                                                    onClick={() => handleDelete(job._id, job.title)}
                                                    title="Delete Job"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>

                                            {editingJob === job._id ? (
                                                /* Edit Form */
                                                <div className="edit-form">
                                                    <div className="form-group">
                                                        <label>Company Name:</label>
                                                        <input 
                                                            type="text" 
                                                            name="companyName" 
                                                            value={editFormData.companyName} 
                                                            onChange={handleEditFormChange} 
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Title:</label>
                                                        <input 
                                                            type="text" 
                                                            name="title" 
                                                            value={editFormData.title} 
                                                            onChange={handleEditFormChange} 
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Description:</label>
                                                        <textarea 
                                                            name="description" 
                                                            value={editFormData.description} 
                                                            onChange={handleEditFormChange} 
                                                            className="form-textarea"
                                                            rows="3"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Package:</label>
                                                        <input 
                                                            type="text" 
                                                            name="package" 
                                                            value={editFormData.package} 
                                                            onChange={handleEditFormChange} 
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Role:</label>
                                                        <input 
                                                            type="text" 
                                                            name="role" 
                                                            value={editFormData.role} 
                                                            onChange={handleEditFormChange} 
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Min CGPA:</label>
                                                        <input 
                                                            type="number" 
                                                            step="0.01"
                                                            name="minUgCgpa" 
                                                            value={editFormData.minUgCgpa} 
                                                            onChange={handleEditFormChange} 
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Allowed Departments:</label>
                                                        <select 
                                                            name="allowedDepts" 
                                                            multiple 
                                                            size="4" 
                                                            value={editFormData.allowedDepts} 
                                                            onChange={handleEditDeptChange} 
                                                            className="form-input"
                                                        >
                                                            {DEPARTMENTS.map(dept => (
                                                                <option key={dept} value={dept}>{dept}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="edit-actions">
                                                        <button className="save-btn" onClick={() => handleEditSave(job._id)}>
                                                            Save
                                                        </button>
                                                        <button className="cancel-btn" onClick={handleEditCancel}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Display Mode */
                                                <>
                                                    <h3>{job.title}</h3>
                                                    <p><strong>Company:</strong> {job.companyName || 'N/A'}</p>
                                                    <p className="post-description"><strong>Package:</strong> {job.package || 'N/A'}</p>
                                                    <p className="post-description"><strong>Role:</strong> {job.role || 'N/A'}</p>
                                                    <div className="card-actions">
                                                        <button className="action-btn view-btn" onClick={() => handleViewEligible(job._id, job.title)}>
                                                            <FaUsers /> View Eligible
                                                        </button>
                                                        <button className="action-btn download-btn" onClick={() => handleDownloadCSV(job._id, job.title)}>
                                                            <FaFileCsv /> Download CSV
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Eligible Students Grid - AdminDashboard Style */}
                {showStudentsGrid && (
                    <div className="students-container">
                        <div className="students-header">
                            <h2>Eligible Students for: {selectedJobTitle}</h2>
                            <div className="students-actions">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="search-bar"
                                    value={studentSearchTerm}
                                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                                />
                                <button 
                                    className="action-btn download-btn-header"
                                    onClick={handleDownloadCurrentStudentsCSV}
                                    title="Download CSV"
                                >
                                    <FaDownload /> Download CSV
                                </button>
                                <button 
                                    className="action-btn back-btn-header"
                                    onClick={handleCloseStudentsGrid}
                                >
                                    Back to Jobs
                                </button>
                            </div>
                        </div>
                        
                        {loadingStudents ? (
                            <p>Loading students...</p>
                        ) : (
                            <div className="table-wrapper">
                                <table className="students-table">
                                    <thead>
                                        <tr>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                            <th>Department</th>
                                            <th>Passing Year</th>
                                            <th>CGPA</th>
                                            <th>Current Arrears</th>
                                            <th>Photo</th>
                                            <th>Resume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr key={student._id}>
                                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.fullName}</td>
                                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.collegeEmail}</td>
                                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.dept}</td>
                                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.passoutYear}</td>
                                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.ugCgpa}</td>
                                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.currentArrears || 0}</td>
                                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.photoUrl ? 'Available' : 'N/A'}</td>
                                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.resumeUrl ? 'Available' : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Student Detail Modal */}
                        {selectedStudent && (
                            <div className="modal-backdrop" onClick={closeStudentModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>{selectedStudent.fullName}</h3>
                                        <button className="close-button" onClick={closeStudentModal}>×</button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="detail-item"><strong>College Email:</strong><span>{selectedStudent.collegeEmail || 'N/A'}</span></div>
                                        <div className="detail-item"><strong>Personal Email:</strong><span>{selectedStudent.personalEmail || 'N/A'}</span></div>
                                        <div className="detail-item"><strong>Roll No:</strong><span>{selectedStudent.rollNo || 'N/A'}</span></div>
                                        <div className="detail-item"><strong>University Reg:</strong><span>{selectedStudent.universityRegNumber || 'N/A'}</span></div>
                                        <div className="detail-item"><strong>Department:</strong><span>{selectedStudent.dept || 'N/A'}</span></div>
                                        <div className="detail-item"><strong>Passout Year:</strong><span>{selectedStudent.passoutYear || 'N/A'}</span></div>
                                        <div className="detail-item"><strong>UG CGPA:</strong><span>{selectedStudent.ugCgpa ?? 'N/A'}</span></div>
                                        <div className="detail-item"><strong>Current Arrears:</strong><span>{selectedStudent.currentArrears ?? 'N/A'}</span></div>
                                        <div className="detail-item"><strong>History of Arrears:</strong><span>{selectedStudent.historyOfArrears ?? 'N/A'}</span></div>
                                        <div className="detail-item"><strong>Mobile:</strong><span>{selectedStudent.mobileNumber || 'N/A'}</span></div>
                                        <div className="detail-item"><strong>Gender:</strong><span>{selectedStudent.gender || 'N/A'}</span></div>
                                        <div className="detail-item"><strong>Nationality:</strong><span>{selectedStudent.nationality || 'N/A'}</span></div>
                                        <div className="detail-item full">
                                            <strong>Photo:</strong>
                                            {selectedStudent.photoUrl ? (
                                                <img src={selectedStudent.photoUrl} alt="Student" className="student-photo" onError={(e)=>{e.currentTarget.style.display='none';}} />
                                            ) : (
                                                <span>N/A</span>
                                            )}
                                        </div>
                                        <div className="detail-item full">
                                            <strong>Resume:</strong>
                                            {selectedStudent.resumeUrl ? (
                                                <a href={selectedStudent.resumeUrl} target="_blank" rel="noreferrer">View Resume</a>
                                            ) : (
                                                <span>N/A</span>
                                            )}
                                        </div>
                                        {selectedStudent.codingProfiles && (
                                            <div className="detail-item full">
                                                <strong>Coding Profiles:</strong>
                                                <div className="profile-links">
                                                    {Object.entries(selectedStudent.codingProfiles).map(([k, v]) => (
                                                        v ? <a key={k} href={v} target="_blank" rel="noreferrer">{k}</a> : null
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {selectedStudent.languages && (
                                            <div className="detail-item full">
                                                <strong>Languages:</strong>
                                                <div>
                                                    {selectedStudent.languages.japanese?.knows ? `Japanese (${selectedStudent.languages.japanese.level || 'N/A'})` : 'Japanese: No'}
                                                    <br />
                                                    {selectedStudent.languages.german?.knows ? `German (${selectedStudent.languages.german.level || 'N/A'})` : 'German: No'}
                                                </div>
                                            </div>
                                        )}
                                        {selectedStudent.education && (
                                            <div className="detail-item full">
                                                <strong>Education:</strong>
                                                <div>
                                                    <div>10th: {selectedStudent.education.tenth?.percentage || 'N/A'}% ({selectedStudent.education.tenth?.board || 'N/A'})</div>
                                                    <div>12th: {selectedStudent.education.twelth?.percentage || 'N/A'}%</div>
                                                    {selectedStudent.education.diploma?.percentage && <div>Diploma: {selectedStudent.education.diploma.percentage}%</div>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="modal-actions">
                                        <button className="save-button" onClick={closeStudentModal}>Close</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageJobs;