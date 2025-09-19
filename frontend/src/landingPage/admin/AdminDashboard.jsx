import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]); // This is what we'll display
    const [searchTerm, setSearchTerm] = useState(''); // For the search input
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const openStudentModal = (student) => setSelectedStudent(student);
    const closeStudentModal = () => setSelectedStudent(null);

    useEffect(() => {
        // Check admin privilege
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            navigate('/'); // Redirect to login or home
            return;
        }

        const fetchStudents = async () => {
            try {
                // Get the token from localStorage
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('No authentication token found. Please login.');
                    setLoading(false);
                    return;
                }

                // Set up the authorization header
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        role: 'admin'
                    },
                };

                // Make the API call to our new endpoint
                const { data } = await axios.get('http://localhost:3002/api/users', config);
                setStudents(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch students. You may not have admin privileges.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [navigate]);

    useEffect(() => {
        const results = students.filter(student =>
            student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    if (loading) return <p>Loading students...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="students-container">
            {/* Add CreatePost form at the top */}
       

            <div className="students-header">
                <h2>All Student Details</h2>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="search-bar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="table-wrapper">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Passing Year</th>
                            <th>CGPA</th>
                            <th>Arrears</th>
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
                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.arrears}</td>
                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.photoUrl || 'N/A'}</td>
                                <td className="clickable-cell" onClick={() => openStudentModal(student)}>{student.resumeUrl || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedStudent && (
                <div className="modal-backdrop" onClick={closeStudentModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedStudent.fullName}</h3>
                            <button className="close-button" onClick={closeStudentModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-item"><strong>College Email:</strong><span>{selectedStudent.collegeEmail || 'N/A'}</span></div>
                            <div className="detail-item"><strong>Personal Email:</strong><span>{selectedStudent.email || 'N/A'}</span></div>
                            <div className="detail-item"><strong>Department:</strong><span>{selectedStudent.dept || 'N/A'}</span></div>
                            <div className="detail-item"><strong>Passout Year:</strong><span>{selectedStudent.passoutYear || 'N/A'}</span></div>
                            <div className="detail-item"><strong>UG CGPA:</strong><span>{selectedStudent.ugCgpa ?? 'N/A'}</span></div>
                            <div className="detail-item"><strong>Arrears:</strong><span>{selectedStudent.arrears ?? 'N/A'}</span></div>
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
                        </div>
                        <div className="modal-actions">
                            <button className="save-button" onClick={closeStudentModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;