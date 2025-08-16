import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    insurance_provider: '',
    insurance_policy_number: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadPatient();
    }
  }, [id, isEditing]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const patient = await window.electronAPI.patients.getById(id);
        if (patient) {
          setFormData({
            first_name: patient.first_name || '',
            last_name: patient.last_name || '',
            date_of_birth: patient.date_of_birth || '',
            gender: patient.gender || '',
            phone: patient.phone || '',
            email: patient.email || '',
            address: patient.address || '',
            emergency_contact_name: patient.emergency_contact_name || '',
            emergency_contact_phone: patient.emergency_contact_phone || '',
            insurance_provider: patient.insurance_provider || '',
            insurance_policy_number: patient.insurance_policy_number || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      setSubmitError('Failed to load patient data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-\(\)\+]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
          await window.electronAPI.patients.update(id, formData);
        } else {
          await window.electronAPI.patients.create(formData);
        }
      }
      
      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
      setSubmitError('Failed to save patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  if (loading && isEditing) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading patient data...
      </div>
    );
  }

  return (
    <div className="patient-form">
      <div className="card">
        <div className="card-header">
          <h3>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h3>
        </div>
        
        <div className="card-body">
          {submitError && (
            <div className="alert alert-error">
              <i>⚠️</i> {submitError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <h4 className="section-title">Personal Information</h4>
            
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`form-control ${errors.first_name ? 'error' : ''}`}
                    required
                  />
                  {errors.first_name && (
                    <div className="form-error">{errors.first_name}</div>
                  )}
                </div>
              </div>
              
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`form-control ${errors.last_name ? 'error' : ''}`}
                    required
                  />
                  {errors.last_name && (
                    <div className="form-error">{errors.last_name}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className={`form-control ${errors.date_of_birth ? 'error' : ''}`}
                    required
                  />
                  {errors.date_of_birth && (
                    <div className="form-error">{errors.date_of_birth}</div>
                  )}
                </div>
              </div>
              
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`form-control ${errors.gender ? 'error' : ''}`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <div className="form-error">{errors.gender}</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <h4 className="section-title">Contact Information</h4>
            
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-control ${errors.phone ? 'error' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && (
                    <div className="form-error">{errors.phone}</div>
                  )}
                </div>
              </div>
              
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    placeholder="patient@example.com"
                  />
                  {errors.email && (
                    <div className="form-error">{errors.email}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Street address, city, state, zip code"
              />
            </div>
            
            {/* Emergency Contact */}
            <h4 className="section-title">Emergency Contact</h4>
            
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
            
            {/* Insurance Information */}
            <h4 className="section-title">Insurance Information</h4>
            
            <div className="form-row">
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Insurance Provider</label>
                  <input
                    type="text"
                    name="insurance_provider"
                    value={formData.insurance_provider}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g., Blue Cross Blue Shield"
                  />
                </div>
              </div>
              
              <div className="form-col">
                <div className="form-group">
                  <label className="form-label">Policy Number</label>
                  <input
                    type="text"
                    name="insurance_policy_number"
                    value={formData.insurance_policy_number}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>
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
                {loading ? 'Saving...' : (isEditing ? 'Update Patient' : 'Create Patient')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;