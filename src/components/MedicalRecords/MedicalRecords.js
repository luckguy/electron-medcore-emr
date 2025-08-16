import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { patients as mockPatients, medicalRecords as mockMedicalRecords } from '../../data/mockData';

import { useContext } from 'react';
import { DataSourceContext } from '../../context/DataSourceContext';


import { format } from 'date-fns';

const MedicalRecords = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const { useMockData } = useContext(DataSourceContext);

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);

  const [newRecord, setNewRecord] = useState({
    patient_id: '',
    visit_date: format(new Date(), 'yyyy-MM-dd'),
    chief_complaint: '',
    history_of_present_illness: '',
    physical_examination: '',
    assessment: '',
    plan: '',
    vital_signs: '',
    height: '',
    weight: '',
    blood_pressure: '',
    temperature: '',
    heart_rate: '',
    respiratory_rate: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadMedicalRecords(selectedPatient);
      setNewRecord(prev => ({ ...prev, patient_id: selectedPatient }));
    } else {
      setMedicalRecords([]);
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

  const loadMedicalRecords = async (patientId) => {
    try {
      setLoading(true);
      setError('');

      if (window.electronAPI && !useMockData) {
        const recordsData = await window.electronAPI.medicalRecords.getByPatient(patientId);
        setMedicalRecords(recordsData || []);
      } else {
        // Mock data for web development
        setMedicalRecords(mockMedicalRecords.filter(r => r.patient_id === patientId));
      }
    } catch (error) {
      console.error('Error loading medical records:', error);
      setError('Failed to load medical records.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecordChange = (e) => {
    const { name, value, type } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmitNewRecord = async (e) => {
    e.preventDefault();

    if (!newRecord.chief_complaint.trim()) {
      setError('Chief complaint is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (window.electronAPI) {
        await window.electronAPI.medicalRecords.create(newRecord);
        await loadMedicalRecords(selectedPatient);
      }

      // Reset form
      setNewRecord({
        patient_id: selectedPatient,
        visit_date: format(new Date(), 'yyyy-MM-dd'),
        chief_complaint: '',
        history_of_present_illness: '',
        physical_examination: '',
        assessment: '',
        plan: '',
        vital_signs: '',
        height: '',
        weight: '',
        blood_pressure: '',
        temperature: '',
        heart_rate: '',
        respiratory_rate: ''
      });
      setShowNewRecordForm(false);
    } catch (error) {
      console.error('Error creating medical record:', error);
      setError('Failed to create medical record.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="medical-records">
      {error && (
        <div className="alert alert-error">
          <i>⚠️</i> {error}
        </div>
      )}

      {/* Patient Selection */}
      <div className="card mb-2">
        <div className="card-header">
          <h3>Medical Records</h3>
        </div>
        <div className="card-body">
          <div className="patient-selection">
            <label className="form-label">Select Patient:</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="form-control"
            >
              <option value="">Choose a patient to view medical records</option>
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
                <h4>Medical Records for {selectedPatientData?.first_name} {selectedPatientData?.last_name}</h4>
                <p>Total Records: {medicalRecords.length}</p>
              </div>
              <div className="record-actions">
                <button
                  onClick={() => setShowNewRecordForm(!showNewRecordForm)}
                  className="btn btn-primary"
                >
                  {showNewRecordForm ? 'Cancel' : (<><FontAwesomeIcon icon={faPlus} /> Add New Record</>)}
                </button>
              </div>
            </div>
          </div>

          {/* New Record Form */}
          {showNewRecordForm && (
            <div className="card mb-2">
              <div className="card-header">
                <h4>New Medical Record</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmitNewRecord}>
                  <div className="form-row">
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Visit Date *</label>
                        <input
                          type="date"
                          name="visit_date"
                          value={newRecord.visit_date}
                          onChange={handleNewRecordChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chief Complaint *</label>
                    <textarea
                      name="chief_complaint"
                      value={newRecord.chief_complaint}
                      onChange={handleNewRecordChange}
                      className="form-control"
                      rows="3"
                      placeholder="Patient's primary concern or reason for visit"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">History of Present Illness</label>
                    <textarea
                      name="history_of_present_illness"
                      value={newRecord.history_of_present_illness}
                      onChange={handleNewRecordChange}
                      className="form-control"
                      rows="3"
                      placeholder="Detailed description of the current illness or condition"
                    />
                  </div>

                  {/* Vital Signs */}
                  <h5 className="section-title">Vital Signs</h5>
                  <div className="form-row">
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Height (cm)</label>
                        <input
                          type="number"
                          name="height"
                          value={newRecord.height}
                          onChange={handleNewRecordChange}
                          className="form-control"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Weight (kg)</label>
                        <input
                          type="number"
                          name="weight"
                          value={newRecord.weight}
                          onChange={handleNewRecordChange}
                          className="form-control"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Blood Pressure</label>
                        <input
                          type="text"
                          name="blood_pressure"
                          value={newRecord.blood_pressure}
                          onChange={handleNewRecordChange}
                          className="form-control"
                          placeholder="e.g., 120/80"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Temperature (°C)</label>
                        <input
                          type="number"
                          name="temperature"
                          value={newRecord.temperature}
                          onChange={handleNewRecordChange}
                          className="form-control"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Heart Rate (bpm)</label>
                        <input
                          type="number"
                          name="heart_rate"
                          value={newRecord.heart_rate}
                          onChange={handleNewRecordChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="form-col">
                      <div className="form-group">
                        <label className="form-label">Respiratory Rate</label>
                        <input
                          type="number"
                          name="respiratory_rate"
                          value={newRecord.respiratory_rate}
                          onChange={handleNewRecordChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Physical Examination</label>
                    <textarea
                      name="physical_examination"
                      value={newRecord.physical_examination}
                      onChange={handleNewRecordChange}
                      className="form-control"
                      rows="4"
                      placeholder="Physical examination findings"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assessment</label>
                    <textarea
                      name="assessment"
                      value={newRecord.assessment}
                      onChange={handleNewRecordChange}
                      className="form-control"
                      rows="3"
                      placeholder="Clinical assessment and diagnosis"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Plan</label>
                    <textarea
                      name="plan"
                      value={newRecord.plan}
                      onChange={handleNewRecordChange}
                      className="form-control"
                      rows="3"
                      placeholder="Treatment plan and follow-up instructions"
                    />
                  </div>

                  <div className="btn-group right">
                    <button
                      type="button"
                      onClick={() => setShowNewRecordForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Record'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Medical Records List */}
          <div className="card">
            <div className="card-header">
              <h4>Medical History</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  Loading medical records...
                </div>
              ) : medicalRecords.length === 0 ? (
                <div className="empty-state">
                  <p>No medical records found for this patient.</p>
                  <button
                    onClick={() => setShowNewRecordForm(true)}
                    className="btn btn-primary"
                  >
                    Add First Medical Record
                  </button>
                </div>
              ) : (
                <div className="records-timeline">
                  {medicalRecords.map((record, index) => (
                    <div key={record.id} className="record-timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="record-card">
                        <div className="record-header">
                          <h5>Visit Date: {format(new Date(record.visit_date), 'MMMM dd, yyyy')}</h5>
                          <span className="record-time">
                            {format(new Date(record.created_at), 'h:mm a')}
                          </span>
                        </div>

                        <div className="record-content">
                          <div className="record-section">
                            <strong>Chief Complaint:</strong>
                            <p>{record.chief_complaint}</p>
                          </div>

                          {record.history_of_present_illness && (
                            <div className="record-section">
                              <strong>History of Present Illness:</strong>
                              <p>{record.history_of_present_illness}</p>
                            </div>
                          )}

                          {/* Vital Signs */}
                          {(record.height || record.weight || record.blood_pressure ||
                            record.temperature || record.heart_rate || record.respiratory_rate) && (
                            <div className="record-section">
                              <strong>Vital Signs:</strong>
                              <div className="vitals-grid">
                                {record.height && <div>Height: {record.height} cm</div>}
                                {record.weight && <div>Weight: {record.weight} kg</div>}
                                {record.blood_pressure && <div>BP: {record.blood_pressure}</div>}
                                {record.temperature && <div>Temp: {record.temperature}°C</div>}
                                {record.heart_rate && <div>HR: {record.heart_rate} bpm</div>}
                                {record.respiratory_rate && <div>RR: {record.respiratory_rate}</div>}
                              </div>
                            </div>
                          )}

                          {record.physical_examination && (
                            <div className="record-section">
                              <strong>Physical Examination:</strong>
                              <p>{record.physical_examination}</p>
                            </div>
                          )}

                          {record.assessment && (
                            <div className="record-section">
                              <strong>Assessment:</strong>
                              <p>{record.assessment}</p>
                            </div>
                          )}

                          {record.plan && (
                            <div className="record-section">
                              <strong>Plan:</strong>
                              <p>{record.plan}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MedicalRecords;