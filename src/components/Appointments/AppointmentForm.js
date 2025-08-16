import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditing = !!id;
  
  // Get patientId from URL params if creating new appointment from patient detail
  const urlParams = new URLSearchParams(location.search);
  const preselectedPatientId = urlParams.get('patientId');

  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || '',
    appointment_date: '',
    appointment_time: '',
    duration: 30,
    status: 'scheduled',
    reason: '',
    notes: ''
  });

  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadPatients();
    if (isEditing) {
      loadAppointment();
    }
  }, [id, isEditing]);

  const loadPatients = async () => {
    try {
      if (window.electronAPI) {
        const patientsData = await window.electronAPI.patients.getAll();
        setPatients(patientsData);
      } else {
        // Mock data for web development
        const mockPatients = [
          { id: '1', first_name: 'John', last_name: 'Doe' },
          { id: '2', first_name: 'Sarah', last_name: 'Johnson' }
        ];
        setPatients(mockPatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setSubmitError('Failed to load patients.');
    }
  };

  const loadAppointment = async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const appointment = await window.electronAPI.appointments.getById(id);
        if (appointment) {
          setFormData({
            patient_id: appointment.patient_id || '',
            appointment_date: appointment.appointment_date || '',
            appointment_time: appointment.appointment_time || '',
            duration: appointment.duration || 30,
            status: appointment.status || 'scheduled',
            reason: appointment.reason || '',
            notes: appointment.notes || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      setSubmitError('Failed to load appointment data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Please select a patient';
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Appointment date is required';
    } else {
      const appointmentDate = new Date(formData.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        newErrors.appointment_date = 'Appointment date cannot be in the past';
      }
    }

    if (!formData.appointment_time) {
      newErrors.appointment_time = 'Appointment time is required';
    }

    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for visit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      
      if (window.electronAPI) {
        if (isEditing) {
          await window.electronAPI.appointments.update(id, formData);
        } else {
          await window.electronAPI.appointments.create(formData);
        }
      }
      
      navigate('/appointments');
    } catch (error) {
      console.error('Error saving appointment:', error);
      setSubmitError('Failed to save appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  if (loading && isEditing) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading appointment data...
      </div>
    );
  }

  const timeSlots = generateTimeSlots();
  const selectedPatient = patients.find(p => p.id === formData.patient_id);

  return (
    <div className="appointment-form">
      <div className="card">
        <div className="card-header">
          <h3>{isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}</h3>
          {selectedPatient && (
            <div className="selected-patient-info">
              <strong>Patient:</strong> {selectedPatient.first_name} {selectedPatient.last_name}
            </div>
          )}
        </div>
        
        <div className="card-body">
          {submitError && (
            <div className="alert alert-error">
              <i>⚠️</i> {submitError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Patient Selection */}
            <div className="form-group">
              <label className="form-label">Patient *</label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                className={`form-control ${errors.patient_id ? 'error' : ''}`}
                required
                disabled={!!preselectedPatientId}
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
              {errors.patient_id && (
                <div className="form-error">{errors.patient_id}</div>
              )}
            </div>
            
            {/* Appointment Date & Time */}
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Appointment Date *</label>
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    className={`form-control ${errors.appointment_date ? 'error' : ''}`}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                  {errors.appointment_date && (
                    <div className="form-error">{errors.appointment_date}</div>
                  )}
                </div>
              </div>
              
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Appointment Time *</label>
                  <select
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleInputChange}
                    className={`form-control ${errors.appointment_time ? 'error' : ''}`}
                    required
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  {errors.appointment_time && (
                    <div className="form-error">{errors.appointment_time}</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Duration & Status */}
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Duration (minutes) *</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`form-control ${errors.duration ? 'error' : ''}`}
                    required
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                  {errors.duration && (
                    <div className="form-error">{errors.duration}</div>
                  )}
                </div>
              </div>
              
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Reason */}
            <div className="form-group">
              <label className="form-label">Reason for Visit *</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={`form-control ${errors.reason ? 'error' : ''}`}
                placeholder="e.g., Annual checkup, Follow-up consultation, Urgent care"
                required
              />
              {errors.reason && (
                <div className="form-error">{errors.reason}</div>
              )}
            </div>
            
            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Additional notes or special instructions"
              />
            </div>
            
            <div className="btn-group right">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Appointment' : 'Schedule Appointment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;