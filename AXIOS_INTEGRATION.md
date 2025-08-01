# Carebot with Axios Upload Integration

## 🎉 Successfully Integrated!

Your Carebot application now has full Axios integration for uploading patient information and documents as payload to a backend API.

## 🚀 Current Status

### Frontend (React)
- ✅ **Running**: http://localhost:49326 (production build)
- ✅ **Axios Integration**: Complete with file upload and patient data
- ✅ **File Validation**: Type and size checking
- ✅ **Progress Tracking**: Real-time upload progress
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Form Validation**: Patient name and contact number required

### Backend (Node.js + Express + H2-like SQLite Database)
- 📦 **Created**: Complete backend server with database integration
- 🔧 **Location**: `backend/` directory
- 📋 **Features**: File upload, patient data storage, H2-like database, validation
- 🗄️  **Database**: SQLite with Sequelize ORM (H2-like functionality)
- 📊 **APIs**: Full CRUD operations for patients and documents

## 🛠️ What's New

### Axios Features Added:
1. **File Upload with FormData**: Files and patient data sent as multipart payload
2. **Progress Tracking**: Real-time upload progress (0-100%)
3. **Error Handling**: Detailed error messages for different scenarios
4. **File Validation**: 
   - File type checking (PDF, JPG, PNG, DOC)
   - File size validation (max 10MB)
   - Real-time validation feedback
5. **API Configuration**: Centralized config in `src/config/api.js`
6. **Upload Status**: Visual feedback with success/error/progress states

### Backend API:
- **POST** `/api/upload-patient-document` - Upload files with patient data → saves to H2-like database
- **GET** `/api/patient-documents` - Retrieve uploaded documents with pagination
- **GET** `/api/patients` - Get all patients with document counts
- **GET** `/api/patients/:id` - Get specific patient with all documents
- **GET** `/api/stats` - Database statistics (patients, documents, storage)
- **PATCH** `/api/documents/:uploadId/status` - Update document status
- **GET** `/api/health` - Server and database health check

## 🎯 How to Use

### Option 1: Frontend Only (Mock Backend)
Your frontend is ready to use! It will show network errors when trying to upload (since backend isn't running), but all UI features work.

### Option 2: Full Stack (Frontend + Backend with H2-like Database)

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```
   Or use the quick installer: `backend\install.bat`

2. **Start Backend Server**:
   ```bash
   npm start
   ```
   Or use: `backend\start.bat`
   Backend will run on: http://localhost:8000

3. **Database Setup**:
   - SQLite database (`carebot.db`) creates automatically
   - Tables for patients, documents, and upload sessions
   - Data persists between server restarts

4. **Test Upload Functionality**:
   - Login as Admin in the frontend
   - Fill patient information
   - Upload a document
   - Data saves to H2-like SQLite database
   - See real-time progress and success confirmation

## 📁 File Structure
```
Carebot/
├── src/
│   ├── App.js (with Axios integration)
│   ├── config/
│   │   └── api.js (API configuration)
│   └── index.css (updated with upload status styles)
├── backend/
│   ├── server.js (Express server with database)
│   ├── database.js (H2-like SQLite models)
│   ├── services.js (Database service layer)
│   ├── package.json
│   ├── install.bat (Quick installer)
│   ├── start.bat (Quick starter)
│   ├── carebot.db (SQLite database - auto-created)
│   └── uploads/ (File storage directory)
├── .env (frontend environment)
└── AXIOS_INTEGRATION.md (this documentation)
```

## �️ H2-like Database Schema

### Tables Created:
1. **patients** - Patient information
   - id (UUID, Primary Key)
   - name, contact_number, email
   - date_of_birth, address
   - created_at, updated_at

2. **documents** - Uploaded documents
   - id (UUID, Primary Key)
   - upload_id (UUID, Unique)
   - original_filename, stored_filename, file_path
   - file_size, mime_type, status
   - patient_id (Foreign Key → patients)
   - upload_timestamp, server_timestamp

3. **upload_sessions** - Upload tracking
   - id (UUID, Primary Key)
   - session_id (UUID, Unique)
   - uploaded_by, ip_address, user_agent
   - total_files, total_size, status

### Database Features:
- **Auto-relationships**: Patients ↔ Documents
- **Data validation**: Required fields, email validation
- **Indexing**: Performance optimization
- **Transaction support**: Data integrity
- **Migration support**: Schema evolution

## 🔧 Configuration

### Frontend Environment (.env):
```
REACT_APP_API_URL=http://localhost:8000/api
```

### Backend Environment (backend/.env):
```
PORT=8000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:49326
DB_TYPE=sqlite
DB_NAME=carebot.db
NODE_ENV=development
```

## 📊 Database Payload Structure

### When uploading, data is stored in H2-like SQLite database:

#### Patient Record:
```javascript
{
  id: "uuid-v4",
  name: "John Doe",
  contact_number: "+1234567890",
  email: null,
  date_of_birth: null,
  address: null,
  created_at: "2025-08-01T10:30:00.000Z",
  updated_at: "2025-08-01T10:30:00.000Z"
}
```

#### Document Record:
```javascript
{
  id: "uuid-v4",
  upload_id: "uuid-v4",
  original_filename: "medical-report.pdf",
  stored_filename: "uuid-v4.pdf",
  file_path: "/uploads/uuid-v4.pdf",
  file_size: 2048576,
  mime_type: "application/pdf",
  status: "uploaded",
  patient_id: "patient-uuid",
  session_id: "session-uuid",
  uploaded_by: "admin",
  upload_timestamp: "2025-08-01T10:30:00.000Z",
  server_timestamp: "2025-08-01T10:30:00.000Z"
}
```

#### Upload Session Record:
```javascript
{
  id: "uuid-v4", 
  session_id: "uuid-v4",
  uploaded_by: "admin",
  ip_address: "192.168.1.100",
  user_agent: "Mozilla/5.0...",
  total_files: 1,
  total_size: 2048576,
  status: "completed"
}
```

## 🔐 Security Features

- File type validation
- File size limits
- CORS protection
- Input sanitization
- Database transaction integrity
- SQL injection prevention (Sequelize ORM)
- Unique constraint handling
- Error handling without exposing sensitive data
- Session tracking for audit trails

## 🎨 UI Enhancements

- Real-time upload progress bar
- Success/error status indicators
- Loading states on buttons
- File validation feedback
- Responsive design maintained

## 🚀 Next Steps

1. **Test the Upload**: Try uploading different file types
2. **Start Backend**: Run `backend\start.bat` or `cd backend && npm start`
3. **Database**: SQLite database auto-creates with proper schema
4. **View Data**: Check database with SQLite browser or API endpoints
5. **API Testing**: Use endpoints to view patients, documents, statistics
6. **Check Uploads**: Backend saves files to `backend/uploads/` directory

Your Carebot is now a full-featured healthcare document management system with H2-like database storage, secure file uploads, and comprehensive patient data handling! 🎉
