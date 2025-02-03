import React from "react";
import "../Styles/TabsStyle.css"
import { useNavigate } from "react-router";


const Tabs = () => {
  const navigate = useNavigate();
    return (
        <div className='tabs-header'>
          <div className="logo"></div>
          <button onClick={() => navigate('/home')}>🏡 Home</button>
          <button onClick={() => navigate('/history')}>🕰️ History</button>
        </div>
    );
  }
  
  export default Tabs;