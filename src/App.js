import React, { useState } from 'react';
import axios from 'axios';
import { API_CONFIG, getApiUrl, isValidFileType, isValidFileSize } from './config/api';
import './index.css';

function App() {
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [originalFile, setOriginalFile] = useState(null); // Store the original file object
  const [isDragOver, setIsDragOver] = useState(false);
  const [userRole, setUserRole] = useState('patient'); // 'patient', 'admin', 'doctor'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

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
      // Validate file type and size
      if (!isValidFileType(file)) {
        alert('Unsupported file type. Please upload PDF, JPG, PNG, or DOC files only.');
        return;
      }
      
      if (!isValidFileSize(file)) {
        alert(`File too large. Maximum size allowed is ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        return;
      }
      
      setOriginalFile(file); // Store the original file object for upload
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });
      setUploadStatus(''); // Clear any previous status
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
    setOriginalFile(null);
    setUploadStatus('');
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
    setOriginalFile(null);
    setPatientName('');
    setContactNumber('');
    setIsUploading(false);
    setUploadStatus('');
  };

  const handleSubmitUpload = async () => {
    if (!originalFile) {
      alert('Please select a file to upload.');
      return;
    }
    if (!patientName.trim()) {
      alert('Please enter the patient name.');
      return;
    }
    if (!contactNumber.trim()) {
      alert('Please enter the contact number.');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('Uploading...');
    
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('file', originalFile);
      formData.append('patientName', patientName.trim());
      formData.append('contactNumber', contactNumber.trim());
      formData.append('uploadedBy', userRole);
      formData.append('uploadTimestamp', new Date().toISOString());
      
      // Configure API endpoint using configuration
      const uploadUrl = getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_DOCUMENT);
      
      // Upload request with progress tracking
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${authToken}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadStatus(`Uploading... ${percentCompleted}%`);
        },
        timeout: API_CONFIG.TIMEOUT,
      });
      
      // Handle successful upload
      if (response.status === 200 || response.status === 201) {
        setUploadStatus('Upload successful!');
        console.log('Upload successful:', response.data);
        
        // Show success message with response data
        const uploadId = response.data.uploadId || 'N/A';
        alert(`Document uploaded successfully!\n\nPatient: ${patientName}\nUpload ID: ${uploadId}\nStatus: Completed`);
        
        // Reset form after successful upload
        setTimeout(() => {
          setUploadedFile(null);
          setOriginalFile(null);
          setPatientName('');
          setContactNumber('');
          setUploadStatus('');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data.message || 'Invalid file or patient data.';
            break;
          case 401:
            errorMessage = 'Authentication required. Please log in again.';
            break;
          case 403:
            errorMessage = 'Access denied. Insufficient permissions.';
            break;
          case 413:
            errorMessage = 'File too large. Please choose a smaller file.';
            break;
          case 415:
            errorMessage = 'Unsupported file type. Please use PDF, JPG, PNG, or DOC files.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data.message || `Upload failed (Error ${status}).`;
        }
      } else if (error.request) {
        // Network error - no response from server
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        errorMessage = 'Upload timeout. Please try again with a smaller file.';
      }
      
      setUploadStatus('Upload failed');
      alert(errorMessage);
      
      // Reset upload status after delay
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
    } finally {
      setIsUploading(false);
    }
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
            
            {/* Patient Information Fields */}
            <div className="patient-info-section">
              <h3 className="subsection-title">Patient Information</h3>
              <div className="patient-info-fields">
                <div className="input-group">
                  <label htmlFor="patient-name" className="input-label">
                    Patient Name *
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    className="patient-input"
                    placeholder="Enter patient's full name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="contact-number" className="input-label">
                    Contact Number *
                  </label>
                  <input
                    id="contact-number"
                    type="tel"
                    className="patient-input"
                    placeholder="Enter contact number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="file-upload-section">
              <h3 className="subsection-title">Document Upload</h3>
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

            {/* Submit Button */}
            <div className="submit-section">
              {uploadStatus && (
                <div className={`upload-status ${uploadStatus.includes('successful') ? 'success' : uploadStatus.includes('failed') ? 'error' : 'progress'}`}>
                  {uploadStatus}
                </div>
              )}
              <button 
                className="submit-upload-btn"
                onClick={handleSubmitUpload}
                disabled={!uploadedFile || !patientName.trim() || !contactNumber.trim() || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Submit Upload'}
              </button>
              <p className="submit-note">
                * All fields are required. Please ensure patient information is accurate.
                <br />
                <small>📡 Documents will be uploaded to the secure server with patient information as payload.</small>
              </p>
            </div>
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
