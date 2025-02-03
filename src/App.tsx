import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const HomePage = lazy(() => import('./Pages/MainPage'));
const HistoryPage = lazy(() => import('./Pages/HistoryPage'));

const App = () => (
<Router basename={process.env.PUBLIC_URL}>
    <Suspense fallback={"Loading..."}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage/>} />
        </Routes>
    </Suspense>
</Router>
);

export default App;