// frontend/src/App.js - Test without AuthContext
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const TestPage = () => <div style={{padding: '2rem'}}>App is working! Router is functional.</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="*" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;