import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import App from './App.jsx'
//import toolbar from './components/toolbar/ToolBars.jsx'
import ToolBars from './components/toolbar/ToolBars.jsx'
import TopBar from './components/TopBar/TopBar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TopBar />
    <ToolBars />
  </StrictMode>,
)
