// frontend/src/App.js - Test Login component only
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';

const TestPage = () => <div>Working!</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<TestPage />} />
          <Route path="*" element={<TestPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;