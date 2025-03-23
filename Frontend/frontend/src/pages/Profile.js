import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [updatedUsername, setUpdatedUsername] = useState("");
    const [updatedPassword, setUpdatedPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchUserData();
    }, []);
    
    const fetchUserData = () => {
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        
        if (!token || !username) {
            navigate("/LoginOrSignup");
            return;
        }
        
        // Fetch user data
        fetch(`http://localhost:8080/user/username/${username}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            return response.json();
        })
        .then(data => {
            setUserData(data);
            setUpdatedUsername(data.username);
            setLoading(false);
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            setError(error.message);
            setLoading(false);
        });
    };
    
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/LoginOrSignup");
    };
    
    const toggleEditMode = () => {
        setEditMode(!editMode);
        setUpdatedPassword("");
        setConfirmPassword("");
        setUpdateMessage("");
    };
    
    const handleUpdateProfile = (e) => {
        e.preventDefault();
        setUpdateMessage("");
        
        // Validate passwords match if changing password
        if (updatedPassword && updatedPassword !== confirmPassword) {
            setUpdateMessage("Passwords do not match!");
            return;
        }
        
        const token = localStorage.getItem("token");
        
        // Prepare update data
        const updateData = {
            username: updatedUsername !== userData.username ? updatedUsername : null,
            password: updatedPassword || null
        };
        
        // Remove null values
        Object.keys(updateData).forEach(key => 
            updateData[key] === null && delete updateData[key]
        );
        
        // Don't send if nothing to update
        if (Object.keys(updateData).length === 0) {
            setUpdateMessage("No changes to update");
            return;
        }
        
        fetch(`http://localhost:8080/user/editUser/${userData.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update profile");
            }
            return response.text();
        })
        .then(result => {
            setUpdateMessage("Profile updated successfully!");
            
            // If username was changed, update localStorage
            if (updateData.username) {
                localStorage.setItem("username", updatedUsername);
            }
            
            // Refresh user data
            fetchUserData();
            
            // Exit edit mode
            setEditMode(false);
            setUpdatedPassword("");
            setConfirmPassword("");
        })
        .catch(error => {
            console.error("Error updating profile:", error);
            setUpdateMessage("Error: " + error.message);
        });
    };
    
    return (
        <div>
            <nav style={styles.nav}>
                <Link to="/" style={styles.navLink}> Home </Link>
                <Link to="/Admin" style={styles.navLink}> Admin </Link>
                <Link to="/LoginOrSignup" style={styles.navLink}> LoginOrSignup</Link>
                <Link to="/Profile" style={styles.navLink}> Profile </Link>
                <Link to="/Tierlist" style={styles.navLink}> TierList </Link>
            </nav>

            <h1 style={styles.heading}>User Profile</h1>
            
            {loading ? (
                <p style={styles.centeredText}>Loading user data...</p>
            ) : error ? (
                <div style={styles.errorContainer}>
                    <p>{error}</p>
                </div>
            ) : userData ? (
                <div style={styles.card}>
                    {!editMode ? (
                        // View mode
                        <div>
                            <h2>Welcome, {userData.username}!</h2>
                            <p><strong>User ID:</strong> {userData.id}</p>
                            <p><strong>Role:</strong> {userData.role}</p>
                            
                            <div style={styles.buttonContainer}>
                                <button onClick={toggleEditMode} style={styles.primaryButton}>
                                    Edit Profile
                                </button>
                                
                                <button onClick={handleLogout} style={styles.dangerButton}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Edit mode
                        <div>
                            <h2>Edit Profile</h2>
                            <form onSubmit={handleUpdateProfile}>
                                <div>
                                    <label htmlFor="username">Username:</label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={updatedUsername}
                                        onChange={(e) => setUpdatedUsername(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password">New Password (leave blank to keep current):</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={updatedPassword}
                                        onChange={(e) => setUpdatedPassword(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                {updatedPassword && (
                                    <div>
                                        <label htmlFor="confirmPassword">Confirm Password:</label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            style={styles.input}
                                            required={!!updatedPassword}
                                        />
                                    </div>
                                )}
                                
                                <div style={styles.buttonContainer}>
                                    <button type="submit" style={styles.primaryButton}>
                                        Save Changes
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={toggleEditMode}
                                        style={styles.neutralButton}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                            
                            {updateMessage && (
                                <div style={
                                    updateMessage.includes("Error") || updateMessage.includes("not match")
                                        ? styles.errorMessage
                                        : styles.successMessage
                                }>
                                    {updateMessage}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p style={styles.centeredText}>No user data available</p>
            )}
        </div>
    );
}

const styles = {
    nav: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        padding: "10px",
        backgroundColor: "#f8f8f8",
        borderRadius: "5px"
    },
    navLink: {
        margin: "0 10px"
    },
    heading: {
        textAlign: "center"
    },
    centeredText: {
        textAlign: "center"
    },
    errorContainer: {
        color: "red",
        textAlign: "center"
    },
    card: {
        padding: "20px", 
        border: "1px solid #ddd", 
        borderRadius: "5px",
        maxWidth: "500px",
        margin: "0 auto"
    },
    input: {
        width: "100%",
        padding: "8px",
        margin: "8px 0",
        display: "inline-block",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxSizing: "border-box"
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "15px"
    },
    primaryButton: {
        marginTop: "10px",
        marginRight: "10px",
        padding: "10px 15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    },
    dangerButton: {
        marginTop: "10px",
        marginRight: "10px",
        padding: "10px 15px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    },
    neutralButton: {
        marginTop: "10px",
        marginRight: "10px",
        padding: "10px 15px",
        backgroundColor: "#cccccc",
        color: "black",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    },
    successMessage: {
        padding: "10px",
        backgroundColor: "#ccffcc",
        borderRadius: "4px",
        marginTop: "10px",
        color: "#006600"
    },
    errorMessage: {
        padding: "10px",
        backgroundColor: "#ffcccc",
        borderRadius: "4px",
        marginTop: "10px",
        color: "#990000"
    }
};