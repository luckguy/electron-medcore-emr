import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (window.electronAPI) {
        const [patientData, recordsData, prescriptionsData] = await Promise.all([
          window.electronAPI.patients.getById(id),
          window.electronAPI.medicalRecords.getByPatient(id),
          window.electronAPI.prescriptions.getByPatient(id)
        ]);
        
        setPatient(patientData);
        setMedicalRecords(recordsData || []);
        setPrescriptions(prescriptionsData || []);
      } else {
        // Mock data for web development
        const mockPatient = {
          id: id,
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1985-03-15',
          gender: 'Male',
          phone: '(555) 123-4567',
          email: 'john.doe@email.com',
          address: '123 Main St, Anytown, ST 12345',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '(555) 987-6543',
          insurance_provider: 'Blue Cross Blue Shield',
          insurance_policy_number: 'BC123456789',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        };
        setPatient(mockPatient);
        setMedicalRecords([]);
        setPrescriptions([]);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      setError('Failed to load patient data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDeletePatient = async () => {
    if (window.confirm(`Are you sure you want to delete patient ${patient.first_name} ${patient.last_name}? This action cannot be undone.`)) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.patients.delete(id);
        }
        navigate('/patients');
      } catch (error) {
        console.error('Error deleting patient:', error);
        setError('Failed to delete patient.');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading patient data...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="alert alert-error">
            <i>⚠️</i> {error || 'Patient not found'}
          </div>
          <Link to="/patients" className="btn btn-primary">
            Back to Patient List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-detail">
      {/* Patient Header */}
      <div className="card mb-2">
        <div className="card-header">
          <div className="patient-header-info">
            <h2>{patient.first_name} {patient.last_name}</h2>
            <div className="patient-meta">
              <span className="badge badge-info">
                {calculateAge(patient.date_of_birth)} years old
              </span>
              <span className="badge badge-secondary ml-1">
                {patient.gender}
              </span>
            </div>
          </div>
          <div className="patient-actions">
            <Link 
              to={`/appointments/new?patientId=${patient.id}`}
              className="btn btn-success btn-sm"
            >
              📅 Schedule Appointment
            </Link>
            <Link 
              to={`/patients/edit/${patient.id}`}
              className="btn btn-secondary btn-sm"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={handleDeletePatient}
              className="btn btn-danger btn-sm"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="tab-header">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'medical-records' ? 'active' : ''}`}
            onClick={() => setActiveTab('medical-records')}
          >
            Medical Records ({medicalRecords.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('prescriptions')}
          >
            Prescriptions ({prescriptions.length})
          </button>
        </div>
        
        <div className="card-body">
          {activeTab === 'overview' && (
            <div className="patient-overview">
              <div className="overview-grid">
                <div className="overview-section">
                  <h4>Personal Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name:</label>
                      <span>{patient.first_name} {patient.last_name}</span>
                    </div>
                    <div className="info-item">
                      <label>Date of Birth:</label>
                      <span>{format(new Date(patient.date_of_birth), 'MMMM dd, yyyy')}</span>
                    </div>
                    <div className="info-item">
                      <label>Age:</label>
                      <span>{calculateAge(patient.date_of_birth)} years</span>
                    </div>
                    <div className="info-item">
                      <label>Gender:</label>
                      <span>{patient.gender}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h4>Contact Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{patient.phone || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{patient.email || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Address:</label>
                      <span>{patient.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h4>Emergency Contact</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Name:</label>
                      <span>{patient.emergency_contact_name || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone:</label>
                      <span>{patient.emergency_contact_phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="overview-section">
                  <h4>Insurance Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Provider:</label>
                      <span>{patient.insurance_provider || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <label>Policy Number:</label>
                      <span>{patient.insurance_policy_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overview-footer">
                <div className="info-item">
                  <label>Patient Since:</label>
                  <span>{format(new Date(patient.created_at), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="info-item">
                  <label>Last Updated:</label>
                  <span>{format(new Date(patient.updated_at), 'MMMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'medical-records' && (
            <div className="medical-records-tab">
              <div className="tab-header-actions">
                <Link 
                  to={`/medical-records/new?patientId=${patient.id}`}
                  className="btn btn-primary btn-sm"
                >
                  🆕 Add Medical Record
                </Link>
              </div>
              
              {medicalRecords.length === 0 ? (
                <div className="empty-state">
                  <p>No medical records found for this patient.</p>
                  <Link 
                    to={`/medical-records/new?patientId=${patient.id}`}
                    className="btn btn-primary"
                  >
                    Add First Medical Record
                  </Link>
                </div>
              ) : (
                <div className="records-list">
                  {medicalRecords.map(record => (
                    <div key={record.id} className="record-item card">
                      <div className="card-body">
                        <div className="record-header">
                          <h5>Visit Date: {format(new Date(record.visit_date), 'MMMM dd, yyyy')}</h5>
                          <span className="record-date">
                            {format(new Date(record.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="record-content">
                          <p><strong>Chief Complaint:</strong> {record.chief_complaint}</p>
                          {record.assessment && (
                            <p><strong>Assessment:</strong> {record.assessment}</p>
                          )}
                          {record.plan && (
                            <p><strong>Plan:</strong> {record.plan}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'prescriptions' && (
            <div className="prescriptions-tab">
              <div className="tab-header-actions">
                <Link 
                  to={`/prescriptions/new?patientId=${patient.id}`}
                  className="btn btn-primary btn-sm"
                >
                  🆕 Add Prescription
                </Link>
              </div>
              
              {prescriptions.length === 0 ? (
                <div className="empty-state">
                  <p>No prescriptions found for this patient.</p>
                  <Link 
                    to={`/prescriptions/new?patientId=${patient.id}`}
                    className="btn btn-primary"
                  >
                    Add First Prescription
                  </Link>
                </div>
              ) : (
                <div className="prescriptions-list">
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Prescribed</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions.map(prescription => (
                          <tr key={prescription.id}>
                            <td>{prescription.medication_name}</td>
                            <td>{prescription.dosage}</td>
                            <td>{prescription.frequency}</td>
                            <td>{format(new Date(prescription.prescribed_date), 'MMM dd, yyyy')}</td>
                            <td>
                              <span className={`badge badge-${
                                prescription.status === 'active' ? 'success' :
                                prescription.status === 'completed' ? 'info' : 'warning'
                              }`}>
                                {prescription.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;