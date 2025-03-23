import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginOrSignup() {
    const [activeTab, setActiveTab] = useState("login");
    const navigate = useNavigate();
    
    // Login state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    // Signup state
    const [signupUsername, setSignupUsername] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Messages
    const [loginMessage, setLoginMessage] = useState("");
    const [signupMessage, setSignupMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginMessage("");
        
        try {
            const params = new URLSearchParams();
            params.append("username", username);
            params.append("password", password);
            
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            });
            
            if (!response.ok) {
                throw new Error(`Login failed: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Login successful:", data);
            
            // Store token and user info
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            
            // Redirect to profile page
            navigate("/profile");
        } catch (error) {
            console.error("Error during login:", error);
            setLoginMessage(error.message || "Authentication failed. Please check your credentials.");
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setSignupMessage("");
        
        if (signupPassword !== confirmPassword) {
            setSignupMessage("Passwords do not match!");
            return;
        }
        
        try {
            const params = new URLSearchParams();
            params.append("username", signupUsername);
            params.append("password", signupPassword);
            
            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            });
            
            const data = await response.text();
            
            if (response.ok) {
                console.log("Signup successful");
                setSignupMessage("Registration successful! You can now log in.");
                // Clear signup form
                setSignupUsername("");
                setSignupPassword("");
                setConfirmPassword("");
                // Switch to login tab
                setActiveTab("login");
            } else {
                setSignupMessage("Registration failed: " + data);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            setSignupMessage("An error occurred during registration. Please try again.");
        }
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

            <h1>Login Or Signup</h1>
            
            <div style={styles.tabContainer}>
                <button 
                    style={activeTab === "login" ? styles.activeTabButton : styles.tabButton}
                    onClick={() => setActiveTab("login")}
                >
                    Login
                </button>
                <button 
                    style={activeTab === "signup" ? styles.activeTabButton : styles.tabButton}
                    onClick={() => setActiveTab("signup")}
                >
                    Sign Up
                </button>
            </div>
            
            {activeTab === "login" ? (
                <div style={styles.formContainer}>
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="username">Username:</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password:</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        <button type="submit" style={styles.button}>Login</button>
                    </form>
                    
                    {loginMessage && (
                        <div style={loginMessage.includes("failed") || loginMessage.includes("error") ? 
                            styles.errorMessage : styles.successMessage}>
                            {loginMessage}
                        </div>
                    )}
                </div>
            ) : (
                <div style={styles.formContainer}>
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSignup}>
                        <div>
                            <label htmlFor="signupUsername">Username:</label>
                            <input
                                id="signupUsername"
                                type="text"
                                value={signupUsername}
                                onChange={(e) => setSignupUsername(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="signupPassword">Password:</label>
                            <input
                                id="signupPassword"
                                type="password"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword">Confirm Password:</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        <button type="submit" style={styles.button}>Sign Up</button>
                    </form>
                    
                    {signupMessage && (
                        <div style={signupMessage.includes("failed") || signupMessage.includes("error") || signupMessage.includes("not match") ? 
                            styles.errorMessage : styles.successMessage}>
                            {signupMessage}
                        </div>
                    )}
                </div>
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
    tabContainer: {
        display: "flex",
        marginBottom: "20px"
    },
    tabButton: {
        padding: "10px 20px",
        backgroundColor: "#f1f1f1",
        color: "black",
        border: "1px solid #ccc",
        cursor: "pointer",
        flexGrow: 1,
        textAlign: "center"
    },
    activeTabButton: {
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "1px solid #ccc",
        cursor: "pointer",
        flexGrow: 1,
        textAlign: "center"
    },
    formContainer: {
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "5px"
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
    button: {
        width: "100%",
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "14px 20px",
        margin: "8px 0",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
    },
    errorMessage: {
        color: "red",
        marginTop: "10px"
    },
    successMessage: {
        color: "green",
        marginTop: "10px"
    }
};