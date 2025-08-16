import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

import { format, isToday, isFuture, isPast } from 'date-fns';
import { appointments as mockAppointments } from '../../data/mockData';


import { useContext } from 'react';
import { DataSourceContext } from '../../context/DataSourceContext';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { useMockData } = useContext(DataSourceContext);

  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [filter, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      if (window.electronAPI && !useMockData) {
        const appointmentsData = await window.electronAPI.appointments.getAll();
        setAppointments(Array.isArray(appointmentsData) && appointmentsData.length ? appointmentsData : mockAppointments);
      } else {
        // Mock data for web development
        setAppointments(mockAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;
    const today = new Date();

    switch (filter) {
      case 'today':
        filtered = appointments.filter(apt =>
          isToday(new Date(apt.appointment_date))
        );
        break;
      case 'upcoming':
        filtered = appointments.filter(apt =>
          isFuture(new Date(apt.appointment_date)) || isToday(new Date(apt.appointment_date))
        );
        break;
      case 'past':
        filtered = appointments.filter(apt =>
          isPast(new Date(apt.appointment_date)) && !isToday(new Date(apt.appointment_date))
        );
        break;
      case 'scheduled':
        filtered = appointments.filter(apt => apt.status === 'scheduled');
        break;
      case 'completed':
        filtered = appointments.filter(apt => apt.status === 'completed');
        break;
      case 'cancelled':
        filtered = appointments.filter(apt => apt.status === 'cancelled');
        break;
      default:
        filtered = appointments;
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return dateA - dateB;
    });

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      if (window.electronAPI) {
        const appointment = appointments.find(apt => apt.id === appointmentId);
        await window.electronAPI.appointments.update(appointmentId, {
          ...appointment,
          status: newStatus
        });
        await loadAppointments();
      } else {
        // Mock status change for web development
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId
              ? { ...apt, status: newStatus }
              : apt
          )
        );
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('Failed to update appointment status.');
    }
  };

  const handleDeleteAppointment = async (appointmentId, patientName) => {
    if (window.confirm(`Are you sure you want to delete the appointment for ${patientName}? This action cannot be undone.`)) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.appointments.delete(appointmentId);
          await loadAppointments();
        } else {
          // Mock deletion for web development
          setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setError('Failed to delete appointment.');
      }
    }
  };

  const getStatusBadgeClass = (status, appointmentDate) => {
    const today = new Date();
    const aptDate = new Date(appointmentDate);

    if (status === 'completed') return 'badge-success';
    if (status === 'cancelled') return 'badge-danger';
    if (isPast(aptDate) && !isToday(aptDate) && status === 'scheduled') return 'badge-warning';
    if (isToday(aptDate)) return 'badge-info';
    return 'badge-secondary';
  };

  const getStatusDisplayText = (status, appointmentDate) => {
    const today = new Date();
    const aptDate = new Date(appointmentDate);

    if (status === 'scheduled' && isPast(aptDate) && !isToday(aptDate)) {
      return 'Missed';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="appointment-list">
      {error && (
        <div className="alert alert-error">
          <i>⚠️</i> {error}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Appointment Schedule</h3>
          <Link to="/appointments/new" className="btn btn-primary">
            <FontAwesomeIcon icon={faCalendarPlus} /> Schedule New Appointment
          </Link>
        </div>

        <div className="card-body">
          {/* Filter buttons */}
          <div className="appointment-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({appointments.length})
            </button>
            <button
              className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >
              Today
            </button>
            <button
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
            <button
              className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
              onClick={() => setFilter('scheduled')}
            >
              Scheduled
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <p>No appointments found for the selected filter.</p>
              <Link to="/appointments/new" className="btn btn-primary">
                Schedule First Appointment
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(appointment => {
                    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
                    return (
                      <tr key={appointment.id} className={`appointment-row ${isToday(new Date(appointment.appointment_date)) ? 'today-row' : ''}`}>
                        <td>
                          <Link
                            to={`/patients/${appointment.patient_id}`}
                            className="patient-link"
                          >
                            {appointment.first_name} {appointment.last_name}
                          </Link>
                        </td>
                        <td>
                          <div className="datetime-info">
                            <div className="appointment-date">
                              {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                            </div>
                            <div className="appointment-time">
                              {format(appointmentDateTime, 'h:mm a')}
                            </div>
                          </div>
                        </td>
                        <td>{appointment.duration} min</td>
                        <td>{appointment.reason || 'No reason specified'}</td>
                        <td>
                          <select
                            value={appointment.status}
                            onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                            className={`status-select badge ${getStatusBadgeClass(appointment.status, appointment.appointment_date)}`}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                          </select>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`/appointments/edit/${appointment.id}`}
                              className="btn btn-sm btn-secondary"
                              title="Edit Appointment"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </Link>
                            <button
                              onClick={() => handleDeleteAppointment(
                                appointment.id,
                                `${appointment.first_name} ${appointment.last_name}`
                              )}
                              className="btn btn-sm btn-danger"
                              title="Delete Appointment"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="appointment-stats">
        <div className="stats-grid">
          <div className="stat-card primary">
            <h3>{appointments.filter(apt => isToday(new Date(apt.appointment_date))).length}</h3>
            <p>Today's Appointments</p>
          </div>
          <div className="stat-card success">
            <h3>{appointments.filter(apt => apt.status === 'completed').length}</h3>
            <p>Completed</p>
          </div>
          <div className="stat-card warning">
            <h3>{appointments.filter(apt =>
              isPast(new Date(apt.appointment_date)) &&
              !isToday(new Date(apt.appointment_date)) &&
              apt.status === 'scheduled'
            ).length}</h3>
            <p>Missed</p>
          </div>
          <div className="stat-card info">
            <h3>{appointments.filter(apt =>
              (isFuture(new Date(apt.appointment_date)) || isToday(new Date(apt.appointment_date))) &&
              apt.status === 'scheduled'
            ).length}</h3>
            <p>Upcoming</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;