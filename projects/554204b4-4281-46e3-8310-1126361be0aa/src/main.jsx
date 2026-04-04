import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initDemoData } from './data/demoData'
import { RestaurantProvider } from './context/RestaurantContext'

// Pre-seed realistic demo data on first load
initDemoData()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RestaurantProvider>
      <App />
    </RestaurantProvider>
  </React.StrictMode>,
)