import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const Reports = () => {
  const [reportData, setReportData] = useState({
    patients: [],
    appointments: [],
    medicalRecords: [],
    prescriptions: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      if (window.electronAPI) {
        const [patientsData, appointmentsData, dashboardStats] = await Promise.all([
          window.electronAPI.patients.getAll(),
          window.electronAPI.appointments.getAll(),
          window.electronAPI.dashboard.getStats()
        ]);
        
        setReportData({
          patients: patientsData || [],
          appointments: appointmentsData || [],
          stats: dashboardStats
        });
      } else {
        // Mock data for web development
        setReportData({
          patients: [
            { id: '1', first_name: 'John', last_name: 'Doe', created_at: '2024-01-15T10:30:00Z' },
            { id: '2', first_name: 'Sarah', last_name: 'Johnson', created_at: '2024-01-16T14:20:00Z' }
          ],
          appointments: [
            {
              id: '1',
              appointment_date: '2024-02-20',
              status: 'completed',
              first_name: 'John',
              last_name: 'Doe'
            }
          ],
          stats: {
            totalPatients: 156,
            todaysAppointments: 8,
            upcomingAppointments: 23,
            activePrescriptions: 45
          }
        });
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPatientRegistrationStats = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const patientsInRange = reportData.patients.filter(patient => {
      const createdDate = new Date(patient.created_at);
      return createdDate >= startDate && createdDate <= endDate;
    });
    
    return {
      totalInRange: patientsInRange.length,
      totalOverall: reportData.patients.length
    };
  };

  const getAppointmentStats = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const appointmentsInRange = reportData.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
    
    const stats = {
      total: appointmentsInRange.length,
      completed: appointmentsInRange.filter(a => a.status === 'completed').length,
      cancelled: appointmentsInRange.filter(a => a.status === 'cancelled').length,
      scheduled: appointmentsInRange.filter(a => a.status === 'scheduled').length,
      noShow: appointmentsInRange.filter(a => a.status === 'no-show').length
    };
    
    return stats;
  };

  const generatePatientReport = () => {
    const stats = getPatientRegistrationStats();
    
    return (
      <div className="report-content">
        <h4>Patient Registration Report</h4>
        <div className="report-stats">
          <div className="stat-item">
            <strong>New Patients in Date Range:</strong> {stats.totalInRange}
          </div>
          <div className="stat-item">
            <strong>Total Patients:</strong> {stats.totalOverall}
          </div>
        </div>
        
        <div className="patient-list-report">
          <h5>Patient List</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Registration Date</th>
                  <th>Phone</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {reportData.patients.map(patient => (
                  <tr key={patient.id}>
                    <td>{patient.first_name} {patient.last_name}</td>
                    <td>{format(new Date(patient.created_at), 'MMM dd, yyyy')}</td>
                    <td>{patient.phone || 'N/A'}</td>
                    <td>{patient.email || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const generateAppointmentReport = () => {
    const stats = getAppointmentStats();
    
    return (
      <div className="report-content">
        <h4>Appointment Report</h4>
        <div className="report-stats">
          <div className="stat-item">
            <strong>Total Appointments:</strong> {stats.total}
          </div>
          <div className="stat-item">
            <strong>Completed:</strong> {stats.completed}
          </div>
          <div className="stat-item">
            <strong>Cancelled:</strong> {stats.cancelled}
          </div>
          <div className="stat-item">
            <strong>No Show:</strong> {stats.noShow}
          </div>
        </div>
        
        {stats.total > 0 && (
          <div className="completion-rate">
            <strong>Completion Rate:</strong> {((stats.completed / stats.total) * 100).toFixed(1)}%
          </div>
        )}
        
        <div className="appointment-list-report">
          <h5>Appointment Details</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {reportData.appointments
                  .filter(appointment => {
                    const appointmentDate = new Date(appointment.appointment_date);
                    const startDate = new Date(dateRange.startDate);
                    const endDate = new Date(dateRange.endDate);
                    return appointmentDate >= startDate && appointmentDate <= endDate;
                  })
                  .map(appointment => (
                    <tr key={appointment.id}>
                      <td>{format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}</td>
                      <td>{appointment.first_name} {appointment.last_name}</td>
                      <td>
                        <span className={`badge badge-${
                          appointment.status === 'completed' ? 'success' :
                          appointment.status === 'cancelled' ? 'danger' :
                          appointment.status === 'no-show' ? 'warning' : 'info'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>{appointment.reason || 'N/A'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const generateOverviewReport = () => {
    const patientStats = getPatientRegistrationStats();
    const appointmentStats = getAppointmentStats();
    
    return (
      <div className="report-content">
        <h4>Practice Overview Report</h4>
        
        <div className="overview-stats-grid">
          <div className="overview-stat-card">
            <h5>Patients</h5>
            <div className="stat-number">{reportData.stats?.totalPatients || reportData.patients.length}</div>
            <div className="stat-label">Total Registered</div>
            <div className="stat-detail">{patientStats.totalInRange} new this period</div>
          </div>
          
          <div className="overview-stat-card">
            <h5>Appointments</h5>
            <div className="stat-number">{appointmentStats.total}</div>
            <div className="stat-label">This Period</div>
            <div className="stat-detail">
              {appointmentStats.completed} completed ({appointmentStats.total > 0 ? ((appointmentStats.completed / appointmentStats.total) * 100).toFixed(0) : 0}%)
            </div>
          </div>
          
          <div className="overview-stat-card">
            <h5>Today's Schedule</h5>
            <div className="stat-number">{reportData.stats?.todaysAppointments || 0}</div>
            <div className="stat-label">Appointments Today</div>
            <div className="stat-detail">{reportData.stats?.upcomingAppointments || 0} upcoming</div>
          </div>
          
          <div className="overview-stat-card">
            <h5>Prescriptions</h5>
            <div className="stat-number">{reportData.stats?.activePrescriptions || 0}</div>
            <div className="stat-label">Active Prescriptions</div>
            <div className="stat-detail">System-wide</div>
          </div>
        </div>
        
        <div className="overview-summary">
          <h5>Summary</h5>
          <ul>
            <li>Total patients in system: {reportData.patients.length}</li>
            <li>New patients this period: {patientStats.totalInRange}</li>
            <li>Appointments this period: {appointmentStats.total}</li>
            <li>Appointment completion rate: {appointmentStats.total > 0 ? ((appointmentStats.completed / appointmentStats.total) * 100).toFixed(1) : 0}%</li>
            <li>Active prescriptions: {reportData.stats?.activePrescriptions || 0}</li>
          </ul>
        </div>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSelectedReport = () => {
    switch (selectedReport) {
      case 'patients':
        return generatePatientReport();
      case 'appointments':
        return generateAppointmentReport();
      default:
        return generateOverviewReport();
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading report data...
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="card">
        <div className="card-header">
          <h3>Reports & Analytics</h3>
          <button onClick={handlePrint} className="btn btn-secondary">
            🖶️ Print Report
          </button>
        </div>
        
        <div className="card-body">
          {/* Report Controls */}
          <div className="report-controls">
            <div className="control-group">
              <label className="form-label">Report Type:</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="form-control"
              >
                <option value="overview">Practice Overview</option>
                <option value="patients">Patient Report</option>
                <option value="appointments">Appointment Report</option>
              </select>
            </div>
            
            <div className="control-group">
              <label className="form-label">Date Range:</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="form-control"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="control-group">
              <label className="form-label">Quick Select:</label>
              <div className="quick-date-buttons">
                <button
                  onClick={() => setDateRange({
                    startDate: format(new Date(), 'yyyy-MM-dd'),
                    endDate: format(new Date(), 'yyyy-MM-dd')
                  })}
                  className="btn btn-sm btn-outline"
                >
                  Today
                </button>
                <button
                  onClick={() => setDateRange({
                    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
                  })}
                  className="btn btn-sm btn-outline"
                >
                  This Month
                </button>
                <button
                  onClick={() => {
                    const lastMonth = subMonths(new Date(), 1);
                    setDateRange({
                      startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
                      endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
                    });
                  }}
                  className="btn btn-sm btn-outline"
                >
                  Last Month
                </button>
              </div>
            </div>
          </div>
          
          {/* Report Content */}
          <div className="report-container">
            {renderSelectedReport()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;