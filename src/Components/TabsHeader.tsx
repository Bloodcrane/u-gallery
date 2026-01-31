import React from "react";
import "../Styles/TabsStyle.css";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

const Tabs = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname === "/home";
  return (
    <div className="tabs-header">
      <div className="logo" onClick={() => navigate("/home")} aria-hidden="true" role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/home")} />
      <NavLink to="/" end className={`nav-btn ${isHome ? "active" : ""}`}>
        Home
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
        History
      </NavLink>
    </div>
  );
};

export default Tabs;