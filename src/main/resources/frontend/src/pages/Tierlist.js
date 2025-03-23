import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Tierlist() {
  const [userTiers, setUserTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTierId, setEditingTierId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectEntries, setSubjectEntries] = useState([]);
  const [userId, setUserId] = useState(null);
  const [draggingEntry, setDraggingEntry] = useState(null);
  
  // Tier creation state with entry tracking
  const [tierEntries, setTierEntries] = useState({
    s: [],
    a: [],
    b: [],
    c: [],
    d: [],
    f: []
  });
  
  // Editing tier state
  const [editTier, setEditTier] = useState({
    subject: "",
    s: "",
    a: "",
    b: "",
    c: "",
    d: "",
    f: ""
  });

  useEffect(() => {
    fetchUserData();
    fetchSubjects();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError("");
    
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    
    if (!token || !username) {
      setError("You must be logged in to view your tier lists");
      setLoading(false);
      return;
    }
    
    try {
      // Get user ID from username
      const userResponse = await fetch(`/user/username/${username}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await userResponse.json();
      setUserId(userData.id);
      
      // Fetch tiers for this user
      await fetchUserTiers(userData.id);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchUserTiers = async (id) => {
    const token = localStorage.getItem("token");
    
    try {
      const tiersResponse = await fetch(`/tier/getByUserId/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!tiersResponse.ok) {
        throw new Error("Failed to fetch tier lists");
      }
      
      const tiersData = await tiersResponse.json();
      setUserTiers(tiersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tiers:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch("/tier/getSubjects", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError(err.message);
    }
  };

  const fetchSubjectEntries = async (subjectId) => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`/tier/${subjectId}/entries`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch subject entries");
      }
      
      const data = await response.json();
      setSubjectEntries(data);
      
      // Reset tier entries when subject changes
      setTierEntries({
        s: [],
        a: [],
        b: [],
        c: [],
        d: [],
        f: []
      });
    } catch (err) {
      console.error("Error fetching subject entries:", err);
      setError(err.message);
    }
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    
    if (subjectId) {
      fetchSubjectEntries(subjectId);
    } else {
      setSubjectEntries([]);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, entryId) => {
    setDraggingEntry(entryId);
    e.dataTransfer.setData("text/plain", entryId);
    // Add a ghost image effect for drag
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, tier) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, tier) => {
    e.preventDefault();
    const entryId = parseInt(e.dataTransfer.getData("text/plain"));
    
    // First remove from any tier it might be in
    const updatedTierEntries = { ...tierEntries };
    
    Object.keys(updatedTierEntries).forEach(t => {
      updatedTierEntries[t] = updatedTierEntries[t].filter(id => id !== entryId);
    });
    
    // Add to the new tier
    updatedTierEntries[tier] = [...updatedTierEntries[tier], entryId];
    setTierEntries(updatedTierEntries);
    setDraggingEntry(null);
  };

  const removeFromTier = (tier, entryId) => {
    const updatedTierEntries = { ...tierEntries };
    updatedTierEntries[tier] = updatedTierEntries[tier].filter(id => id !== entryId);
    setTierEntries(updatedTierEntries);
  };

  const handleCreateTier = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("You must be logged in to create a tier list");
      return;
    }
    
    // Find the subject name from the ID
    const subjectObj = subjects.find(s => s.id === parseInt(selectedSubject));
    if (!subjectObj) {
      setError("Please select a valid subject");
      return;
    }
    
    // Convert the tierEntries object into string format for API
    const tierData = {};
    
    Object.keys(tierEntries).forEach(tier => {
      const entries = tierEntries[tier];
      if (entries.length > 0) {
        // Join the entry names with commas for multiple entries
        const entryNames = entries.map(entryId => {
          const entry = subjectEntries.find(e => e.id === entryId);
          return entry ? entry.entryName : "";
        }).filter(name => name !== "").join(", ");
        
        tierData[tier] = entryNames;
      } else {
        tierData[tier] = "";
      }
    });
    
    // Prepare tier data for saving
    const newTier = {
      subject: subjectObj.name,
      s: tierData.s,
      a: tierData.a,
      b: tierData.b,
      c: tierData.c,
      d: tierData.d,
      f: tierData.f,
      userId: userId
    };
    
    try {
      const response = await fetch("/tier/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newTier)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create tier list");
      }
      
      // Reset form
      setSelectedSubject("");
      setSubjectEntries([]);
      setTierEntries({
        s: [],
        a: [],
        b: [],
        c: [],
        d: [],
        f: []
      });
      
      // Refresh tier lists
      fetchUserTiers(userId);
    } catch (err) {
      console.error("Error creating tier list:", err);
      setError(err.message);
    }
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tier list?")) {
      return;
    }
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`/tier/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete tier list");
      }
      
      // Refresh tier lists
      fetchUserTiers(userId);
    } catch (err) {
      console.error("Error deleting tier list:", err);
      setError(err.message);
    }
  };

  const startEditing = (tier) => {
    setEditingTierId(tier.id);
    setEditTier({
      subject: tier.subject,
      s: tier.s,
      a: tier.a,
      b: tier.b,
      c: tier.c,
      d: tier.d,
      f: tier.f
    });
  };

  const cancelEditing = () => {
    setEditingTierId(null);
    setEditTier({
      subject: "",
      s: "",
      a: "",
      b: "",
      c: "",
      d: "",
      f: ""
    });
  };

  const handleUpdateTier = async (id) => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`/tier/edit/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editTier)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update tier list");
      }
      
      // Reset edit state
      cancelEditing();
      
      // Refresh tier lists
      fetchUserTiers(userId);
    } catch (err) {
      console.error("Error updating tier list:", err);
      setError(err.message);
    }
  };

  // Find entry name from ID
  const getEntryNameById = (entryId) => {
    const entry = subjectEntries.find(e => e.id === entryId);
    return entry ? entry.entryName : "None";
  };

  // Check if an entry is already assigned to any tier
  const isEntryAssigned = (entryId) => {
    return Object.values(tierEntries).some(tierArray => 
      tierArray.includes(entryId)
    );
  };

  // Get tier name where an entry is assigned
  const getEntryTier = (entryId) => {
    for (const [tier, ids] of Object.entries(tierEntries)) {
      if (ids.includes(entryId)) {
        return tier.toUpperCase();
      }
    }
    return null;
  };
  
  // Get tier label color based on tier
  const getTierLabelColor = (tier) => {
    switch(tier.toLowerCase()) {
      case 's': return "#FF4545"; // Red
      case 'a': return "#FFA534"; // Orange
      case 'b': return "#FFFF44"; // Yellow
      case 'c': return "#B7FF4A"; // Light green
      case 'd': return "#57FFC7"; // Teal
      case 'f': return "#5E7EFF"; // Blue
      default: return "#888888"; // Gray
    }
  };
  
  return (
    <div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}> Home Page</Link>
        <Link to="/Admin" style={styles.navLink}> Admin Page</Link>
        <Link to="/LoginOrSignup" style={styles.navLink}> LoginOrSignup</Link>
        <Link to="/Profile" style={styles.navLink}> Profile Page</Link>
        <Link to="/Tierlist" style={styles.navLink}> TierList Page</Link>
      </nav>
      
      <h1>Tier Lists</h1>
      
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <div style={styles.container}>
        <h2>Create New Tier List</h2>
        
        <div style={styles.formGroup}>
          <label htmlFor="subject-select">Select a Subject:</label>
          <select
            id="subject-select"
            value={selectedSubject}
            onChange={handleSubjectChange}
            style={{...styles.input, marginBottom: "20px"}}
          >
            <option value="">-- Select a subject --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedSubject && (
          <div>
            <h3>Drag Items to Tiers</h3>
            
            <div style={styles.sectionMargin}>
              <h4>Available Entries</h4>
              <div style={styles.entriesContainer}>
                {subjectEntries.map(entry => (
                  <div 
                    key={entry.id} 
                    style={styles.entryItem(entry.id, draggingEntry === entry.id)}
                    draggable={!isEntryAssigned(entry.id)}
                    onDragStart={(e) => !isEntryAssigned(entry.id) && handleDragStart(e, entry.id)}
                  >
                    {entry.entryName}
                    {isEntryAssigned(entry.id) && (
                      <div style={styles.entryBadge}>
                        {getEntryTier(entry.id)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={styles.sectionMargin}>
                <div style={styles.tierRow}>
                  <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('s')}}>S</div>
                  <div 
                    style={styles.dropZone}
                    onDragOver={(e) => handleDragOver(e, 's')}
                    onDrop={(e) => handleDrop(e, 's')}
                  >
                    {tierEntries.s.length === 0 ? (
                      <div style={styles.dropPlaceholder}>Drop entries here</div>
                    ) : (
                      tierEntries.s.map(entryId => (
                        <div key={entryId} style={styles.tierEntry}>
                          {getEntryNameById(entryId)}
                          <button 
                            onClick={() => removeFromTier('s', entryId)}
                            style={styles.removeButton}
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div style={styles.tierRow}>
                  <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('a')}}>A</div>
                  <div 
                    style={styles.dropZone}
                    onDragOver={(e) => handleDragOver(e, 'a')}
                    onDrop={(e) => handleDrop(e, 'a')}
                  >
                    {tierEntries.a.length === 0 ? (
                      <div style={styles.dropPlaceholder}>Drop entries here</div>
                    ) : (
                      tierEntries.a.map(entryId => (
                        <div key={entryId} style={styles.tierEntry}>
                          {getEntryNameById(entryId)}
                          <button 
                            onClick={() => removeFromTier('a', entryId)}
                            style={styles.removeButton}
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div style={styles.tierRow}>
                  <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('b')}}>B</div>
                  <div 
                    style={styles.dropZone}
                    onDragOver={(e) => handleDragOver(e, 'b')}
                    onDrop={(e) => handleDrop(e, 'b')}
                  >
                    {tierEntries.b.length === 0 ? (
                      <div style={styles.dropPlaceholder}>Drop entries here</div>
                    ) : (
                      tierEntries.b.map(entryId => (
                        <div key={entryId} style={styles.tierEntry}>
                          {getEntryNameById(entryId)}
                          <button 
                            onClick={() => removeFromTier('b', entryId)}
                            style={styles.removeButton}
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div style={styles.tierRow}>
                  <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('c')}}>C</div>
                  <div 
                    style={styles.dropZone}
                    onDragOver={(e) => handleDragOver(e, 'c')}
                    onDrop={(e) => handleDrop(e, 'c')}
                  >
                    {tierEntries.c.length === 0 ? (
                      <div style={styles.dropPlaceholder}>Drop entries here</div>
                    ) : (
                      tierEntries.c.map(entryId => (
                        <div key={entryId} style={styles.tierEntry}>
                          {getEntryNameById(entryId)}
                          <button 
                            onClick={() => removeFromTier('c', entryId)}
                            style={styles.removeButton}
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div style={styles.tierRow}>
                  <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('d')}}>D</div>
                  <div 
                    style={styles.dropZone}
                    onDragOver={(e) => handleDragOver(e, 'd')}
                    onDrop={(e) => handleDrop(e, 'd')}
                  >
                    {tierEntries.d.length === 0 ? (
                      <div style={styles.dropPlaceholder}>Drop entries here</div>
                    ) : (
                      tierEntries.d.map(entryId => (
                        <div key={entryId} style={styles.tierEntry}>
                          {getEntryNameById(entryId)}
                          <button 
                            onClick={() => removeFromTier('d', entryId)}
                            style={styles.removeButton}
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div style={styles.tierRow}>
                  <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('f')}}>F</div>
                  <div 
                    style={styles.dropZone}
                    onDragOver={(e) => handleDragOver(e, 'f')}
                    onDrop={(e) => handleDrop(e, 'f')}
                  >
                    {tierEntries.f.length === 0 ? (
                      <div style={styles.dropPlaceholder}>Drop entries here</div>
                    ) : (
                      tierEntries.f.map(entryId => (
                        <div key={entryId} style={styles.tierEntry}>
                          {getEntryNameById(entryId)}
                          <button 
                            onClick={() => removeFromTier('f', entryId)}
                            style={styles.removeButton}
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleCreateTier} 
                style={styles.primaryButton}
                disabled={Object.values(tierEntries).every(tierArray => tierArray.length === 0)}
              >
                Save Tier List
              </button>
            </div>
          </div>
        )}
        
        <h2>Your Tier Lists</h2>
        
        {loading ? (
          <p>Loading your tier lists...</p>
        ) : userTiers.length === 0 ? (
          <p>You haven't created any tier lists yet.</p>
        ) : (
          userTiers.map(tier => (
            <div key={tier.id} style={styles.tierCard}>
              {editingTierId === tier.id ? (
                // Edit mode
                <div>
                  <h3>
                    <input
                      type="text"
                      value={editTier.subject}
                      onChange={(e) => setEditTier(prev => ({...prev, subject: e.target.value}))}
                      style={{...styles.input, fontWeight: "bold"}}
                    />
                  </h3>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('s')}}>S</div>
                    <input
                      type="text"
                      value={editTier.s}
                      onChange={(e) => setEditTier(prev => ({...prev, s: e.target.value}))}
                      style={{...styles.input, flex: 1}}
                    />
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('a')}}>A</div>
                    <input
                      type="text"
                      value={editTier.a}
                      onChange={(e) => setEditTier(prev => ({...prev, a: e.target.value}))}
                      style={{...styles.input, flex: 1}}
                    />
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('b')}}>B</div>
                    <input
                      type="text"
                      value={editTier.b}
                      onChange={(e) => setEditTier(prev => ({...prev, b: e.target.value}))}
                      style={{...styles.input, flex: 1}}
                    />
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('c')}}>C</div>
                    <input
                      type="text"
                      value={editTier.c}
                      onChange={(e) => setEditTier(prev => ({...prev, c: e.target.value}))}
                      style={{...styles.input, flex: 1}}
                    />
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('d')}}>D</div>
                    <input
                      type="text"
                      value={editTier.d}
                      onChange={(e) => setEditTier(prev => ({...prev, d: e.target.value}))}
                      style={{...styles.input, flex: 1}}
                    />
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('f')}}>F</div>
                    <input
                      type="text"
                      value={editTier.f}
                      onChange={(e) => setEditTier(prev => ({...prev, f: e.target.value}))}
                      style={{...styles.input, flex: 1}}
                    />
                  </div>
                  
                  <div style={styles.buttonContainer}>
                    <button 
                      onClick={() => handleUpdateTier(tier.id)} 
                      style={styles.primaryButton}>
                      Save Changes
                    </button>
                    <button 
                      onClick={cancelEditing} 
                      style={styles.neutralButton}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <h3>{tier.subject}</h3>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('s')}}>S</div>
                    <div style={styles.tierContent}>{tier.s || "None"}</div>
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('a')}}>A</div>
                    <div style={styles.tierContent}>{tier.a || "None"}</div>
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('b')}}>B</div>
                    <div style={styles.tierContent}>{tier.b || "None"}</div>
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('c')}}>C</div>
                    <div style={styles.tierContent}>{tier.c || "None"}</div>
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('d')}}>D</div>
                    <div style={styles.tierContent}>{tier.d || "None"}</div>
                  </div>
                  
                  <div style={styles.tierRow}>
                    <div style={{...styles.tierLabel, backgroundColor: getTierLabelColor('f')}}>F</div>
                    <div style={styles.tierContent}>{tier.f || "None"}</div>
                  </div>
                  
                  <div style={styles.buttonContainer}>
                    <button 
                      onClick={() => startEditing(tier)} 
                      style={styles.primaryButton}>
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTier(tier.id)} 
                      style={styles.dangerButton}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// All styles consolidated at the bottom of the file
