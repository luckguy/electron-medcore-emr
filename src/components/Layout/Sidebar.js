import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faUsers, faCalendarAlt, faClipboardList, faPills, faChartLine } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ currentView, onNavigate }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: faChartBar
    },
    {
      id: 'patients',
      label: 'Patients',
      path: '/patients',
      icon: faUsers
    },
    {
      id: 'appointments',
      label: 'Appointments',
      path: '/appointments',
      icon: faCalendarAlt
    },
    {
      id: 'medical-records',
      label: 'Medical Records',
      path: '/medical-records',
      icon: faClipboardList
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      path: '/prescriptions',
      icon: faPills
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: faChartLine
    }
  ];

  const handleMenuClick = (path) => {
    onNavigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>EMR Desktop</h1>
        <p>Electronic Medical Records</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.path)}
          >
            <span className="nav-icon"><FontAwesomeIcon icon={item.icon} /></span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;