import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search term
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => {
        const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
        const phone = patient.phone?.toLowerCase() || '';
        const email = patient.email?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || 
               phone.includes(search) || 
               email.includes(search);
      });
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (window.electronAPI) {
        const patientsData = await window.electronAPI.patients.getAll();
        setPatients(patientsData);
      } else {
        // Mock data for web development
        const mockPatients = [
          {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1985-03-15',
            gender: 'Male',
            phone: '(555) 123-4567',
            email: 'john.doe@email.com',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            first_name: 'Sarah',
            last_name: 'Johnson',
            date_of_birth: '1992-07-22',
            gender: 'Female',
            phone: '(555) 234-5678',
            email: 'sarah.johnson@email.com',
            created_at: '2024-01-16T14:20:00Z'
          }
        ];
        setPatients(mockPatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to delete patient ${patientName}? This action cannot be undone.`)) {
      try {
        if (window.electronAPI) {
          await window.electronAPI.patients.delete(patientId);
          await loadPatients(); // Reload the list
        } else {
          // Mock deletion for web development
          setPatients(prev => prev.filter(p => p.id !== patientId));
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
        setError('Failed to delete patient. Please try again.');
      }
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

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading patients...
      </div>
    );
  }

  return (
    <div className="patient-list">
      {error && (
        <div className="alert alert-error">
          <i>⚠️</i> {error}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3>Patient Management</h3>
          <Link to="/patients/new" className="btn btn-primary">
            🆕 Add New Patient
          </Link>
        </div>
        
        <div className="card-body">
          <div className="search-container">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search patients by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          {filteredPatients.length === 0 ? (
            <div className="text-center mt-3">
              <p>No patients found.</p>
              <Link to="/patients/new" className="btn btn-primary">
                Add First Patient
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => (
                    <tr key={patient.id}>
                      <td>
                        <Link 
                          to={`/patients/${patient.id}`} 
                          className="patient-link"
                        >
                          {patient.first_name} {patient.last_name}
                        </Link>
                      </td>
                      <td>{calculateAge(patient.date_of_birth)}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.phone || 'N/A'}</td>
                      <td>{patient.email || 'N/A'}</td>
                      <td>
                        {format(new Date(patient.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link 
                            to={`/patients/${patient.id}`}
                            className="btn btn-sm btn-outline"
                            title="View Details"
                          >
                            👁️
                          </Link>
                          <Link 
                            to={`/patients/edit/${patient.id}`}
                            className="btn btn-sm btn-secondary"
                            title="Edit Patient"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDeletePatient(
                              patient.id, 
                              `${patient.first_name} ${patient.last_name}`
                            )}
                            className="btn btn-sm btn-danger"
                            title="Delete Patient"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="patient-stats">
        <div className="card">
          <div className="card-body">
            <div className="stats-summary">
              <div className="stat-item">
                <strong>Total Patients:</strong> {patients.length}
              </div>
              <div className="stat-item">
                <strong>Showing:</strong> {filteredPatients.length}
              </div>
              {searchTerm && (
                <div className="stat-item">
                  <strong>Search:</strong> "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="btn btn-sm btn-outline ml-1"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;