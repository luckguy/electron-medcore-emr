import React from 'react';

const Sidebar = ({ currentView, onNavigate }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: '📊'
    },
    {
      id: 'patients',
      label: 'Patients',
      path: '/patients',
      icon: '👥'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      path: '/appointments',
      icon: '📅'
    },
    {
      id: 'medical-records',
      label: 'Medical Records',
      path: '/medical-records',
      icon: '📋'
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      path: '/prescriptions',
      icon: '💊'
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: '📈'
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
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;