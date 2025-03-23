import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch("https://cst438-project2-33edc6317781.herokuapp.com/");
        const data = await response.text();
        console.log(data);
        setMessage(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMessage();
  }, []);

  return (
    <div>
      <Link to="/" style={{ margin: "0 10px" }}> Home </Link>
      <Link to="/Admin" style={{ margin: "0 10px" }}> Admin </Link>
      <Link to="/LoginOrSignup" style={{ margin: "0 10px" }}> LoginOrSignup </Link>
      <Link to="/Profile" style={{ margin: "0 10px" }}> Profile </Link>
      <Link to="/Tierlist" style={{ margin: "0 10px" }}> TierList </Link>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>

      <h3>Message from API:</h3>
      {/*<p>{message}</p>/*/}

    </div>
  );
}