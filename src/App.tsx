import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const HomePage = lazy(() => import('./Pages/MainPage'));
const HistoryPage = lazy(() => import('./Pages/HistoryPage'));

const App = () => (
  <div className="App">
    <div className="bg-effects" aria-hidden="true">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-orb bg-orb-5" />
    </div>
    <Router basename={process.env.PUBLIC_URL}>
      <Suspense fallback={
        <div className="app-loading" aria-label="Loading">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Suspense>
    </Router>
  </div>
);

export default App;