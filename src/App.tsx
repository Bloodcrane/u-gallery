import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const HomePage = lazy(() => import('./Pages/MainPage'));
const WelcomePage = lazy(() => import('./Pages/WelcomePage'));

const App = () => (
<Router basename={process.env.PUBLIC_URL}>
    <Suspense fallback={"Loading..."}>
        <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/welcome" element={<WelcomePage/>} />
        </Routes>
    </Suspense>
</Router>
);

export default App;