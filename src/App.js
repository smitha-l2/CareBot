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
  // const [documents, setDocuments] = useState([]); // Unused - commented out
  
  // Patients Dashboard functionality
  const [showPatientsDashboard, setShowPatientsDashboard] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDocuments, setPatientDocuments] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit patient functionality
  const [editingPatient, setEditingPatient] = useState(null);
  const [editPatientName, setEditPatientName] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Follow-up Scheduler functionality
  const [showFollowUpScheduler, setShowFollowUpScheduler] = useState(false);
  const [followUpStats, setFollowUpStats] = useState(null);
  const [visitTypes, setVisitTypes] = useState([]);
  const [selectedFollowUpPatient, setSelectedFollowUpPatient] = useState(null);
  const [selectedVisitType, setSelectedVisitType] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [isSchedulingFollowUp, setIsSchedulingFollowUp] = useState(false);
  const [isSendingImmediateFollowUp, setIsSendingImmediateFollowUp] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [scheduledFollowUps, setScheduledFollowUps] = useState([]);
  const [followUpFilter, setFollowUpFilter] = useState('all');
  
  // Admin view management
  const [currentAdminView, setCurrentAdminView] = useState('none'); // 'upload', 'dashboard', 'followup', 'doctors', 'appointments', 'queries', or 'none'
  
  // Doctor Management functionality (Admin only)
  // const [showDoctorManagement, setShowDoctorManagement] = useState(false); // Unused - commented out
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialty: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    availableDays: [],
    timeSlots: [],
    languages: [],
    about: '',
    image: '👨‍⚕️'
  });
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);
  const [managedDoctors, setManagedDoctors] = useState([]);
  // const [doctorSchedule, setDoctorSchedule] = useState({}); // Unused - commented out

  // Doctors Database State
  const [doctorsDatabase, setDoctorsDatabase] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "General Medicine",
      qualifications: "MBBS, MD",
      experience: "8 years",
      rating: 4.8,
      consultationFee: 500,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      image: "👩‍⚕️",
      languages: ["English", "Hindi"],
      about: "Specialized in preventive care and chronic disease management",
      isActive: true
    },
    {
      id: 2,
      name: "Dr. Rajesh Kumar",
      specialty: "Cardiology",
      qualifications: "MBBS, MD, DM Cardiology",
      experience: "12 years",
      rating: 4.9,
      consultationFee: 800,
      availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
      timeSlots: ["10:00", "11:00", "15:00", "16:00", "17:00"],
      image: "👨‍⚕️",
      languages: ["English", "Hindi", "Telugu"],
      about: "Expert in interventional cardiology and heart disease prevention",
      isActive: true
    },
    {
      id: 3,
      name: "Dr. Priya Sharma",
      specialty: "Dermatology",
      qualifications: "MBBS, MD Dermatology",
      experience: "6 years",
      rating: 4.7,
      consultationFee: 600,
      availableDays: ["Tuesday", "Thursday", "Friday", "Saturday"],
      timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      image: "👩‍⚕️",
      languages: ["English", "Hindi"],
      about: "Specializes in skin conditions, cosmetic dermatology, and hair care",
      isActive: true
    },
    {
      id: 4,
      name: "Dr. Mohammed Ali",
      specialty: "Orthopedics",
      qualifications: "MBBS, MS Orthopedics",
      experience: "10 years",
      rating: 4.6,
      consultationFee: 700,
      availableDays: ["Monday", "Tuesday", "Thursday", "Saturday"],
      timeSlots: ["09:00", "10:00", "14:00", "15:00", "16:00", "17:00"],
      image: "👨‍⚕️",
      languages: ["English", "Hindi", "Urdu"],
      about: "Specializes in joint replacement and sports medicine",
      isActive: true
    },
    {
      id: 5,
      name: "Dr. Anitha Menon",
      specialty: "Pediatrics",
      qualifications: "MBBS, MD Pediatrics",
      experience: "9 years",
      rating: 4.9,
      consultationFee: 550,
      availableDays: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
      timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      image: "👩‍⚕️",
      languages: ["English", "Hindi", "Malayalam"],
      about: "Expert in child health, vaccination, and developmental pediatrics",
      isActive: true
    },
    {
      id: 6,
      name: "Dr. Vikram Reddy",
      specialty: "Neurology",
      qualifications: "MBBS, MD, DM Neurology",
      experience: "15 years",
      rating: 4.8,
      consultationFee: 900,
      availableDays: ["Tuesday", "Wednesday", "Friday"],
      timeSlots: ["10:00", "11:00", "15:00", "16:00"],
      image: "👨‍⚕️",
      languages: ["English", "Hindi", "Telugu"],
      about: "Specialized in stroke care, epilepsy management, and neurodegenerative diseases",
      isActive: true
    }
  ]);

  // Conversational Booking States
  const [chatBookingFlow, setChatBookingFlow] = useState({
    isActive: false,
    step: 'init', // init, askName, askPhone, askSpecialty, selectDoctor, selectDate, selectTime, confirm
    data: {}
  });
  const [selectedDoctorForSchedule, setSelectedDoctorForSchedule] = useState(null);
  
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

  // Medication Info functionality
  const [showMedicationInfo, setShowMedicationInfo] = useState(false);
  const [searchMedication, setSearchMedication] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Appointment Booking functionality
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    contactNumber: '',
    email: '',
    dateOfBirth: '',
    preferredDate: '',
    preferredTime: '',
    doctorSpecialty: '',
    appointmentType: '',
    symptoms: '',
    urgency: 'routine'
  });
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Patient Info, 2: Doctor Selection, 3: Time Slot, 4: Confirmation
  const [bookedAppointments, setBookedAppointments] = useState([]);
  
  // Enhanced Appointments Management State
  const [appointmentFilter, setAppointmentFilter] = useState('all'); // 'all', 'upcoming', 'today', 'cancelled', 'completed'
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [appointmentDateFilter, setAppointmentDateFilter] = useState('');
  const [appointmentDoctorFilter, setAppointmentDoctorFilter] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'patient', 'doctor', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Doctor-Patient Communication System
  const [showDoctorCommunication, setShowDoctorCommunication] = useState(false);
  const [patientQueries, setPatientQueries] = useState([]);
  const [currentQuery, setCurrentQuery] = useState({
    patientName: '',
    contactNumber: '',
    preferredDoctor: '',
    queryText: '',
    urgency: 'normal' // 'low', 'normal', 'high', 'urgent'
  });
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [queryFilter, setQueryFilter] = useState('all'); // 'all', 'new', 'replied', 'urgent'
  const [selectedQueryDoctor, setSelectedQueryDoctor] = useState('');

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  // Initialize managed doctors with the doctors database
  useEffect(() => {
    if (managedDoctors.length === 0) {
      setManagedDoctors([...doctorsDatabase]);
    }
  }, [managedDoctors.length, doctorsDatabase]);

  // Appointment Types
  const appointmentTypes = [
    { value: "consultation", label: "General Consultation", duration: 30 },
    { value: "followup", label: "Follow-up Visit", duration: 20 },
    { value: "emergency", label: "Emergency Consultation", duration: 45 },
    { value: "checkup", label: "Routine Check-up", duration: 30 },
    { value: "second_opinion", label: "Second Opinion", duration: 45 }
  ];

  // Medical Specialties
  const medicalSpecialties = [
    "General Medicine",
    "Cardiology", 
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Neurology"
  ];

  // Comprehensive Medicine Database
  const medicineDatabase = [
    {
      id: 1,
      brandName: "Crocin Advance",
      activeIngredient: "Paracetamol",
      alternatives: "Dolo 650, Calpol 650",
      availabilityStatus: "In stock",
      category: "Pain Reliever / Fever Reducer",
      uses: [
        "Pain relief (headache, toothache, muscle pain)",
        "Fever reduction",
        "Post-vaccination fever",
        "Cold and flu symptoms"
      ],
      dosageInstructions: "Adults: 1-2 tablets every 4-6 hours. Maximum 8 tablets in 24 hours.",
      price: "₹35-45 per strip (10 tablets)",
      prescriptionRequired: false
    },
    {
      id: 2,
      brandName: "Brufen 400",
      activeIngredient: "Ibuprofen",
      alternatives: "Ibugesic 400, Combiflam",
      availabilityStatus: "Low stock",
      category: "Anti-inflammatory / Pain Reliever",
      uses: [
        "Pain relief",
        "Inflammation reduction",
        "Fever reduction",
        "Muscle and joint pain"
      ],
      dosageInstructions: "Adults: 1 tablet 2-3 times daily with food. Maximum 1200mg daily.",
      price: "₹25-35 per strip (10 tablets)",
      prescriptionRequired: false
    },
    {
      id: 3,
      brandName: "Allegra 120",
      activeIngredient: "Fexofenadine Hydrochloride",
      alternatives: "Fexofen 120mg Tablet, Mavifex 180mg Tablet",
      availabilityStatus: "In stock",
      category: "Antihistamine / Allergy Medicine",
      uses: [
        "Seasonal allergies",
        "Hay fever",
        "Allergic rhinitis",
        "Hives and skin allergies"
      ],
      dosageInstructions: "Adults: 1 tablet once daily. Best taken on empty stomach.",
      price: "₹85-95 per strip (10 tablets)",
      prescriptionRequired: false
    },
    {
      id: 4,
      brandName: "Avil 25",
      activeIngredient: "Pheniramine Maleate",
      alternatives: "Eralet 25mg Tablet, Sleepiness",
      availabilityStatus: "Unavailable",
      category: "Antihistamine",
      uses: [
        "Allergic reactions",
        "Cold symptoms",
        "Motion sickness",
        "Sleep aid (drowsiness effect)"
      ],
      dosageInstructions: "Adults: 1 tablet 2-3 times daily. May cause drowsiness.",
      price: "₹15-25 per strip (10 tablets)",
      prescriptionRequired: false
    },
    {
      id: 5,
      brandName: "Amoxycillin 500mg Capsule",
      activeIngredient: "Amoxycillin",
      alternatives: "Tormoxin 500mg Capsule, Cipmox 500 Capsule",
      availabilityStatus: "In stock",
      category: "Antibiotic",
      uses: [
        "Bacterial infections",
        "Respiratory tract infections",
        "Urinary tract infections",
        "Skin and soft tissue infections"
      ],
      dosageInstructions: "Adults: 1 capsule 3 times daily. Complete the full course.",
      price: "₹45-65 per strip (10 capsules)",
      prescriptionRequired: true
    },
    {
      id: 6,
      brandName: "Nexito 10",
      activeIngredient: "Escitalopram Oxalate",
      alternatives: "Esitalopram 10mg, Stipram 10mg",
      availabilityStatus: "In stock",
      category: "Antidepressant / Anti-anxiety",
      uses: [
        "Depression",
        "Anxiety disorders",
        "Panic disorders",
        "Obsessive-compulsive disorder"
      ],
      dosageInstructions: "Adults: 1 tablet once daily, preferably in the morning.",
      price: "₹125-145 per strip (10 tablets)",
      prescriptionRequired: true
    },
    {
      id: 7,
      brandName: "Montina-L Tablet",
      activeIngredient: "Montelukast + Levocetirizine",
      alternatives: "Lecope-M Tablet, Monticope Tablet",
      availabilityStatus: "Unavailable",
      category: "Anti-allergy / Asthma",
      uses: [
        "Allergic rhinitis",
        "Asthma prevention",
        "Chronic urticaria",
        "Seasonal allergies"
      ],
      dosageInstructions: "Adults: 1 tablet once daily in the evening.",
      price: "₹85-105 per strip (10 tablets)",
      prescriptionRequired: false
    },
    {
      id: 8,
      brandName: "Zerodol P",
      activeIngredient: "Aceclofenac + Paracetamol",
      alternatives: "Aceclofenac, Paracetamol",
      availabilityStatus: "Low stock",
      category: "Pain Reliever / Anti-inflammatory",
      uses: [
        "Joint pain",
        "Muscle pain",
        "Back pain",
        "Inflammation reduction"
      ],
      dosageInstructions: "Adults: 1 tablet twice daily after meals.",
      price: "₹55-75 per strip (10 tablets)",
      prescriptionRequired: false
    },
    {
      id: 9,
      brandName: "Pantocid D",
      activeIngredient: "Pantoprazole + Domperidone",
      alternatives: "Pan D, Pentaloc D",
      availabilityStatus: "In stock",
      category: "Acid Reducer / Anti-nausea",
      uses: [
        "Acid reflux",
        "GERD",
        "Peptic ulcers",
        "Nausea and vomiting"
      ],
      dosageInstructions: "Adults: 1 tablet once daily before breakfast.",
      price: "₹75-95 per strip (10 tablets)",
      prescriptionRequired: false
    },
    {
      id: 10,
      brandName: "Atarax 25mg Tablet",
      activeIngredient: "Hydroxyzine",
      alternatives: "HD Zine 25mg Tablet, Hyzox 25 Tablet",
      availabilityStatus: "In stock",
      category: "Antihistamine / Anti-anxiety",
      uses: [
        "Anxiety",
        "Allergic reactions",
        "Itching and hives",
        "Sleep disorders"
      ],
      dosageInstructions: "Adults: 1 tablet 2-3 times daily or as directed by doctor.",
      price: "₹35-45 per strip (10 tablets)",
      prescriptionRequired: false
    }
  ];

  // Medication Info Helper Functions
  const filteredMedicines = medicineDatabase.filter(medicine =>
    medicine.brandName.toLowerCase().includes(searchMedication.toLowerCase()) ||
    medicine.activeIngredient.toLowerCase().includes(searchMedication.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchMedication.toLowerCase()) ||
    medicine.uses.some(use => use.toLowerCase().includes(searchMedication.toLowerCase()))
  );

  // Alternative Medicine Search Function
  const findMedicineAlternatives = (medicineName) => {
    const normalizedInput = medicineName.toLowerCase().trim();
    
    // Search for exact match or partial match
    const foundMedicine = medicineDatabase.find(medicine => 
      medicine.brandName.toLowerCase().includes(normalizedInput) ||
      medicine.activeIngredient.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(medicine.brandName.toLowerCase().split(' ')[0]) // First word match
    );
    
    if (foundMedicine) {
      const statusIcon = {
        'In stock': '✅',
        'Low stock': '⚠️',
        'Unavailable': '❌'
      };
      
      return `💊 **${foundMedicine.brandName}** Information\n\n` +
        `**Active Ingredient:** ${foundMedicine.activeIngredient}\n` +
        `**Category:** ${foundMedicine.category}\n` +
        `**Availability:** ${statusIcon[foundMedicine.availabilityStatus]} ${foundMedicine.availabilityStatus}\n` +
        `**Price:** ${foundMedicine.price}\n\n` +
        `**Alternative Medicines:**\n${foundMedicine.alternatives}\n\n` +
        `**Uses:**\n${foundMedicine.uses.map(use => `• ${use}`).join('\n')}\n\n` +
        `**Dosage:** ${foundMedicine.dosageInstructions}\n\n` +
        `**Prescription Required:** ${foundMedicine.prescriptionRequired ? 'Yes ⚠️' : 'No ✅'}\n\n` +
        `⚠️ **Important:** Always consult your doctor or pharmacist before switching medications or if you have any concerns about drug interactions.`;
    } else {
      // Show available medicines if no match found
      const availableMedicines = medicineDatabase
        .filter(med => med.availabilityStatus === 'In stock')
        .slice(0, 5)
        .map(med => `• ${med.brandName} (${med.activeIngredient})`)
        .join('\n');
        
      return `🔍 **Medicine not found in our database**\n\n` +
        `I couldn't find "${medicineName}" in our current medicine database.\n\n` +
        `**Available medicines in stock:**\n${availableMedicines}\n\n` +
        `**What you can do:**\n` +
        `• Try searching with the exact medicine name\n` +
        `• Search by active ingredient\n` +
        `• Contact our pharmacist for specific alternatives\n` +
        `• Ask our doctors for professional advice\n\n` +
        `💬 Type the medicine name more specifically or ask: "What alternatives are there for [medicine name]?"`;
    }
  };

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
  };

  const clearMedicineSelection = () => {
    setSelectedMedicine(null);
    setSearchMedication('');
  };

  const closeMedicationInfo = () => {
    setShowMedicationInfo(false);
    setSelectedMedicine(null);
    setSearchMedication('');
  };

  // Appointment Booking Helper Functions
  const openAppointmentBooking = () => {
    setShowAppointmentBooking(true);
    setBookingStep(1);
    // Pre-fill patient info if logged in
    if (isLoggedIn && userRole === 'patient') {
      setAppointmentForm(prev => ({
        ...prev,
        patientName: patientName,
        contactNumber: contactNumber,
        dateOfBirth: dateOfBirth
      }));
    }
  };

  const closeAppointmentBooking = () => {
    setShowAppointmentBooking(false);
    setBookingStep(1);
    setAppointmentForm({
      patientName: '',
      contactNumber: '',
      dateOfBirth: '',
      selectedDoctor: null,
      selectedDate: '',
      selectedTime: '',
      purpose: '',
      notes: ''
    });
    setSelectedDoctor(null);
  };

  // const scrollToAppointmentSection = () => { // Unused - commented out
  //   setTimeout(() => {
  //     const appointmentSection = document.querySelector('.appointment-booking-section');
  //     if (appointmentSection) {
  //       appointmentSection.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }, 100);
  // };

  const handleAppointmentFormChange = (field, value) => {
    setAppointmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filterDoctorsBySpecialty = (specialty) => {
    if (!specialty) return doctorsDatabase;
    return doctorsDatabase.filter(doctor => 
      doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  };

  const generateTimeSlots = (doctor, selectedDate) => {
    if (!doctor || !selectedDate) return [];
    
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!doctor.availableDays.includes(dayOfWeek)) {
      return [];
    }
    
    // Generate available slots (in real app, this would check actual bookings)
    return doctor.timeSlots.map(time => ({
      time: time,
      available: Math.random() > 0.3 // Simulate some slots being booked
    }));
  };

  // Form validation helper
  // const validateAppointmentForm = () => { // Unused - commented out
  //   const { patientName, contactNumber, dateOfBirth, selectedDoctor, selectedDate, selectedTime } = appointmentForm;
  //   
  //   if (!patientName.trim()) {
  //     alert('Please enter patient name');
  //     return false;
  //   }
  //   
  //   if (!contactNumber.trim() || contactNumber.length < 10) {
  //     alert('Please enter a valid contact number');
  //     return false;
  //   }
  //   
  //   if (!dateOfBirth) {
  //     alert('Please select date of birth');
  //     return false;
  //   }
  //   
  //   if (!selectedDoctor) {
  //     alert('Please select a doctor');
  //     return false;
  //   }
  //   
  //   if (!selectedDate) {
  //     alert('Please select appointment date');
  //     return false;
  //   }
  //   
  //   if (!selectedTime) {
  //     alert('Please select appointment time');
  //     return false;
  //   }
  //   
  //   return true;
  // };

  // Get available time slots for selected doctor and date
  // const getAvailableTimeSlots = (doctor, date) => { // Unused - commented out
  //   if (!doctor || !date) return [];
  //   
  //   // Check if date is in the past
  //   if (new Date(date) < new Date().setHours(0, 0, 0, 0)) {
  //     return [];
  //   }
  //   
  //   // Get doctor's available time slots for the day
  //   const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  //   if (!doctor.availableDays.includes(dayOfWeek)) {
  //     return [];
  //   }
  //   
  //   // Simulate some slots being booked
  //   return doctor.timeSlots.map(slot => ({
  //     time: slot,
  //     available: Math.random() > 0.3 // Simulate some slots being booked
  //   }));
  // };

  const proceedToNextStep = () => {
    if (bookingStep < 4) {
      setBookingStep(bookingStep + 1);
      
      // Load doctors when moving to step 2
      if (bookingStep === 1) {
        const filtered = filterDoctorsBySpecialty(appointmentForm.doctorSpecialty);
        setAvailableDoctors(filtered);
      }
      
      // Generate time slots when moving to step 3
      // Generate time slots when moving to step 3
      if (bookingStep === 2 && selectedDoctor && appointmentForm.preferredDate) {
        const slots = generateTimeSlots(selectedDoctor, appointmentForm.preferredDate);
        setAvailableSlots(slots);
      }
    }
  };

  const goBackStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const bookAppointment = async () => {
    setIsBookingAppointment(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAppointment = {
        appointmentDate: appointmentForm.preferredDate,
        appointmentTime: appointmentForm.preferredTime,
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        appointmentId: `APT${Date.now().toString().slice(-6)}`,
        patientName: appointmentForm.patientName,
        contactNumber: appointmentForm.contactNumber,
        doctor: selectedDoctor,
        purpose: appointmentForm.symptoms || 'General consultation',
        urgency: appointmentForm.urgency
      };
      
      setBookedAppointments(prev => [...prev, newAppointment]);
      
      alert(`🎉 Appointment Booked Successfully!\n\nAppointment ID: ${newAppointment.appointmentId}\nDoctor: ${selectedDoctor.name}\nDate: ${appointmentForm.preferredDate}\nTime: ${appointmentForm.preferredTime}\n\nYou will receive a confirmation message shortly.`);
      
      // Reset form and close booking
      closeAppointmentBooking();
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsBookingAppointment(false);
    }
  };

  // Doctor Management Helper Functions
  const openDoctorManagement = () => {
    setCurrentAdminView('doctors');
    // Initialize managed doctors with existing database if empty
    if (managedDoctors.length === 0) {
      setManagedDoctors([...doctorsDatabase]);
    }
  };

  // Appointments Management Helper Functions
  const openAppointmentsManagement = () => {
    setCurrentAdminView('appointments');
  };

  // Patient Queries Management Helper Functions
  const openQueriesManagement = () => {
    setCurrentAdminView('queries');
  };

  const cancelAppointment = (appointmentId) => {
    if (window.confirm('⚠️ Are you sure you want to cancel this appointment?\n\nThis action cannot be undone and the patient will need to book a new appointment.')) {
      setBookedAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : apt
        )
      );
      alert('✅ Appointment cancelled successfully!');
    }
  };

  const rescheduleAppointment = (appointmentId, newDate, newTime) => {
    setBookedAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, appointmentDate: newDate, appointmentTime: newTime, status: 'rescheduled', rescheduledAt: new Date().toISOString() }
          : apt
      )
    );
    alert('✅ Appointment rescheduled successfully!');
  };

  const getAppointmentStats = () => {
    const total = bookedAppointments.length;
    const confirmed = bookedAppointments.filter(apt => apt.status === 'confirmed').length;
    const cancelled = bookedAppointments.filter(apt => apt.status === 'cancelled').length;
    const completed = bookedAppointments.filter(apt => apt.status === 'completed').length;
    const upcoming = bookedAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      const today = new Date();
      return aptDate >= today && apt.status === 'confirmed';
    }).length;
    
    return { total, confirmed, cancelled, completed, upcoming };
  };

  // Enhanced Appointments Management Functions
  const getFilteredAppointments = () => {
    let filtered = [...bookedAppointments];
    
    // Filter by status
    if (appointmentFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (appointmentFilter) {
        case 'upcoming':
          filtered = filtered.filter(apt => 
            new Date(apt.appointmentDate) >= today && apt.status === 'confirmed'
          );
          break;
        case 'today':
          const todayEnd = new Date(today);
          todayEnd.setDate(todayEnd.getDate() + 1);
          filtered = filtered.filter(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= today && aptDate < todayEnd;
          });
          break;
        case 'cancelled':
          filtered = filtered.filter(apt => apt.status === 'cancelled');
          break;
        case 'completed':
          filtered = filtered.filter(apt => apt.status === 'completed');
          break;
        default:
          break;
      }
    }
    
    // Filter by search term
    if (appointmentSearchTerm) {
      const searchLower = appointmentSearchTerm.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchLower) ||
        apt.doctor.name.toLowerCase().includes(searchLower) ||
        apt.appointmentId.toLowerCase().includes(searchLower) ||
        apt.contactNumber.includes(searchLower)
      );
    }
    
    // Filter by date
    if (appointmentDateFilter) {
      filtered = filtered.filter(apt => 
        apt.appointmentDate === appointmentDateFilter
      );
    }
    
    // Filter by doctor
    if (appointmentDoctorFilter) {
      filtered = filtered.filter(apt => 
        apt.doctor.id.toString() === appointmentDoctorFilter
      );
    }
    
    // Sort appointments
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.appointmentDate) - new Date(b.appointmentDate);
          break;
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'doctor':
          comparison = a.doctor.name.localeCompare(b.doctor.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  const exportAppointments = () => {
    const appointments = getFilteredAppointments();
    
    if (appointments.length === 0) {
      alert('No appointments to export');
      return;
    }
    
    const csvContent = [
      ['Appointment ID', 'Patient Name', 'Phone', 'Doctor', 'Specialty', 'Date', 'Time', 'Status', 'Fee', 'Booked Date'],
      ...appointments.map(apt => [
        apt.appointmentId,
        apt.patientName,
        apt.contactNumber,
        `Dr. ${apt.doctor.name}`,
        apt.doctor.specialty,
        new Date(apt.appointmentDate).toLocaleDateString(),
        apt.appointmentTime,
        apt.status,
        `₹${apt.fee}`,
        new Date(apt.bookingDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const bulkCancelAppointments = () => {
    if (selectedAppointments.length === 0) {
      alert('Please select appointments to cancel');
      return;
    }
    
    if (window.confirm(`Are you sure you want to cancel ${selectedAppointments.length} appointment(s)?`)) {
      setBookedAppointments(prev => 
        prev.map(apt => 
          selectedAppointments.includes(apt.id)
            ? { ...apt, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : apt
        )
      );
      setSelectedAppointments([]);
      alert(`✅ ${selectedAppointments.length} appointment(s) cancelled successfully!`);
    }
  };

  const bulkCompleteAppointments = () => {
    if (selectedAppointments.length === 0) {
      alert('Please select appointments to mark as completed');
      return;
    }
    
    if (window.confirm(`Are you sure you want to mark ${selectedAppointments.length} appointment(s) as completed?`)) {
      setBookedAppointments(prev => 
        prev.map(apt => 
          selectedAppointments.includes(apt.id)
            ? { ...apt, status: 'completed', completedAt: new Date().toISOString() }
            : apt
        )
      );
      setSelectedAppointments([]);
      alert(`✅ ${selectedAppointments.length} appointment(s) marked as completed!`);
    }
  };

  const toggleAppointmentSelection = (appointmentId) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const selectAllAppointments = () => {
    const filtered = getFilteredAppointments();
    setSelectedAppointments(filtered.map(apt => apt.id));
  };

  const clearAppointmentSelection = () => {
    setSelectedAppointments([]);
  };

  const getTodaysAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return bookedAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && aptDate < tomorrow && apt.status === 'confirmed';
    });
  };

  const getAdvancedAppointmentStats = () => {
    const basic = getAppointmentStats();
    const today = getTodaysAppointments();
    const thisWeek = bookedAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return aptDate >= weekStart && aptDate < weekEnd;
    });
    
    const revenue = bookedAppointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + apt.fee, 0);
    
    return {
      ...basic,
      today: today.length,
      thisWeek: thisWeek.length,
      revenue
    };
  };

  // Doctor-Patient Communication System Functions
  const initiateDoctorCommunication = () => {
    setShowDoctorCommunication(true);
    setCurrentQuery({
      patientName: '',
      contactNumber: '',
      preferredDoctor: '',
      queryText: '',
      urgency: 'normal'
    });
  };

  const submitPatientQuery = async () => {
    if (!currentQuery.patientName.trim() || !currentQuery.contactNumber.trim() || !currentQuery.queryText.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmittingQuery(true);

    try {
      const newQuery = {
        id: Date.now(),
        queryId: `Q${Date.now().toString().slice(-6)}`,
        patientName: currentQuery.patientName.trim(),
        contactNumber: currentQuery.contactNumber.trim(),
        preferredDoctor: currentQuery.preferredDoctor,
        queryText: currentQuery.queryText.trim(),
        urgency: currentQuery.urgency,
        status: 'new', // 'new', 'replied', 'closed'
        submittedAt: new Date().toISOString(),
        doctorReply: null,
        repliedAt: null,
        repliedBy: null,
        isWhatsAppSent: false
      };

      setPatientQueries(prev => [newQuery, ...prev]);
      
      // Integrate with chatbot - Post the query to chat interface
      const queryMessage = {
        type: 'user',
        message: `🩺 Doctor Query Submitted:\n\nPatient: ${currentQuery.patientName}\nQuery: ${currentQuery.queryText}\nUrgency: ${currentQuery.urgency}\nQuery ID: ${newQuery.queryId}`,
        timestamp: new Date(),
        isQuery: true,
        queryId: newQuery.queryId
      };
      
      setChatMessages(prev => [...prev, queryMessage]);
      
      // Auto-generate bot response for query submission
      setTimeout(() => {
        const botResponse = {
          type: 'bot',
          message: `✅ Your medical query has been successfully submitted to our doctors!\n\n📋 **Query Details:**\n• Query ID: ${newQuery.queryId}\n• Patient: ${currentQuery.patientName}\n• Urgency: ${currentQuery.urgency}\n\n👨‍⚕️ **What happens next:**\n• Your query will be reviewed by our qualified doctors\n• You'll receive a WhatsApp notification when they respond\n• Response time varies based on urgency level\n\nThank you for using CareBot! 🏥`,
          timestamp: new Date(),
          isQueryResponse: true
        };
        
        setChatMessages(prev => [...prev, botResponse]);
      }, 1500);
      
      // Reset form
      setCurrentQuery({
        patientName: '',
        contactNumber: '',
        preferredDoctor: '',
        queryText: '',
        urgency: 'normal'
      });
      
      setShowDoctorCommunication(false);
      
      alert(`✅ Your query has been submitted successfully!\n\nQuery ID: ${newQuery.queryId}\n\nA doctor will review your query and respond shortly. You'll receive a WhatsApp notification when they reply.\n\n💬 Check the chatbot for confirmation details!`);
      
    } catch (error) {
      console.error('Query submission error:', error);
      alert('❌ Failed to submit query. Please try again.');
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  const replyToPatientQuery = (queryId, replyText, doctorName) => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    setPatientQueries(prev => 
      prev.map(query => 
        query.id === queryId
          ? {
              ...query,
              status: 'replied',
              doctorReply: replyText.trim(),
              repliedAt: new Date().toISOString(),
              repliedBy: doctorName
            }
          : query
      )
    );

    // Integrate with chatbot - Post doctor's reply to chat interface
    const query = patientQueries.find(q => q.id === queryId);
    if (query) {
      const doctorReplyMessage = {
        type: 'bot',
        message: `👨‍⚕️ **Doctor Reply Received!**\n\n📋 **Query ID:** ${query.queryId}\n🏥 **Doctor:** ${doctorName}\n👤 **Patient:** ${query.patientName}\n\n💬 **Doctor's Response:**\n"${replyText}"\n\n📱 A WhatsApp notification has been sent to the patient.\n\n✅ Query status updated to: Replied`,
        timestamp: new Date(),
        isDoctorReply: true,
        queryId: query.queryId
      };
      
      setChatMessages(prev => [...prev, doctorReplyMessage]);

      // Simulate WhatsApp notification
      setTimeout(() => {
        setPatientQueries(prev => 
          prev.map(q => 
            q.id === queryId
              ? { ...q, isWhatsAppSent: true }
              : q
          )
        );
        
        // Add WhatsApp confirmation to chat
        const whatsappConfirmation = {
          type: 'bot',
          message: `📱 **WhatsApp Notification Sent!**\n\nSent to: ${query.contactNumber}\nMessage: "Dr. ${doctorName} has replied to your query #${query.queryId}"\n\n✅ Patient has been successfully notified.`,
          timestamp: new Date(),
          isWhatsAppNotification: true
        };
        
        setChatMessages(prev => [...prev, whatsappConfirmation]);
        
        alert(`📱 WhatsApp notification sent to ${query.contactNumber}\n\nMessage: "Dr. ${doctorName} has replied to your query #${query.queryId}. Reply: ${replyText.substring(0, 50)}..."`);
      }, 1000);
    }

    alert('✅ Reply sent successfully! Patient will be notified via WhatsApp.\n\n💬 Check the chatbot for confirmation details!');
  };

  const getFilteredQueries = () => {
    let filtered = [...patientQueries];
    
    // Filter by status
    if (queryFilter !== 'all') {
      switch (queryFilter) {
        case 'new':
          filtered = filtered.filter(q => q.status === 'new');
          break;
        case 'replied':
          filtered = filtered.filter(q => q.status === 'replied');
          break;
        case 'urgent':
          filtered = filtered.filter(q => q.urgency === 'urgent' || q.urgency === 'high');
          break;
        default:
          break;
      }
    }
    
    // Filter by doctor
    if (selectedQueryDoctor) {
      filtered = filtered.filter(q => 
        q.preferredDoctor === selectedQueryDoctor || 
        (q.repliedBy && q.repliedBy.includes(selectedQueryDoctor))
      );
    }
    
    // Sort by urgency and date
    filtered.sort((a, b) => {
      const urgencyOrder = { 'urgent': 4, 'high': 3, 'normal': 2, 'low': 1 };
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      
      if (urgencyDiff !== 0) return urgencyDiff;
      
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });
    
    return filtered;
  };

  const markQueryAsClosed = (queryId) => {
    if (window.confirm('Mark this query as closed? This action cannot be undone.')) {
      setPatientQueries(prev => 
        prev.map(query => 
          query.id === queryId
            ? { ...query, status: 'closed', closedAt: new Date().toISOString() }
            : query
        )
      );
      alert('✅ Query marked as closed.');
    }
  };

  const getQueryStats = () => {
    const total = patientQueries.length;
    const newQueries = patientQueries.filter(q => q.status === 'new').length;
    const replied = patientQueries.filter(q => q.status === 'replied').length;
    const urgent = patientQueries.filter(q => q.urgency === 'urgent' || q.urgency === 'high').length;
    const today = patientQueries.filter(q => {
      const queryDate = new Date(q.submittedAt);
      const today = new Date();
      return queryDate.toDateString() === today.toDateString();
    }).length;
    
    return { total, newQueries, replied, urgent, today };
  };

  // Enhanced WhatsApp Notification System for Prescription Uploads
  const sendPrescriptionUploadNotification = async (patientName, contactNumber, uploadId) => {
    try {
      const appLink = "https://carebot-app.com"; // Replace with your actual app URL
      const message = `🏥 *CareBot Healthcare Portal*\n\n✅ Thank you for visiting us, ${patientName}!\n\nYour prescription and medical documents have been successfully uploaded to your healthcare portal.\n\n📋 *Upload Details:*\n• Upload ID: ${uploadId}\n• Date: ${new Date().toLocaleDateString()}\n• Status: Verified\n\n📱 *Access Your Portal:*\n${appLink}\n\n💊 Please follow your prescribed medication schedule and contact us if you have any questions.\n\n🔔 We'll check in with you every 3 days to see how you're feeling.\n\nStay healthy! 🌟`;
      
      // Simulate WhatsApp API call
      console.log(`Sending WhatsApp to ${contactNumber}:`, message);
      
      // In production, this would be an actual WhatsApp API call
      // await fetch('/api/whatsapp/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ to: contactNumber, message })
      // });
      
      return true;
    } catch (error) {
      console.error('WhatsApp notification failed:', error);
      return false;
    }
  };

  const setupAutomatedFollowUpReminders = (patientName, contactNumber, severity = 'medium') => {
    // Determine reminder frequency based on severity
    const reminderSchedule = {
      low: [3, 7, 14], // Days 3, 7, 14
      medium: [3, 6, 9, 12], // Every 3 days for 12 days
      high: [1, 3, 5, 7, 10], // More frequent for high severity
      critical: [1, 2, 3, 5, 7] // Daily then every 2 days
    };

    const schedule = reminderSchedule[severity] || reminderSchedule.medium;
    
    // Store reminder schedule (in production, this would be saved to database)
    const reminders = schedule.map((day, index) => ({
      id: `reminder_${Date.now()}_${index}`,
      patientName,
      contactNumber,
      scheduledDay: day,
      reminderNumber: index + 1,
      status: 'scheduled',
      severity,
      createdAt: new Date().toISOString()
    }));

    console.log(`Scheduled ${reminders.length} follow-up reminders for ${patientName}:`, reminders);
    
    // In production, you would save these to a database and have a cron job process them
    // For demo purposes, we'll simulate the first reminder
    setTimeout(() => {
      sendFollowUpReminder(patientName, contactNumber, 1, severity);
    }, 5000); // Simulate first reminder after 5 seconds for demo
    
    return reminders;
  };

  const sendFollowUpReminder = async (patientName, contactNumber, reminderNumber, severity) => {
    try {
      const appLink = "https://carebot-app.com";
      const severityEmojis = {
        low: '🟢',
        medium: '🟡', 
        high: '🟠',
        critical: '🔴'
      };

      const message = `🏥 *CareBot Follow-up Check #${reminderNumber}*\n\nHi ${patientName}! 👋\n\nWe hope you're feeling better! ${severityEmojis[severity]}\n\n❓ *How are you doing today?*\n• Are you taking your medications as prescribed?\n• Any side effects or concerns?\n• Do you feel your condition is improving?\n\n📱 *Quick Update Options:*\n• Reply "GOOD" - Feeling better\n• Reply "SAME" - No change\n• Reply "WORSE" - Need help\n• Reply "CALL" - Request callback\n\n💊 *Medication Reminder:*\nPlease continue following your prescribed treatment plan.\n\n📲 Access your portal: ${appLink}\n\n🆘 For emergencies, call 911 immediately.\n\nTake care! 💙`;
      
      console.log(`Sending follow-up reminder to ${contactNumber}:`, message);
      
      // In production, this would be an actual WhatsApp API call
      return true;
    } catch (error) {
      console.error('Follow-up reminder failed:', error);
      return false;
    }
  };

  // const handlePatientResponse = (contactNumber, response) => { // Unused - commented out
  //   // Handle patient responses to follow-up messages
  //   const responseActions = {
  //     'GOOD': () => console.log('Patient feeling better - continue current schedule'),
  //     'SAME': () => console.log('No change - may need medication adjustment'),
  //     'WORSE': () => console.log('Condition worsening - escalate to doctor'),
  //     'CALL': () => console.log('Patient requests callback - schedule immediately')
  //   };

  //   const action = responseActions[response.toUpperCase()];
  //   if (action) {
  //     action();
  //     // In production, this would update the patient's status and potentially alert healthcare providers
  //   }
  // };

  // const closeDoctorManagement = () => { // Unused - commented out
  //   setCurrentAdminView('none');
  //   resetDoctorForm();
  //   setEditingDoctor(null);
  //   setSelectedDoctorForSchedule(null);
  // };

  const resetDoctorForm = () => {
    setDoctorForm({
      name: '',
      specialty: '',
      qualifications: '',
      experience: '',
      consultationFee: '',
      availableDays: [],
      timeSlots: [],
      languages: [],
      about: '',
      image: '👨‍⚕️'
    });
  };

  const handleDoctorFormChange = (field, value) => {
    setDoctorForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      name: doctor.name,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications || '',
      experience: doctor.experience,
      consultationFee: doctor.consultationFee.toString(),
      availableDays: [...(doctor.availableDays || [])],
      timeSlots: [...(doctor.timeSlots || [])],
      languages: [...(doctor.languages || [])],
      about: doctor.about || '',
      image: doctor.image || '👨‍⚕️'
    });
    setSelectedDoctorForSchedule(null);
  };

  const saveDoctor = async () => {
    // Validation
    if (!doctorForm.name.trim()) {
      alert('Please enter the doctor\'s name');
      return;
    }
    
    if (!doctorForm.specialty.trim()) {
      alert('Please select a medical specialty');
      return;
    }
    
    if (!doctorForm.experience.trim()) {
      alert('Please enter the doctor\'s experience');
      return;
    }
    
    if (!doctorForm.consultationFee.trim()) {
      alert('Please enter the consultation fee');
      return;
    }
    
    if (doctorForm.availableDays.length === 0) {
      alert('Please select at least one available day');
      return;
    }
    
    if (doctorForm.timeSlots.length === 0) {
      alert('Please select at least one time slot');
      return;
    }

    setIsSavingDoctor(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const doctorData = {
        id: editingDoctor ? editingDoctor.id : `doctor_${Date.now()}`,
        name: doctorForm.name.trim(),
        specialty: doctorForm.specialty,
        qualifications: doctorForm.qualifications.trim(),
        experience: doctorForm.experience.trim(),
        consultationFee: parseInt(doctorForm.consultationFee) || 500,
        availableDays: [...doctorForm.availableDays],
        timeSlots: [...doctorForm.timeSlots],
        languages: [...doctorForm.languages],
        about: doctorForm.about.trim(),
        image: doctorForm.image,
        rating: editingDoctor ? editingDoctor.rating : (4.0 + Math.random() * 1.0).toFixed(1),
        isActive: true,
        dateAdded: editingDoctor ? editingDoctor.dateAdded : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      if (editingDoctor) {
        // Update existing doctor
        setManagedDoctors(prev => 
          prev.map(doc => doc.id === editingDoctor.id ? doctorData : doc)
        );
        
        // Also update the main doctors database for appointment booking
        setDoctorsDatabase(prev => 
          prev.map(doc => doc.id === editingDoctor.id ? doctorData : doc)
        );
        
        alert(`✅ Dr. ${doctorData.name} updated successfully!\n\nUpdated information:\n• Specialty: ${doctorData.specialty}\n• Available Days: ${doctorData.availableDays.join(', ')}\n• Time Slots: ${doctorData.timeSlots.length} slots\n• Consultation Fee: ₹${doctorData.consultationFee}`);
      } else {
        // Add new doctor
        setManagedDoctors(prev => [...prev, doctorData]);
        
        // Also add to main doctors database for appointment booking
        setDoctorsDatabase(prev => [...prev, doctorData]);
        
        alert(`✅ Dr. ${doctorData.name} added successfully!\n\nDoctor Details:\n• Specialty: ${doctorData.specialty}\n• Available Days: ${doctorData.availableDays.join(', ')}\n• Time Slots: ${doctorData.timeSlots.length} slots\n• Consultation Fee: ₹${doctorData.consultationFee}\n\nPatients can now book appointments with this doctor!`);
      }

      resetDoctorForm();
      setEditingDoctor(null);
      setSelectedDoctorForSchedule(null);
      
      // Navigate back to "All Doctors" view and scroll to top
      setTimeout(() => {
        // Scroll to top of the doctor management section
        const doctorManagementElement = document.querySelector('.doctor-management-section');
        if (doctorManagementElement) {
          doctorManagementElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        } else {
          // Fallback: scroll to top of page
          window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert('Failed to save doctor. Please try again.');
    } finally {
      setIsSavingDoctor(false);
    }
  };

  const deleteDoctor = async (doctorId) => {
    const doctor = managedDoctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    if (!window.confirm(`⚠️ Delete Doctor Confirmation\n\nAre you sure you want to delete Dr. ${doctor.name}?\n\n• This will remove the doctor from the system\n• All future appointments will be cancelled\n• This action cannot be undone\n\nType 'DELETE' to confirm:`)) {
      return;
    }

    try {
      // Remove from managed doctors
      setManagedDoctors(prev => prev.filter(doc => doc.id !== doctorId));
      
      // Remove from main doctors database
      setDoctorsDatabase(prev => prev.filter(doc => doc.id !== doctorId));
      
      // Clear any related schedule data
      // setDoctorSchedule(prev => { // Commented out - doctorSchedule state is unused
      //   const newSchedule = { ...prev };
      //   delete newSchedule[doctorId];
      //   return newSchedule;
      // });
      
      alert(`✅ Dr. ${doctor.name} has been successfully removed from the system.`);
      
      // Reset views if deleted doctor was selected
      if (selectedDoctorForSchedule?.id === doctorId) {
        setSelectedDoctorForSchedule(null);
      }
      if (editingDoctor?.id === doctorId) {
        setEditingDoctor(null);
        resetDoctorForm();
      }
      
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Failed to delete doctor. Please try again.');
    }
  };

  // Advanced schedule management functions
  // const updateDoctorSchedule = async (doctorId, date, timeSlots) => { // Unused - commented out
  //   try {
  //     const updatedSchedule = {
  //       ...doctorSchedule,
  //       [doctorId]: {
  //         ...doctorSchedule[doctorId],
  //         [date]: timeSlots
  //       }
  //     };
      
  //     setDoctorSchedule(updatedSchedule);
      
  //     // Also update the doctor's default time slots if needed
  //     const doctor = managedDoctors.find(d => d.id === doctorId);
  //     if (doctor) {
  //       const updatedDoctor = {
  //         ...doctor,
  //         timeSlots: timeSlots,
  //         lastUpdated: new Date().toISOString()
  //       };
        
  //       setManagedDoctors(prev => 
  //         prev.map(doc => doc.id === doctorId ? updatedDoctor : doc)
  //       );
        
  //       setDoctorsDatabase(prev => 
  //         prev.map(doc => doc.id === doctorId ? updatedDoctor : doc)
  //       );
  //     }
      
  //     alert('Schedule updated successfully!');
      
  //   } catch (error) {
  //     console.error('Error updating schedule:', error);
  //     alert('Failed to update schedule. Please try again.');
  //   }
  // };

  // const toggleDoctorAvailability = async (doctorId, isActive) => { // Unused - commented out
  //   try {
  //     const updatedDoctors = managedDoctors.map(doctor => 
  //       doctor.id === doctorId 
  //         ? { ...doctor, isActive, lastUpdated: new Date().toISOString() }
  //         : doctor
  //     );
      
  //     setManagedDoctors(updatedDoctors);
      
  //     // Also update main database
  //     setDoctorsDatabase(prev => 
  //       prev.map(doc => doc.id === doctorId ? { ...doc, isActive } : doc)
  //     );
      
  //     const doctor = managedDoctors.find(d => d.id === doctorId);
  //     alert(`Dr. ${doctor?.name} is now ${isActive ? 'ACTIVE' : 'INACTIVE'} in the system.`);
      
  //   } catch (error) {
  //     console.error('Error toggling doctor availability:', error);
  //     alert('Failed to update doctor status. Please try again.');
  //   }
  // };

  // Get available doctors with real-time status
  const getAvailableDoctors = () => {
    // Merge managed doctors with original database, prioritizing managed doctors
    const allDoctors = [...doctorsDatabase];
    
    // Replace any doctors that exist in managedDoctors
    managedDoctors.forEach(managedDoc => {
      const index = allDoctors.findIndex(doc => doc.id === managedDoc.id);
      if (index !== -1) {
        allDoctors[index] = managedDoc;
      } else {
        allDoctors.push(managedDoc);
      }
    });
    
    // Only return active doctors
    return allDoctors.filter(doctor => doctor.isActive !== false);
  };

  // Enhanced appointment booking with real-time availability
  // const generateTimeSlotsWithSchedule = (doctor, selectedDate) => { // Unused - commented out
  //   if (!doctor || !selectedDate) return [];
    
  //   const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    
  //   if (!doctor.availableDays.includes(dayOfWeek)) {
  //     return [];
  //   }
    
  //   // Check if admin has set custom schedule for this doctor and date
  //   const customSchedule = doctorSchedule[doctor.id]?.[selectedDate];
    
  //   if (customSchedule) {
  //     return customSchedule.map(time => ({
  //       time: time,
  //       available: true // Admin-defined slots are available
  //     }));
  //   }
    
  //   // Use default schedule with some slots marked as booked (simulation)
  //   return doctor.timeSlots.map(time => ({
  //     time: time,
  //     available: Math.random() > 0.2 // 80% availability simulation
  //   }));
  // };

  // Conversational Booking System - Direct in Chat
  const startChatBooking = (doctorSpecialty = null, urgency = 'routine') => {
    setChatBookingFlow({
      isActive: true,
      step: 'askName',
      data: { 
        specialty: doctorSpecialty, 
        urgency: urgency,
        patientName: isLoggedIn ? patientName : '',
        contactNumber: isLoggedIn ? contactNumber : ''
      }
    });
    
    return "🩺 **Let's book your appointment!**\n\nI'll help you book an appointment step by step. This will only take 2-3 minutes.\n\n**First, what's your full name?**\n\n💡 *Type your name exactly as you'd like it on the appointment*";
  };

  const handleChatBookingResponse = async (userMessage) => {
    const currentFlow = chatBookingFlow;
    
    switch (currentFlow.step) {
      case 'askName':
        if (userMessage.trim().length < 2) {
          return "Please enter your full name (at least 2 characters)";
        }
        setChatBookingFlow(prev => ({
          ...prev,
          step: 'askPhone',
          data: { ...prev.data, patientName: userMessage.trim() }
        }));
        return `👋 **Nice to meet you, ${userMessage.trim()}!**\n\n📱 **Now, what's your phone number?**\n\n💡 *We'll use this to send you appointment confirmations*\n\n*Example: +91-9876543210*`;

      case 'askPhone':
        const phoneRegex = /^[+]?[0-9\-\s()]{10,15}$/;
        if (!phoneRegex.test(userMessage.trim())) {
          return "⚠️ Please enter a valid phone number\n\n*Example formats:*\n• +91-9876543210\n• 9876543210\n• (+91) 98765-43210";
        }
        setChatBookingFlow(prev => ({
          ...prev,
          step: currentFlow.data.specialty ? 'selectDoctor' : 'askSpecialty',
          data: { ...prev.data, contactNumber: userMessage.trim() }
        }));
        
        if (currentFlow.data.specialty) {
          return showDoctorSelection(currentFlow.data.specialty);
        } else {
          return "📋 **What type of doctor do you need?**\n\n**Available specialties:**\n" + 
                 medicalSpecialties.map((spec, index) => `${index + 1}. ${spec}`).join('\n') +
                 "\n\n💡 *Type the number or specialty name*\n*Example: Type '2' or 'Cardiology'*";
        }

      case 'askSpecialty':
        const selectedSpecialty = parseSpecialtyInput(userMessage);
        if (!selectedSpecialty) {
          return "⚠️ **Please select a valid specialty**\n\n**Available options:**\n" + 
                 medicalSpecialties.map((spec, index) => `${index + 1}. ${spec}`).join('\n') +
                 "\n\n💡 *Type the number or specialty name*";
        }
        setChatBookingFlow(prev => ({
          ...prev,
          step: 'selectDoctor',
          data: { ...prev.data, specialty: selectedSpecialty }
        }));
        return showDoctorSelection(selectedSpecialty);

      case 'selectDoctor':
        const selectedDoctor = parseDoctorInput(userMessage, currentFlow.data.specialty);
        if (!selectedDoctor) {
          return "⚠️ **Please select a valid doctor**\n\n" + showDoctorSelection(currentFlow.data.specialty);
        }
        setChatBookingFlow(prev => ({
          ...prev,
          step: 'selectDate',
          data: { ...prev.data, selectedDoctor: selectedDoctor }
        }));
        return showDateSelection();

      case 'selectDate':
        const selectedDate = parseDateInput(userMessage);
        if (!selectedDate) {
          return "⚠️ **Please enter a valid date**\n\n" + showDateSelection();
        }
        setChatBookingFlow(prev => ({
          ...prev,
          step: 'selectTime',
          data: { ...prev.data, selectedDate: selectedDate }
        }));
        return showTimeSelection(currentFlow.data.selectedDoctor, selectedDate);

      case 'selectTime':
        const selectedTime = parseTimeInput(userMessage);
        if (!selectedTime) {
          return "⚠️ **Please select a valid time slot**\n\n" + 
                 showTimeSelection(currentFlow.data.selectedDoctor, currentFlow.data.selectedDate);
        }
        setChatBookingFlow(prev => ({
          ...prev,
          step: 'confirm',
          data: { ...prev.data, selectedTime: selectedTime }
        }));
        return showBookingConfirmation();

      case 'confirm':
        if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('confirm')) {
          return await completeBooking();
        } else if (userMessage.toLowerCase().includes('no') || userMessage.toLowerCase().includes('cancel')) {
          setChatBookingFlow({ isActive: false, step: 'init', data: {} });
          return "❌ **Booking cancelled**\n\nNo problem! You can start a new booking anytime by typing 'book appointment'.\n\nIs there anything else I can help you with?";
        } else {
          return "**Please confirm your appointment**\n\n💡 Type 'Yes' to confirm or 'No' to cancel\n\n" + showBookingConfirmation();
        }

      default:
        return "Something went wrong. Let's start over. Type 'book appointment' to begin.";
    }
  };

  const parseSpecialtyInput = (input) => {
    const cleaned = input.trim().toLowerCase();
    
    // Check if it's a number
    const num = parseInt(cleaned);
    if (!isNaN(num) && num >= 1 && num <= medicalSpecialties.length) {
      return medicalSpecialties[num - 1];
    }
    
    // Check if it matches a specialty name
    return medicalSpecialties.find(specialty => 
      specialty.toLowerCase().includes(cleaned) || 
      cleaned.includes(specialty.toLowerCase()) ||
      (specialty === 'General Medicine' && (cleaned.includes('general') || cleaned.includes('family')))
    );
  };

  const parseDoctorInput = (input, specialty) => {
    const availableDoctors = getAvailableDoctors().filter(doc => doc.specialty === specialty);
    const cleaned = input.trim().toLowerCase();
    
    // Check if it's a number
    const num = parseInt(cleaned);
    if (!isNaN(num) && num >= 1 && num <= availableDoctors.length) {
      return availableDoctors[num - 1];
    }
    
    // Check if it matches doctor name
    return availableDoctors.find(doctor => 
      doctor.name.toLowerCase().includes(cleaned) || 
      cleaned.includes(doctor.name.toLowerCase())
    );
  };

  const parseDateInput = (input) => {
    const cleaned = input.trim().toLowerCase();
    const today = new Date();
    
    // Handle relative dates
    if (cleaned.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    if (cleaned.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    // Handle number selection
    const num = parseInt(cleaned);
    if (!isNaN(num) && num >= 1 && num <= 7) {
      const selectedDate = new Date(today);
      selectedDate.setDate(selectedDate.getDate() + (num - 1));
      return selectedDate.toISOString().split('T')[0];
    }
    
    // Handle date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(cleaned)) {
      const inputDate = new Date(cleaned);
      if (inputDate >= today) {
        return cleaned;
      }
    }
    
    return null;
  };

  const parseTimeInput = (input) => {
    const cleaned = input.trim().toLowerCase();
    
    // Check if it's a number (1-8 for typical time slots)
    const num = parseInt(cleaned);
    if (!isNaN(num) && num >= 1 && num <= 8) {
      const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
      return timeSlots[num - 1];
    }
    
    // Check for time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(cleaned.replace(/\s/g, ''))) {
      return cleaned.replace(/\s/g, '');
    }
    
    // Check for common time expressions
    const timeMap = {
      '9am': '09:00', '10am': '10:00', '11am': '11:00',
      '2pm': '14:00', '3pm': '15:00', '4pm': '16:00', '5pm': '17:00', '6pm': '18:00',
      'morning': '10:00', 'afternoon': '15:00', 'evening': '17:00'
    };
    
    return timeMap[cleaned] || null;
  };

  const showDoctorSelection = (specialty) => {
    const availableDoctors = getAvailableDoctors().filter(doc => doc.specialty === specialty);
    return `👨‍⚕️ **Available ${specialty} Doctors:**\n\n` +
           availableDoctors.map((doc, index) => 
             `**${index + 1}. Dr. ${doc.name}** ${doc.image}\n` +
             `   • Experience: ${doc.experience}\n` +
             `   • Rating: ⭐${doc.rating}\n` +
             `   • Fee: ₹${doc.consultationFee}\n` +
             `   • Languages: ${doc.languages.join(', ')}\n`
           ).join('\n') +
           "\n💡 **Type the number or doctor's name**\n*Example: Type '1' or 'Dr. Smith'*";
  };

  const showDateSelection = () => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push(`${i + 1}. ${dayName}, ${dateStr}${i === 0 ? ' (Today)' : i === 1 ? ' (Tomorrow)' : ''}`);
    }
    
    return "📅 **When would you like your appointment?**\n\n" +
           dates.join('\n') +
           "\n\n💡 **Type the number, day name, or date**\n*Examples: '2', 'Tomorrow', '2024-12-05'*";
  };

  const showTimeSelection = (doctor, date) => {
    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const availableSlots = timeSlots.filter(time => Math.random() > 0.3); // Simulate availability
    
    return `⏰ **Available time slots for Dr. ${doctor.name} on ${date}:**\n\n` +
           availableSlots.map((time, index) => {
             const hour = parseInt(time.split(':')[0]);
             const period = hour >= 12 ? 'PM' : 'AM';
             const displayHour = hour > 12 ? hour - 12 : hour;
             return `${index + 1}. ${displayHour}:${time.split(':')[1]} ${period}`;
           }).join('\n') +
           "\n\n💡 **Type the number or time**\n*Examples: '3', '2pm', '15:00'*";
  };

  const showBookingConfirmation = () => {
    const data = chatBookingFlow.data;
    const appointmentDate = new Date(data.selectedDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `✅ **Please confirm your appointment details:**\n\n` +
           `👤 **Patient:** ${data.patientName}\n` +
           `📱 **Phone:** ${data.contactNumber}\n` +
           `👨‍⚕️ **Doctor:** Dr. ${data.selectedDoctor.name}\n` +
           `🏥 **Specialty:** ${data.selectedDoctor.specialty}\n` +
           `📅 **Date:** ${appointmentDate}\n` +
           `⏰ **Time:** ${data.selectedTime}\n` +
           `💰 **Fee:** ₹${data.selectedDoctor.consultationFee}\n\n` +
           `**Type 'Yes' to confirm or 'No' to cancel**`;
  };

  const completeBooking = async () => {
    const data = chatBookingFlow.data;
    
    try {
      // Simulate booking process
      const newAppointment = {
        id: Date.now(),
        appointmentId: `APT${Date.now().toString().slice(-6)}`,
        patientName: data.patientName,
        contactNumber: data.contactNumber,
        doctor: data.selectedDoctor,
        appointmentDate: data.selectedDate,
        appointmentTime: data.selectedTime,
        specialty: data.selectedDoctor.specialty,
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        fee: data.selectedDoctor.consultationFee
      };
      
      setBookedAppointments(prev => [...prev, newAppointment]);
      setChatBookingFlow({ isActive: false, step: 'init', data: {} });
      
      return `🎉 **Appointment Booked Successfully!**\n\n` +
             `📋 **Appointment ID:** ${newAppointment.appointmentId}\n` +
             `👨‍⚕️ **Doctor:** Dr. ${data.selectedDoctor.name}\n` +
             `📅 **Date:** ${new Date(data.selectedDate).toLocaleDateString()}\n` +
             `⏰ **Time:** ${data.selectedTime}\n\n` +
             `📱 **You'll receive a confirmation SMS shortly at ${data.contactNumber}**\n\n` +
             `💡 **Important reminders:**\n` +
             `• Arrive 15 minutes early\n` +
             `• Bring a valid ID\n` +
             `• Bring any previous medical records\n` +
             `• Payment can be made at the clinic\n\n` +
             `**Need to reschedule?** Just type 'reschedule appointment'`;
             
    } catch (error) {
      console.error('Booking error:', error);
      return "❌ **Booking failed**\n\nSorry, there was an error processing your appointment. Please try again or contact our support team.";
    }
  };

  // Enhanced chatbot integration for direct booking
  const handleChatbotAppointmentBooking = (doctorSpecialty = null, urgency = 'routine') => {
    // Start conversational booking instead of opening form
    return startChatBooking(doctorSpecialty, urgency);
  };

  // Carebot Knowledge Base from FAQ
  const getCarebotResponse = async (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // Handle conversational booking flow
    if (chatBookingFlow.isActive) {
      return await handleChatBookingResponse(userMessage);
    }
    
    // Emergency situations
    if (msg.includes('emergency') || msg.includes('911') || msg.includes('chest pain') || 
        msg.includes('difficulty breathing') || msg.includes('heart attack') || 
        msg.includes('stroke') || msg.includes('bleeding') || msg.includes('unconscious')) {
      return "🚨 **EMERGENCY ALERT** 🚨\n\nFor medical emergencies, **call 911 immediately** or go to the nearest emergency room. Do not rely on Carebot for emergency medical advice.\n\n**Emergency signs include:**\n• Chest pain or pressure\n• Difficulty breathing\n• Severe bleeding\n• Loss of consciousness\n• Signs of stroke\n• Severe injuries\n\n**Get immediate medical help now!**";
    }

    // Doctor Communication - Ask Doctor a Question (PRIORITIZED BEFORE APPOINTMENT BOOKING)
    if (msg.includes('ask doctor') || msg.includes('talk to doctor') || msg.includes('communicate with doctor') || 
        msg.includes('question for doctor') || msg.includes('speak with doctor') || msg.includes('contact doctor') ||
        msg.includes('doctor query') || msg.includes('medical query') || msg.includes('ask a doctor') ||
        msg.includes('need doctor advice') || msg.includes('consult doctor') || msg.includes('doctor advice') ||
        msg.includes('medical question') || msg.includes('health question')) {
      return "👨‍⚕️ **Communicate with Doctor**\n\n📝 **Would you like to send a question to our doctors?**\n\nOur qualified doctors can answer your medical questions, concerns, and provide professional guidance.\n\n**How it works:**\n1. ✍️ You submit your question\n2. 👨‍⚕️ A doctor reviews it\n3. 💬 You get a personalized response\n4. 📱 WhatsApp notification when replied\n\n**What you can ask:**\n• Medical symptoms or concerns\n• Treatment questions\n• Medication queries\n• General health advice\n• Second opinions\n\n**Ready to ask a doctor?** 🚀\n\n💬 Type **'start doctor communication'** to begin\n💬 Or click the 'Ask Doctor' quick action below\n\nNote: For emergencies, call 911 immediately!";
    }

    // Start doctor communication flow
    if (msg.includes('start doctor communication') || msg.includes('ask doctor now') || 
        msg.includes('submit question') || msg.includes('doctor question form') ||
        msg.includes('open form') || msg.includes('yes, ask doctor') || msg.includes('begin consultation')) {
      // Automatically trigger the doctor communication form
      setTimeout(() => {
        initiateDoctorCommunication();
      }, 1000);
      return "📝 **Doctor Communication Started!**\n\n✨ **Opening communication form for you...**\n\nPlease fill in:\n• Your name and contact number\n• Preferred doctor (optional)\n• Your question/concern\n• Urgency level\n\nYou'll receive a WhatsApp notification when a doctor replies!\n\n🔄 *Form will open in a moment...*";
    }

    // Medication and Alternative Medicine Queries
    if (msg.includes('alternative') || msg.includes('substitute') || msg.includes('similar medicine') ||
        msg.includes('replacement') || msg.includes('medicine alternative') || msg.includes('drug alternative') ||
        msg.includes('what can i take instead')) {
      
      // Extract medicine name from the query
      const medicineKeywords = ['for', 'to', 'of', 'instead of', 'alternative for', 'substitute for'];
      let medicineName = msg;
      
      // Remove common words to extract medicine name
      medicineKeywords.forEach(keyword => {
        if (msg.includes(keyword)) {
          const parts = msg.split(keyword);
          if (parts.length > 1) {
            medicineName = parts[parts.length - 1].trim();
          }
        }
      });
      
      // Clean up the medicine name
      medicineName = medicineName.replace(/[^\w\s]/g, '').trim();
      
      if (medicineName && medicineName.length > 2) {
        return findMedicineAlternatives(medicineName);
      } else {
        return "💊 **Medicine Alternative Search**\n\n🔍 **I can help you find alternative medicines!**\n\n**How to ask:**\n• \"Alternative for Crocin\"\n• \"Substitute for Brufen 400\"\n• \"What can I take instead of Allegra?\"\n• \"Similar medicine to Nexito\"\n\n**Available medicines in our database:**\n• Crocin Advance (Paracetamol)\n• Brufen 400 (Ibuprofen)\n• Allegra 120 (Fexofenadine)\n• Avil 25 (Pheniramine Maleate)\n• Amoxycillin 500mg\n• Nexito 10 (Escitalopram)\n• Montina-L Tablet\n• Zerodol P\n• Pantocid D\n• Atarax 25mg\n\n💬 **Try asking:** \"Alternative for [medicine name]\"";
      }
    }

    // General medicine information queries
    if (msg.includes('medicine') || msg.includes('medication') || msg.includes('drug') || 
        msg.includes('tablet') || msg.includes('capsule') || msg.includes('pill')) {
      
      // Check if asking about specific medicine
      const foundMedicine = medicineDatabase.find(medicine => 
        msg.includes(medicine.brandName.toLowerCase()) ||
        msg.includes(medicine.activeIngredient.toLowerCase()) ||
        medicine.brandName.toLowerCase().split(' ').some(word => msg.includes(word.toLowerCase()))
      );
      
      if (foundMedicine) {
        const statusIcon = {
          'In stock': '✅',
          'Low stock': '⚠️',
          'Unavailable': '❌'
        };
        
        return `💊 **${foundMedicine.brandName}** Information\n\n` +
          `**Active Ingredient:** ${foundMedicine.activeIngredient}\n` +
          `**Category:** ${foundMedicine.category}\n` +
          `**Availability:** ${statusIcon[foundMedicine.availabilityStatus]} ${foundMedicine.availabilityStatus}\n` +
          `**Price:** ${foundMedicine.price}\n\n` +
          `**Uses:**\n${foundMedicine.uses.map(use => `• ${use}`).join('\n')}\n\n` +
          `**Dosage:** ${foundMedicine.dosageInstructions}\n\n` +
          `**Similar Alternatives:** ${foundMedicine.alternatives}\n\n` +
          `**Prescription Required:** ${foundMedicine.prescriptionRequired ? 'Yes ⚠️' : 'No ✅'}\n\n` +
          `⚠️ **Important:** Always consult your doctor or pharmacist before taking any medication.`;
      } else {
        return "💊 **Medicine Information**\n\nI can provide information about medicines in our database:\n\n**Available medicines:**\n• Crocin Advance (Pain/Fever relief)\n• Brufen 400 (Anti-inflammatory)\n• Allegra 120 (Allergy relief)\n• Avil 25 (Antihistamine)\n• Amoxycillin 500mg (Antibiotic)\n• Nexito 10 (Antidepressant)\n• Montina-L (Anti-allergy/Asthma)\n• Zerodol P (Pain relief)\n• Pantocid D (Acid reducer)\n• Atarax 25mg (Anti-anxiety)\n\n**You can ask:**\n• \"Tell me about Crocin\"\n• \"Alternative for Brufen\"\n• \"What is Nexito used for?\"\n• \"Is Allegra available?\"\n\n⚠️ **Important:** This is general information only. Always consult your healthcare provider for medical advice.";
      }
    }

    // Appointment Booking - Start conversational flow (MORE SPECIFIC CONDITIONS)
    if ((msg.includes('appointment') || msg.includes('book')) || 
        (msg.includes('schedule') || msg.includes('visit') || msg.includes('consultation')) ||
        (msg.includes('see a doctor') && !msg.includes('ask')) || msg.includes('medical consultation')) {
      
      // Handle direct booking requests
      if (msg.includes('book now') || msg.includes('book appointment now') || msg.includes('start booking')) {
        return handleChatbotAppointmentBooking();
      }
      
      // If user wants to book with specific specialty
      const specialtyMatch = medicalSpecialties.find(specialty => 
        msg.includes(specialty.toLowerCase()) || 
        msg.includes(specialty.toLowerCase().replace('ology', '')) ||
        (specialty === 'General Medicine' && (msg.includes('general') || msg.includes('family'))) ||
        (specialty === 'ENT' && (msg.includes('ear') || msg.includes('nose') || msg.includes('throat')))
      );
      
      if (specialtyMatch && (msg.includes('book with') || msg.includes('book for') || msg.includes('need'))) {
        return handleChatbotAppointmentBooking(specialtyMatch);
      }
      
      // Handle urgency-based booking
      if (msg.includes('urgent') || msg.includes('emergency') || msg.includes('asap') || msg.includes('today')) {
        return handleChatbotAppointmentBooking(null, 'urgent');
      }
      
      // If user is asking about available doctors or specialties
      if (msg.includes('available doctors') || msg.includes('specialties') || msg.includes('which doctors')) {
        const currentDoctors = getAvailableDoctors();
        return `🩺 **Available Medical Specialties & Doctors**\n\nOur healthcare network includes specialists in:\n${medicalSpecialties.map(s => `• ${s}`).join('\n')}\n\n**Featured Doctors:**\n${currentDoctors.slice(0, 3).map(doc => `• ${doc.name} - ${doc.specialty} (${doc.experience} experience, ⭐${doc.rating})`).join('\n')}\n\n**Quick Booking:**\n💬 Type "book now" to start booking immediately\n💬 Type "book with [specialty]" for specific doctor\n� Type "urgent appointment" for same-day booking\n\nReady to book? Just say "book now"!`;
      }
      
      if (specialtyMatch) {
        const currentDoctors = getAvailableDoctors();
        const specialtyDoctors = currentDoctors.filter(doc => doc.specialty === specialtyMatch);
        
        return `🏥 **${specialtyMatch} Doctors Available**\n\n${specialtyDoctors.map(doc => 
          `**${doc.name}** ${doc.image}\n• Experience: ${doc.experience}\n• Rating: ⭐${doc.rating}\n• Fee: ₹${doc.consultationFee}\n• Languages: ${doc.languages.join(', ')}\n• About: ${doc.about}`
        ).join('\n\n')}\n\n**To book with these doctors:**\n💬 Type "book with ${specialtyMatch}"\n💬 Type "book now" for quick booking\n\nShall I start the booking process for you?`;
      }
      
      // General appointment booking response
      return "📅 **Doctor Appointment Booking**\n\nI can help you book an appointment right here in the chat! No forms to fill out.\n\n**Quick Start:**\n💬 **Type 'book now'** - I'll guide you step-by-step\n💬 **Type 'book with [specialty]'** - For specific doctors\n💬 **Type 'urgent appointment'** - For same-day booking\n\n**Available Specialties:**\n• General Medicine • Cardiology • Dermatology\n• Orthopedics • Pediatrics • Neurology\n\n**It's easy - I'll ask you:**\n1. Your name and phone number\n2. What type of doctor you need\n3. Your preferred date and time\n4. Confirm the details\n\n**Ready to book?** Just say 'book now' and I'll get started!";
    }

    // Appointment status or history
    if (msg.includes('my appointment') || msg.includes('appointment status') || 
        msg.includes('when is my appointment') || msg.includes('appointment history')) {
      if (bookedAppointments.length > 0) {
        const upcomingAppointments = bookedAppointments.filter(apt => 
          new Date(apt.appointmentDate) >= new Date()
        );
        
        if (upcomingAppointments.length > 0) {
          return `📋 **Your Upcoming Appointments**\n\n${upcomingAppointments.map(apt => 
            `**Appointment ID:** ${apt.appointmentId}\n• Doctor: ${apt.doctor.name}\n• Specialty: ${apt.doctor.specialty}\n• Date: ${apt.appointmentDate}\n• Time: ${apt.appointmentTime}\n• Status: ${apt.status}\n• Fee: ₹${apt.doctor.consultationFee}`
          ).join('\n\n')}\n\n**Need to reschedule or cancel?** Please contact our support team or use the appointment management section.`;
        } else {
          return "📅 **No Upcoming Appointments**\n\nYou don't have any upcoming appointments scheduled.\n\nWould you like to book a new appointment? Click the '📅 Book Appointment' quick action below to get started!";
        }
      } else {
        return "📅 **No Appointments Found**\n\nYou haven't booked any appointments yet.\n\n**To book your first appointment:**\n1. Click '📅 Book Appointment' below\n2. Fill in your details\n3. Choose your preferred doctor and time\n4. Confirm your booking\n\nWould you like to book an appointment now?";
      }
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
      setTimeout(async () => {
        const botResponse = await getCarebotResponse(userMessage);
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
  const isDoctor = userRole === 'doctor';
  const hasUploadAccess = isAdmin; // Only admins can access upload functionality
  const hasDashboardAccess = isAdmin || isDoctor; // Both admins and doctors can access dashboard

  // Login simulation function
  const handleLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    // Set default admin view to none (clean interface)
    if (role === 'admin') {
      setCurrentAdminView('none');
    }
    // For doctors, show the welcome screen instead of auto-loading dashboard
    if (role === 'doctor') {
      setShowPatientsDashboard(false);
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
    // Reset admin and doctor view states
    setCurrentAdminView('none');
    setShowPatientsDashboard(false);
    setSelectedPatient(null);
    setPatientDocuments([]);
    // Reset edit states
    setEditingPatient(null);
    setEditPatientName('');
    setEditContactNumber('');
    setEditDateOfBirth('');
    setIsSavingEdit(false);
  };

  // Patients Dashboard Functions
  const loadPatientsDashboard = async () => {
    setIsLoadingPatients(true);
    try {
      // Fetch patients
      const patientsResponse = await axios.get(getApiUrl('/patients'), { timeout: 10000 });
      setPatients(patientsResponse.data);

      // Fetch documents
      // const documentsResponse = await axios.get(getApiUrl('/documents'), { timeout: 10000 }); // Unused - commented out
      // setDocuments(documentsResponse.data); // Removed - documents state is unused

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

  // Edit patient functions
  const startEditPatient = (patient) => {
    setEditingPatient(patient);
    setEditPatientName(patient.patientName);
    setEditContactNumber(patient.contactNumber);
    setEditDateOfBirth(patient.dateOfBirth);
  };

  const cancelEditPatient = () => {
    setEditingPatient(null);
    setEditPatientName('');
    setEditContactNumber('');
    setEditDateOfBirth('');
  };

  const saveEditPatient = async () => {
    if (!editPatientName.trim() || !editContactNumber.trim() || !editDateOfBirth.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append('patientName', editPatientName.trim());
      formData.append('contactNumber', editContactNumber.trim());
      formData.append('dateOfBirth', editDateOfBirth);
      formData.append('updatedBy', userRole);

      const response = await axios.put(
        getApiUrl(`/patients/${editingPatient.id}`),
        formData,
        { timeout: 10000 }
      );

      if (response.status === 200) {
        // Update local state
        setPatients(prev => prev.map(p => 
          p.id === editingPatient.id ? response.data.patient : p
        ));
        
        // Update selected patient if it's the one being edited
        if (selectedPatient?.id === editingPatient.id) {
          setSelectedPatient(response.data.patient);
        }

        alert('Patient updated successfully!');
        cancelEditPatient();
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deletePatient = async (patient) => {
    if (!window.confirm(`Are you sure you want to delete patient "${patient.patientName}"?\n\nThis will also delete all associated documents and cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(getApiUrl(`/patients/${patient.id}`), { timeout: 10000 });
      
      if (response.status === 200) {
        // Remove from local state
        setPatients(prev => prev.filter(p => p.id !== patient.id));
        
        // Clear selection if deleted patient was selected
        if (selectedPatient?.id === patient.id) {
          setSelectedPatient(null);
          setPatientDocuments([]);
        }

        alert('Patient and associated documents deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteDocument = async (document) => {
    if (!window.confirm(`Are you sure you want to delete document "${document.fileName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(getApiUrl(`/documents/${document.id}`), { timeout: 10000 });
      
      if (response.status === 200) {
        // Remove from patient documents
        setPatientDocuments(prev => prev.filter(d => d.id !== document.id));
        
        // Remove from global documents
        // setDocuments(prev => prev.filter(d => d.id !== document.id)); // Removed - documents state is unused

        alert('Document deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document: ' + (error.response?.data?.error || error.message));
    }
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
        
        // Enhanced WhatsApp notification system for prescription uploads
        const uploadId = response.data.uploadId || 'N/A';
        const whatsappSent = response.data.whatsappNotificationSent || false;
        
        // Send immediate thank you WhatsApp notification
        await sendPrescriptionUploadNotification(patientName, contactNumber, uploadId);
        
        // Set up automated follow-up reminders based on severity
        setupAutomatedFollowUpReminders(patientName, contactNumber, 'medium'); // Default severity
        
        const whatsappMessage = whatsappSent ? 
          '✅ WhatsApp thank you message sent to patient\n📅 Follow-up reminders scheduled' : 
          '⚠️ WhatsApp notification could not be sent';
        
        alert(`Document uploaded successfully!\n\nPatient: ${patientName}\nUpload ID: ${uploadId}\nStatus: Completed\n\n${whatsappMessage}\n\n🔔 Automated follow-up reminders set up for every 3 days\n\nReturning to dashboard...`);
        
        // Reset form and navigate back to default view after successful upload
        setTimeout(() => {
          setUploadedFile(null);
          setOriginalFile(null);
          setPatientName('');
          setContactNumber('');
          setDateOfBirth('');
          setUploadStatus('Redirecting to dashboard...');
          // Navigate back to admin welcome screen
          setCurrentAdminView('none');
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

  // ==================== FOLLOW-UP SCHEDULER FUNCTIONS ====================
  
  /**
   * Load Follow-up Scheduler with stats and visit types
   */
  const loadFollowUpScheduler = async () => {
    setIsLoadingPatients(true);
    try {
      console.log('🔄 Loading Follow-up Scheduler...');
      
      // Load patients, visit types, stats, and scheduled follow-ups in parallel
      const [patientsResponse, visitTypesResponse, statsResponse] = await Promise.all([
        axios.get(getApiUrl('/patients'), { timeout: 10000 }),
        axios.get(getApiUrl('/follow-ups/visit-types'), { timeout: 10000 }),
        axios.get(getApiUrl('/follow-ups/stats'), { timeout: 10000 })
      ]);
      
      // Set all the data
      setPatients(patientsResponse.data);
      setVisitTypes(visitTypesResponse.data);
      setFollowUpStats(statsResponse.data);
      
      // Try to load scheduled follow-ups (this might not exist yet)
      try {
        const scheduledResponse = await axios.get(getApiUrl('/follow-ups/scheduled'), { timeout: 5000 });
        setScheduledFollowUps(scheduledResponse.data || []);
        console.log('📅 Loaded scheduled follow-ups:', scheduledResponse.data);
      } catch (scheduleError) {
        console.log('ℹ️ No scheduled follow-ups endpoint available yet');
        setScheduledFollowUps([]);
      }
      
      console.log('✅ Data loaded:', {
        patients: patientsResponse.data,
        visitTypes: visitTypesResponse.data,
        stats: statsResponse.data
      });
      
      // Show the scheduler
      setShowFollowUpScheduler(true);
      setCurrentAdminView('followup');
      setShowPatientsDashboard(false);
      
      console.log('✅ Follow-up scheduler loaded successfully');
    } catch (error) {
      console.error('❌ Error loading follow-up scheduler:', error);
      alert('Failed to load follow-up scheduler: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoadingPatients(false);
    }
  };
  
  /**
   * Schedule a follow-up for selected patient
   */
  const scheduleFollowUp = async () => {
    if (!selectedFollowUpPatient) {
      alert('Please select a patient for follow-up.');
      return;
    }
    if (!selectedVisitType) {
      alert('Please select a visit type.');
      return;
    }

    setIsSchedulingFollowUp(true);
    try {
      const params = {
        visitType: selectedVisitType,
        scheduledBy: userRole,
      };
      
      if (customHours && customHours.trim() !== '') {
        params.customHours = parseInt(customHours);
      }

      console.log('📅 Scheduling follow-up with params:', params);

      const response = await axios.post(
        getApiUrl(`/patients/${selectedFollowUpPatient.id}/follow-ups`), 
        null,
        { 
          params,
          timeout: 10000 
        }
      );
      
      if (response.status === 200) {
        const followUp = response.data.followUp;
        console.log('✅ Follow-up scheduled successfully:', followUp);
        
        // Show detailed success message
        let successMessage = `✅ Follow-up scheduled successfully!\n\n`;
        successMessage += `Patient: ${followUp.patientName}\n`;
        successMessage += `Type: ${followUp.visitTypeDisplay}\n`;
        successMessage += `Scheduled for: ${new Date(followUp.scheduledTime).toLocaleString()}\n`;
        successMessage += `Status: ${followUp.status}\n\n`;
        
        if (response.data.whatsappSent) {
          successMessage += `📱 WhatsApp notification sent successfully!`;
        } else {
          successMessage += `⚠️ WhatsApp notification could not be sent automatically.`;
        }
        
        alert(successMessage);
        
        // Clear form
        setSelectedFollowUpPatient(null);
        setSelectedVisitType('');
        setCustomHours('');
        
        // Reload stats and scheduled follow-ups
        try {
          const [statsResponse, scheduledResponse] = await Promise.all([
            axios.get(getApiUrl('/follow-ups/stats'), { timeout: 5000 }),
            axios.get(getApiUrl('/follow-ups/scheduled'), { timeout: 5000 }).catch(() => ({ data: [] }))
          ]);
          setFollowUpStats(statsResponse.data);
          setScheduledFollowUps(scheduledResponse.data || []);
        } catch (reloadError) {
          console.log('⚠️ Could not reload stats/schedules:', reloadError);
        }
      }
    } catch (error) {
      console.error('❌ Error scheduling follow-up:', error);
      let errorMessage = 'Failed to schedule follow-up: ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    } finally {
      setIsSchedulingFollowUp(false);
    }
  };
  
  /**
   * Send immediate follow-up to patient (for testing)
   */
  const sendImmediateFollowUp = async () => {
    if (!selectedFollowUpPatient) {
      alert('Please select a patient for immediate follow-up.');
      return;
    }
    if (!selectedVisitType) {
      alert('Please select a visit type.');
      return;
    }

    setIsSendingImmediateFollowUp(true);
    try {
      const response = await axios.post(
        getApiUrl(`/patients/${selectedFollowUpPatient.id}/follow-ups/send-now`), 
        null,
        { 
          params: {
            visitType: selectedVisitType,
            sentBy: userRole,
          },
          timeout: 15000 
        }
      );
      
      if (response.status === 200) {
        const result = response.data;
        setFollowUpMessage(result);
        
        // Show comprehensive success message
        let alertMessage = `📤 Follow-up sent successfully!\n\n`;
        alertMessage += `Patient: ${result.patientName}\n`;
        alertMessage += `Type: ${result.visitType}\n`;
        alertMessage += `Sent: ${result.sentTime}\n`;
        alertMessage += `Method: ${result.method}\n\n`;
        
        if (result.whatsappUrl) {
          alertMessage += `📱 WhatsApp URL generated! Click the link below to send manually:\n${result.whatsappUrl}`;
        } else {
          alertMessage += `✅ Message sent automatically to patient's WhatsApp`;
        }
        
        alert(alertMessage);
      }
    } catch (error) {
      console.error('❌ Error sending immediate follow-up:', error);
      alert('Failed to send follow-up: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSendingImmediateFollowUp(false);
    }
  };
  
  /**
   * Get visit type details
   */
  const getVisitTypeDetails = (visitTypeValue) => {
    return visitTypes.find(vt => vt.value === visitTypeValue);
  };

  // Helper function to scroll to medication section smoothly
  const scrollToMedicationSection = () => {
    setTimeout(() => {
      const medicationSection = document.querySelector('.medication-info-section');
      if (medicationSection) {
        medicationSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to ensure the section is rendered
  };

  const quickActions = [
    {
      icon: '🩺',
      title: 'Symptoms Check',
      description: 'Describe your symptoms and get guidance',
      action: () => setMessage('Symptoms Check')
    },
    {
      icon: '�',
      title: 'Book Appointment',
      description: 'Schedule a consultation with our doctors',
      action: () => openAppointmentBooking()
    },
    {
      icon: '👨‍⚕️',
      title: 'Ask Doctor',
      description: 'Send questions directly to our doctors',
      action: () => initiateDoctorCommunication()
    },
    {
      icon: '�💊',
      title: 'Medication Info',
      description: 'Search medicines, dosages, and alternatives',
      action: () => {
        setShowMedicationInfo(true);
        scrollToMedicationSection();
      }
    },
    {
      icon: '📋',
      title: 'Appointment Prep',
      description: 'Prepare questions for your doctor visit',
      action: () => setMessage('Appointment Prep')
    },
    {
      icon: '🏥',
      title: 'Find Care',
      description: 'Locate healthcare services near you',
      action: () => setMessage('Find Care')
    },
    {
      icon: '🧘‍♀️',
      title: 'Wellness Tips',
      description: 'Get personalized wellness advice',
      action: () => setMessage('Wellness Tips')
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
        {/* Chat Section - Hidden for Admin and Doctor Users */}
        {userRole !== 'admin' && userRole !== 'doctor' && (
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
                  <div 
                    key={index} 
                    className={`chat-message ${msg.type}`}
                    data-is-query={msg.isQuery || false}
                    data-is-query-response={msg.isQueryResponse || false}
                    data-is-doctor-reply={msg.isDoctorReply || false}
                    data-is-whatsapp-notification={msg.isWhatsAppNotification || false}
                  >
                    <div className="message-header">
                      <span className="message-sender">
                        {msg.type === 'bot' ? '🤖 Carebot' : '👤 You'}
                      </span>
                      <span className="message-time">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="message-content">
                      {(typeof msg.message === 'string' ? msg.message : String(msg.message || '')).split('\n').map((line, lineIndex) => (
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
        {hasUploadAccess && currentAdminView === 'upload' && userRole === 'admin' && (
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

      </div>

      {/* Patients Dashboard - Visible to admins and doctors - Shows first for doctors */}
      {hasDashboardAccess && showPatientsDashboard && (
        <div className="patients-dashboard-centered">
          <div className="dashboard-header">
            <h2 className="section-title">
              👥 Patients Dashboard
              <span className="admin-only-badge">{isAdmin ? 'Admin Only' : 'Doctor Access'}</span>
            </h2>
            <button 
              className="cancel-btn"
              onClick={() => {
                setShowPatientsDashboard(false);
                // For doctors, don't reset the admin view as they don't have the admin welcome screen
                if (userRole !== 'doctor') {
                  setCurrentAdminView('none');
                }
                setSelectedPatient(null);
                setPatientDocuments([]);
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
                    >
                      {editingPatient?.id === patient.id ? (
                        // Edit mode
                        <div className="patient-edit-form">
                          <input
                            type="text"
                            value={editPatientName}
                            onChange={(e) => setEditPatientName(e.target.value)}
                            placeholder="Patient Name"
                            className="edit-input"
                          />
                          <input
                            type="tel"
                            value={editContactNumber}
                            onChange={(e) => setEditContactNumber(e.target.value)}
                            placeholder="Contact Number"
                            className="edit-input"
                          />
                          <input
                            type="date"
                            value={editDateOfBirth}
                            onChange={(e) => setEditDateOfBirth(e.target.value)}
                            className="edit-input"
                          />
                          <div className="edit-buttons">
                            <button 
                              className="save-btn"
                              onClick={saveEditPatient}
                              disabled={isSavingEdit}
                            >
                              {isSavingEdit ? '⏳' : '✅'} Save
                            </button>
                            <button 
                              className="cancel-btn-small"
                              onClick={cancelEditPatient}
                              disabled={isSavingEdit}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div onClick={() => selectPatient(patient)}>
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
                          <div className="patient-actions">
                            <button 
                              className="edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditPatient(patient);
                              }}
                              title="Edit Patient"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePatient(patient);
                              }}
                              title="Delete Patient"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      )}
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
                          <div className="document-info">
                            <div className="document-name">📄 {doc.fileName}</div>
                            <div className="document-meta">
                              Type: {doc.documentType} | Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                            <div className="document-description">
                              {doc.description}
                            </div>
                          </div>
                          <button 
                            className="delete-document-btn"
                            onClick={() => deleteDocument(doc)}
                            title="Delete Document"
                          >
                            🗑️
                          </button>
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

      {/* Follow-up Scheduler - Admin Only */}
      {showFollowUpScheduler && hasUploadAccess && (
        <div className="follow-up-scheduler">
          <div className="scheduler-header">
            <h2 className="section-title">
              📅 Follow-up Scheduler
              <span className="admin-only-badge">Admin Only</span>
            </h2>
            <div className="header-buttons">
              <button 
                className="refresh-btn"
                onClick={loadFollowUpScheduler}
                disabled={isLoadingPatients}
                style={{
                  marginRight: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isLoadingPatients ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoadingPatients ? '🔄 Loading...' : '🔄 Refresh Data'}
              </button>
              <button 
                className="back-btn"
                onClick={() => {
                  setShowFollowUpScheduler(false);
                  setCurrentAdminView('none');
                }}
              >
                🏠 Back to Admin Dashboard
              </button>
            </div>
          </div>

          {/* Follow-up Statistics */}
          {followUpStats && (
            <div className="follow-up-stats">
              <h3 className="subsection-title">📊 Follow-up Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{followUpStats.totalScheduled}</div>
                  <div className="stat-label">Total Scheduled</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{followUpStats.sentToday}</div>
                  <div className="stat-label">Sent Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{followUpStats.responseRate}%</div>
                  <div className="stat-label">Response Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{followUpStats.escalationsToday}</div>
                  <div className="stat-label">Escalations Today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{followUpStats.pendingFollowUps}</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{followUpStats.patientCount}</div>
                  <div className="stat-label">Active Patients</div>
                </div>
              </div>
              <div className="stats-updated">
                Last updated: {followUpStats.lastUpdated}
              </div>
            </div>
          )}

          {/* Schedule Follow-up Form */}
          <div className="schedule-followup-form">
            <h3 className="subsection-title">📝 Schedule New Follow-up</h3>
            
            {/* Patient Summary Cards */}
            {patients.length > 0 && (
              <div className="patient-summary-section">
                <h4 className="summary-title">👥 Available Patients ({patients.length})</h4>
                <div className="patient-summary-grid">
                  {patients.slice(0, 6).map(patient => (
                    <div 
                      key={patient.id} 
                      className={`patient-summary-card ${selectedFollowUpPatient?.id === patient.id ? 'selected' : ''}`}
                      onClick={() => setSelectedFollowUpPatient(patient)}
                    >
                      <div className="patient-summary-info">
                        <div className="patient-summary-name">{patient.patientName}</div>
                        <div className="patient-summary-contact">📞 {patient.contactNumber}</div>
                        <div className="patient-summary-dob">🎂 {patient.dateOfBirth}</div>
                      </div>
                      {selectedFollowUpPatient?.id === patient.id && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                  ))}
                  {patients.length > 6 && (
                    <div className="more-patients-indicator">
                      +{patients.length - 6} more patients available in dropdown
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="followUpPatient">Select Patient:</label>
                <select 
                  id="followUpPatient"
                  value={selectedFollowUpPatient?.id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    console.log('Patient selection changed to ID:', selectedId);
                    
                    if (selectedId === '') {
                      setSelectedFollowUpPatient(null);
                      return;
                    }
                    
                    // Find patient by ID (handle both string and number)
                    const foundPatient = patients.find(p => {
                      return String(p.id) === String(selectedId);
                    });
                    
                    console.log('Found patient:', foundPatient);
                    setSelectedFollowUpPatient(foundPatient || null);
                  }}
                  className="form-input"
                  disabled={patients.length === 0}
                >
                  <option value="">
                    {patients.length === 0 ? 'Loading patients...' : 'Choose a patient...'}
                  </option>
                  {patients.map(patient => (
                    <option key={`patient-${patient.id}`} value={patient.id}>
                      {patient.patientName} ({patient.contactNumber})
                    </option>
                  ))}
                </select>
                {patients.length === 0 && (
                  <small style={{color: 'orange'}}>
                    ⚠️ No patients loaded. Please try refreshing the scheduler.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="visitType">Visit Type:</label>
                <select 
                  id="visitType"
                  value={selectedVisitType}
                  onChange={(e) => setSelectedVisitType(e.target.value)}
                  className="form-input"
                >
                  <option value="">Choose visit type...</option>
                  {visitTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.display} (Default: {type.defaultDelay})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="customHours">Custom Hours (Optional):</label>
                <input 
                  type="number"
                  id="customHours"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  placeholder="e.g. 24 for 24 hours"
                  className="form-input"
                  min="1"
                  max="8760"
                />
                <small className="form-hint">Leave blank to use default timing for visit type</small>
              </div>

              {/* Quick Schedule Options */}
              <div className="form-group quick-schedule-section">
                <label>⚡ Quick Schedule Options:</label>
                <div className="quick-schedule-buttons">
                  <button 
                    type="button"
                    className="quick-btn"
                    onClick={() => setCustomHours('1')}
                  >
                    1 Hour
                  </button>
                  <button 
                    type="button"
                    className="quick-btn"
                    onClick={() => setCustomHours('24')}
                  >
                    1 Day
                  </button>
                  <button 
                    type="button"
                    className="quick-btn"
                    onClick={() => setCustomHours('72')}
                  >
                    3 Days
                  </button>
                  <button 
                    type="button"
                    className="quick-btn"
                    onClick={() => setCustomHours('168')}
                  >
                    1 Week
                  </button>
                </div>
              </div>
            </div>

            {/* Form Validation Feedback */}
            {(selectedFollowUpPatient || selectedVisitType) && (
              <div className="form-validation-feedback">
                <div className="validation-item">
                  <span className={selectedFollowUpPatient ? 'valid' : 'invalid'}>
                    {selectedFollowUpPatient ? '✅' : '❌'} Patient Selected
                  </span>
                  {selectedFollowUpPatient && (
                    <span className="validation-detail">
                      → {selectedFollowUpPatient.patientName}
                    </span>
                  )}
                </div>
                <div className="validation-item">
                  <span className={selectedVisitType ? 'valid' : 'invalid'}>
                    {selectedVisitType ? '✅' : '❌'} Visit Type Selected
                  </span>
                  {selectedVisitType && (
                    <span className="validation-detail">
                      → {getVisitTypeDetails(selectedVisitType)?.display}
                    </span>
                  )}
                </div>
                {customHours && (
                  <div className="validation-item">
                    <span className="valid">⏰ Custom Timing</span>
                    <span className="validation-detail">
                      → {customHours} hour{parseInt(customHours) !== 1 ? 's' : ''} from now
                    </span>
                  </div>
                )}
              </div>
            )}

            {selectedVisitType && getVisitTypeDetails(selectedVisitType) && (
              <div className="visit-type-info">
                <h4>📋 Visit Type Details:</h4>
                <p><strong>{getVisitTypeDetails(selectedVisitType).display}</strong></p>
                <p>Default delay: {getVisitTypeDetails(selectedVisitType).defaultDelay}</p>
                {customHours && customHours.trim() !== '' && (
                  <p className="custom-timing">
                    Custom timing: {customHours} hour{parseInt(customHours) !== 1 ? 's' : ''} from now
                  </p>
                )}
              </div>
            )}

            <div className="form-actions">
              <button 
                className="primary-btn schedule-btn"
                onClick={scheduleFollowUp}
                disabled={isSchedulingFollowUp || !selectedFollowUpPatient || !selectedVisitType}
              >
                {isSchedulingFollowUp ? '📅 Scheduling...' : '📅 Schedule Follow-up'}
              </button>
              
              <button 
                className="secondary-btn send-now-btn"
                onClick={sendImmediateFollowUp}
                disabled={isSendingImmediateFollowUp || !selectedFollowUpPatient || !selectedVisitType}
              >
                {isSendingImmediateFollowUp ? '📤 Sending...' : '📤 Send Now (Test)'}
              </button>
            </div>
          </div>

          {/* Scheduled Follow-ups List */}
          <div className="scheduled-followups-section">
            <div className="followups-header">
              <h3 className="subsection-title">📋 Scheduled Follow-ups</h3>
              <div className="followups-controls">
                <div className="followups-filter">
                  <select 
                    className="filter-select"
                    value={followUpFilter}
                    onChange={(e) => setFollowUpFilter(e.target.value)}
                  >
                    <option value="all">All Follow-ups</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="followups-count">
                  <span className="count-badge">
                    {scheduledFollowUps.length} Total
                  </span>
                </div>
              </div>
            </div>
            
            <div className="scheduled-list">
              {scheduledFollowUps.length > 0 ? (
                <>
                  <div className="followups-summary">
                    <div className="summary-stats">
                      <div className="stat-item">
                        <span className="stat-number">{scheduledFollowUps.filter(f => f.status === 'SCHEDULED').length}</span>
                        <span className="stat-label">Scheduled</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{scheduledFollowUps.filter(f => f.status === 'SENT').length}</span>
                        <span className="stat-label">Sent</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{scheduledFollowUps.filter(f => !f.status || f.status === 'PENDING').length}</span>
                        <span className="stat-label">Pending</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="followups-grid">
                    {scheduledFollowUps
                      .filter(followUp => {
                        if (followUpFilter === 'all') return true;
                        if (followUpFilter === 'scheduled') return followUp.status === 'SCHEDULED';
                        if (followUpFilter === 'sent') return followUp.status === 'SENT';
                        if (followUpFilter === 'pending') return !followUp.status || followUp.status === 'PENDING';
                        return true;
                      })
                      .map((followUp, index) => (
                    <div key={followUp.id || index} className="followup-card enhanced">
                      <div className="followup-header">
                        <strong>{followUp.patientName}</strong>
                        <span className={`status-badge ${followUp.status?.toLowerCase()}`}>
                          {followUp.status || 'SCHEDULED'}
                        </span>
                      </div>
                      <div className="followup-details">
                        <div>📅 <strong>Scheduled:</strong> {new Date(followUp.scheduledTime).toLocaleString()}</div>
                        <div>🏥 <strong>Type:</strong> {followUp.visitTypeDisplay || followUp.visitType}</div>
                        <div>📞 <strong>Contact:</strong> {followUp.contactNumber}</div>
                        <div>👤 <strong>Scheduled by:</strong> {followUp.scheduledBy}</div>
                        {followUp.sentTime && (
                          <div>📤 <strong>Sent:</strong> {new Date(followUp.sentTime).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </>
              ) : (
                <div className="no-followups">
                  <div className="empty-state">
                    <div style={{fontSize: '48px', marginBottom: '15px'}}>📅</div>
                    <p><strong>No follow-ups scheduled yet</strong></p>
                    <p>Schedule your first follow-up using the form above.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Message Preview */}
          {followUpMessage && followUpMessage.whatsappUrl && (
            <div className="followup-message-result">
              <h3 className="subsection-title">📱 Follow-up Result</h3>
              <div className="message-info">
                <p><strong>Patient:</strong> {followUpMessage.patientName}</p>
                <p><strong>Type:</strong> {followUpMessage.visitType}</p>
                <p><strong>Method:</strong> {followUpMessage.method}</p>
                <p><strong>Sent:</strong> {followUpMessage.sentTime}</p>
              </div>
              <div className="whatsapp-url-container">
                <p><strong>WhatsApp URL Generated:</strong></p>
                <a 
                  href={followUpMessage.whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="whatsapp-url-link"
                >
                  📱 Click to Send WhatsApp Message
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medication Info Section - Available to all users */}
      {showMedicationInfo && (
        <div className="medication-info-section">
          <div className="medication-header">
            <h2 className="section-title">
              💊 Medication Information Database
              <span className="info-badge">Comprehensive Medicine Guide</span>
            </h2>
            <button 
              className="close-medication-btn"
              onClick={closeMedicationInfo}
              title="Close Medication Info"
            >
              ✕ Close
            </button>
          </div>

          <div className="medication-content">
            {/* Search and Filter Section */}
            <div className="medication-search-section">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="medication-search-input"
                    placeholder="Search medicines by name, generic name, or condition..."
                    value={searchMedication}
                    onChange={(e) => setSearchMedication(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                {searchMedication && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchMedication('')}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="search-stats">
                Found {filteredMedicines.length} of {medicineDatabase.length} medicines
              </div>
            </div>

            <div className="medication-main-content">
              {/* Medicine List */}
              <div className="medicines-list">
                <h3 className="list-title">Available Medicines</h3>
                <div className="medicines-grid">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine) => (
                      <div 
                        key={medicine.id}
                        className={`medicine-card ${selectedMedicine?.id === medicine.id ? 'selected' : ''}`}
                        onClick={() => handleMedicineSelect(medicine)}
                      >
                        <div className="medicine-header">
                          <div className="medicine-name">
                            <span className="brand-name">{medicine.brandName}</span>
                            <span className="generic-name">({medicine.genericName})</span>
                          </div>
                          <span className="dosage-badge">{medicine.dosage}</span>
                        </div>
                        <div className="medicine-category">{medicine.category}</div>
                        <div className="medicine-price">{medicine.price}</div>
                        <div className="prescription-status">
                          {medicine.prescriptionRequired ? (
                            <span className="prescription-required">📋 Prescription Required</span>
                          ) : (
                            <span className="over-counter">🏪 Over-the-Counter</span>
                          )}
                        </div>
                        <div className="primary-uses">
                          <strong>Primary Uses:</strong> {medicine.uses.slice(0, 2).join(', ')}
                          {medicine.uses.length > 2 && '...'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-medicines">
                      {searchMedication ? (
                        <>
                          <div className="no-results-icon">🔍</div>
                          <p><strong>No medicines found</strong></p>
                          <p>Try searching with different keywords or check spelling</p>
                        </>
                      ) : (
                        <>
                          <div className="loading-icon">💊</div>
                          <p><strong>Medicine Database</strong></p>
                          <p>Search above to find medicine information</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Medicine Details */}
              <div className="medicine-details">
                {selectedMedicine ? (
                  <div className="medicine-details-content">
                    <div className="details-header">
                      <h3 className="details-title">Medicine Details</h3>
                      <button 
                        className="clear-selection-btn"
                        onClick={clearMedicineSelection}
                        title="Clear Selection"
                      >
                        ✕ Clear
                      </button>
                    </div>

                    <div className="medicine-full-info">
                      <div className="medicine-title-section">
                        <h4 className="medicine-full-name">
                          {selectedMedicine.brandName}
                          <span className="generic-info">({selectedMedicine.genericName} {selectedMedicine.dosage})</span>
                        </h4>
                        <div className="medicine-meta">
                          <span className="category-tag">{selectedMedicine.category}</span>
                          <span className={`prescription-tag ${selectedMedicine.prescriptionRequired ? 'required' : 'otc'}`}>
                            {selectedMedicine.prescriptionRequired ? '📋 Rx Required' : '🏪 OTC'}
                          </span>
                        </div>
                      </div>

                      <div className="details-grid">
                        <div className="detail-section">
                          <h5 className="section-header">🎯 Uses & Indications</h5>
                          <ul className="detail-list">
                            {selectedMedicine.uses.map((use, index) => (
                              <li key={index}>{use}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="detail-section">
                          <h5 className="section-header">📏 Dosage Instructions</h5>
                          <div className="dosage-info">
                            {selectedMedicine.dosageInstructions}
                          </div>
                        </div>

                        <div className="detail-section">
                          <h5 className="section-header">⚠️ Side Effects</h5>
                          <ul className="detail-list side-effects">
                            {(selectedMedicine.sideEffects || ['Consult doctor for side effects information']).map((effect, index) => (
                              <li key={index}>{effect}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="detail-section">
                          <h5 className="section-header">🛡️ Precautions</h5>
                          <ul className="detail-list precautions">
                            {(selectedMedicine.precautions || ['Follow doctor\'s advice', 'Read medicine label carefully']).map((precaution, index) => (
                              <li key={index}>{precaution}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="detail-section price-section">
                          <h5 className="section-header">💰 Price Information</h5>
                          <div className="price-info">
                            <div className="current-price">{selectedMedicine.price}</div>
                            <div className="price-note">*Prices may vary by pharmacy and location</div>
                          </div>
                        </div>

                        <div className="detail-section alternatives-section">
                          <h5 className="section-header">🔄 Available Alternatives</h5>
                          <div className="alternatives-info">
                            <div className="alternatives-text">
                              {selectedMedicine.alternatives || 'No alternatives listed'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="important-notice">
                        <div className="notice-header">⚠️ Important Medical Disclaimer</div>
                        <div className="notice-content">
                          <p><strong>This information is for educational purposes only.</strong> Always consult with a qualified healthcare provider before starting, stopping, or changing any medication. Do not use this information to self-diagnose or treat medical conditions.</p>
                          <p><strong>For emergencies:</strong> Contact your doctor immediately or call emergency services.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="select-medicine-prompt">
                    <div className="prompt-icon">💊</div>
                    <div className="prompt-text">
                      <h4>Select a Medicine</h4>
                      <p>Choose a medicine from the list to view detailed information including uses, dosage, side effects, precautions, and alternatives.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Categories */}
            <div className="quick-categories">
              <h3 className="categories-title">🏷️ Browse by Category</h3>
              <div className="categories-grid">
                <button 
                  className="category-btn"
                  onClick={() => setSearchMedication('pain reliever')}
                >
                  🩹 Pain Relief
                </button>
                <button 
                  className="category-btn"
                  onClick={() => setSearchMedication('antibiotic')}
                >
                  🦠 Antibiotics
                </button>
                <button 
                  className="category-btn"
                  onClick={() => setSearchMedication('allergy')}
                >
                  🤧 Allergy Relief
                </button>
                <button 
                  className="category-btn"
                  onClick={() => setSearchMedication('antidepressant')}
                >
                  🧠 Mental Health
                </button>
                <button 
                  className="category-btn"
                  onClick={() => setSearchMedication('acid')}
                >
                  🔥 Acid Reducer
                </button>
                <button 
                  className="category-btn"
                  onClick={() => setSearchMedication('anti-inflammatory')}
                >
                  ⚡ Anti-inflammatory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Restriction Notice for non-admins - Shows only for patients */}
      {userRole === 'patient' && isLoggedIn && (
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

      {/* Doctor Dashboard Welcome - Shows when doctor cancels from patient dashboard */}
      {userRole === 'doctor' && !showPatientsDashboard && !isLoadingPatients && (
        <div className="doctor-welcome">
          <div className="welcome-content">
            <h2 className="section-title">
              👨‍⚕️ Doctor Portal
              <span className="admin-only-badge">Doctor Access</span>
            </h2>
            <div className="welcome-message-admin">
              <div className="welcome-icon">🩺</div>
              <div className="welcome-text">
                <h3>Welcome to the Doctor Portal</h3>
                <p>Access patient information and manage healthcare records:</p>
                <div className="admin-nav-buttons-welcome">
                  <button 
                    className="nav-button dashboard-nav-btn"
                    onClick={loadPatientsDashboard}
                    disabled={isLoadingPatients}
                  >
                    {isLoadingPatients ? '🔄 Loading...' : '👥 View Patients Dashboard'}
                  </button>
                  <button 
                    className={`nav-button queries-nav-btn ${currentAdminView === 'queries' ? 'active' : ''}`}
                    onClick={() => {
                      setShowPatientsDashboard(false);
                      setShowFollowUpScheduler(false);
                      openQueriesManagement();
                    }}
                  >
                    💬 Patient Queries
                  </button>
                </div>
                <div className="admin-note">
                  <p><em>This interface provides secure access to patient information for healthcare professionals.</em></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Welcome View - Default view for admin users only */}
      {userRole === 'admin' && currentAdminView === 'none' && !showPatientsDashboard && (
        <div className="admin-welcome">
          <div className="welcome-content">
            <h2 className="section-title">
              👨‍⚕️ Administrator Dashboard
              <span className="admin-only-badge">Admin Only</span>
            </h2>
            <div className="admin-portal-container">
              <div className="welcome-message-admin">
                <div className="welcome-icon">🏥</div>
                <div className="welcome-text">
                  <h3>Welcome to the Healthcare Admin Portal</h3>
                  <p>Select an option below to get started:</p>
                </div>
              </div>
              <div className="admin-nav-buttons-welcome">
              <button 
                className={`nav-button dashboard-nav-btn ${currentAdminView === 'dashboard' ? 'active' : ''}`}
                onClick={loadPatientsDashboard}
                disabled={isLoadingPatients}
              >
                {isLoadingPatients ? '🔄 Loading...' : '👥 Patients Dashboard'}
              </button>
              <button 
                className={`nav-button followup-nav-btn ${currentAdminView === 'followup' ? 'active' : ''}`}
                onClick={loadFollowUpScheduler}
                disabled={isLoadingPatients}
              >
                {isLoadingPatients ? '🔄 Loading...' : '📅 Follow-up Scheduler'}
              </button>
              <button 
                className={`nav-button doctors-nav-btn ${currentAdminView === 'doctors' ? 'active' : ''}`}
                onClick={() => {
                  setShowPatientsDashboard(false);
                  setShowFollowUpScheduler(false);
                  openDoctorManagement();
                }}
              >
                👨‍⚕️ Doctor Management
              </button>
              <button 
                className={`nav-button appointments-nav-btn ${currentAdminView === 'appointments' ? 'active' : ''}`}
                onClick={() => {
                  setShowPatientsDashboard(false);
                  setShowFollowUpScheduler(false);
                  openAppointmentsManagement();
                }}
              >
                📅 Appointments Management
              </button>
              <button 
                className={`nav-button upload-nav-btn ${currentAdminView === 'upload' ? 'active' : ''}`}
                onClick={() => {
                  setShowPatientsDashboard(false);
                  setShowFollowUpScheduler(false);
                  setCurrentAdminView('upload');
                }}
              >
                📎 Document Upload
              </button>
            </div>
            </div>
            <div className="admin-note">
              <p><em>This administrative interface provides secure access to patient management tools and document handling systems.</em></p>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Communication Section */}
      {showDoctorCommunication && (
        <div className="doctor-communication-section">
          <div className="communication-header">
            <h2 className="section-title">
              👨‍⚕️ Ask Our Doctors
            </h2>
            <p className="section-description">
              Send your medical questions directly to our qualified doctors and receive professional responses via WhatsApp
            </p>
            <button 
              className="close-communication-btn"
              onClick={() => setShowDoctorCommunication(false)}
            >
              ✕ Close
            </button>
          </div>

          <div className="communication-form">
            <div className="form-grid">
              <div className="form-group">
                <label>👤 Your Full Name *</label>
                <input
                  type="text"
                  value={currentQuery.patientName}
                  onChange={(e) => setCurrentQuery(prev => ({ ...prev, patientName: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>📱 WhatsApp Number *</label>
                <input
                  type="tel"
                  value={currentQuery.contactNumber}
                  onChange={(e) => setCurrentQuery(prev => ({ ...prev, contactNumber: e.target.value }))}
                  placeholder="+91-9876543210"
                  required
                />
              </div>

              <div className="form-group">
                <label>👨‍⚕️ Preferred Doctor (Optional)</label>
                <select
                  value={currentQuery.preferredDoctor}
                  onChange={(e) => setCurrentQuery(prev => ({ ...prev, preferredDoctor: e.target.value }))}
                >
                  <option value="">Any Available Doctor</option>
                  {getAvailableDoctors().map(doctor => (
                    <option key={doctor.id} value={doctor.name}>
                      Dr. {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>⚡ Urgency Level</label>
                <select
                  value={currentQuery.urgency}
                  onChange={(e) => setCurrentQuery(prev => ({ ...prev, urgency: e.target.value }))}
                >
                  <option value="low">🟢 Low - General inquiry</option>
                  <option value="normal">🟡 Normal - Regular concern</option>
                  <option value="high">🟠 High - Important issue</option>
                  <option value="urgent">🔴 Urgent - Needs immediate attention</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>💬 Your Question/Concern *</label>
                <textarea
                  value={currentQuery.queryText}
                  onChange={(e) => setCurrentQuery(prev => ({ ...prev, queryText: e.target.value }))}
                  placeholder="Please describe your medical question, symptoms, or concerns in detail. The more information you provide, the better our doctors can help you."
                  rows="6"
                  required
                />
                <small className="char-count">
                  {currentQuery.queryText.length}/1000 characters
                </small>
              </div>
            </div>

            <div className="communication-actions">
              <button
                className="submit-query-btn"
                onClick={submitPatientQuery}
                disabled={isSubmittingQuery || !currentQuery.patientName.trim() || !currentQuery.contactNumber.trim() || !currentQuery.queryText.trim()}
              >
                {isSubmittingQuery ? '📤 Sending...' : '📤 Send to Doctor'}
              </button>
              <button
                className="cancel-query-btn"
                onClick={() => setShowDoctorCommunication(false)}
              >
                ❌ Cancel
              </button>
            </div>

            <div className="communication-info">
              <div className="info-card">
                <h4>📋 How it works:</h4>
                <ol>
                  <li>Fill out the form with your question</li>
                  <li>Our doctors review your query</li>
                  <li>You receive a professional response</li>
                  <li>Get WhatsApp notification when replied</li>
                </ol>
              </div>
              
              <div className="info-card">
                <h4>⚡ Response Times:</h4>
                <ul>
                  <li>🔴 Urgent: Within 30 minutes</li>
                  <li>🟠 High: Within 2 hours</li>
                  <li>🟡 Normal: Within 4 hours</li>
                  <li>🟢 Low: Within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Section */}
      {showAppointmentBooking && (
        <div className="appointment-booking-section">
          <div className="appointment-header">
            <h2 className="section-title">
              📅 Book Doctor Appointment
              <span className="step-indicator">Step {bookingStep} of 4</span>
            </h2>
            <button 
              className="close-appointment-btn"
              onClick={closeAppointmentBooking}
              title="Close Appointment Booking"
            >
              ✕ Close
            </button>
          </div>

          <div className="booking-progress">
            <div className={`progress-step ${bookingStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Patient Info</div>
            </div>
            <div className={`progress-step ${bookingStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Select Doctor</div>
            </div>
            <div className={`progress-step ${bookingStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Choose Time</div>
            </div>
            <div className={`progress-step ${bookingStep >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Confirmation</div>
            </div>
          </div>

          <div className="booking-content">
            {/* Step 1: Patient Information */}
            {bookingStep === 1 && (
              <div className="booking-step patient-info-step">
                <h3>👤 Patient Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={appointmentForm.patientName}
                      onChange={(e) => handleAppointmentFormChange('patientName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      value={appointmentForm.contactNumber}
                      onChange={(e) => handleAppointmentFormChange('contactNumber', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={appointmentForm.email}
                      onChange={(e) => handleAppointmentFormChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      value={appointmentForm.dateOfBirth}
                      onChange={(e) => handleAppointmentFormChange('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Medical Specialty Needed</label>
                    <select
                      value={appointmentForm.doctorSpecialty}
                      onChange={(e) => handleAppointmentFormChange('doctorSpecialty', e.target.value)}
                    >
                      <option value="">Select specialty (optional)</option>
                      {medicalSpecialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Appointment Type</label>
                    <select
                      value={appointmentForm.appointmentType}
                      onChange={(e) => handleAppointmentFormChange('appointmentType', e.target.value)}
                    >
                      <option value="">Select appointment type</option>
                      {appointmentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Brief Description of Symptoms/Concern</label>
                    <textarea
                      value={appointmentForm.symptoms}
                      onChange={(e) => handleAppointmentFormChange('symptoms', e.target.value)}
                      placeholder="Briefly describe your health concern or reason for visit"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Urgency Level</label>
                    <select
                      value={appointmentForm.urgency}
                      onChange={(e) => handleAppointmentFormChange('urgency', e.target.value)}
                    >
                      <option value="routine">Routine (within 1-2 weeks)</option>
                      <option value="urgent">Urgent (within 2-3 days)</option>
                      <option value="emergency">Emergency (same day)</option>
                    </select>
                  </div>
                </div>
                <div className="step-actions">
                  <button 
                    className="next-btn"
                    onClick={proceedToNextStep}
                    disabled={!appointmentForm.patientName || !appointmentForm.contactNumber || !appointmentForm.dateOfBirth}
                  >
                    Next: Select Doctor →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Doctor Selection */}
            {bookingStep === 2 && (
              <div className="booking-step doctor-selection-step">
                <h3>👨‍⚕️ Select Your Doctor</h3>
                {appointmentForm.doctorSpecialty && (
                  <div className="specialty-filter">
                    <span>Showing doctors for: <strong>{appointmentForm.doctorSpecialty}</strong></span>
                  </div>
                )}
                <div className="doctors-grid">
                  {availableDoctors.map(doctor => (
                    <div 
                      key={doctor.id}
                      className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''}`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="doctor-image">{doctor.image}</div>
                      <div className="doctor-info">
                        <h4>{doctor.name}</h4>
                        <div className="doctor-specialty">{doctor.specialty}</div>
                        <div className="doctor-qualifications">{doctor.qualifications}</div>
                        <div className="doctor-experience">Experience: {doctor.experience}</div>
                        <div className="doctor-rating">⭐ {doctor.rating} rating</div>
                        <div className="doctor-fee">Consultation Fee: ₹{doctor.consultationFee}</div>
                        <div className="doctor-languages">Languages: {doctor.languages.join(', ')}</div>
                        <div className="doctor-about">{doctor.about}</div>
                      </div>
                      {selectedDoctor?.id === doctor.id && (
                        <div className="selected-indicator">✓ Selected</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="step-actions">
                  <button className="back-btn" onClick={goBackStep}>
                    ← Back
                  </button>
                  <button 
                    className="next-btn"
                    onClick={proceedToNextStep}
                    disabled={!selectedDoctor}
                  >
                    Next: Choose Time →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Time Slot Selection */}
            {bookingStep === 3 && (
              <div className="booking-step time-selection-step">
                <h3>🕐 Choose Date and Time</h3>
                {selectedDoctor && (
                  <div className="selected-doctor-info">
                    <span>Booking with: <strong>{selectedDoctor.name}</strong> - {selectedDoctor.specialty}</span>
                  </div>
                )}
                <div className="date-time-selection">
                  <div className="date-selection">
                    <label>Preferred Date</label>
                    <input
                      type="date"
                      value={appointmentForm.preferredDate}
                      onChange={(e) => {
                        handleAppointmentFormChange('preferredDate', e.target.value);
                        if (selectedDoctor) {
                          const slots = generateTimeSlots(selectedDoctor, e.target.value);
                          setAvailableSlots(slots);
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  {appointmentForm.preferredDate && (
                    <div className="time-slots">
                      <label>Available Time Slots</label>
                      {availableSlots.length > 0 ? (
                        <div className="slots-grid">
                          {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              className={`time-slot ${!slot.available ? 'unavailable' : ''} ${appointmentForm.preferredTime === slot.time ? 'selected' : ''}`}
                              onClick={() => slot.available && handleAppointmentFormChange('preferredTime', slot.time)}
                              disabled={!slot.available}
                            >
                              {slot.time}
                              {!slot.available && <span className="unavailable-label">Booked</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="no-slots">
                          No available slots for the selected date. Please choose another date.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="step-actions">
                  <button className="back-btn" onClick={goBackStep}>
                    ← Back
                  </button>
                  <button 
                    className="next-btn"
                    onClick={proceedToNextStep}
                    disabled={!appointmentForm.preferredDate || !appointmentForm.preferredTime}
                  >
                    Next: Confirmation →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {bookingStep === 4 && (
              <div className="booking-step confirmation-step">
                <h3>✅ Confirm Your Appointment</h3>
                <div className="appointment-summary">
                  <div className="summary-section">
                    <h4>👤 Patient Information</h4>
                    <div className="summary-item">Name: {appointmentForm.patientName}</div>
                    <div className="summary-item">Contact: {appointmentForm.contactNumber}</div>
                    <div className="summary-item">Email: {appointmentForm.email || 'Not provided'}</div>
                    <div className="summary-item">Date of Birth: {appointmentForm.dateOfBirth}</div>
                  </div>
                  
                  <div className="summary-section">
                    <h4>👨‍⚕️ Doctor Details</h4>
                    <div className="summary-item">Doctor: {selectedDoctor?.name}</div>
                    <div className="summary-item">Specialty: {selectedDoctor?.specialty}</div>
                    <div className="summary-item">Experience: {selectedDoctor?.experience}</div>
                    <div className="summary-item">Consultation Fee: ₹{selectedDoctor?.consultationFee}</div>
                  </div>
                  
                  <div className="summary-section">
                    <h4>📅 Appointment Details</h4>
                    <div className="summary-item">Date: {appointmentForm.preferredDate}</div>
                    <div className="summary-item">Time: {appointmentForm.preferredTime}</div>
                    <div className="summary-item">Type: {appointmentTypes.find(t => t.value === appointmentForm.appointmentType)?.label || 'General Consultation'}</div>
                    <div className="summary-item">Urgency: {appointmentForm.urgency}</div>
                    {appointmentForm.symptoms && (
                      <div className="summary-item">Symptoms: {appointmentForm.symptoms}</div>
                    )}
                  </div>
                </div>
                
                <div className="booking-terms">
                  <div className="terms-text">
                    <h4>📋 Terms & Conditions</h4>
                    <ul>
                      <li>Please arrive 15 minutes before your appointment time</li>
                      <li>Bring a valid ID and any relevant medical documents</li>
                      <li>Consultation fee is to be paid at the time of visit</li>
                      <li>Cancellation must be done at least 24 hours in advance</li>
                      <li>You will receive a confirmation SMS/email shortly</li>
                    </ul>
                  </div>
                </div>
                
                <div className="step-actions">
                  <button className="back-btn" onClick={goBackStep}>
                    ← Back
                  </button>
                  <button 
                    className="confirm-btn"
                    onClick={bookAppointment}
                    disabled={isBookingAppointment}
                  >
                    {isBookingAppointment ? 'Booking...' : '✅ Confirm Appointment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Doctor Management Section - Admin Only */}
      {userRole === 'admin' && currentAdminView === 'doctors' && (
        <div className="doctor-management-section">
          <div className="doctor-management-header">
            <h2 className="section-title">
              👨‍⚕️ Doctor Management System
              <span className="admin-only-badge">Admin Only</span>
            </h2>
            <p className="section-description">
              Manage doctors, their availability, schedules, and information in the system.
            </p>
            <button 
              className="back-to-dashboard-btn"
              onClick={() => {
                setCurrentAdminView('none');
                resetDoctorForm();
                setEditingDoctor(null);
                setSelectedDoctorForSchedule(null);
              }}
            >
              🏠 Back to Admin Dashboard
            </button>
          </div>

          <div className="doctor-management-content">
            {/* Doctor Management Navigation */}
            <div className="doctor-management-nav">
              <div className="nav-tabs">
                <button 
                  className={`nav-tab ${!editingDoctor && !selectedDoctorForSchedule ? 'active' : ''}`}
                  onClick={() => {
                    setEditingDoctor(null);
                    setSelectedDoctorForSchedule(null);
                    resetDoctorForm();
                    // Scroll to top of doctor management section
                    setTimeout(() => {
                      const doctorManagementElement = document.querySelector('.doctor-management-section');
                      if (doctorManagementElement) {
                        doctorManagementElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }
                    }, 100);
                  }}
                >
                  📋 All Doctors
                </button>
                <button 
                  className={`nav-tab ${editingDoctor || (!editingDoctor && !selectedDoctorForSchedule && Object.values(doctorForm).some(v => v !== '' && v.length !== 0)) ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDoctorForSchedule(null);
                    setEditingDoctor(null);
                    if (!Object.values(doctorForm).some(v => v !== '' && v.length !== 0)) {
                      resetDoctorForm();
                    }
                    // Trigger add doctor mode by ensuring form is visible
                    setTimeout(() => {
                      const formElement = document.querySelector('.doctor-form-section');
                      if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  {editingDoctor ? '✏️ Edit Doctor' : '➕ Add Doctor'}
                </button>
                <button 
                  className={`nav-tab ${selectedDoctorForSchedule ? 'active' : ''}`}
                  onClick={() => {
                    if (managedDoctors.length > 0) {
                      setSelectedDoctorForSchedule(managedDoctors[0]);
                      setEditingDoctor(null);
                    }
                  }}
                  disabled={managedDoctors.length === 0}
                >
                  📅 Manage Schedules
                </button>
              </div>
            </div>

            {/* Doctor List View */}
            {!editingDoctor && !selectedDoctorForSchedule && (
              <div className="doctors-list-view">
                <div className="doctors-list-header">
                  <h3>Current Doctors ({managedDoctors.length})</h3>
                </div>

                <div className="doctors-management-grid">
                  {managedDoctors.map((doctor, index) => (
                    <div key={doctor.id || index} className="doctor-management-card">
                      <div className="doctor-card-header">
                        <div className="doctor-image">{doctor.image}</div>
                        <div className="doctor-basic-info">
                          <h4>{doctor.name}</h4>
                          <div className="doctor-specialty">{doctor.specialty}</div>
                        </div>
                        <div className="doctor-status">
                          <span className={`status-badge ${doctor.isActive !== false ? 'active' : 'inactive'}`}>
                            {doctor.isActive !== false ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="doctor-details-summary">
                        <div className="detail-item">
                          <span className="label">Experience:</span>
                          <span className="value">{doctor.experience}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Consultation Fee:</span>
                          <span className="value">₹{doctor.consultationFee}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Rating:</span>
                          <span className="value">⭐{doctor.rating}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Languages:</span>
                          <span className="value">{doctor.languages?.join(', ') || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="doctor-availability-summary">
                        <h5>📅 Availability Overview</h5>
                        <div className="availability-days">
                          {doctor.availableDays?.map(day => (
                            <span key={day} className="available-day">{day.slice(0, 3)}</span>
                          )) || <span className="no-availability">No days set</span>}
                        </div>
                        <div className="time-slots-summary">
                          {doctor.timeSlots?.length > 0 ? (
                            <span>{doctor.timeSlots.length} time slots configured</span>
                          ) : (
                            <span className="no-slots">No time slots set</span>
                          )}
                        </div>
                      </div>

                      <div className="doctor-card-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => startEditDoctor(doctor)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="schedule-btn"
                          onClick={() => setSelectedDoctorForSchedule(doctor)}
                        >
                          📅 Schedule
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
                              deleteDoctor(doctor.id || index);
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {managedDoctors.length === 0 && (
                    <div className="no-doctors-message">
                      <div className="empty-state">
                        <div className="empty-icon">👨‍⚕️</div>
                        <h3>No Doctors Added Yet</h3>
                        <p>Start by adding your first doctor to the system.</p>
                        <button 
                          className="add-first-doctor-btn"
                          onClick={() => {
                            resetDoctorForm();
                            setEditingDoctor(null);
                          }}
                        >
                          ➕ Add First Doctor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add/Edit Doctor Form */}
            {(editingDoctor || (!selectedDoctorForSchedule && Object.values(doctorForm).some(v => v !== '' && v.length !== 0))) && (
              <div className="doctor-form-section">
                <div className="doctor-form-header">
                  <h3>{editingDoctor ? '✏️ Edit Doctor Information' : '➕ Add New Doctor'}</h3>
                  <button 
                    className="cancel-form-btn"
                    onClick={() => {
                      resetDoctorForm();
                      setEditingDoctor(null);
                      setSelectedDoctorForSchedule(null);
                      // Navigate back to "All Doctors" view and scroll to top
                      setTimeout(() => {
                        const doctorManagementElement = document.querySelector('.doctor-management-section');
                        if (doctorManagementElement) {
                          doctorManagementElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                          });
                        } else {
                          window.scrollTo({ 
                            top: 0, 
                            behavior: 'smooth' 
                          });
                        }
                      }, 100);
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>

                <form className="doctor-form" onSubmit={(e) => {
                  e.preventDefault();
                  saveDoctor();
                }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>👨‍⚕️ Doctor Name *</label>
                      <input
                        type="text"
                        value={doctorForm.name}
                        onChange={(e) => handleDoctorFormChange('name', e.target.value)}
                        placeholder="Enter doctor's full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>🏥 Medical Specialty *</label>
                      <select
                        value={doctorForm.specialty}
                        onChange={(e) => handleDoctorFormChange('specialty', e.target.value)}
                        required
                      >
                        <option value="">Select Specialty</option>
                        {medicalSpecialties.map(specialty => (
                          <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>🎓 Qualifications</label>
                      <input
                        type="text"
                        value={doctorForm.qualifications}
                        onChange={(e) => handleDoctorFormChange('qualifications', e.target.value)}
                        placeholder="e.g., MBBS, MD, MS"
                      />
                    </div>

                    <div className="form-group">
                      <label>⏱️ Experience *</label>
                      <input
                        type="text"
                        value={doctorForm.experience}
                        onChange={(e) => handleDoctorFormChange('experience', e.target.value)}
                        placeholder="e.g., 10 years"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>💰 Consultation Fee (₹) *</label>
                      <input
                        type="number"
                        value={doctorForm.consultationFee}
                        onChange={(e) => handleDoctorFormChange('consultationFee', e.target.value)}
                        placeholder="Enter fee amount"
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>🎭 Profile Image</label>
                      <select
                        value={doctorForm.image}
                        onChange={(e) => handleDoctorFormChange('image', e.target.value)}
                      >
                        <option value="👨‍⚕️">👨‍⚕️ Male Doctor</option>
                        <option value="👩‍⚕️">👩‍⚕️ Female Doctor</option>
                        <option value="🧑‍⚕️">🧑‍⚕️ Doctor</option>
                        <option value="👨‍🔬">👨‍🔬 Male Specialist</option>
                        <option value="👩‍🔬">👩‍🔬 Female Specialist</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>📅 Availability Settings</h4>
                    
                    <div className="availability-section">
                      <label>Available Days *</label>
                      <div className="days-selection">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <label key={day} className="day-checkbox">
                            <input
                              type="checkbox"
                              checked={doctorForm.availableDays.includes(day)}
                              onChange={(e) => {
                                const days = doctorForm.availableDays;
                                if (e.target.checked) {
                                  handleDoctorFormChange('availableDays', [...days, day]);
                                } else {
                                  handleDoctorFormChange('availableDays', days.filter(d => d !== day));
                                }
                              }}
                            />
                            <span className="day-label">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="time-slots-section">
                      <label>Time Slots *</label>
                      <div className="time-slots-selection">
                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                          <label key={time} className="time-checkbox">
                            <input
                              type="checkbox"
                              checked={doctorForm.timeSlots.includes(time)}
                              onChange={(e) => {
                                const slots = doctorForm.timeSlots;
                                if (e.target.checked) {
                                  handleDoctorFormChange('timeSlots', [...slots, time]);
                                } else {
                                  handleDoctorFormChange('timeSlots', slots.filter(t => t !== time));
                                }
                              }}
                            />
                            <span className="time-label">
                              {time} {parseInt(time) >= 12 ? 'PM' : 'AM'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>🗣️ Languages Spoken</h4>
                    <div className="languages-section">
                      {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi'].map(language => (
                        <label key={language} className="language-checkbox">
                          <input
                            type="checkbox"
                            checked={doctorForm.languages.includes(language)}
                            onChange={(e) => {
                              const langs = doctorForm.languages;
                              if (e.target.checked) {
                                handleDoctorFormChange('languages', [...langs, language]);
                              } else {
                                handleDoctorFormChange('languages', langs.filter(l => l !== language));
                              }
                            }}
                          />
                          <span className="language-label">{language}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>📝 About Doctor</label>
                    <textarea
                      value={doctorForm.about}
                      onChange={(e) => handleDoctorFormChange('about', e.target.value)}
                      placeholder="Brief description about the doctor's expertise and background"
                      rows="3"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        resetDoctorForm();
                        setEditingDoctor(null);
                      }}
                    >
                      ❌ Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={isSavingDoctor}
                    >
                      {isSavingDoctor ? '💾 Saving...' : (editingDoctor ? '✅ Update Doctor' : '✅ Add Doctor')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Doctor Schedule Management */}
            {selectedDoctorForSchedule && (
              <div className="doctor-schedule-section">
                <div className="schedule-header">
                  <h3>📅 Manage Schedule for Dr. {selectedDoctorForSchedule.name}</h3>
                  <div className="schedule-actions">
                    <select
                      value={selectedDoctorForSchedule.id}
                      onChange={(e) => {
                        const doctorId = e.target.value;
                        const doctor = managedDoctors.find(d => d.id === doctorId);
                        setSelectedDoctorForSchedule(doctor);
                      }}
                    >
                      {managedDoctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} - {doctor.specialty}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="back-btn"
                      onClick={() => setSelectedDoctorForSchedule(null)}
                    >
                      ← Back to List
                    </button>
                  </div>
                </div>

                <div className="schedule-content">
                  <div className="current-schedule">
                    <h4>Current Availability</h4>
                    <div className="schedule-overview">
                      <div className="availability-info">
                        <div className="schedule-item">
                          <span className="label">Available Days:</span>
                          <span className="value">
                            {selectedDoctorForSchedule.availableDays?.join(', ') || 'Not set'}
                          </span>
                        </div>
                        <div className="schedule-item">
                          <span className="label">Time Slots:</span>
                          <span className="value">
                            {selectedDoctorForSchedule.timeSlots?.length > 0 
                              ? `${selectedDoctorForSchedule.timeSlots.length} slots configured`
                              : 'Not set'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="detailed-schedule">
                      <h5>Weekly Schedule</h5>
                      <div className="weekly-calendar">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <div key={day} className={`day-schedule ${selectedDoctorForSchedule.availableDays?.includes(day) ? 'available' : 'unavailable'}`}>
                            <div className="day-name">{day}</div>
                            <div className="day-status">
                              {selectedDoctorForSchedule.availableDays?.includes(day) ? (
                                <div className="available-slots">
                                  {selectedDoctorForSchedule.timeSlots?.map(time => (
                                    <span key={time} className="time-slot">{time}</span>
                                  ))}
                                </div>
                              ) : (
                                <span className="unavailable-text">Not Available</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="schedule-actions-bottom">
                      <button 
                        className="edit-schedule-btn"
                        onClick={() => startEditDoctor(selectedDoctorForSchedule)}
                      >
                        ✏️ Edit Schedule
                      </button>
                      <button 
                        className="copy-schedule-btn"
                        onClick={() => {
                          alert('Schedule template copying feature coming soon!');
                        }}
                      >
                        📋 Copy Schedule Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointments Management Section - Admin Only */}
      {userRole === 'admin' && currentAdminView === 'appointments' && (
        <div className="appointments-management-section">
          <div className="appointments-management-header">
            <h2 className="section-title">
              📅 Appointments Management System
            </h2>
            <p className="section-description">
              Manage all booked appointments, view statistics, and handle patient scheduling
            </p>
            <button 
              className="back-button"
              onClick={() => setCurrentAdminView('none')}
            >
              ← Back to Admin Dashboard
            </button>
          </div>

          {/* Enhanced Appointments Statistics */}
          <div className="appointments-stats">
            <h3>📊 Advanced Appointment Analytics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{getAdvancedAppointmentStats().total}</div>
                <div className="stat-label">Total Appointments</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getAdvancedAppointmentStats().today}</div>
                <div className="stat-label">Today's Appointments</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getAdvancedAppointmentStats().upcoming}</div>
                <div className="stat-label">Upcoming</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getAdvancedAppointmentStats().thisWeek}</div>
                <div className="stat-label">This Week</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getAdvancedAppointmentStats().completed}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">₹{getAdvancedAppointmentStats().revenue}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="appointments-controls">
            <div className="control-row">
              <div className="filters-section">
                <div className="filter-group">
                  <label>🔍 Search:</label>
                  <input
                    type="text"
                    placeholder="Search by patient, doctor, or appointment ID..."
                    value={appointmentSearchTerm}
                    onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label>📅 Status:</label>
                  <select
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Appointments</option>
                    <option value="today">Today's Appointments</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>👨‍⚕️ Doctor:</label>
                  <select
                    value={appointmentDoctorFilter}
                    onChange={(e) => setAppointmentDoctorFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Doctors</option>
                    {getAvailableDoctors().map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>📆 Date:</label>
                  <input
                    type="date"
                    value={appointmentDateFilter}
                    onChange={(e) => setAppointmentDateFilter(e.target.value)}
                    className="date-filter"
                  />
                </div>
              </div>
              
              <div className="actions-section">
                <div className="sort-controls">
                  <label>🔄 Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="date">Date</option>
                    <option value="patient">Patient Name</option>
                    <option value="doctor">Doctor</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    className="sort-order-btn"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
                
                <button
                  className="export-btn"
                  onClick={exportAppointments}
                  disabled={getFilteredAppointments().length === 0}
                >
                  📤 Export CSV
                </button>
                
                <button
                  className="bulk-actions-btn"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                >
                  ⚙️ Bulk Actions
                </button>
              </div>
            </div>
            
            {/* Bulk Actions Panel */}
            {showBulkActions && (
              <div className="bulk-actions-panel">
                <div className="bulk-selection">
                  <button onClick={selectAllAppointments} className="select-all-btn">
                    ✅ Select All ({getFilteredAppointments().length})
                  </button>
                  <button onClick={clearAppointmentSelection} className="clear-selection-btn">
                    ❌ Clear Selection
                  </button>
                  <span className="selection-count">
                    {selectedAppointments.length} selected
                  </span>
                </div>
                
                <div className="bulk-actions">
                  <button
                    onClick={bulkCancelAppointments}
                    disabled={selectedAppointments.length === 0}
                    className="bulk-cancel-btn"
                  >
                    🚫 Cancel Selected
                  </button>
                  <button
                    onClick={bulkCompleteAppointments}
                    disabled={selectedAppointments.length === 0}
                    className="bulk-complete-btn"
                  >
                    ✅ Mark Selected Complete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Appointments List */}
          <div className="appointments-list-container">
            <div className="list-header">
              <h3>📋 Appointments ({getFilteredAppointments().length})</h3>
              {appointmentFilter !== 'all' && (
                <button
                  className="clear-filters-btn"
                  onClick={() => {
                    setAppointmentFilter('all');
                    setAppointmentSearchTerm('');
                    setAppointmentDateFilter('');
                    setAppointmentDoctorFilter('');
                  }}
                >
                  🔄 Clear Filters
                </button>
              )}
            </div>
            
            {getFilteredAppointments().length === 0 ? (
              <div className="no-appointments">
                <div className="no-appointments-icon">📅</div>
                <h4>No Appointments Found</h4>
                <p>
                  {bookedAppointments.length === 0 
                    ? "No appointments have been booked yet. Patients can book appointments through the chat interface or appointment booking form."
                    : "No appointments match your current filters. Try adjusting your search criteria."
                  }
                </p>
              </div>
            ) : (
              <div className="appointments-grid">
                {getFilteredAppointments().map(appointment => {
                  const isUpcoming = new Date(appointment.appointmentDate) >= new Date();
                  const statusClass = appointment.status === 'cancelled' ? 'cancelled' : 
                                    appointment.status === 'completed' ? 'completed' : 
                                    isUpcoming ? 'upcoming' : 'past';
                  const isSelected = selectedAppointments.includes(appointment.id);
                  
                  return (
                    <div key={appointment.id} className={`appointment-card ${statusClass} ${isSelected ? 'selected' : ''}`}>
                      {showBulkActions && (
                        <div className="appointment-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAppointmentSelection(appointment.id)}
                          />
                        </div>
                      )}
                      
                      <div className="appointment-header">
                        <div className="appointment-id">#{appointment.appointmentId}</div>
                        <div className={`appointment-status ${appointment.status}`}>
                          {appointment.status === 'confirmed' && isUpcoming ? '✅ Upcoming' :
                           appointment.status === 'cancelled' ? '❌ Cancelled' :
                           appointment.status === 'completed' ? '✅ Completed' :
                           '📅 ' + appointment.status}
                        </div>
                      </div>
                      
                      <div className="appointment-details">
                        <div className="detail-row">
                          <span className="label">👤 Patient:</span>
                          <span className="value">{appointment.patientName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">📱 Phone:</span>
                          <span className="value">{appointment.contactNumber}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">👨‍⚕️ Doctor:</span>
                          <span className="value">Dr. {appointment.doctor.name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">🏥 Specialty:</span>
                          <span className="value">{appointment.doctor.specialty}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">📅 Date:</span>
                          <span className="value">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">⏰ Time:</span>
                          <span className="value">{appointment.appointmentTime}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">💰 Fee:</span>
                          <span className="value">₹{appointment.fee}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">📝 Booked:</span>
                          <span className="value">{new Date(appointment.bookingDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Individual Appointment Actions */}
                      {appointment.status === 'confirmed' && isUpcoming && (
                        <div className="appointment-actions">
                          <button 
                            className="action-btn cancel-btn"
                            onClick={() => cancelAppointment(appointment.id)}
                          >
                            ❌ Cancel
                          </button>
                          <button 
                            className="action-btn complete-btn"
                            onClick={() => {
                              setBookedAppointments(prev => 
                                prev.map(apt => 
                                  apt.id === appointment.id 
                                    ? { ...apt, status: 'completed', completedAt: new Date().toISOString() }
                                    : apt
                                )
                              );
                              alert('✅ Appointment marked as completed!');
                            }}
                          >
                            ✅ Mark Complete
                          </button>
                          <button 
                            className="action-btn reschedule-btn"
                            onClick={() => {
                              const newDate = prompt('Enter new date (YYYY-MM-DD):');
                              const newTime = prompt('Enter new time (HH:MM):');
                              if (newDate && newTime) {
                                rescheduleAppointment(appointment.id, newDate, newTime);
                              }
                            }}
                          >
                            📅 Reschedule
                          </button>
                        </div>
                      )}
                      
                      {appointment.status === 'cancelled' && appointment.cancelledAt && (
                        <div className="cancellation-info">
                          <small>Cancelled on: {new Date(appointment.cancelledAt).toLocaleDateString()}</small>
                        </div>
                      )}
                      
                      {appointment.status === 'completed' && appointment.completedAt && (
                        <div className="completion-info">
                          <small>Completed on: {new Date(appointment.completedAt).toLocaleDateString()}</small>
                        </div>
                      )}
                      
                      {appointment.status === 'rescheduled' && appointment.rescheduledAt && (
                        <div className="reschedule-info">
                          <small>Rescheduled on: {new Date(appointment.rescheduledAt).toLocaleDateString()}</small>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient Queries Management Section - Doctor Only Access */}
      {userRole === 'doctor' && currentAdminView === 'queries' && (
        <div className="queries-management-section">
          <div className="queries-management-header">
            <h2 className="section-title">
              💬 Patient Queries Management
            </h2>
            <p className="section-description">
              View and respond to patient medical queries and questions
            </p>
            <button 
              className="back-button"
              onClick={() => setCurrentAdminView('none')}
            >
              ← Back to Doctor Portal
            </button>
          </div>

          {/* Query Statistics */}
          <div className="queries-stats">
            <h3>📊 Query Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{getQueryStats().total}</div>
                <div className="stat-label">Total Queries</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getQueryStats().newQueries}</div>
                <div className="stat-label">New Queries</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getQueryStats().replied}</div>
                <div className="stat-label">Replied</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getQueryStats().urgent}</div>
                <div className="stat-label">Urgent</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{getQueryStats().today}</div>
                <div className="stat-label">Today</div>
              </div>
            </div>
          </div>

          {/* Query Filters */}
          <div className="queries-controls">
            <div className="filters-section">
              <div className="filter-group">
                <label>📋 Status:</label>
                <select
                  value={queryFilter}
                  onChange={(e) => setQueryFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Queries</option>
                  <option value="new">New Queries</option>
                  <option value="replied">Replied</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>👨‍⚕️ Doctor:</label>
                <select
                  value={selectedQueryDoctor}
                  onChange={(e) => setSelectedQueryDoctor(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Doctors</option>
                  {getAvailableDoctors().map(doctor => (
                    <option key={doctor.id} value={doctor.name}>
                      Dr. {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Queries List */}
          <div className="queries-list-container">
            <div className="list-header">
              <h3>💬 Patient Queries ({getFilteredQueries().length})</h3>
            </div>
            
            {getFilteredQueries().length === 0 ? (
              <div className="no-queries">
                <div className="no-queries-icon">💬</div>
                <h4>No Queries Found</h4>
                <p>
                  {patientQueries.length === 0 
                    ? "No patient queries have been submitted yet. Patients can send questions through the 'Ask Doctor' feature."
                    : "No queries match your current filters."
                  }
                </p>
              </div>
            ) : (
              <div className="queries-grid">
                {getFilteredQueries().map(query => {
                  const isUrgent = query.urgency === 'urgent' || query.urgency === 'high';
                  const statusClass = query.status === 'new' ? 'new' : 
                                    query.status === 'replied' ? 'replied' : 'closed';
                  
                  return (
                    <div key={query.id} className={`query-card ${statusClass} ${isUrgent ? 'urgent' : ''}`}>
                      <div className="query-header">
                        <div className="query-id">#{query.queryId}</div>
                        <div className={`query-status ${query.status}`}>
                          {query.status === 'new' ? '🆕 New' :
                           query.status === 'replied' ? '✅ Replied' : '🔒 Closed'}
                        </div>
                        <div className={`urgency-badge ${query.urgency}`}>
                          {query.urgency === 'urgent' ? '🔴 Urgent' :
                           query.urgency === 'high' ? '🟠 High' :
                           query.urgency === 'normal' ? '🟡 Normal' : '🟢 Low'}
                        </div>
                      </div>
                      
                      <div className="query-details">
                        <div className="detail-row">
                          <span className="label">👤 Patient:</span>
                          <span className="value">{query.patientName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">📱 WhatsApp:</span>
                          <span className="value">{query.contactNumber}</span>
                        </div>
                        {query.preferredDoctor && (
                          <div className="detail-row">
                            <span className="label">👨‍⚕️ Preferred Doctor:</span>
                            <span className="value">{query.preferredDoctor}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span className="label">📅 Submitted:</span>
                          <span className="value">{new Date(query.submittedAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="query-content">
                        <h4>💬 Patient's Question:</h4>
                        <p className="query-text">{query.queryText}</p>
                      </div>

                      {query.status === 'replied' && query.doctorReply && (
                        <div className="doctor-reply">
                          <h4>🩺 Doctor's Reply:</h4>
                          <p className="reply-text">{query.doctorReply}</p>
                          <div className="reply-info">
                            <small>
                              Replied by: {query.repliedBy} | 
                              {new Date(query.repliedAt).toLocaleString()}
                              {query.isWhatsAppSent && " | 📱 WhatsApp Sent"}
                            </small>
                          </div>
                        </div>
                      )}

                      {query.status === 'new' && (
                        <div className="query-actions">
                          <div className="reply-form">
                            <textarea
                              id={`reply-${query.id}`}
                              placeholder="Type your professional medical response here..."
                              rows="4"
                              className="reply-textarea"
                            />
                            <div className="reply-buttons">
                              <button
                                className="send-reply-btn"
                                onClick={() => {
                                  const replyText = document.getElementById(`reply-${query.id}`).value;
                                  if (replyText.trim()) {
                                    replyToPatientQuery(query.id, replyText, userRole === 'doctor' ? 'Dr. ' + patientName : 'Medical Team');
                                    document.getElementById(`reply-${query.id}`).value = '';
                                  }
                                }}
                              >
                                📤 Send Reply
                              </button>
                              <button
                                className="mark-urgent-btn"
                                onClick={() => {
                                  setPatientQueries(prev => 
                                    prev.map(q => 
                                      q.id === query.id 
                                        ? { ...q, urgency: q.urgency === 'urgent' ? 'high' : 'urgent' }
                                        : q
                                    )
                                  );
                                }}
                              >
                                {query.urgency === 'urgent' ? '⬇️ Lower Priority' : '⬆️ Mark Urgent'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {query.status === 'replied' && (
                        <div className="post-reply-actions">
                          <button
                            className="close-query-btn"
                            onClick={() => markQueryAsClosed(query.id)}
                          >
                            🔒 Mark as Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions - Show for patients and doctors */}
      {(userRole === 'patient' || userRole === 'doctor') && (
        <div className="quick-actions">
          <h2 className="section-title">
            ⚡ Quick Actions
          </h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <div key={index} className="action-card" onClick={() => action.action ? action.action() : setMessage(action.title)}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-title">{action.title}</div>
                <div className="action-description">{action.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