const styles = {
  nav: {
    display: "flex",
    marginBottom: "20px",
    padding: "10px"
  },
  navLink: {
    margin: "0 10px"
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto"
  },
  errorMessage: {
    backgroundColor: "#ffcccc",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "15px"
  },
  formGroup: {
    marginBottom: "15px"
  },
  input: {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box",
    margin: "5px 0"
  },
  sectionMargin: {
    marginBottom: "30px"
  },
  entriesContainer: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: "20px",
    padding: "10px",
    border: "1px solid #eee",
    borderRadius: "4px"
  },
  entryItem: (entryId, isDragging = false) => ({
    padding: "8px 15px",
    margin: "5px",
    backgroundColor: "#4CAF50", 
    color: "white", 
    border: "none",
    borderRadius: "4px",
    cursor: "grab",
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    display: "inline-block"
  }),
  entryBadge: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    backgroundColor: "#ff4d4f",
    color: "white",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold"
  },
  tierRow: {
    display: "flex",
    margin: "5px 0",
    alignItems: "center"
  },
  tierLabel: {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "10px",
    fontWeight: "bold",
    color: "black",
    borderRadius: "4px"
  },
  dropZone: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#fff",
    border: "2px dashed #ccc",
    borderRadius: "4px",
    minHeight: "60px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start"
  },
  dropPlaceholder: {
    color: "#999",
    padding: "10px"
  },
  tierEntry: {
    padding: "5px 10px",
    margin: "5px",
    backgroundColor: "#e6f7ff",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center"
  },
  removeButton: {
    marginLeft: "5px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0"
  },
  tierContent: {
    flex: 1,
    padding: "5px 10px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "4px",
    minHeight: "20px"
  },
  tierCard: {
    border: "1px solid #ddd",
    borderRadius: "5px",
    margin: "15px 0",
    padding: "15px",
    backgroundColor: "#f9f9f9"
  },
  buttonContainer: {
    marginTop: "10px",
    display: "flex"
  },
  primaryButton: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px"
  },
  dangerButton: {
    padding: "8px 16px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px"
  },
  neutralButton: {
    padding: "8px 16px",
    backgroundColor: "#888",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px"
  }
}