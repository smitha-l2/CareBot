# Carebot Backend Server

This is a sample backend server for testing the Axios upload functionality.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:8000`

### API Endpoints

#### Upload Patient Document
- **POST** `/api/upload-patient-document`
- **Content-Type**: `multipart/form-data`
- **Payload**:
  - `file`: The uploaded file
  - `patientName`: Patient's full name
  - `contactNumber`: Patient's contact number
  - `uploadedBy`: User role (admin/doctor/patient)
  - `uploadTimestamp`: ISO timestamp

#### Health Check
- **GET** `/api/health`
- Returns server status

### File Storage
Uploaded files are stored in the `uploads/` directory with unique filenames.

### Security Notes
- This is a development server for testing
- In production, implement proper authentication and validation
- Use HTTPS for sensitive medical data
- Implement proper file type validation and virus scanning
- Add rate limiting and file size restrictions

### Environment Variables
Create a `.env` file in the backend directory:
```
PORT=8000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_ORIGINS=http://localhost:3000
```
