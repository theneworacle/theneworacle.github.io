import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Will create this component
import PostPage from './pages/PostPage'; // Will create this component

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/posts/:slug" element={<PostPage />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App;
