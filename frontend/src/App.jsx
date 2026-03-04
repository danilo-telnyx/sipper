import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiInfo, setApiInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/info')
      .then(res => res.json())
      .then(data => {
        setApiInfo(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch API info:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>🍹 SIPPER</h1>
        <p>SIP Protocol Testing Platform</p>
        
        {loading ? (
          <p>Loading...</p>
        ) : apiInfo ? (
          <div className="info-box">
            <p><strong>Version:</strong> {apiInfo.app_version}</p>
            <p><strong>API:</strong> {apiInfo.api_version}</p>
            <div className="links">
              <a href="/docs" target="_blank" rel="noopener noreferrer">
                API Documentation
              </a>
            </div>
          </div>
        ) : (
          <p className="error">Failed to connect to API</p>
        )}
        
        <div className="status">
          <h2>Coming Soon</h2>
          <ul>
            <li>✅ Docker deployment ready</li>
            <li>✅ API infrastructure</li>
            <li>⏳ SIP test execution (v0.1.1)</li>
            <li>⏳ Web UI dashboard (v0.2.0)</li>
            <li>⏳ Load testing (v0.2.0)</li>
          </ul>
        </div>
      </header>
    </div>
  )
}

export default App
