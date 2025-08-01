import React, { useState } from 'react';
import './index.css';

function App() {
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [userRole, setUserRole] = useState('patient'); // 'patient', 'admin', 'doctor'
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileUpload = (file) => {
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  // Role-based access control
  const isAdmin = userRole === 'admin';
  const isDoctor = userRole === 'doctor';
  const hasUploadAccess = isAdmin; // Only admins can access upload functionality

  // Login simulation function
  const handleLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserRole('patient');
    setIsLoggedIn(false);
    setUploadedFile(null);
  };

  const quickActions = [
    {
      icon: '🩺',
      title: 'Symptoms Check',
      description: 'Describe your symptoms and get guidance'
    },
    {
      icon: '💊',
      title: 'Medication Info',
      description: 'Learn about medications and side effects'
    },
    {
      icon: '📋',
      title: 'Appointment Prep',
      description: 'Prepare questions for your doctor visit'
    },
    {
      icon: '🏥',
      title: 'Find Care',
      description: 'Locate healthcare services near you'
    },
    {
      icon: '📚',
      title: 'Health Education',
      description: 'Access reliable health information'
    },
    {
      icon: '🧘‍♀️',
      title: 'Wellness Tips',
      description: 'Get personalized wellness advice'
    }
  ];

  return (
    <div className="container">
      {/* Authentication Banner */}
      <div className="auth-banner">
        <div className="auth-info">
          <span className="user-role">
            {isLoggedIn ? `Logged in as: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}` : 'Not logged in'}
          </span>
          {isLoggedIn && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
        {!isLoggedIn && (
          <div className="login-buttons">
            <button className="login-btn patient" onClick={() => handleLogin('patient')}>
              Login as Patient
            </button>
            <button className="login-btn doctor" onClick={() => handleLogin('doctor')}>
              Login as Doctor
            </button>
            <button className="login-btn admin" onClick={() => handleLogin('admin')}>
              Login as Admin
            </button>
          </div>
        )}
      </div>

      {/* Emergency Banner */}
      <div className="emergency-banner">
        <strong>🚨 EMERGENCY? Call 911 immediately!</strong> Carebot is not for medical emergencies.
      </div>

      {/* Header */}
      <div className="header">
        <h1>🤖 Carebot</h1>
        <p>Your AI-powered healthcare assistant, available 24/7 to provide reliable health information and guidance</p>
      </div>

      {/* Main Content */}
      <div className={`main-content ${!hasUploadAccess ? 'single-column' : ''}`}>
        {/* Chat Section */}
        <div className="chat-section">
          <h2 className="section-title">
            💬 Chat with Carebot
          </h2>
          <div className="chat-container">
            <div className="chat-messages">
              <div className="welcome-message">
                <strong>Welcome to Carebot! 👋</strong>
                <br />
                I'm here to help you with health questions, symptom guidance, and medical information. 
                Ask me anything about your health concerns, medications, or wellness tips!
                <br /><br />
                <strong>Remember:</strong> I provide general information only. For emergencies or serious concerns, contact your healthcare provider immediately.
                {isLoggedIn && (
                  <>
                    <br /><br />
                    <strong>Current Access Level:</strong> {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    {hasUploadAccess && <span className="access-indicator"> ✅ Document Upload Access</span>}
                    {!hasUploadAccess && <span className="access-indicator"> ℹ️ Chat Access Only</span>}
                  </>
                )}
              </div>
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask me about your health concerns..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="send-button" onClick={handleSendMessage}>
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section - Only visible to admins */}
        {hasUploadAccess && (
          <div className="upload-section">
            <h2 className="section-title">
              📎 Upload Documents
              <span className="admin-only-badge">Admin Only</span>
            </h2>
            <div 
              className={`upload-container ${isDragOver ? 'dragover' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('file-input').click()}
            >
              <div className="upload-icon">📄</div>
              <div className="upload-text">
                {uploadedFile ? 'File uploaded successfully!' : 'Upload medical documents, lab results, or images'}
              </div>
              <div className="upload-subtext">
                Drag & drop files here or click to browse
                <br />
                <small>Supported: PDF, JPG, PNG, DOC (Max 10MB)</small>
              </div>
              <input
                id="file-input"
                type="file"
                className="file-input"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              {!uploadedFile && (
                <button 
                  className="upload-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('file-input').click();
                  }}
                >
                  Choose File
                </button>
              )}
            </div>

            {uploadedFile && (
              <div className="uploaded-file">
                <div className="file-info">
                  <span>📎</span>
                  <div>
                    <div className="file-name">{uploadedFile.name}</div>
                    <div className="file-size">{uploadedFile.size}</div>
                  </div>
                </div>
                <button className="remove-file" onClick={removeUploadedFile}>
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Access Restriction Notice for non-admins */}
        {!hasUploadAccess && isLoggedIn && (
          <div className="access-restriction-notice">
            <h2 className="section-title">
              🔒 Document Upload
            </h2>
            <div className="restriction-message">
              <div className="restriction-icon">🛡️</div>
              <div className="restriction-text">
                <strong>Access Restricted</strong>
                <p>Document upload functionality is only available to hospital administrators.</p>
                <p>If you need to upload medical documents, please contact your healthcare facility's administration.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">
          ⚡ Quick Actions
        </h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card" onClick={() => setMessage(action.title)}>
              <div className="action-icon">{action.icon}</div>
              <div className="action-title">{action.title}</div>
              <div className="action-description">{action.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>
          <strong>Disclaimer:</strong> Carebot provides general health information only and does not replace professional medical advice. 
          Always consult with qualified healthcare professionals for medical concerns.
        </p>
        <p style={{ marginTop: '10px' }}>
          Last Updated: August 2025 | Version 1.0
        </p>
      </div>
    </div>
  );
}

export default App;
