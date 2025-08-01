import React, { useState } from 'react';
import './index.css';

function App() {
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
      <div className="main-content">
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

        {/* Upload Section */}
        <div className="upload-section">
          <h2 className="section-title">
            📎 Upload Documents
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
