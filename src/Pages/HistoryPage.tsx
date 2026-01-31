import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/MainStyle.css";
import Tabs from "../Components/TabsHeader";

const History: React.FC = () => {
  const navigate = useNavigate();
  const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  const handleSearchClick = (searchTerm: string) => {
    navigate(`/?query=${searchTerm}`);
  };

  return (
    <div className="history-page">
      <Tabs />
      <h1>Search History</h1>
      {history.length > 0 ? (
        <ul className="history-list">
          {history.map((term: string, index: number) => (
            <li
              key={index}
              onClick={() => handleSearchClick(term)}
              style={{ animationDelay: `${index * 0.06}s` }}
              className="history-item"
            >
              {term}
            </li>
          ))}
        </ul>
      ) : (
        <p className="history-empty">No search history yet.</p>
      )}
    </div>
  );
};

export default History;
