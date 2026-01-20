import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Positions from './components/Positions';
import PositionDetail from './components/PositionDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to positions */}
          <Route path="/" element={<Navigate to="/positions" replace />} />
          
          {/* Positions list */}
          <Route path="/positions" element={<Positions />} />
          
          {/* Position detail with Kanban view */}
          <Route path="/position/:id" element={<PositionDetail />} />
          
          {/* 404 - Not found */}
          <Route path="*" element={
            <div className="container mt-5">
              <h2>Página no encontrada</h2>
              <p>La página que buscas no existe.</p>
              <a href="/positions" className="btn btn-primary">Volver a posiciones</a>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
