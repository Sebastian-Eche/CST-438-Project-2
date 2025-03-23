import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ 
        username: "", 
        password: "", 
        role: "ROLE_USER" 
    });
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    // Check if user is authenticated on component mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            setErrorMessage("Please log in to access the admin page");
            setTimeout(() => {
                navigate("/LoginOrSignup");
            }, 2000);
        } else {
            setToken(storedToken);
            fetchUsers();
        }
    }, [navigate]);

    const fetchUsers = () => {
        setErrorMessage("");
        fetch("http://localhost:8080/user/all", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }) 
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error("You don't have permission to access this page");
                    }
                    throw new Error("Failed to fetch users");
                }
                return response.json();
            })
            .then((data) => setUsers(data))
            .catch((error) => {
                console.error("Error fetching users:", error);
                setErrorMessage(error.message);
                if (error.message.includes("permission")) {
                    setTimeout(() => {
                        navigate("/LoginOrSignup");
                    }, 2000);
                }
            });
    };

    // Handles changes in input fields for existing users
    const handleEdit = (id, field, value) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, [field]: value } : user
        ));
    };

    // Save updated user data
    const handleSave = (user) => {
        fetch(`http://localhost:8080/user/editUser/${user.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                username: user.username,
                password: user.password
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update user");
            }
            return response.text();
        })
        .then(result => {
            console.log("User updated successfully:", result);
            fetchUsers(); // Refresh user list
        })
        .catch(error => {
            console.error("Error updating user:", error);
            setErrorMessage(error.message);
        });
    };

    // Delete user from database
    const handleDelete = (id) => {
        fetch(`http://localhost:8080/user/deleteUser/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to delete user");
            }
            return response.text();
        })
        .then(result => {
            setUsers(users.filter(user => user.id !== id));
            console.log("User deleted successfully:", result);
        })
        .catch(error => {
            console.error("Error deleting user:", error);
            setErrorMessage(error.message);
        });
    };

    // Handle input changes for new user form
    const handleNewUserChange = (field, value) => {
        setNewUser(prev => ({ ...prev, [field]: value }));
    };

    // Add a new user to the database
    const handleAddUser = () => {
        if (!newUser.username || !newUser.password) {
            setErrorMessage("Username and password are required!");
            return;
        }

        // Using the PUT endpoint for admin to create users
        fetch(`http://localhost:8080/user/put?username=${encodeURIComponent(newUser.username)}&password=${encodeURIComponent(newUser.password)}&role=${encodeURIComponent(newUser.role)}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to add user");
            }
            return response.text();
        })
        .then(result => {
            console.log("User added successfully:", result);
            setNewUser({ username: "", password: "", role: "ROLE_USER" });
            fetchUsers(); // Refresh the list of users
            setErrorMessage("");
        })
        .catch(error => {
            console.error("Error adding user:", error);
            setErrorMessage(error.message);
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

            <h1>Admin Page</h1>
            <p>Manage users below:</p>

            {errorMessage && (
                <div style={styles.errorMessage}>
                    {errorMessage}
                </div>
            )}

            {/* Add User Form */}
            <h2>Add User</h2>
            <div style={styles.addUserForm}>
                <input
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => handleNewUserChange("username", e.target.value)}
                    style={styles.formInput}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => handleNewUserChange("password", e.target.value)}
                    style={styles.formInput}
                />
                <select 
                    value={newUser.role} 
                    onChange={(e) => handleNewUserChange("role", e.target.value)}
                    style={styles.formInput}
                >
                    <option value="ROLE_USER">User</option>
                    <option value="ROLE_ADMIN">Admin</option>
                </select>
                <button 
                    onClick={handleAddUser}
                    style={styles.addButton}
                >
                    Add User
                </button>
            </div>

            <h2>User Management</h2>
            {users.length === 0 && !errorMessage ? (
                <p>Loading users...</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeader}>ID</th>
                            <th style={styles.tableHeader}>Username</th>
                            <th style={styles.tableHeader}>Password</th>
                            <th style={styles.tableHeader}>Role</th>
                            <th style={styles.tableHeader}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td style={styles.tableCell}>{user.id}</td>
                                <td style={styles.tableCell}>
                                    <input
                                        type="text"
                                        value={user.username}
                                        onChange={(e) => handleEdit(user.id, "username", e.target.value)}
                                        style={styles.tableInput}
                                    />
                                </td>
                                <td style={styles.tableCell}>
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={user.password || ""}
                                        onChange={(e) => handleEdit(user.id, "password", e.target.value)}
                                        style={styles.tableInput}
                                    />
                                </td>
                                <td style={styles.tableCell}>
                                    {user.role}
                                </td>
                                <td style={styles.tableCell}>
                                    <button 
                                        onClick={() => handleSave(user)}
                                        style={styles.saveButton}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id)} 
                                        style={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
    errorMessage: {
        backgroundColor: "#ffcccc",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "15px"
    },
    addUserForm: {
        marginBottom: "20px"
    },
    formInput: {
        marginRight: "10px",
        padding: "8px"
    },
    addButton: {
        padding: "8px 16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    tableHeader: {
        border: "1px solid #ddd",
        padding: "8px",
        textAlign: "left"
    },
    tableCell: {
        border: "1px solid #ddd",
        padding: "8px"
    },
    tableInput: {
        width: "100%",
        padding: "5px"
    },
    saveButton: {
        marginRight: "5px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer"
    },
    deleteButton: {
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer"
    }
};