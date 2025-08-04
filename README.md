# Carebot Healthcare System with WhatsApp Integration

A comprehensive healthcare management system with automatic WhatsApp notifications for patients.

## Features

- 📋 **Patient Management Dashboard**: Comprehensive patient data management
- 📄 **Document Upload and Storage**: Upload prescriptions and medical documents
- 📱 **Automatic WhatsApp Notifications**: Send notifications via Twilio WhatsApp API
- 🆓 **Free WhatsApp Integration**: Generate WhatsApp URLs without external accounts
- 🔐 **Secure Patient Data Handling**: In-memory storage with H2 database support
- 🌐 **React Frontend with Spring Boot Backend**: Modern full-stack architecture
- **Chat Interface**: Interactive chat with the Carebot AI assistant
- **File Upload**: Upload medical documents, lab results, and images with drag-and-drop support
- **Quick Actions**: Pre-defined health-related action buttons for common queries
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Emergency Banner**: Clear warning and guidance for emergency situations
- **Modern UI**: Clean, healthcare-focused design with smooth animations

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js (version 14 or higher) - for React frontend only
- npm or yarn package manager - for React frontend only

### Backend Setup (Java Spring Boot)

1. **Clone the repository**
   ```bash
   git clone https://github.com/smitha-l2/CareBot.git
   cd CareBot
   ```

2. **Configure Application Properties**
   ```bash
   cd java-carebot-backend/src/main/resources
   cp application.properties.template application.properties
   ```

3. **Set up Twilio WhatsApp (Optional)**
   
   For automatic WhatsApp messaging, get credentials from [Twilio Console](https://console.twilio.com/):
   
   Edit `application.properties`:
   ```properties
   twilio.account.sid=YOUR_ACTUAL_TWILIO_ACCOUNT_SID
   twilio.auth.token=YOUR_ACTUAL_TWILIO_AUTH_TOKEN
   ```
   
   Or set environment variables:
   ```bash
   export TWILIO_ACCOUNT_SID=your_account_sid
   export TWILIO_AUTH_TOKEN=your_auth_token
   ```

4. **Build and Run Java Backend**
   
   Option 1 - Using the provided batch file:
   ```bash
   start-java-backend.bat
   ```
   
   Option 2 - Manual commands:
   ```bash
   cd java-carebot-backend
   mvn clean install
   mvn spring-boot:run
   ```
   
   The backend will be available at: http://localhost:8080/api

### Frontend Setup

1. Navigate to the project directory:
   ```bash
   cd "c:\Users\2313829\Downloads\Carebot"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Available Scripts (Frontend)

- `npm start` - Runs the React app in development mode
- `npm test` - Launches the test runner for React components
- `npm run build` - Builds the React app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Backend Commands

- `start-java-backend.bat` - Quick start for Java Spring Boot backend
- `mvn spring-boot:run` - Run backend from java-carebot-backend directory
- `mvn clean install` - Build and install dependencies

## Project Structure

```
src/                          # React frontend source code
  ├── App.js                 # Main application component
  ├── index.js               # Application entry point
  └── index.css              # Global styles and component styles

public/                       # React frontend public assets
  └── index.html             # HTML template

java-carebot-backend/         # Java Spring Boot backend
  ├── src/main/java/         # Java source code
  ├── src/main/resources/    # Configuration files
  ├── target/                # Built artifacts
  └── pom.xml                # Maven configuration

docs/
  └── Patient_FAQ.md         # Comprehensive FAQ for patients

package.json                  # Frontend (React) dependencies
start-java-backend.bat       # Quick start script for Java backend
start-carebot-complete.bat   # Complete system startup script
```

## Key Components

### Chat Section
- Real-time messaging interface
- Welcome message with important disclaimers
- Input field with enter-to-send functionality
- Send button with hover effects

### Upload Section
- Drag-and-drop file upload
- Support for medical documents (PDF, DOC, images)
- File preview with size information
- Remove uploaded files functionality

### Quick Actions
- Pre-defined health-related queries
- Symptoms check, medication info, appointment preparation
- Healthcare service location, health education, wellness tips
- Click-to-populate chat input

## Styling

The application uses a modern design system with:
- Gradient backgrounds and clean card layouts
- Responsive grid system
- Smooth hover animations and transitions
- Healthcare-appropriate color scheme
- Mobile-first responsive design

## Safety Features

- Prominent emergency warning banner
- Clear disclaimers about medical advice limitations
- Emphasis on professional healthcare consultation
- Warning messages integrated throughout the interface

## File Upload Support

Supported file types:
- PDF documents
- Images (JPG, PNG)
- Word documents (DOC, DOCX)
- Maximum file size: 10MB

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Development Workflow

### Creating a Feature Branch
```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name
```

### Building for Production
```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Environment Variables

Create a `.env` file in the root directory for environment-specific configurations:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENVIRONMENT=development
```

## API Integration

The system includes a fully functional Java Spring Boot backend with the following endpoints:

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/patients` - List all patients
- `POST /api/upload` - Upload patient documents
- `GET /api/documents` - List all documents
- `PUT /api/patients/{id}` - Update patient information
- `DELETE /api/patients/{id}` - Delete patient and documents

### Follow-up Scheduler Endpoints
- `POST /api/patients/{id}/follow-ups` - Schedule a follow-up
- `GET /api/follow-ups/visit-types` - Get available visit types
- `GET /api/follow-ups/scheduled` - List scheduled follow-ups
- `GET /api/follow-ups/stats` - Follow-up statistics

### WhatsApp Integration
- Automatic notifications via Twilio WhatsApp API
- Fallback to URL generation for non-sandbox numbers
- Support for different visit types and message templates

The frontend communicates with the Java backend via HTTP requests. The proxy in `package.json` redirects API calls to `http://localhost:8080`.

## Deployment

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

## Security Considerations

- All file uploads should be validated on the backend
- Implement proper authentication for production use
- Use HTTPS in production
- Sanitize all user inputs
- Follow HIPAA compliance guidelines for healthcare data

## Performance Optimization

- Images are optimized for web
- Code splitting is implemented via React.lazy (when needed)
- CSS is optimized for minimal bundle size
- Service worker can be added for offline functionality

## Accessibility

The application follows accessibility best practices:
- Proper ARIA labels
- Keyboard navigation support
- High contrast color scheme
- Screen reader compatibility

## Testing

Run tests with:
```bash
npm test
```

For coverage reports:
```bash
npm test -- --coverage
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **npm install fails**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and package-lock.json
   - Run `npm install` again

3. **Build fails**
   - Check for ESLint errors
   - Ensure all imports are correct
   - Verify environment variables

## Disclaimer

This application is for demonstration purposes. The Carebot interface provides general health information only and does not replace professional medical advice. Always consult with qualified healthcare professionals for medical concerns, diagnoses, and treatment decisions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the FAQ documentation

---

**Last Updated:** August 2025
**Version:** 1.0
