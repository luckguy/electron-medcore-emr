const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === 'true';
const Database = require('./database');

class EMRElectronApp {
  constructor() {
    this.mainWindow = null;
    this.database = null;
  }

  async initialize() {
    // Initialize database
    this.database = new Database();
    await this.database.initialize();

    // Set up IPC handlers
    this.setupIpcHandlers();

    // Create main window when app is ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.createApplicationMenu();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    // Handle app window closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app before quit
    app.on('before-quit', () => {
      if (this.database) {
        this.database.close();
      }
    });
  }

  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true
      },
      icon: path.join(__dirname, 'assets', 'icon.png'),
      show: false,
      titleBarStyle: 'default'
    });

    // Load the React app
    const startUrl = isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, '../build/index.html')}`;
    
    this.mainWindow.loadURL(startUrl);

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      if (isDev) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Prevent navigation to external URLs
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
        event.preventDefault();
      }
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  createApplicationMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Patient',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow.webContents.send('menu-new-patient');
            }
          },
          {
            label: 'Search Patients',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
              this.mainWindow.webContents.send('menu-search-patients');
            }
          },
          { type: 'separator' },
          {
            label: 'Export Data',
            click: async () => {
              const result = await dialog.showSaveDialog(this.mainWindow, {
                title: 'Export EMR Data',
                defaultPath: 'emr-backup.db',
                filters: [
                  { name: 'Database Files', extensions: ['db'] },
                  { name: 'All Files', extensions: ['*'] }
                ]
              });
              if (!result.canceled) {
                this.mainWindow.webContents.send('menu-export-data', result.filePath);
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About EMR Desktop',
            click: () => {
              dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'About EMR Desktop',
                message: 'EMR Desktop v1.0.0',
                detail: 'Professional Electronic Medical Record System\nBuilt with Electron and React'
              });
            }
          }
        ]
      }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIpcHandlers() {
    // Patient operations
    ipcMain.handle('get-patients', async () => {
      return await this.database.getPatients();
    });

    ipcMain.handle('get-patient', async (event, id) => {
      return await this.database.getPatient(id);
    });

    ipcMain.handle('create-patient', async (event, patientData) => {
      return await this.database.createPatient(patientData);
    });

    ipcMain.handle('update-patient', async (event, id, patientData) => {
      return await this.database.updatePatient(id, patientData);
    });

    ipcMain.handle('delete-patient', async (event, id) => {
      return await this.database.deletePatient(id);
    });

    ipcMain.handle('search-patients', async (event, query) => {
      return await this.database.searchPatients(query);
    });

    // Appointment operations
    ipcMain.handle('get-appointments', async () => {
      return await this.database.getAppointments();
    });

    ipcMain.handle('create-appointment', async (event, appointmentData) => {
      return await this.database.createAppointment(appointmentData);
    });

    ipcMain.handle('update-appointment', async (event, id, appointmentData) => {
      return await this.database.updateAppointment(id, appointmentData);
    });

    ipcMain.handle('delete-appointment', async (event, id) => {
      return await this.database.deleteAppointment(id);
    });

    // Medical record operations
    ipcMain.handle('get-medical-records', async (event, patientId) => {
      return await this.database.getMedicalRecords(patientId);
    });

    ipcMain.handle('create-medical-record', async (event, recordData) => {
      return await this.database.createMedicalRecord(recordData);
    });

    ipcMain.handle('update-medical-record', async (event, id, recordData) => {
      return await this.database.updateMedicalRecord(id, recordData);
    });

    // Prescription operations
    ipcMain.handle('get-prescriptions', async (event, patientId) => {
      return await this.database.getPrescriptions(patientId);
    });

    ipcMain.handle('create-prescription', async (event, prescriptionData) => {
      return await this.database.createPrescription(prescriptionData);
    });

    ipcMain.handle('update-prescription', async (event, id, prescriptionData) => {
      return await this.database.updatePrescription(id, prescriptionData);
    });

    // Dashboard statistics
    ipcMain.handle('get-dashboard-stats', async () => {
      return await this.database.getDashboardStats();
    });
  }
}

// Initialize and start the application
const emrApp = new EMRElectronApp();
emrApp.initialize();

// Handle certificate errors for development
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

module.exports = EMRElectronApp;