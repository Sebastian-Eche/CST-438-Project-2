import React from "react";
import { Link } from "react-router-dom";

export default function Tierlist() {
  return (
    <div>
      <Link to="/"> Home Page</Link>
      <Link to="/Admin"> Admin Page</Link>
      <Link to="/Login"> Login Page</Link>
      <Link to="/Profile"> Profile Page</Link>
      <Link to="/Signup"> Signup Page</Link>
      <Link to="/Tierlist"> TierList Page</Link>
      <h1>Tierlist Page</h1>
      <p>Welcome to the Tierlist page!</p>
      
    </div>
  );
}