import React, { useState, useEffect, useRef } from 'react';
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
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Data viewing functionality
  const [patients, setPatients] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // Patients Dashboard functionality
  const [showPatientsDashboard, setShowPatientsDashboard] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDocuments, setPatientDocuments] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin view management
  const [currentAdminView, setCurrentAdminView] = useState('none'); // 'upload', 'dashboard', or 'none'
  
  // Chat functionality
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'bot',
      message: 'Hello! I\'m Carebot, your AI healthcare assistant. I can help answer general health questions, provide information about symptoms, medications, and wellness tips. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatMessagesRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  // Carebot Knowledge Base from FAQ
  const getCarebotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Emergency situations
    if (msg.includes('emergency') || msg.includes('911') || msg.includes('chest pain') || 
        msg.includes('difficulty breathing') || msg.includes('heart attack') || 
        msg.includes('stroke') || msg.includes('bleeding') || msg.includes('unconscious')) {
      return "🚨 **EMERGENCY ALERT** 🚨\n\nFor medical emergencies, **call 911 immediately** or go to the nearest emergency room. Do not rely on Carebot for emergency medical advice.\n\n**Emergency signs include:**\n• Chest pain or pressure\n• Difficulty breathing\n• Severe bleeding\n• Loss of consciousness\n• Signs of stroke\n• Severe injuries\n\n**Get immediate medical help now!**";
    }

    // What is Carebot
    if (msg.includes('what is carebot') || msg.includes('about carebot') || msg.includes('who are you')) {
      return "I'm Carebot, your AI-powered healthcare assistant! 🤖\n\nI'm designed to:\n• Provide reliable health information 24/7\n• Answer basic medical questions\n• Help you navigate healthcare services\n• Offer general wellness guidance\n• Assist with symptom understanding\n\n**Important:** I'm a supplementary tool and cannot replace professional medical advice from qualified healthcare providers. Always consult your doctor for serious health concerns!";
    }

    // Medication questions
    if (msg.includes('medication') || msg.includes('drug') || msg.includes('pill') || 
        msg.includes('side effect') || msg.includes('prescription')) {
      return "💊 **Medication Information**\n\nI can provide general information about:\n• Common medication uses and effects\n• General side effects to watch for\n• Basic drug interaction awareness\n• Medication adherence tips\n\n**Important reminders:**\n• Never stop or change medications without consulting your healthcare provider\n• Always inform all your healthcare providers about ALL medications you take\n• Include over-the-counter medications and supplements\n• Contact your pharmacist for detailed interaction checks\n• Seek immediate care for severe medication reactions\n\nWhat specific medication question can I help you with?";
    }

    // Pain reliever information
    if (msg.includes('tylenol') || msg.includes('acetaminophen') || msg.includes('advil') || 
        msg.includes('ibuprofen') || msg.includes('aspirin') || msg.includes('pain reliever')) {
      return "💊 **Pain Reliever Information**\n\n**Acetaminophen (Tylenol):**\n• Uses: Pain relief, fever reduction\n• Dosage: Follow package (max 3,000mg/day)\n• Safe for most people\n• Caution: Avoid with liver disease or heavy alcohol use\n\n**Ibuprofen (Advil, Motrin):**\n• Uses: Pain, inflammation, fever reduction\n• Take with food to reduce stomach irritation\n• Caution: Avoid with stomach ulcers, kidney/heart problems\n\n**Aspirin:**\n• Uses: Pain, inflammation, blood thinning\n• Caution: Avoid in children (Reye's syndrome risk)\n• Don't use with bleeding disorders\n\n**General safety:**\n• Read labels carefully\n• Don't exceed recommended doses\n• Don't combine multiple pain relievers without guidance\n• Consult pharmacist or doctor for questions\n\n**Always consult your healthcare provider for persistent pain.**";
    }

    // Cold and allergy medications
    if (msg.includes('cold medicine') || msg.includes('allergy') || msg.includes('antihistamine') || 
        msg.includes('decongestant') || msg.includes('runny nose') || msg.includes('sneezing')) {
      return "🤧 **Cold & Allergy Medication Info**\n\n**Antihistamines:**\n• Examples: Benadryl, Claritin, Zyrtec\n• Uses: Allergies, runny nose, sneezing\n• Note: Some cause drowsiness (Benadryl), others don't (Claritin)\n\n**Decongestants:**\n• Examples: Sudafed, phenylephrine\n• Uses: Nasal congestion\n• Caution: Can raise blood pressure\n\n**Cough medicines:**\n• Dextromethorphan: Suppresses dry cough\n• Guaifenesin: Helps loosen mucus\n\n**Natural options:**\n• Saline nasal rinse\n• Honey for cough (not for babies under 1 year)\n• Steam inhalation\n• Stay hydrated\n\n**⚠️ Important:**\n• Check with pharmacist for drug interactions\n• Don't exceed recommended doses\n• Some medications not suitable for certain conditions\n\n**See your healthcare provider if symptoms persist or worsen.**";
    }

    // Digestive medications
    if (msg.includes('antacid') || msg.includes('heartburn') || msg.includes('acid reflux') || 
        msg.includes('stomach medicine') || msg.includes('pepto') || msg.includes('tums')) {
      return "🍽️ **Digestive Medication Info**\n\n**For Heartburn/Acid Reflux:**\n• **Antacids** (Tums, Rolaids): Quick relief for occasional heartburn\n• **H2 blockers** (Pepcid): Longer-lasting relief\n• **Proton pump inhibitors** (Prilosec): For frequent heartburn\n\n**For Upset Stomach:**\n• **Bismuth subsalicylate** (Pepto-Bismol): Nausea, upset stomach, diarrhea\n• **Simethicone** (Gas-X): Gas and bloating\n\n**For Diarrhea:**\n• **Loperamide** (Imodium): Slows bowel movements\n• **Avoid if you have fever or blood in stool**\n\n**Lifestyle tips:**\n• Eat smaller, more frequent meals\n• Avoid spicy, fatty foods\n• Don't lie down immediately after eating\n• Stay hydrated\n\n**⚠️ See your healthcare provider for:**\n• Persistent symptoms\n• Blood in stool or vomit\n• Severe abdominal pain\n• Signs of dehydration";
    }

    // Specific symptom analysis (MOVED BEFORE GENERAL SYMPTOM CHECK)
    // Headache
    if (msg.includes('headache') || msg.includes('head pain') || msg.includes('migraine')) {
      return "🧠 **Headache Information**\n\n**Common types:**\n• **Tension headaches**: Stress, fatigue, poor posture\n• **Migraines**: Hormonal changes, certain foods, stress\n• **Cluster headaches**: Severe pain around one eye\n\n**Possible general management:**\n• Over-the-counter pain relievers (acetaminophen, ibuprofen)\n• Rest in quiet, dark room\n• Cold or warm compress\n• Stay hydrated\n• Regular sleep schedule\n\n**🚨 SEEK IMMEDIATE CARE for:**\n• Sudden severe headache unlike any before\n• Headache with fever, stiff neck, rash\n• Headache after head injury\n• Progressive worsening headaches\n\n**Consult your healthcare provider for persistent or frequent headaches.**";
    }

    // Cough
    if (msg.includes('cough') && !msg.includes('headache')) {
      return "😷 **Cough Information**\n\n**Possible conditions:**\n• Common cold or flu\n• Bronchitis\n• Allergies\n• Asthma\n• GERD (acid reflux)\n\n**General management:**\n• Stay hydrated (warm liquids helpful)\n• Use humidifier\n• Honey for throat irritation (not for children under 1 year)\n• Over-the-counter options:\n  - Dextromethorphan (cough suppressant for dry cough)\n  - Guaifenesin (expectorant to loosen mucus)\n\n**🚨 SEEK IMMEDIATE CARE for:**\n• Coughing up blood\n• Severe difficulty breathing\n• High fever with productive cough\n• Chest pain with coughing\n\n**See your doctor if cough persists over 2-3 weeks.**";
    }

    // Nausea and vomiting
    if (msg.includes('nausea') || msg.includes('vomit') || msg.includes('throw up') || msg.includes('stomach ache')) {
      return "🤢 **Nausea & Digestive Issues**\n\n**Possible causes:**\n• Viral gastroenteritis (stomach flu)\n• Food poisoning\n• Motion sickness\n• Medication side effects\n• Stress or anxiety\n• Pregnancy (morning sickness)\n\n**General management:**\n• Clear fluids in small, frequent sips\n• BRAT diet: Bananas, Rice, Applesauce, Toast\n• Ginger or peppermint may help\n• Rest\n• Avoid dairy, fatty, or spicy foods\n\n**Over-the-counter options:**\n• Bismuth subsalicylate (Pepto-Bismol)\n• Simethicone for gas (Gas-X)\n\n**🚨 SEEK CARE for:**\n• Persistent vomiting >24 hours\n• Signs of dehydration\n• Blood in vomit\n• Severe abdominal pain\n• High fever\n\n**Contact your healthcare provider for persistent symptoms.**";
    }

    // Fever
    if (msg.includes('fever') && !msg.includes('headache') && !msg.includes('cough')) {
      return "🌡️ **Fever Information**\n\n**Normal body temperature:** 98.6°F (37°C)\n**Fever:** Generally 100.4°F (38°C) or higher\n\n**Possible causes:**\n• Viral infections (cold, flu)\n• Bacterial infections\n• Inflammatory conditions\n• Heat exhaustion\n• Medication reactions\n\n**General management:**\n• Rest and stay hydrated\n• Light clothing and cool environment\n• Over-the-counter fever reducers:\n  - Acetaminophen (Tylenol): Safe for most people\n  - Ibuprofen (Advil, Motrin): Also reduces inflammation\n  - Follow package dosing instructions\n\n**🚨 SEEK IMMEDIATE CARE for:**\n• Fever over 103°F (39.4°C)\n• Fever with severe headache and stiff neck\n• Difficulty breathing\n• Persistent high fever despite medication\n• Signs of dehydration\n\n**For infants under 3 months, any fever requires immediate medical attention.**";
    }

    // Back pain
    if (msg.includes('back pain') || msg.includes('backache') || msg.includes('spine')) {
      return "🦴 **Back Pain Information**\n\n**Common causes:**\n• Muscle strain or sprain\n• Poor posture\n• Herniated disc\n• Arthritis\n• Stress and tension\n\n**General management:**\n• Rest but avoid prolonged bed rest\n• Gentle movement and stretching\n• Heat or ice therapy (try both to see what helps)\n• Over-the-counter pain relievers:\n  - Ibuprofen (reduces inflammation)\n  - Acetaminophen (pain relief)\n  - Topical pain creams\n\n**Prevention:**\n• Proper lifting techniques\n• Good posture\n• Regular exercise\n• Ergonomic workspace\n\n**🚨 SEEK IMMEDIATE CARE for:**\n• Back pain with leg weakness or numbness\n• Loss of bladder or bowel control\n• Severe pain after injury\n• Fever with back pain\n\n**See a healthcare provider if pain persists beyond a few days or worsens.**";
    }

    // Chest pain
    if (msg.includes('chest pain') || msg.includes('chest pressure')) {
      return "🚨 **CHEST PAIN - IMPORTANT** 🚨\n\n**CALL 911 IMMEDIATELY if you have:**\n• Crushing chest pain\n• Pain radiating to arm, jaw, or back\n• Shortness of breath with chest pain\n• Nausea, sweating with chest pain\n• Sudden severe chest pain\n\n**Possible non-emergency causes:**\n• Acid reflux/heartburn\n• Muscle strain\n• Anxiety or panic attacks\n• Costochondritis (chest wall inflammation)\n\n**For mild heartburn:**\n• Antacids (Tums, Rolaids)\n• Avoid spicy, fatty foods\n• Don't lie down immediately after eating\n\n**⚠️ NEVER ignore chest pain - when in doubt, seek immediate medical care!**\n\nChest pain can be a sign of serious conditions including heart attack. Always err on the side of caution.";
    }

    // Sore throat
    if (msg.includes('sore throat') || msg.includes('throat pain')) {
      return "😖 **Sore Throat Information**\n\n**Common causes:**\n• Viral infections (cold, flu)\n• Bacterial infections (strep throat)\n• Allergies\n• Dry air\n• Acid reflux\n\n**General management:**\n• Warm salt water gargle\n• Throat lozenges or hard candy\n• Warm liquids (tea with honey)\n• Stay hydrated\n• Use humidifier\n\n**Over-the-counter options:**\n• Pain relievers: acetaminophen, ibuprofen\n• Throat sprays with benzocaine\n• Lozenges with menthol or eucalyptus\n\n**🚨 SEEK CARE for:**\n• Severe throat pain with difficulty swallowing\n• High fever with sore throat\n• White patches on throat\n• Swollen glands in neck\n• Symptoms lasting more than a week\n\n**Strep throat requires antibiotic treatment - see your healthcare provider.**";
    }

    // Diarrhea
    if (msg.includes('diarrhea') || msg.includes('loose stool')) {
      return "💧 **Diarrhea Information**\n\n**Common causes:**\n• Viral or bacterial infections\n• Food poisoning\n• Stress or anxiety\n• Medication side effects\n• Inflammatory bowel conditions\n\n**General management:**\n• Stay hydrated with clear fluids\n• Electrolyte replacement (sports drinks, ORS)\n• BRAT diet: Bananas, Rice, Applesauce, Toast\n• Probiotics may help\n• Rest\n\n**Over-the-counter options:**\n• Loperamide (Imodium) - for symptom relief\n• Bismuth subsalicylate (Pepto-Bismol)\n• **Avoid anti-diarrheal medications if you have fever or blood in stool**\n\n**🚨 SEEK CARE for:**\n• Blood in stool\n• High fever\n• Signs of severe dehydration\n• Persistent diarrhea >3 days\n• Severe abdominal pain\n\n**See your healthcare provider for persistent or severe symptoms.**";
    }

    // Rash or skin problems
    if (msg.includes('rash') || msg.includes('itchy') || msg.includes('skin') || msg.includes('eczema')) {
      return "🩹 **Skin & Rash Information**\n\n**Common types:**\n• **Contact dermatitis**: Allergic reaction to substances\n• **Eczema**: Chronic inflammatory skin condition\n• **Fungal infections**: Athlete's foot, ringworm\n• **Heat rash**: From hot, humid conditions\n\n**General management:**\n• Keep area clean and dry\n• Avoid scratching\n• Cool compresses for itching\n• Loose, breathable clothing\n\n**Over-the-counter options:**\n• Hydrocortisone cream (1%) for inflammation\n• Calamine lotion for itching\n• Antihistamines (Benadryl, Claritin) for allergic reactions\n• Antifungal creams for suspected fungal infections\n\n**🚨 SEEK IMMEDIATE CARE for:**\n• Rash with fever\n• Rapidly spreading rash\n• Signs of infection (pus, red streaking)\n• Severe itching affecting daily life\n• Difficulty breathing with rash\n\n**See your healthcare provider for persistent or worsening rashes.**";
    }

    // General symptoms (MOVED TO AFTER SPECIFIC SYMPTOM CHECKS)
    if (msg.includes('symptom') || msg.includes('pain') || msg.includes('tired') || msg.includes('fatigue')) {
      return "🩺 **Symptom Guidance**\n\nWhen describing symptoms, please include:\n• When symptoms started\n• What makes them better or worse\n• Severity level (1-10 scale for pain)\n• Whether they're constant or come and go\n• Any associated symptoms\n\n**Seek immediate medical attention if you have:**\n• Severe or worsening symptoms\n• Symptoms interfering with daily activities\n• Fever with severe symptoms\n• Signs of serious conditions\n\n**Remember:** I can provide general information, but cannot diagnose. Always consult your healthcare provider for proper evaluation.\n\nWhat symptoms are you experiencing?";
    }

    // Mental health
    if (msg.includes('mental health') || msg.includes('depression') || msg.includes('anxiety') || 
        msg.includes('stress') || msg.includes('worried') || msg.includes('sad')) {
      return "🧠 **Mental Health Support**\n\nMental health is just as important as physical health. I can provide general information about:\n• Stress management techniques\n• Coping strategies\n• When to seek professional help\n• General wellness practices\n\n**For mental health concerns, please:**\n• Speak with a mental health professional\n• Contact your primary care provider\n• Use crisis hotlines if having thoughts of self-harm\n• Seek immediate help for mental health emergencies\n\n**Crisis Resources:**\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n\nHow can I support your mental wellness today?";
    }

    // Preventive care
    if (msg.includes('screening') || msg.includes('checkup') || msg.includes('preventive') || 
        msg.includes('vaccine') || msg.includes('immunization') || msg.includes('wellness')) {
      return "🛡️ **Preventive Care & Wellness**\n\nPreventive care is key to staying healthy! General recommendations include:\n\n**Regular Screenings:**\n• Blood pressure and cholesterol checks\n• Cancer screenings (mammograms, colonoscopies)\n• Eye and hearing exams\n• Bone density tests\n\n**Vaccinations:**\n• Annual flu shots\n• COVID-19 boosters\n• Tdap (tetanus, diphtheria, pertussis)\n• Age-specific vaccines (shingles, pneumonia)\n\n**Healthy Lifestyle:**\n• Regular exercise\n• Balanced nutrition\n• Quality sleep\n• Stress management\n• Avoiding tobacco and limiting alcohol\n\nWhat specific preventive care question can I help you with?";
    }

    // Doctor appointments
    if (msg.includes('doctor') || msg.includes('appointment') || msg.includes('visit') || 
        msg.includes('prepare') || msg.includes('questions')) {
      return "👩‍⚕️ **Doctor Appointment Preparation**\n\nI can help you prepare for your healthcare visits!\n\n**Before your appointment:**\n• List your symptoms and when they started\n• Note what makes symptoms better or worse\n• Prepare questions about your health concerns\n• Bring a list of all medications and supplements\n• Write down your medical history\n\n**Good questions to ask:**\n• What could be causing my symptoms?\n• What tests might I need?\n• What are my treatment options?\n• Are there lifestyle changes that could help?\n• When should I follow up?\n\n**Remember:** Always follow your healthcare provider's advice, as they have access to your complete medical history.\n\nWhat specific aspect of your appointment can I help you prepare for?";
    }

    // Insurance and healthcare navigation
    if (msg.includes('insurance') || msg.includes('cost') || msg.includes('afford') || 
        msg.includes('expensive') || msg.includes('coverage')) {
      return "💰 **Healthcare Navigation & Costs**\n\nI understand healthcare costs can be challenging. Here are some resources:\n\n**For medication costs:**\n• Patient assistance programs from pharmaceutical companies\n• Generic medication alternatives\n• Prescription discount programs\n• Government assistance programs\n\n**For general healthcare:**\n• Community health centers\n• Free and low-cost clinics\n• Hospital financial assistance programs\n• Insurance marketplace options\n\n**When to seek care:**\n• Emergency Room: Life-threatening conditions\n• Urgent Care: Non-emergency issues that can't wait\n• Regular Appointment: Routine and preventive care\n\nWhat specific healthcare navigation question can I help you with?";
    }

    // Privacy and security
    if (msg.includes('privacy') || msg.includes('secure') || msg.includes('confidential') || 
        msg.includes('hipaa') || msg.includes('data')) {
      return "🔒 **Privacy & Security**\n\nYour health information privacy is important:\n\n**Your conversations with me are:**\n• Protected by healthcare privacy standards\n• Encrypted and stored securely\n• Only accessible to authorized healthcare personnel\n• Not shared with third parties without consent\n\n**Best practices:**\n• Avoid sharing sensitive personal identifiers unless necessary\n• Use secure internet connections\n• Log out of shared devices\n\n**Data storage:**\n• Conversations may be temporarily stored for context\n• Information is handled according to healthcare privacy regulations (HIPAA)\n• Used only for quality improvement and continuity of care\n\nDo you have specific privacy concerns I can address?";
    }

    // General health information
    if (msg.includes('health') || msg.includes('wellness') || msg.includes('healthy') || 
        msg.includes('diet') || msg.includes('exercise') || msg.includes('nutrition')) {
      return "🌟 **General Health & Wellness**\n\nI'm here to help with general health information!\n\n**Common topics I can assist with:**\n• Nutrition and healthy eating patterns\n• Exercise recommendations for different fitness levels\n• Sleep hygiene and stress management\n• Smoking cessation and alcohol moderation\n• Weight management strategies\n• Understanding lab results (general ranges)\n• Lifestyle modifications for chronic conditions\n\n**Key principles of good health:**\n• Balanced, nutritious diet\n• Regular physical activity\n• Adequate sleep (7-9 hours for adults)\n• Stress management\n• Regular healthcare checkups\n• Staying hydrated\n• Avoiding harmful substances\n\nWhat specific health topic would you like to explore?";
    }

    // Technical issues
    if (msg.includes('not working') || msg.includes('technical') || msg.includes('error') || 
        msg.includes('problem') || msg.includes('help') || msg.includes('support')) {
      return "🔧 **Technical Support**\n\nIf you're experiencing technical difficulties:\n\n**Try these steps:**\n1. Refresh your browser or restart the app\n2. Check your internet connection\n3. Clear your browser cache\n4. Try using a different browser or device\n\n**For mobile devices:**\n• Ensure you have a stable internet connection\n• Update your browser or app\n• Restart your device if needed\n\n**If problems persist:**\n• Contact technical support\n• Speak with a healthcare provider\n• Try rephrasing your question using simpler terms\n\nIs there a specific technical issue I can help you troubleshoot?";
    }

    // Default helpful response
    return "Hello! I'm here to help with your health questions. 😊\n\n**I can assist you with:**\n• General health information and wellness tips\n• Common symptoms and when to seek care\n• Medication information and side effects\n• Preventive care and screening guidelines\n• Mental health and stress management\n• Nutrition and exercise guidance\n• Preparing for doctor appointments\n\n**Please remember:**\n• I provide general information only\n• I cannot diagnose or prescribe treatments\n• For emergencies, call 911 immediately\n• Always consult healthcare professionals for serious concerns\n\nWhat health topic can I help you with today? Feel free to ask specific questions or describe any concerns you might have!";
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const userMessage = message.trim();
      
      // Add user message to chat
      const newUserMessage = {
        type: 'user',
        message: userMessage,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newUserMessage]);
      setMessage('');
      setIsChatLoading(true);
      
      // Simulate thinking time and generate bot response
      setTimeout(() => {
        const botResponse = getCarebotResponse(userMessage);
        const newBotMessage = {
          type: 'bot',
          message: botResponse,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, newBotMessage]);
        setIsChatLoading(false);
      }, 1000); // 1 second delay to simulate processing
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
  const hasUploadAccess = isAdmin; // Only admins can access upload functionality

  // Login simulation function
  const handleLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    // Set default admin view to none (clean interface)
    if (role === 'admin') {
      setCurrentAdminView('none');
    }
  };

  const handleLogout = () => {
    setUserRole('patient');
    setIsLoggedIn(false);
    setUploadedFile(null);
    setOriginalFile(null);
    setPatientName('');
    setContactNumber('');
    setDateOfBirth('');
    setIsUploading(false);
    setUploadStatus('');
    // Reset admin view states
    setCurrentAdminView('none');
    setShowPatientsDashboard(false);
  };

  // Patients Dashboard Functions
  const loadPatientsDashboard = async () => {
    setIsLoadingPatients(true);
    try {
      // Fetch patients
      const patientsResponse = await axios.get(getApiUrl('/patients'), { timeout: 10000 });
      setPatients(patientsResponse.data);

      // Fetch documents
      const documentsResponse = await axios.get(getApiUrl('/documents'), { timeout: 10000 });
      setDocuments(documentsResponse.data);

      setShowPatientsDashboard(true);
      setCurrentAdminView('dashboard');
      console.log('Dashboard loaded successfully');
    } catch (error) {
      console.error('Error loading patients dashboard:', error);
      alert(`Error loading dashboard: ${error.message}`);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadPatientDocuments = async (patientId) => {
    try {
      const response = await axios.get(getApiUrl(`/patients/${patientId}/documents`), { timeout: 5000 });
      setPatientDocuments(response.data);
    } catch (error) {
      console.error('Error loading patient documents:', error);
      setPatientDocuments([]);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    loadPatientDocuments(patient.id);
  };

  const filteredPatients = patients.filter(patient =>
    patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contactNumber.includes(searchTerm)
  );

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
    if (!dateOfBirth.trim()) {
      alert('Please enter the date of birth.');
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
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('uploadedBy', userRole);
      formData.append('uploadTimestamp', new Date().toISOString());
      
      // Configure API endpoint using configuration
      const uploadUrl = getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_DOCUMENT);
      console.log('Upload URL:', uploadUrl);
      console.log('FormData contents:', {
        patientName: patientName.trim(),
        contactNumber: contactNumber.trim(),
        dateOfBirth: dateOfBirth,
        userRole: userRole,
        fileName: originalFile.name,
        fileSize: originalFile.size
      });
      
      // Upload request with progress tracking
      const response = await axios.post(uploadUrl, formData, {
        // Don't set Content-Type header manually for FormData - axios will set it automatically with boundary
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
        const whatsappSent = response.data.whatsappNotificationSent || false;
        const whatsappMessage = whatsappSent ? 
          '✅ WhatsApp notification sent to patient' : 
          '⚠️ WhatsApp notification could not be sent';
        
        alert(`Document uploaded successfully!\n\nPatient: ${patientName}\nUpload ID: ${uploadId}\nStatus: Completed\n\n${whatsappMessage}`);
        
        // Reset form after successful upload
        setTimeout(() => {
          setUploadedFile(null);
          setOriginalFile(null);
          setPatientName('');
          setContactNumber('');
          setDateOfBirth('');
          setUploadStatus('');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request,
        config: error.config
      });
      
      // Handle different types of errors
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        console.log('Server error response:', { status, data });
        
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
        console.log('Network error details:', error.request);
        errorMessage = `Network error: Cannot connect to server at ${API_CONFIG.BASE_URL}. Please check if the backend is running.`;
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        errorMessage = 'Upload timeout. Please try again with a smaller file.';
      } else {
        console.log('Other error:', error.message);
        errorMessage = `Upload error: ${error.message}`;
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
      <div className={`main-content ${!hasUploadAccess || currentAdminView === 'upload' ? 'single-column' : ''}`}>
        {/* Chat Section - Hidden for Admin Users */}
        {userRole !== 'admin' && (
          <div className="chat-section">
            <h2 className="section-title">
              💬 Chat with Carebot
            </h2>
            <div className="chat-container">
              <div className="chat-messages" ref={chatMessagesRef}>
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
                
                {/* Chat Messages */}
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.type}`}>
                    <div className="message-header">
                      <span className="message-sender">
                        {msg.type === 'bot' ? '🤖 Carebot' : '👤 You'}
                      </span>
                      <span className="message-time">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="message-content">
                      {msg.message.split('\n').map((line, lineIndex) => (
                        <div key={lineIndex}>
                          {line.startsWith('**') && line.endsWith('**') ? (
                            <strong>{line.slice(2, -2)}</strong>
                          ) : line.startsWith('•') ? (
                            <div style={{marginLeft: '20px'}}>{line}</div>
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isChatLoading && (
                  <div className="chat-message bot">
                    <div className="message-header">
                      <span className="message-sender">🤖 Carebot</span>
                      <span className="message-time">typing...</span>
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
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
        )}

        {/* Upload Section - Only visible to admins and when upload view is active */}
        {hasUploadAccess && currentAdminView === 'upload' && (
          <div className="upload-section-centered">
            <div className="upload-header">
              <h2 className="section-title">
                📎 Upload Documents
                <span className="admin-only-badge">Admin Only</span>
              </h2>
              <button 
                className="cancel-btn"
                onClick={() => setCurrentAdminView('none')}
                title="Back to Dashboard"
              >
                ✕ Cancel
              </button>
            </div>
            
            <div className="upload-content">
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
                <div className="input-group">
                  <label htmlFor="date-of-birth" className="input-label">
                    Date of Birth *
                  </label>
                  <input
                    id="date-of-birth"
                    type="date"
                    className="patient-input"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
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
                disabled={!uploadedFile || !patientName.trim() || !contactNumber.trim() || !dateOfBirth.trim() || isUploading}
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

      {/* Admin Welcome View - Default view for admin users */}
      {hasUploadAccess && currentAdminView === 'none' && (
        <div className="admin-welcome">
          <div className="welcome-content">
            <h2 className="section-title">
              👨‍⚕️ Administrator Dashboard
              <span className="admin-only-badge">Admin Only</span>
            </h2>
            <div className="welcome-message-admin">
              <div className="welcome-icon">🏥</div>
              <div className="welcome-text">
                <h3>Welcome to the Healthcare Admin Portal</h3>
                <p>Select an option below to get started:</p>
                <div className="admin-nav-buttons-welcome">
                  <button 
                    className={`nav-button dashboard-nav-btn ${currentAdminView === 'dashboard' ? 'active' : ''}`}
                    onClick={loadPatientsDashboard}
                    disabled={isLoadingPatients}
                  >
                    {isLoadingPatients ? '🔄 Loading...' : '👥 Patients Dashboard'}
                  </button>
                  <button 
                    className={`nav-button upload-nav-btn ${currentAdminView === 'upload' ? 'active' : ''}`}
                    onClick={() => {
                      setShowPatientsDashboard(false);
                      setCurrentAdminView('upload');
                    }}
                  >
                    📎 Document Upload
                  </button>
                </div>
                <div className="admin-note">
                  <p><em>This administrative interface provides secure access to patient management tools and document handling systems.</em></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patients Dashboard - Only visible to admins */}
      {hasUploadAccess && showPatientsDashboard && (
        <div className="patients-dashboard-centered">
          <div className="dashboard-header">
            <h2 className="section-title">
              👥 Patients Dashboard
              <span className="admin-only-badge">Admin Only</span>
            </h2>
            <button 
              className="cancel-btn"
              onClick={() => {
                setShowPatientsDashboard(false);
                setCurrentAdminView('none');
              }}
              title="Back to Dashboard"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="dashboard-controls">
            <input
              type="text"
              placeholder="Search patients by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dashboard-search"
            />
          </div>

          <div className="dashboard-content">
            {/* Patients List */}
            <div className="patients-list">
              <h3 className="list-title">Patients ({filteredPatients.length})</h3>
              <div className="patients-container">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div 
                      key={patient.id}
                      className={`patient-card ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                      onClick={() => selectPatient(patient)}
                    >
                      <div className="patient-name">
                        {patient.patientName}
                      </div>
                      <div className="patient-info">
                        📞 {patient.contactNumber}
                      </div>
                      <div className="patient-info">
                        🎂 {patient.dateOfBirth}
                      </div>
                      <div className="patient-date">
                        Added: {new Date(patient.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-patients">
                    {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                  </div>
                )}
              </div>
            </div>

            {/* Patient Details */}
            <div className="patient-details">
              {selectedPatient ? (
                <div>
                  <h3 className="details-title">Patient Details</h3>
                  <div className="patient-info-card">
                    <div className="info-item">
                      <strong>Name:</strong> {selectedPatient.patientName}
                    </div>
                    <div className="info-item">
                      <strong>Contact:</strong> {selectedPatient.contactNumber}
                    </div>
                    <div className="info-item">
                      <strong>Date of Birth:</strong> {selectedPatient.dateOfBirth}
                    </div>
                    <div className="info-item">
                      <strong>Patient ID:</strong> {selectedPatient.id}
                    </div>
                    <div className="info-item">
                      <strong>Registered:</strong> {new Date(selectedPatient.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <h4 className="documents-title">Documents</h4>
                  <div className="patient-documents">
                    {patientDocuments.length > 0 ? (
                      patientDocuments.map((doc) => (
                        <div key={doc.id} className="document-card">
                          <div className="document-name">📄 {doc.fileName}</div>
                          <div className="document-meta">
                            Type: {doc.fileType} | Size: {(doc.fileSize / 1024).toFixed(2)} KB
                          </div>
                          <div className="document-date">
                            Uploaded: {new Date(doc.uploadDate).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-documents">
                        No documents found for this patient.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="select-patient-prompt">
                  Select a patient to view details
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
