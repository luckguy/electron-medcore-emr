import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendarAlt, faClock, faPills, faUserPlus, faCalendarPlus, faClipboardList, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { computeDashboardStats } from '../../data/mockData';
import { useContext } from 'react';
import { DataSourceContext } from '../../context/DataSourceContext';




const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaysAppointments: 0,
    upcomingAppointments: 0,
    activePrescriptions: 0
  });
  const { useMockData } = useContext(DataSourceContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      if (window.electronAPI && !useMockData) {
        try {
          const dashboardStats = await window.electronAPI.dashboard.getStats();
          if (dashboardStats && typeof dashboardStats === 'object') {
            setStats(dashboardStats);
          } else {
            setStats(computeDashboardStats());
          }
        } catch (e) {
          setStats(computeDashboardStats());
        }
      } else {
        // Mock data for web development
        setStats(computeDashboardStats());
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon" aria-hidden="true"><FontAwesomeIcon icon={faUsers} /></div>
          <h3>{stats.totalPatients}</h3>
          <p>Total Patients</p>
          <Link to="/patients" className="btn btn-outline btn-sm mt-2">
            View All Patients
          </Link>
        </div>

        <div className="stat-card success">
          <div className="stat-icon" aria-hidden="true"><FontAwesomeIcon icon={faCalendarAlt} /></div>
          <h3>{stats.todaysAppointments}</h3>
          <p>Today's Appointments</p>
          <Link to="/appointments" className="btn btn-outline btn-sm mt-2">
            View Schedule
          </Link>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon" aria-hidden="true"><FontAwesomeIcon icon={faClock} /></div>
          <h3>{stats.upcomingAppointments}</h3>
          <p>Upcoming Appointments</p>
          <Link to="/appointments/new" className="btn btn-outline btn-sm mt-2">
            Schedule New
          </Link>
        </div>

        <div className="stat-card info">
          <div className="stat-icon" aria-hidden="true"><FontAwesomeIcon icon={faPills} /></div>
          <h3>{stats.activePrescriptions}</h3>
          <p>Active Prescriptions</p>
          <Link to="/prescriptions" className="btn btn-outline btn-sm mt-2">
            Manage Prescriptions
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="quick-actions">
            <Link to="/patients/new" className="btn btn-primary btn-lg">
              <FontAwesomeIcon icon={faUserPlus} /> Add New Patient
            </Link>
            <Link to="/appointments/new" className="btn btn-success btn-lg">
              <FontAwesomeIcon icon={faCalendarPlus} /> Schedule Appointment
            </Link>
            <Link to="/medical-records" className="btn btn-info btn-lg">
              <FontAwesomeIcon icon={faClipboardList} /> View Medical Records
            </Link>
            <Link to="/reports" className="btn btn-secondary btn-lg">
              <FontAwesomeIcon icon={faChartBar} /> Generate Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>System Information</h3>
        </div>
        <div className="card-body">
          <div className="system-info">
            <div className="info-item">
              <strong>Application Version:</strong> 1.0.0
            </div>
            <div className="info-item">
              <strong>Database Status:</strong>
              <span className="badge badge-success ml-1">Connected</span>
            </div>
            <div className="info-item">
              <strong>Last Backup:</strong> Never
            </div>
            <div className="info-item">
              <strong>System Status:</strong>
              <span className="badge badge-success ml-1">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;