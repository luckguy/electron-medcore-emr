import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import PatientList from './components/Patients/PatientList';
import PatientForm from './components/Patients/PatientForm';
import PatientDetail from './components/Patients/PatientDetail';
import AppointmentList from './components/Appointments/AppointmentList';
import AppointmentForm from './components/Appointments/AppointmentForm';
import MedicalRecords from './components/MedicalRecords/MedicalRecords';
import Prescriptions from './components/Prescriptions/Prescriptions';
import Reports from './components/Reports/Reports';
import './App.css';
import { DataSourceProvider } from './context/DataSourceContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Update current view based on location
    const path = location.pathname.split('/')[1] || 'dashboard';
    setCurrentView(path);
  }, [location]);

  useEffect(() => {
    // Set up menu event listeners if Electron API is available
    if (window.electronAPI) {
      window.electronAPI.onMenuEvent(() => {
        // Handle menu events
      });

      return () => {
        window.electronAPI.removeMenuListeners();
      };
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setCurrentView(path.split('/')[1] || 'dashboard');
  };

  const getPageTitle = () => {
    const titles = {
      'dashboard': 'Dashboard',
      'patients': 'Patient Management',
      'appointments': 'Appointments',
      'medical-records': 'Medical Records',
      'prescriptions': 'Prescriptions',
      'reports': 'Reports & Analytics'
    };
    return titles[currentView] || 'EMR System';
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return [{ label: 'Dashboard', path: '/' }];
    }

    const breadcrumbs = [{ label: 'Dashboard', path: '/' }];
    
    if (segments[0] === 'patients') {
      breadcrumbs.push({ label: 'Patients', path: '/patients' });
      if (segments[1] === 'new') {
        breadcrumbs.push({ label: 'New Patient', path: null });
      } else if (segments[1] === 'edit') {
        breadcrumbs.push({ label: 'Edit Patient', path: null });
      } else if (segments[1]) {
        breadcrumbs.push({ label: 'Patient Details', path: null });
      }
    } else if (segments[0] === 'appointments') {
      breadcrumbs.push({ label: 'Appointments', path: '/appointments' });
      if (segments[1] === 'new') {
        breadcrumbs.push({ label: 'New Appointment', path: null });
      } else if (segments[1] === 'edit') {
        breadcrumbs.push({ label: 'Edit Appointment', path: null });
      }
    } else {
      const titles = {
        'medical-records': 'Medical Records',
        'prescriptions': 'Prescriptions',
        'reports': 'Reports'
      };
      const title = titles[segments[0]] || segments[0];
      breadcrumbs.push({ label: title, path: null });
    }

    return breadcrumbs;
  };

  return (
    <DataSourceProvider>
      <div className="app professional">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigation}
        />
        <div className="main-content">
          <Header
            title={getPageTitle()}
            breadcrumbs={getBreadcrumbs()}
          />
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/new" element={<PatientForm />} />
              <Route path="/patients/edit/:id" element={<PatientForm />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/appointments" element={<AppointmentList />} />
              <Route path="/appointments/new" element={<AppointmentForm />} />
              <Route path="/appointments/edit/:id" element={<AppointmentForm />} />
              <Route path="/medical-records" element={<MedicalRecords />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </div>
      </div>
    </DataSourceProvider>
  );
}

export default App;