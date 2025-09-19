import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateJob from './CreateJob'; // The form component from before

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const config = { headers: { Authorization: `Bearer ${token}`,role: 'admin' } };
                // This call will now work
                const { data } = await axios.get('http://localhost:3002/api/jobs', config);
                setJobs(data);
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllJobs();
    }, []);

    if (loading) return <p>Loading jobs...</p>;

    return (
        <div>
            <CreateJob /> {/* The form to add a new job */}

            <div className="profile-card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h3>Posted Jobs</h3>
                </div>
                {jobs.map(job => (
                    <div key={job._id}>
                        <h4>{job.jobTitle} at {job.companyName}</h4>
                        <p>Passout Year: {job.eligibility.passoutYear}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageJobs;