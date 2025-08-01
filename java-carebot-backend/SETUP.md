# Carebot Java Backend Setup Guide

## Prerequisites

1. **Java 17 or later** ✅ (Already installed)
2. **Maven 3.6+** ❌ (Needs to be installed)

## Quick Setup Instructions

### Option 1: Install Maven (Recommended)

1. **Download Maven:**
   - Go to https://maven.apache.org/download.cgi
   - Download "Binary zip archive" (e.g., `apache-maven-3.9.4-bin.zip`)

2. **Extract Maven:**
   - Extract to `C:\Program Files\Apache\maven` (or any location)

3. **Set Environment Variables:**
   - Add `MAVEN_HOME` environment variable pointing to Maven installation directory
   - Add `%MAVEN_HOME%\bin` to your PATH environment variable

4. **Verify Installation:**
   ```cmd
   mvn -version
   ```

5. **Start the Backend:**
   ```cmd
   cd "C:\Users\2313829\Downloads\Carebot\java-carebot-backend"
   mvn clean spring-boot:run
   ```

### Option 2: Use IDE (Alternative)

1. **Install IntelliJ IDEA Community Edition** (Free)
   - Download from https://www.jetbrains.com/idea/download/
   
2. **Open Project:**
   - Open the `java-carebot-backend` folder as a Maven project
   - IntelliJ will automatically download dependencies
   - Run the `JavaCarebotBackendApplication.java` file

### Option 3: Use Eclipse (Alternative)

1. **Install Eclipse IDE for Java Developers**
   - Download from https://www.eclipse.org/downloads/
   
2. **Import Project:**
   - File → Import → Existing Maven Projects
   - Browse to `java-carebot-backend` folder
   - Eclipse will download dependencies automatically

## Backend Features

The Java backend provides:

- **H2 Database**: In-memory database for patient and document storage
- **File Upload**: Handles prescription document uploads up to 10MB
- **Patient Management**: Stores patient information (name, contact, etc.)
- **Document Storage**: Manages uploaded files with metadata
- **RESTful APIs**: Endpoints for frontend integration
- **CORS Support**: Configured for React frontend (localhost:3000)

## API Endpoints

Once running (on http://localhost:8080/api):

- `POST /upload-document` - Upload prescription with patient info
- `GET /patients` - Get all patients
- `GET /patients/{id}` - Get specific patient
- `GET /patients/{id}/documents` - Get patient's documents
- `GET /documents` - Get all documents
- `GET /health` - Health check endpoint
- `GET /statistics` - System statistics
- `GET /h2-console` - H2 database console (development)

## Frontend Integration

The React frontend is already configured to connect to this backend:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

## Troubleshooting

### If you get "Port 8080 already in use":
```cmd
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### If you get dependency errors:
1. Make sure you have internet connection
2. Delete `target` folder and restart
3. Check Java version compatibility

## Database Access

While running, you can access the H2 database console:
1. Open: http://localhost:8080/api/h2-console
2. JDBC URL: `jdbc:h2:file:./data/carebot-db`
3. Username: `carebot`
4. Password: `carebot123`

## Development

### Project Structure:
```
java-carebot-backend/
├── src/main/java/com/carebot/backend/
│   ├── entity/          # JPA entities (Patient, Document, Prescription)
│   ├── repository/      # Data access layer
│   ├── controller/      # REST controllers
│   └── JavaCarebotBackendApplication.java
├── src/main/resources/
│   └── application.properties
├── uploads/             # File storage directory
└── pom.xml             # Maven configuration
```

### Next Steps:
1. Install Maven using Option 1 above
2. Run `mvn clean spring-boot:run`
3. Test file upload from React frontend
4. Check H2 console to see stored data

The backend will automatically:
- Create database tables
- Set up file upload directory
- Enable CORS for React frontend
- Start on port 8080
