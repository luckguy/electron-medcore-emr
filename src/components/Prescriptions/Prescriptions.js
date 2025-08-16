import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPrint } from '@fortawesome/free-solid-svg-icons';

import { useContext } from 'react';
import { DataSourceContext } from '../../context/DataSourceContext';

import { patients as mockPatients, prescriptions as mockPrescriptions } from '../../data/mockData';


const Prescriptions = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const { useMockData } = useContext(DataSourceContext);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewPrescriptionForm, setShowNewPrescriptionForm] = useState(false);

  const [newPrescription, setNewPrescription] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    refills: 0,
    instructions: '',
    prescribed_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'active'
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadPrescriptions(selectedPatient);
      setNewPrescription(prev => ({ ...prev, patient_id: selectedPatient }));
    } else {
      setPrescriptions([]);
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      setError('');
      if (window.electronAPI && !useMockData) {
        const patientsData = await window.electronAPI.patients.getAll();
        setPatients(Array.isArray(patientsData) && patientsData.length ? patientsData : mockPatients);
      } else {
        // Mock data for web development
        setPatients(mockPatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients.');
    }
  };

  const loadPrescriptions = async (patientId) => {
    try {
      setLoading(true);
      setError('');

      if (window.electronAPI && !useMockData) {
        const prescriptionsData = await window.electronAPI.prescriptions.getByPatient(patientId);
        setPrescriptions(prescriptionsData || []);
      } else {
        // Mock data for web development
        setPrescriptions(mockPrescriptions.filter(p => p.patient_id === patientId));
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setError('Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrescriptionChange = (e) => {
    const { name, value, type } = e.target;
    setNewPrescription(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmitNewPrescription = async (e) => {
    e.preventDefault();

    if (!newPrescription.medication_name.trim() || !newPrescription.dosage.trim() || !newPrescription.frequency.trim()) {
      setError('Medication name, dosage, and frequency are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (window.electronAPI) {
        await window.electronAPI.prescriptions.create(newPrescription);
        await loadPrescriptions(selectedPatient);
      }

      // Reset form
      setNewPrescription({
        patient_id: selectedPatient,
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: '',
        refills: 0,
        instructions: '',
        prescribed_date: format(new Date(), 'yyyy-MM-dd'),
        status: 'active'
      });
      setShowNewPrescriptionForm(false);
    } catch (error) {
      console.error('Error creating prescription:', error);
      setError('Failed to create prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (prescriptionId, newStatus) => {
    try {
      if (window.electronAPI) {
        const prescription = prescriptions.find(p => p.id === prescriptionId);
        await window.electronAPI.prescriptions.update(prescriptionId, {
          ...prescription,
          status: newStatus
        });
        await loadPrescriptions(selectedPatient);
      } else {
        // Mock status change for web development
        setPrescriptions(prev =>
          prev.map(p =>
            p.id === prescriptionId
              ? { ...p, status: newStatus }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error updating prescription status:', error);
      setError('Failed to update prescription status.');
    }
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'completed': return 'badge-info';
      case 'discontinued': return 'badge-warning';
      case 'expired': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="prescriptions">
      {error && (
        <div className="alert alert-error">
          <i>⚠️</i> {error}
        </div>
      )}

      {/* Patient Selection */}
      <div className="card mb-2">
        <div className="card-header">
          <h3>Prescription Management</h3>
        </div>
        <div className="card-body">
          <div className="patient-selection">
            <label className="form-label">Select Patient:</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="form-control"
            >
              <option value="">Choose a patient to manage prescriptions</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedPatient && (
        <>
          {/* Patient Info & Actions */}
          <div className="card mb-2">
            <div className="card-header">
              <div className="patient-header-info">
                <h4>Prescriptions for {selectedPatientData?.first_name} {selectedPatientData?.last_name}</h4>
                <p>Active Prescriptions: {prescriptions.filter(p => p.status === 'active').length}</p>
              </div>
              <div className="prescription-actions">
                <button
                  onClick={() => setShowNewPrescriptionForm(!showNewPrescriptionForm)}
                  className="btn btn-primary"
                >
                  {showNewPrescriptionForm ? 'Cancel' : (<><FontAwesomeIcon icon={faPlus} /> Add New Prescription</>)}
                </button>
              </div>
            </div>
          </div>

          {/* New Prescription Form */}
          {showNewPrescriptionForm && (
            <div className="card mb-2">
              <div className="card-header">
                <h4>New Prescription</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmitNewPrescription}>
                  <div className="form-row">
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Medication Name *</label>
                        <input
                          type="text"
                          name="medication_name"
                          value={newPrescription.medication_name}
                          onChange={handleNewPrescriptionChange}
                          className="form-control"
                          placeholder="e.g., Lisinopril, Metformin"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Dosage *</label>
                        <input
                          type="text"
                          name="dosage"
                          value={newPrescription.dosage}
                          onChange={handleNewPrescriptionChange}
                          className="form-control"
                          placeholder="e.g., 10mg, 500mg"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Frequency *</label>
                        <select
                          name="frequency"
                          value={newPrescription.frequency}
                          onChange={handleNewPrescriptionChange}
                          className="form-control"
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="Every 4 hours">Every 4 hours</option>
                          <option value="Every 6 hours">Every 6 hours</option>
                          <option value="Every 8 hours">Every 8 hours</option>
                          <option value="Every 12 hours">Every 12 hours</option>
                          <option value="As needed">As needed</option>
                          <option value="Before meals">Before meals</option>
                          <option value="After meals">After meals</option>
                          <option value="At bedtime">At bedtime</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Duration</label>
                        <input
                          type="text"
                          name="duration"
                          value={newPrescription.duration}
                          onChange={handleNewPrescriptionChange}
                          className="form-control"
                          placeholder="e.g., 7 days, 30 days, 3 months"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          value={newPrescription.quantity}
                          onChange={handleNewPrescriptionChange}
                          className="form-control"
                          placeholder="Number of tablets/capsules"
                        />
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Refills</label>
                        <input
                          type="number"
                          name="refills"
                          value={newPrescription.refills}
                          onChange={handleNewPrescriptionChange}
                          className="form-control"
                          min="0"
                          max="12"
                        />
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Prescribed Date</label>
                        <input
                          type="date"
                          name="prescribed_date"
                          value={newPrescription.prescribed_date}
                          onChange={handleNewPrescriptionChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Instructions</label>
                    <textarea
                      name="instructions"
                      value={newPrescription.instructions}
                      onChange={handleNewPrescriptionChange}
                      className="form-control"
                      rows="3"
                      placeholder="Special instructions, warnings, or notes"
                    />
                  </div>

                  <div className="btn-group right">
                    <button
                      type="button"
                      onClick={() => setShowNewPrescriptionForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Create Prescription'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Prescriptions List */}
          <div className="card">
            <div className="card-header">
              <h4>Prescription History</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  Loading prescriptions...
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="empty-state">
                  <p>No prescriptions found for this patient.</p>
                  <button
                    onClick={() => setShowNewPrescriptionForm(true)}
                    className="btn btn-primary"
                  >
                    Add First Prescription
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Quantity</th>
                        <th>Refills</th>
                        <th>Prescribed</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map(prescription => (
                        <tr key={prescription.id}>
                          <td>
                            <strong>{prescription.medication_name}</strong>
                            {prescription.instructions && (
                              <div className="prescription-instructions">
                                <small>{prescription.instructions}</small>
                              </div>
                            )}
                          </td>
                          <td>{prescription.dosage}</td>
                          <td>{prescription.frequency}</td>
                          <td>{prescription.duration || 'N/A'}</td>
                          <td>{prescription.quantity || 'N/A'}</td>
                          <td>{prescription.refills}</td>
                          <td>{format(new Date(prescription.prescribed_date), 'MMM dd, yyyy')}</td>
                          <td>
                            <select
                              value={prescription.status}
                              onChange={(e) => handleStatusChange(prescription.id, e.target.value)}
                              className={`status-select badge ${getStatusBadgeClass(prescription.status)}`}
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="discontinued">Discontinued</option>
                              <option value="expired">Expired</option>
                            </select>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline"
                                title="Print Prescription"
                                onClick={() => window.print()}
                              >
                                <FontAwesomeIcon icon={faPrint} />
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
        </>
      )}
    </div>
  );
};

export default Prescriptions;