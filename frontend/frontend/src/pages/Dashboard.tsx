import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` : "Dashboard"}</h1>
      <p>Protected content based on role goes here.</p>
    </div>
  );
};

export default Dashboard;