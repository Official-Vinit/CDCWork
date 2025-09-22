import React, { useState } from 'react';
import axios from 'axios';
import './Post.css';

// Define departments as a constant
const DEPARTMENTS = [
    'AIDS', 'BME', 'CHEM', 'CIVIL', 'CSE', 'AIML', 'Cyber Security', 
    'CSBS', 'ECE', 'EEE', 'IT', 'Mechanical', 'Mechatronics'
];

const CreateJobPost = ({ onJobCreated }) => {
    const [formData, setFormData] = useState({
        companyName: '', // Changed from company to companyName
        title: '',
        description: '',
        package: '',
        role: '',
        passoutYear: new Date().getFullYear() + 1,
        minUgCgpa: '7.5',
        maxHistoryOfArrears: '0',
        maxCurrentArrears: '0',
        allowedDepts: DEPARTMENTS,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleDeptChange = (e) => {
        const { options } = e.target;
        const selectedDepts = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedDepts.push(options[i].value);
            }
        }
        setFormData({ ...formData, allowedDepts: selectedDepts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Admin not logged in.');
            return;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                role:'admin'
            },
        };

        // Remove hardcoded company ID and placeholders
        const postData = {
            ...formData,
        };

        try {
            await axios.post('http://localhost:3002/api/jobs', postData, config);
            setSuccess('Job post created successfully!');
            
            // Reset form
            setFormData({
                companyName: '', // Reset companyName field
                title: '', description: '', package: '', role: '',
                passoutYear: new Date().getFullYear() + 1, minUgCgpa: '7.5',
                maxHistoryOfArrears: '0', maxCurrentArrears: '0', allowedDepts: DEPARTMENTS,
            });
            
            if (onJobCreated) {
                onJobCreated(); // Refresh the list in the parent component
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create job post.');
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2>Create New Job Post</h2>
            </div>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                {/* Company Name field - changed from Company ID */}
                <div className="form-group">
                    <label htmlFor="companyName">Company Name</label>
                    <input 
                        type="text" 
                        id="companyName" 
                        name="companyName" 
                        className="form-input" 
                        value={formData.companyName} 
                        onChange={handleChange} 
                        placeholder="Enter company name (e.g., Google, Microsoft)"
                        required 
                    />
                </div>

                {/* Job Details */}
                <div className="form-group">
                    <label htmlFor="title">Job Title</label>
                    <input type="text" id="title" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Job Description</label>
                    <textarea id="description" name="description" className="form-textarea" rows="4" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="package">Package (e.g., 12 LPA)</label>
                    <input type="text" id="package" name="package" className="form-input" value={formData.package} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role (e.g., SDE-1)</label>
                    <input type="text" id="role" name="role" className="form-input" value={formData.role} onChange={handleChange} />
                </div>
                
                {/* Eligibility Criteria */}
                <div className="form-group">
                    <label htmlFor="passoutYear">Passout Year</label>
                    <input type="number" id="passoutYear" name="passoutYear" className="form-input" value={formData.passoutYear} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="minUgCgpa">Minimum CGPA</label>
                    <input type="number" step="0.01" id="minUgCgpa" name="minUgCgpa" className="form-input" value={formData.minUgCgpa} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="maxHistoryOfArrears">Max History of Arrears</label>
                    <input type="number" id="maxHistoryOfArrears" name="maxHistoryOfArrears" className="form-input" value={formData.maxHistoryOfArrears} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="maxCurrentArrears">Max Current Arrears</label>
                    <input type="number" id="maxCurrentArrears" name="maxCurrentArrears" className="form-input" value={formData.maxCurrentArrears} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="allowedDepts">Allowed Departments (Hold Ctrl/Cmd to select multiple)</label>
                    <select id="allowedDepts" name="allowedDepts" className="form-input" multiple size="8" value={formData.allowedDepts} onChange={handleDeptChange} >
                        {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="submit-btn">Create Post</button>
            </form>
        </div>
    );
};

export default CreateJobPost;