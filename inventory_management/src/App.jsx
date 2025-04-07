import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ToolBars from './components/toolbar/ToolBars'
import Dashboard from './pages/Dashboard'
import Products from './components/Products'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <ToolBars />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product" element={<Products />} />
            <Route path="*" element={<h1>Page Not Found</h1>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
