import React from "react";
import "../Styles/TabsStyle.css"

const Tabs = () => {
    return (
        <div className='tabs-header'>
          <div className="logo"></div>
          <button>🏡 Home</button>
          <button>🕰️ History</button>
        </div>
    );
  }
  
  export default Tabs;