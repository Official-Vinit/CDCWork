import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// Add an icon for the admin view
import { FaTachometerAlt, FaUser, FaClipboardList, FaSignOutAlt, FaUsersCog, FaTasks,FaPaperPlane,FaComments } from 'react-icons/fa';
import './sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    // 1. Add state to hold the current user's role
    const [userRole, setUserRole] = useState(null);

    // 2. Load the user data from localStorage when the component mounts
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserRole(user.role);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-main-nav">
                <div className="sidebar-header">
                    <h3>Placement Cell</h3>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {/* 3. Conditionally render links based on user role */}

                        {/* === STUDENT LINKS === */}
                        {userRole === 'student' && (
                            <>
                                <li>
                                    <NavLink to="/student/availableJob">
                                        <FaTachometerAlt /> <span>Job Listings</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/student/profile">
                                        <FaUser /> <span>My Profile</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/student/applications">
                                        <FaClipboardList /> <span>Applications</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/student/ViewPost">
                                    <FaComments/><span>Posts</span>
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {/* === ADMIN LINKS === */}
                        {userRole === 'admin' && (
                            <>
                                <li>
                                    <NavLink to="/admin/dashboard">
                                        <FaUsersCog /> <span>Manage Students</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/applications">
                                        <FaTasks /> <span>Manage Applications</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/Post">
                                    <FaPaperPlane/><span> Posts</span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/JobsPosts">
                                    <FaPaperPlane/><span> Create Job</span>
                                    </NavLink>
                                </li>
                                {/* Add more admin-specific links here in the future */}
                            </>
                        )}
                    </ul>
                </nav>
            </div>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-button">
                    <FaSignOutAlt /> <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;