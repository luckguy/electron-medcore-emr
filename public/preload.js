const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Patient operations
  patients: {
    getAll: () => ipcRenderer.invoke('get-patients'),
    getById: (id) => ipcRenderer.invoke('get-patient', id),
    create: (patientData) => ipcRenderer.invoke('create-patient', patientData),
    update: (id, patientData) => ipcRenderer.invoke('update-patient', id, patientData),
    delete: (id) => ipcRenderer.invoke('delete-patient', id),
    search: (query) => ipcRenderer.invoke('search-patients', query)
  },

  // Appointment operations
  appointments: {
    getAll: () => ipcRenderer.invoke('get-appointments'),
    create: (appointmentData) => ipcRenderer.invoke('create-appointment', appointmentData),
    update: (id, appointmentData) => ipcRenderer.invoke('update-appointment', id, appointmentData),
    delete: (id) => ipcRenderer.invoke('delete-appointment', id)
  },

  // Medical record operations
  medicalRecords: {
    getByPatient: (patientId) => ipcRenderer.invoke('get-medical-records', patientId),
    create: (recordData) => ipcRenderer.invoke('create-medical-record', recordData),
    update: (id, recordData) => ipcRenderer.invoke('update-medical-record', id, recordData)
  },

  // Prescription operations
  prescriptions: {
    getByPatient: (patientId) => ipcRenderer.invoke('get-prescriptions', patientId),
    create: (prescriptionData) => ipcRenderer.invoke('create-prescription', prescriptionData),
    update: (id, prescriptionData) => ipcRenderer.invoke('update-prescription', id, prescriptionData)
  },

  // Dashboard operations
  dashboard: {
    getStats: () => ipcRenderer.invoke('get-dashboard-stats')
  },

  // Menu event listeners
  onMenuEvent: (callback) => {
    ipcRenderer.on('menu-new-patient', callback);
    ipcRenderer.on('menu-search-patients', callback);
    ipcRenderer.on('menu-export-data', callback);
  },

  // Remove listeners
  removeMenuListeners: () => {
    ipcRenderer.removeAllListeners('menu-new-patient');
    ipcRenderer.removeAllListeners('menu-search-patients');
    ipcRenderer.removeAllListeners('menu-export-data');
  }
});

// Platform detection
contextBridge.exposeInMainWorld('platform', {
  os: process.platform,
  versions: process.versions
});

// Console logging for development
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electronDev', {
    log: (message) => console.log('[Renderer]:', message),
    error: (message) => console.error('[Renderer]:', message)
  });
}