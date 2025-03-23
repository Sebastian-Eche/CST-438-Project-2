import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [mostRecentTier, setMostRecentTier] = useState(null);
  const [similarity, setSimilarity] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUserAndTier = async () => {
      try {
        const userResponse = await fetch(`/user/username/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!userResponse.ok) throw new Error("Failed to get user");

        const user = await userResponse.json();
        const userId = user.id;

        const tierResponse = await fetch(`/tier/getByUserId/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!tierResponse.ok) throw new Error("Failed to get tier lists");

        const tiers = await tierResponse.json();
        if (tiers.length > 0) {
          const latest = [...tiers].sort((a, b) => b.id - a.id)[0];
          setMostRecentTier(latest);

          // Fetch similarity from /tier/compare
          const compareRes = await fetch(
            `/tier/compare?id=${latest.id}&subject=${encodeURIComponent(latest.subject)}`
          );
          if (!compareRes.ok) throw new Error("Failed to compare tiers");

          const rawOutput = await compareRes.text();
          console.log("Raw similarity response:", rawOutput);

          // Extract and convert number from raw output
          const floats = rawOutput.match(/\d+\.\d+/g);
          if (floats && floats.length > 0) {
            const lastFloat = parseFloat(floats[floats.length - 1]);
            const percent = (lastFloat * 100).toFixed(2);
            setSimilarity(percent);
          } else {
            setSimilarity("N/A");
          }
          
        }
      } catch (err) {
        console.error(err);
        setError("Unable to fetch user or tier data.");
      }
    };

    fetchUserAndTier();
  }, [username]);

  return (
    <div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>Home Page</Link>
        <Link to="/Admin" style={styles.navLink}>Admin Page</Link>
        <Link to="/LoginOrSignup" style={styles.navLink}>Login Page</Link>
        <Link to="/Profile" style={styles.navLink}>Profile Page</Link>
        <Link to="/Tierlist" style={styles.navLink}>TierList Page</Link>
      </nav>

      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>

      {username ? (
        <div>
          <h3>Logged in as: <strong>{username}</strong></h3>

          {mostRecentTier ? (
            <div style={styles.tierCard}>
              <h4>Most Recent Tier List: {mostRecentTier.subject}</h4>
              <p><strong>S:</strong> {mostRecentTier.s || "None"}</p>
              <p><strong>A:</strong> {mostRecentTier.a || "None"}</p>
              <p><strong>B:</strong> {mostRecentTier.b || "None"}</p>
              <p><strong>C:</strong> {mostRecentTier.c || "None"}</p>
              <p><strong>D:</strong> {mostRecentTier.d || "None"}</p>
              <p><strong>F:</strong> {mostRecentTier.f || "None"}</p>
              {similarity && (
                <p style={styles.similarity}>
                  🔍 This tier list is <strong>{similarity}%</strong> similar to another user's!
                </p>
              )}
            </div>
          ) : (
            <p>You have not created any tier lists yet.</p>
          )}
        </div>
      ) : (
        <p>Please log in to see your tier list history.</p>
      )}

      {error && <p style={styles.error}>{error}</p>}
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
  tierCard: {
    backgroundColor: "#f2f2f2",
    padding: "15px",
    marginTop: "20px",
    borderRadius: "5px"
  },
  similarity: {
    marginTop: "10px",
    fontSize: "16px",
    color: "#333"
  },
  error: {
    color: "red"
  }
};
