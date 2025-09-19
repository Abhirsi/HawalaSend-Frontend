// frontend/src/App.js - Minimal test version
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const TestPage = () => <div style={{padding: '2rem'}}>App is working! Router is functional.</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<TestPage />} />
          <Route path="*" element={<TestPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;