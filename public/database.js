const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.db = null;
    // Store database in user data directory
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'emr_database.db');
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database at:', this.dbPath);
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Patients table
      `CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        insurance_provider TEXT,
        insurance_policy_number TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Appointments table
      `CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        duration INTEGER DEFAULT 30,
        status TEXT DEFAULT 'scheduled',
        reason TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      )`,
      
      // Medical records table
      `CREATE TABLE IF NOT EXISTS medical_records (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        visit_date TEXT NOT NULL,
        chief_complaint TEXT,
        history_of_present_illness TEXT,
        physical_examination TEXT,
        assessment TEXT,
        plan TEXT,
        vital_signs TEXT,
        height REAL,
        weight REAL,
        blood_pressure TEXT,
        temperature REAL,
        heart_rate INTEGER,
        respiratory_rate INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
      )`,
      
      // Prescriptions table
      `CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        medical_record_id TEXT,
        medication_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration TEXT,
        quantity INTEGER,
        refills INTEGER DEFAULT 0,
        instructions TEXT,
        prescribed_date TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (medical_record_id) REFERENCES medical_records (id)
      )`
    ];

    try {
      for (const tableSQL of tables) {
        await this.runQuery(tableSQL);
      }
      console.log('Database tables created successfully');
      
      // Insert sample data if tables are empty
      await this.insertSampleData();
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async insertSampleData() {
    try {
      const patientCount = await this.getQuery('SELECT COUNT(*) as count FROM patients');
      if (patientCount.count === 0) {
        console.log('Inserting sample data...');
        
        // Sample patients
        const samplePatients = [
          {
            id: uuidv4(),
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
            insurance_policy_number: 'BC123456789'
          },
          {
            id: uuidv4(),
            first_name: 'Sarah',
            last_name: 'Johnson',
            date_of_birth: '1992-07-22',
            gender: 'Female',
            phone: '(555) 234-5678',
            email: 'sarah.johnson@email.com',
            address: '456 Oak Ave, Somewhere, ST 67890',
            emergency_contact_name: 'Mike Johnson',
            emergency_contact_phone: '(555) 876-5432',
            insurance_provider: 'Aetna',
            insurance_policy_number: 'AE987654321'
          }
        ];

        for (const patient of samplePatients) {
          await this.createPatient(patient);
        }
      }
    } catch (error) {
      console.error('Error inserting sample data:', error);
    }
  }

  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Patient operations
  async getPatients() {
    return await this.allQuery(
      'SELECT * FROM patients ORDER BY last_name, first_name'
    );
  }

  async getPatient(id) {
    return await this.getQuery(
      'SELECT * FROM patients WHERE id = ?',
      [id]
    );
  }

  async createPatient(patientData) {
    const id = patientData.id || uuidv4();
    const now = new Date().toISOString();
    
    await this.runQuery(`
      INSERT INTO patients (
        id, first_name, last_name, date_of_birth, gender, phone, email, address,
        emergency_contact_name, emergency_contact_phone, insurance_provider,
        insurance_policy_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, patientData.first_name, patientData.last_name, patientData.date_of_birth,
      patientData.gender, patientData.phone, patientData.email, patientData.address,
      patientData.emergency_contact_name, patientData.emergency_contact_phone,
      patientData.insurance_provider, patientData.insurance_policy_number, now, now
    ]);
    
    return await this.getPatient(id);
  }

  async updatePatient(id, patientData) {
    const now = new Date().toISOString();
    
    await this.runQuery(`
      UPDATE patients SET
        first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
        phone = ?, email = ?, address = ?, emergency_contact_name = ?,
        emergency_contact_phone = ?, insurance_provider = ?,
        insurance_policy_number = ?, updated_at = ?
      WHERE id = ?
    `, [
      patientData.first_name, patientData.last_name, patientData.date_of_birth,
      patientData.gender, patientData.phone, patientData.email, patientData.address,
      patientData.emergency_contact_name, patientData.emergency_contact_phone,
      patientData.insurance_provider, patientData.insurance_policy_number, now, id
    ]);
    
    return await this.getPatient(id);
  }

  async deletePatient(id) {
    await this.runQuery('DELETE FROM patients WHERE id = ?', [id]);
    return { success: true };
  }

  async searchPatients(query) {
    const searchTerm = `%${query}%`;
    return await this.allQuery(`
      SELECT * FROM patients
      WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?
      ORDER BY last_name, first_name
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);
  }

  // Appointment operations
  async getAppointments() {
    return await this.allQuery(`
      SELECT a.*, p.first_name, p.last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.appointment_date, a.appointment_time
    `);
  }

  async createAppointment(appointmentData) {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await this.runQuery(`
      INSERT INTO appointments (
        id, patient_id, appointment_date, appointment_time, duration,
        status, reason, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, appointmentData.patient_id, appointmentData.appointment_date,
      appointmentData.appointment_time, appointmentData.duration || 30,
      appointmentData.status || 'scheduled', appointmentData.reason,
      appointmentData.notes, now, now
    ]);
    
    return await this.getQuery(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );
  }

  async updateAppointment(id, appointmentData) {
    const now = new Date().toISOString();
    
    await this.runQuery(`
      UPDATE appointments SET
        patient_id = ?, appointment_date = ?, appointment_time = ?,
        duration = ?, status = ?, reason = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      appointmentData.patient_id, appointmentData.appointment_date,
      appointmentData.appointment_time, appointmentData.duration,
      appointmentData.status, appointmentData.reason, appointmentData.notes,
      now, id
    ]);
    
    return await this.getQuery(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );
  }

  async deleteAppointment(id) {
    await this.runQuery('DELETE FROM appointments WHERE id = ?', [id]);
    return { success: true };
  }

  // Medical record operations
  async getMedicalRecords(patientId) {
    return await this.allQuery(
      'SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_date DESC',
      [patientId]
    );
  }

  async createMedicalRecord(recordData) {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await this.runQuery(`
      INSERT INTO medical_records (
        id, patient_id, visit_date, chief_complaint, history_of_present_illness,
        physical_examination, assessment, plan, vital_signs, height, weight,
        blood_pressure, temperature, heart_rate, respiratory_rate, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, recordData.patient_id, recordData.visit_date, recordData.chief_complaint,
      recordData.history_of_present_illness, recordData.physical_examination,
      recordData.assessment, recordData.plan, recordData.vital_signs,
      recordData.height, recordData.weight, recordData.blood_pressure,
      recordData.temperature, recordData.heart_rate, recordData.respiratory_rate,
      now, now
    ]);
    
    return await this.getQuery(
      'SELECT * FROM medical_records WHERE id = ?',
      [id]
    );
  }

  async updateMedicalRecord(id, recordData) {
    const now = new Date().toISOString();
    
    await this.runQuery(`
      UPDATE medical_records SET
        visit_date = ?, chief_complaint = ?, history_of_present_illness = ?,
        physical_examination = ?, assessment = ?, plan = ?, vital_signs = ?,
        height = ?, weight = ?, blood_pressure = ?, temperature = ?,
        heart_rate = ?, respiratory_rate = ?, updated_at = ?
      WHERE id = ?
    `, [
      recordData.visit_date, recordData.chief_complaint, recordData.history_of_present_illness,
      recordData.physical_examination, recordData.assessment, recordData.plan,
      recordData.vital_signs, recordData.height, recordData.weight,
      recordData.blood_pressure, recordData.temperature, recordData.heart_rate,
      recordData.respiratory_rate, now, id
    ]);
    
    return await this.getQuery(
      'SELECT * FROM medical_records WHERE id = ?',
      [id]
    );
  }

  // Prescription operations
  async getPrescriptions(patientId) {
    return await this.allQuery(
      'SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY prescribed_date DESC',
      [patientId]
    );
  }

  async createPrescription(prescriptionData) {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await this.runQuery(`
      INSERT INTO prescriptions (
        id, patient_id, medical_record_id, medication_name, dosage, frequency,
        duration, quantity, refills, instructions, prescribed_date, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, prescriptionData.patient_id, prescriptionData.medical_record_id,
      prescriptionData.medication_name, prescriptionData.dosage, prescriptionData.frequency,
      prescriptionData.duration, prescriptionData.quantity, prescriptionData.refills || 0,
      prescriptionData.instructions, prescriptionData.prescribed_date,
      prescriptionData.status || 'active', now, now
    ]);
    
    return await this.getQuery(
      'SELECT * FROM prescriptions WHERE id = ?',
      [id]
    );
  }

  async updatePrescription(id, prescriptionData) {
    const now = new Date().toISOString();
    
    await this.runQuery(`
      UPDATE prescriptions SET
        medication_name = ?, dosage = ?, frequency = ?, duration = ?,
        quantity = ?, refills = ?, instructions = ?, status = ?, updated_at = ?
      WHERE id = ?
    `, [
      prescriptionData.medication_name, prescriptionData.dosage, prescriptionData.frequency,
      prescriptionData.duration, prescriptionData.quantity, prescriptionData.refills,
      prescriptionData.instructions, prescriptionData.status, now, id
    ]);
    
    return await this.getQuery(
      'SELECT * FROM prescriptions WHERE id = ?',
      [id]
    );
  }

  // Dashboard statistics
  async getDashboardStats() {
    const stats = {};
    
    // Total patients
    const patientsCount = await this.getQuery('SELECT COUNT(*) as count FROM patients');
    stats.totalPatients = patientsCount.count;
    
    // Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = await this.getQuery(
      'SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?',
      [today]
    );
    stats.todaysAppointments = todaysAppointments.count;
    
    // Upcoming appointments (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingAppointments = await this.getQuery(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE appointment_date BETWEEN ? AND ? AND status = 'scheduled'
    `, [today, nextWeek.toISOString().split('T')[0]]);
    stats.upcomingAppointments = upcomingAppointments.count;
    
    // Active prescriptions
    const activePrescriptions = await this.getQuery(
      'SELECT COUNT(*) as count FROM prescriptions WHERE status = "active"'
    );
    stats.activePrescriptions = activePrescriptions.count;
    
    return stats;
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  }
}

module.exports = Database;