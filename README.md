# MedCore EMR 🏥

> A comprehensive Electronic Medical Record (EMR) desktop application built with Electron and React

[![Electron](https://img.shields.io/badge/Electron-27+-blue.svg)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3+-green.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 📋 Overview

MedCore EMR is a professional-grade Electronic Medical Record system designed for healthcare providers. Built as a secure desktop application using Electron and React, it provides comprehensive patient management, appointment scheduling, medical record keeping, and prescription management in a user-friendly interface.

## ✨ Features

### 🔐 **Security First**
- Context isolation enabled
- Node integration disabled in renderers
- Secure IPC communication through preload scripts
- Local SQLite database with encrypted storage

### 👥 **Patient Management**
- Complete patient demographics and contact information
- Insurance information tracking
- Emergency contact management
- Real-time patient search and filtering
- Patient history timeline

### 📅 **Appointment Scheduling**
- Interactive scheduling interface
- Time slot management (8 AM - 6 PM)
- Appointment status tracking (scheduled, completed, cancelled, no-show)
- Duration options from 15 minutes to 2 hours
- Date-based filtering and search

### 🩺 **Medical Records**
- SOAP format documentation
- Vital signs tracking and history
- Comprehensive medical history timeline
- Diagnosis and treatment planning
- Secure record storage and retrieval

### 💊 **Prescription Management**
- Complete medication tracking
- Dosage and frequency management
- Refill tracking and alerts
- Prescription status management
- Print-ready prescription formats

### 📊 **Reports & Analytics**
- Practice overview dashboard
- Patient registration analytics
- Appointment statistics
- Custom date range reporting
- Export capabilities for reports

### 🎨 **Professional UI/UX**
- Medical software appropriate design
- Responsive desktop layout
- Intuitive navigation with sidebar menu
- Professional color scheme and branding
- Smooth transitions and loading states

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn package manager
- Windows 10+, macOS 10.13+, or Linux

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medcore-emr.git
   cd medcore-emr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

   Or use the included batch file for Windows:
   ```bash
   start.bat
   ```

## 🏗️ Development

### Project Structure

```
medcore-emr/
├── public/
│   ├── electron.js          # Main Electron process
│   ├── preload.js           # Secure IPC bridge
│   ├── database.js          # SQLite operations
│   └── index.html           # Entry HTML
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard/
│   │   ├── Patients/
│   │   ├── Appointments/
│   │   ├── MedicalRecords/
│   │   ├── Prescriptions/
│   │   └── Reports/
│   ├── App.js              # Main React application
│   ├── index.js            # React entry point
│   └── index.css           # Application styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

### Available Scripts

- `npm start` - Start development server and Electron app
- `npm run electron` - Start Electron in development mode
- `npm run build` - Build the React application
- `npm run dist` - Build distributable packages
- `npm test` - Run test suite

### Building for Production

```bash
# Build React app
npm run build

# Create distributable packages
npm run dist
```

## 🗃️ Database Schema

The application uses SQLite with the following main tables:

- **patients** - Patient demographics and contact information
- **appointments** - Appointment scheduling and status
- **medical_records** - SOAP format medical documentation
- **prescriptions** - Medication and prescription management

Sample data is automatically loaded on first run for testing purposes.

## 🔧 Configuration

### Database Location
- **Windows**: `%APPDATA%/MedCore EMR/database.db`
- **macOS**: `~/Library/Application Support/MedCore EMR/database.db`
- **Linux**: `~/.config/MedCore EMR/database.db`

### Environment Variables
- `NODE_ENV` - Set to 'production' for production builds
- `DEBUG` - Enable debug logging when set to 'true'

## 📱 Platform Support

- ✅ Windows 10+
- ✅ macOS 10.13+
- ✅ Linux (Ubuntu 18.04+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚨 Important Notes

### HIPAA Compliance
This software is designed with healthcare data security in mind but should be properly configured and audited for HIPAA compliance in production environments. Consult with compliance experts before using in a clinical setting.

### Data Security
- All patient data is stored locally
- Database files should be backed up regularly
- Consider implementing additional encryption for sensitive environments
- Regular security updates are recommended

## 📞 Support

For support, feature requests, or bug reports, please create an issue in the GitHub repository.

## 🏆 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- UI powered by [React](https://reactjs.org/)
- Database management with [SQLite](https://sqlite.org/)
- Icons and design inspiration from healthcare industry standards

---

**Made with ❤️ for healthcare providers**