# Java Carebot Backend

A Spring Boot backend application for the Carebot healthcare system with H2 database integration.

## 🏗️ Architecture

This Java backend provides:
- **Patient Management**: Store and manage patient information
- **Document Upload**: Handle prescription and medical document uploads
- **H2 Database**: In-memory/file-based database for development
- **RESTful APIs**: Complete CRUD operations
- **File Storage**: Secure file upload and storage system
- **CORS Support**: Configured for React frontend integration

## 📁 Project Structure

```
java-carebot-backend/
├── src/main/java/com/carebot/backend/
│   ├── JavaCarebotBackendApplication.java  # Main application class
│   ├── controller/
│   │   └── FileUploadController.java       # REST endpoints
│   ├── entity/
│   │   ├── Patient.java                    # Patient entity
│   │   ├── Document.java                   # Document entity
│   │   └── Prescription.java               # Prescription entity
│   └── repository/
│       ├── PatientRepository.java          # Patient data access
│       └── DocumentRepository.java         # Document data access
├── src/main/resources/
│   └── application.properties              # Configuration
├── uploads/                                # File upload directory
└── pom.xml                                # Maven dependencies
```

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+ 
- Git

### 1. Start the Backend
Run the provided batch script:
```bash
start-java-backend.bat
```

Or manually:
```bash
cd java-carebot-backend
mvn clean install
mvn spring-boot:run
```

### 2. Verify Installation
- **Health Check**: http://localhost:8080/api/health
- **H2 Console**: http://localhost:8080/api/h2-console
- **Statistics**: http://localhost:8080/api/statistics

### 3. H2 Database Access
- **URL**: http://localhost:8080/api/h2-console
- **JDBC URL**: `jdbc:h2:file:./data/carebot-db`
- **Username**: `carebot`
- **Password**: `carebot123`

## 📊 Database Schema

### Patients Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| patient_name | VARCHAR(100) | Patient full name |
| contact_number | VARCHAR(20) | Phone number |
| email | VARCHAR(100) | Email address |
| date_of_birth | TIMESTAMP | Birth date |
| gender | VARCHAR(10) | Gender |
| address | VARCHAR(500) | Address |
| emergency_contact | VARCHAR(20) | Emergency contact |
| medical_history | VARCHAR(2000) | Medical history |
| allergies | VARCHAR(1000) | Known allergies |
| current_medications | VARCHAR(1000) | Current medications |
| status | VARCHAR(20) | Patient status |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update |
| created_by | VARCHAR(50) | Created by user |

### Documents Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| document_name | VARCHAR(255) | Document name |
| original_filename | VARCHAR(255) | Original file name |
| file_path | VARCHAR(500) | File system path |
| file_size | BIGINT | File size in bytes |
| file_type | VARCHAR(100) | MIME type |
| document_type | VARCHAR(50) | Document category |
| description | VARCHAR(1000) | Description |
| upload_status | VARCHAR(20) | Upload status |
| uploaded_at | TIMESTAMP | Upload timestamp |
| uploaded_by | VARCHAR(50) | Uploaded by user |
| upload_session_id | VARCHAR(100) | Session identifier |
| patient_id | BIGINT | Foreign key to patients |

## 🔌 API Endpoints

### File Upload
- **POST** `/api/upload-document` - Upload prescription document
  - Parameters: `file`, `patientName`, `contactNumber`, `uploadedBy`, `documentType`
  - Response: Upload confirmation with IDs

### Patient Management
- **GET** `/api/patients` - Get all patients
- **GET** `/api/patients/{id}` - Get patient by ID
- **GET** `/api/patients/search?query=text` - Search patients
- **GET** `/api/patients/{id}/documents` - Get patient documents

### Document Management
- **GET** `/api/documents` - Get all documents
- **GET** `/api/documents/{id}` - Get document by ID

### System
- **GET** `/api/health` - Health check
- **GET** `/api/statistics` - System statistics

## 💾 Data from UI

The backend captures the following data from the React UI:

### Required Fields
1. **Prescription Document** (MultipartFile)
   - Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX
   - Maximum size: 10MB
   - Stored in `uploads/` directory

2. **Patient Name** (String)
   - Validation: 2-100 characters
   - Stored in `patients.patient_name`

3. **Contact Number** (String)  
   - Validation: Phone number format
   - Stored in `patients.contact_number`
   - Used for patient lookup/creation

### Optional Fields
- **Document Type**: PRESCRIPTION, LAB_RESULT, X_RAY, REPORT, OTHER
- **Description**: Additional document information
- **Uploaded By**: User who uploaded (defaults to 'admin')

### Automatic Fields
- **Upload Timestamp**: Auto-generated
- **File Metadata**: Size, type, original filename
- **Patient ID**: Auto-generated for new patients
- **Document ID**: Auto-generated for each upload
- **Upload Session ID**: UUID for tracking

## 🔧 Configuration

Key configuration in `application.properties`:

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:h2:file:./data/carebot-db
spring.datasource.username=carebot
spring.datasource.password=carebot123

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Upload Directory
app.upload.dir=./uploads
```

## 🔄 Frontend Integration

The React frontend is configured to connect to this Java backend:

1. **API Base URL**: `http://localhost:8080/api`
2. **Upload Endpoint**: `/upload-document`
3. **CORS**: Enabled for `localhost:3000`

## 🛠️ Development

### Building
```bash
mvn clean compile
```

### Testing
```bash
mvn test
```

### Running
```bash
mvn spring-boot:run
```

### Packaging
```bash
mvn clean package
java -jar target/java-carebot-backend-1.0.0.jar
```

## 📝 Logging

The application logs detailed information:
- SQL queries and parameters
- File upload operations
- Patient and document creation
- Error handling and validation

Check console output for real-time logs.

## 🚨 Error Handling

The backend provides comprehensive error responses:
- File validation errors
- Database constraint violations  
- File system errors
- Network/connection issues

All errors are returned as JSON with appropriate HTTP status codes.

## 🔮 Future Enhancements

- JWT authentication
- Role-based access control
- File encryption
- Document OCR processing
- Email notifications
- Audit logging
- Database migrations
- Docker containerization
