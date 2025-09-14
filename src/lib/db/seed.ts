import { db } from './index'
import { users, laboratories, equipment, schedules, settings } from './schema'
import { hash } from 'bcryptjs'

async function seed() {
  console.log('🌱 Starting comprehensive database seed...')

  // Clear existing data first
  console.log('🧹 Clearing existing data...')
  await db.delete(schedules)
  await db.delete(equipment)
  await db.delete(laboratories)
  await db.delete(users)
  await db.delete(settings)

  // Create more diverse users
  console.log('👥 Creating users...')
  
  // Administrators
  const adminPassword = await hash('admin123', 12)
  await db.insert(users).values([
    {
      id: 'admin-1',
      email: 'admin@dhvsu.edu.ph',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
      fullName: 'Dr. Maria Santos',
      department: 'IT Department',
      biometricId: 'BIO000',
      isActive: true,
    },
    {
      id: 'admin-2',
      email: 'juan.delacruz@dhvsu.edu.ph',
      username: 'jdelacruz',
      passwordHash: adminPassword,
      role: 'admin',
      fullName: 'Juan Dela Cruz',
      department: 'IT Department',
      biometricId: 'BIO010',
      isActive: true,
    }
  ])

  // Faculty members
  const facultyPassword = await hash('faculty123', 12)
  await db.insert(users).values([
    {
      id: 'faculty-1',
      email: 'prof.ocampo@dhvsu.edu.ph',
      username: 'rocampo',
      passwordHash: facultyPassword,
      role: 'faculty',
      fullName: 'Prof. Ramonsito Ocampo',
      department: 'College of Computing Studies',
      biometricId: 'BIO001',
      isActive: true,
    },
    {
      id: 'faculty-2',
      email: 'anna.garcia@dhvsu.edu.ph',
      username: 'agarcia',
      passwordHash: facultyPassword,
      role: 'faculty',
      fullName: 'Prof. Anna Garcia',
      department: 'College of Computing Studies',
      biometricId: 'BIO002',
      isActive: true,
    },
    {
      id: 'faculty-3',
      email: 'michael.reyes@dhvsu.edu.ph',
      username: 'mreyes',
      passwordHash: facultyPassword,
      role: 'faculty',
      fullName: 'Prof. Michael Reyes',
      department: 'College of Engineering',
      biometricId: 'BIO003',
      isActive: true,
    },
    {
      id: 'faculty-4',
      email: 'lisa.santos@dhvsu.edu.ph',
      username: 'lsantos',
      passwordHash: facultyPassword,
      role: 'faculty',
      fullName: 'Prof. Lisa Santos',
      department: 'College of Computing Studies',
      biometricId: 'BIO004',
      isActive: true,
    },
    {
      id: 'faculty-5',
      email: 'robert.tan@dhvsu.edu.ph',
      username: 'rtan',
      passwordHash: facultyPassword,
      role: 'faculty',
      fullName: 'Prof. Robert Tan',
      department: 'College of Computing Studies',
      biometricId: 'BIO011',
      isActive: true,
    }
  ])

  // Custodians
  const custodianPassword = await hash('custodian123', 12)
  await db.insert(users).values([
    {
      id: 'custodian-1',
      email: 'roberto.cruz@dhvsu.edu.ph',
      username: 'labkeeper',
      passwordHash: custodianPassword,
      role: 'custodian',
      fullName: 'Roberto Cruz',
      department: 'Facilities Management',
      biometricId: 'BIO005',
      isActive: true,
    },
    {
      id: 'custodian-2',
      email: 'jose.manalo@dhvsu.edu.ph',
      username: 'jmanalo',
      passwordHash: custodianPassword,
      role: 'custodian',
      fullName: 'Jose Manalo',
      department: 'Facilities Management',
      biometricId: 'BIO006',
      isActive: true,
    },
    {
      id: 'custodian-3',
      email: 'pedro.santos@dhvsu.edu.ph',
      username: 'psantos',
      passwordHash: custodianPassword,
      role: 'custodian',
      fullName: 'Pedro Santos',
      department: 'Facilities Management',
      biometricId: 'BIO012',
      isActive: true,
    }
  ])

  // Create laboratories
  console.log('🏢 Creating laboratories...')
  await db.insert(laboratories).values([
    {
      id: 'lab-1',
      name: 'Computer Laboratory 1',
      building: 'Engineering Building',
      roomNumber: 'E301',
      capacity: 40,
      status: 'active',
      description: 'Main programming laboratory with 40 high-spec workstations for software development courses',
    },
    {
      id: 'lab-2',
      name: 'Computer Laboratory 2',
      building: 'Engineering Building',
      roomNumber: 'E302',
      capacity: 35,
      status: 'active',
      description: 'Web development and database management laboratory',
    },
    {
      id: 'lab-3',
      name: 'Networking Laboratory',
      building: 'Engineering Building',
      roomNumber: 'E303',
      capacity: 30,
      status: 'active',
      description: 'Cisco networking equipment and network simulation lab',
    },
    {
      id: 'lab-4',
      name: 'Multimedia Laboratory',
      building: 'Engineering Building',
      roomNumber: 'E304',
      capacity: 25,
      status: 'active',
      description: 'Graphics design and multimedia production laboratory with high-end workstations',
    },
    {
      id: 'lab-5',
      name: 'Research Laboratory',
      building: 'Research Center',
      roomNumber: 'RC201',
      capacity: 20,
      status: 'active',
      description: 'Graduate research and AI/ML development laboratory',
    },
    {
      id: 'lab-6',
      name: 'Mobile Development Lab',
      building: 'Engineering Building',
      roomNumber: 'E305',
      capacity: 30,
      status: 'maintenance',
      description: 'Android and iOS mobile application development laboratory',
    },
    {
      id: 'lab-7',
      name: 'Cybersecurity Lab',
      building: 'Engineering Building',
      roomNumber: 'E306',
      capacity: 25,
      status: 'active',
      description: 'Penetration testing and security analysis laboratory',
    },
    {
      id: 'lab-8',
      name: 'IoT Laboratory',
      building: 'Innovation Center',
      roomNumber: 'IC101',
      capacity: 20,
      status: 'active',
      description: 'Internet of Things and embedded systems development lab',
    }
  ])

  // Create equipment for multiple labs
  console.log('💻 Creating equipment inventory...')
  const equipmentData = []
  const labs = ['lab-1', 'lab-2', 'lab-3', 'lab-4', 'lab-5', 'lab-7', 'lab-8']
  const brands = {
    monitor: ['Dell', 'ASUS', 'Samsung', 'LG', 'ViewSonic', 'BenQ'],
    keyboard: ['Logitech', 'A4Tech', 'Genius', 'Dell', 'HP'],
    mouse: ['Logitech', 'A4Tech', 'Genius', 'Rapoo', 'HP'],
    cpu: ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer']
  }
  const models = {
    monitor: ['P2419H', 'VG248QE', 'S24F350', '24MK430H', 'VA2719'],
    keyboard: ['K120', 'KR-6260', 'KB-110', 'KB216', 'K380'],
    mouse: ['B100', 'OP-620D', 'NetScroll 120', 'M185', 'M705'],
    cpu: ['ProDesk 400', 'OptiPlex 3080', 'ThinkCentre M720', 'VivoPC', 'Veriton']
  }

  for (const labId of labs) {
    const labIndex = labs.indexOf(labId)
    const stationCount = 
      labId === 'lab-1' ? 40 : 
      labId === 'lab-2' ? 35 : 
      labId === 'lab-3' ? 30 : 
      labId === 'lab-4' ? 25 : 
      20

    for (let station = 1; station <= stationCount; station++) {
      const row = Math.floor((station - 1) / 8) + 1
      const col = ((station - 1) % 8) + 1

      // Monitor
      equipmentData.push({
        id: `${labId}-mon-${station}`,
        labId,
        type: 'monitor' as const,
        serialNumber: `MON-${labId.toUpperCase().replace('-', '')}-${String(station).padStart(3, '0')}`,
        brand: brands.monitor[Math.floor(Math.random() * brands.monitor.length)],
        model: models.monitor[Math.floor(Math.random() * models.monitor.length)],
        status: Math.random() > 0.95 ? 'maintenance' as const : 'present' as const,
        assignedStation: `Station ${station}`,
        positionX: col,
        positionY: row,
        lastDetected: new Date(),
      })

      // Keyboard
      equipmentData.push({
        id: `${labId}-kb-${station}`,
        labId,
        type: 'keyboard' as const,
        serialNumber: `KB-${labId.toUpperCase().replace('-', '')}-${String(station).padStart(3, '0')}`,
        brand: brands.keyboard[Math.floor(Math.random() * brands.keyboard.length)],
        model: models.keyboard[Math.floor(Math.random() * models.keyboard.length)],
        status: Math.random() > 0.98 ? 'damaged' as const : 'present' as const,
        assignedStation: `Station ${station}`,
        positionX: col,
        positionY: row,
        lastDetected: new Date(),
      })

      // Mouse
      equipmentData.push({
        id: `${labId}-ms-${station}`,
        labId,
        type: 'mouse' as const,
        serialNumber: `MS-${labId.toUpperCase().replace('-', '')}-${String(station).padStart(3, '0')}`,
        brand: brands.mouse[Math.floor(Math.random() * brands.mouse.length)],
        model: models.mouse[Math.floor(Math.random() * models.mouse.length)],
        status: Math.random() > 0.97 ? 'missing' as const : 'present' as const,
        assignedStation: `Station ${station}`,
        positionX: col,
        positionY: row,
        lastDetected: Math.random() > 0.03 ? new Date() : new Date(Date.now() - 86400000),
      })

      // CPU
      equipmentData.push({
        id: `${labId}-cpu-${station}`,
        labId,
        type: 'cpu' as const,
        serialNumber: `CPU-${labId.toUpperCase().replace('-', '')}-${String(station).padStart(3, '0')}`,
        brand: brands.cpu[Math.floor(Math.random() * brands.cpu.length)],
        model: models.cpu[Math.floor(Math.random() * models.cpu.length)],
        status: 'present' as const,
        assignedStation: `Station ${station}`,
        positionX: col,
        positionY: row,
        lastDetected: new Date(),
      })
    }
  }

  await db.insert(equipment).values(equipmentData)

  // Create realistic class schedules
  console.log('📅 Creating class schedules...')
  await db.insert(schedules).values([
    // Monday & Thursday classes
    {
      id: 'sched-1',
      labId: 'lab-1',
      userId: 'faculty-1',
      dayOfWeek: 1,
      startTime: '07:30',
      endTime: '09:00',
      courseCode: 'CS121',
      section: 'BSCS 1A',
      subject: 'Computer Programming 1',
      isRecurring: true,
    },
    {
      id: 'sched-2',
      labId: 'lab-1',
      userId: 'faculty-1',
      dayOfWeek: 4,
      startTime: '07:30',
      endTime: '09:00',
      courseCode: 'CS121',
      section: 'BSCS 1A',
      subject: 'Computer Programming 1',
      isRecurring: true,
    },
    {
      id: 'sched-3',
      labId: 'lab-1',
      userId: 'faculty-2',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '12:00',
      courseCode: 'CS122',
      section: 'BSCS 1B',
      subject: 'Computer Programming 2',
      isRecurring: true,
    },
    {
      id: 'sched-4',
      labId: 'lab-1',
      userId: 'faculty-2',
      dayOfWeek: 4,
      startTime: '09:00',
      endTime: '12:00',
      courseCode: 'CS122',
      section: 'BSCS 1B',
      subject: 'Computer Programming 2',
      isRecurring: true,
    },
    // Tuesday & Friday classes
    {
      id: 'sched-5',
      labId: 'lab-2',
      userId: 'faculty-3',
      dayOfWeek: 2,
      startTime: '07:30',
      endTime: '10:30',
      courseCode: 'IT211',
      section: 'BSIT 2A',
      subject: 'Web Development',
      isRecurring: true,
    },
    {
      id: 'sched-6',
      labId: 'lab-2',
      userId: 'faculty-3',
      dayOfWeek: 5,
      startTime: '07:30',
      endTime: '10:30',
      courseCode: 'IT211',
      section: 'BSIT 2A',
      subject: 'Web Development',
      isRecurring: true,
    },
    {
      id: 'sched-7',
      labId: 'lab-3',
      userId: 'faculty-4',
      dayOfWeek: 2,
      startTime: '13:00',
      endTime: '16:00',
      courseCode: 'IT301',
      section: 'BSIT 3A',
      subject: 'Network Administration',
      isRecurring: true,
    },
    {
      id: 'sched-8',
      labId: 'lab-3',
      userId: 'faculty-4',
      dayOfWeek: 5,
      startTime: '13:00',
      endTime: '16:00',
      courseCode: 'IT301',
      section: 'BSIT 3A',
      subject: 'Network Administration',
      isRecurring: true,
    },
    // Wednesday classes
    {
      id: 'sched-9',
      labId: 'lab-4',
      userId: 'faculty-2',
      dayOfWeek: 3,
      startTime: '07:30',
      endTime: '10:30',
      courseCode: 'MM201',
      section: 'BSIT 2C',
      subject: 'Digital Graphics Design',
      isRecurring: true,
    },
    {
      id: 'sched-10',
      labId: 'lab-5',
      userId: 'faculty-5',
      dayOfWeek: 3,
      startTime: '13:00',
      endTime: '16:00',
      courseCode: 'CS501',
      section: 'MSCS',
      subject: 'Machine Learning',
      isRecurring: true,
    },
    // Saturday classes
    {
      id: 'sched-11',
      labId: 'lab-1',
      userId: 'faculty-5',
      dayOfWeek: 6,
      startTime: '08:00',
      endTime: '11:00',
      courseCode: 'CS401',
      section: 'BSCS 4A',
      subject: 'Software Engineering',
      isRecurring: true,
    },
    {
      id: 'sched-12',
      labId: 'lab-7',
      userId: 'faculty-4',
      dayOfWeek: 6,
      startTime: '13:00',
      endTime: '16:00',
      courseCode: 'IT411',
      section: 'BSIT 4A',
      subject: 'Cybersecurity Fundamentals',
      isRecurring: true,
    },
  ])

  // Create system settings
  console.log('⚙️ Configuring system settings...')
  await db.insert(settings).values([
    {
      id: 'setting-1',
      key: 'system_name',
      value: 'TabeTalá Laboratory Management System',
      type: 'string',
      description: 'System display name',
      category: 'general',
    },
    {
      id: 'setting-2',
      key: 'university_name',
      value: 'Don Honorio Ventura State University',
      type: 'string',
      description: 'University name',
      category: 'general',
    },
    {
      id: 'setting-3',
      key: 'university_acronym',
      value: 'DHVSU',
      type: 'string',
      description: 'University acronym',
      category: 'general',
    },
    {
      id: 'setting-4',
      key: 'current_semester',
      value: '1st Semester 2024-2025',
      type: 'string',
      description: 'Current academic semester',
      category: 'academic',
    },
    {
      id: 'setting-5',
      key: 'max_booking_days',
      value: '30',
      type: 'number',
      description: 'Maximum days in advance for lab booking',
      category: 'booking',
    },
    {
      id: 'setting-6',
      key: 'auto_logout_minutes',
      value: '30',
      type: 'number',
      description: 'Auto logout after inactivity (minutes)',
      category: 'security',
    },
    {
      id: 'setting-7',
      key: 'enable_biometric_auth',
      value: 'true',
      type: 'boolean',
      description: 'Enable biometric authentication',
      category: 'security',
    },
    {
      id: 'setting-8',
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      description: 'Enable system maintenance mode',
      category: 'system',
    },
    {
      id: 'setting-9',
      key: 'alert_email',
      value: 'labadmin@dhvsu.edu.ph',
      type: 'string',
      description: 'Email for system alerts',
      category: 'notifications',
    },
    {
      id: 'setting-10',
      key: 'occupancy_threshold',
      value: '90',
      type: 'number',
      description: 'Occupancy percentage threshold for alerts',
      category: 'monitoring',
    },
    {
      id: 'setting-11',
      key: 'equipment_check_interval',
      value: '300',
      type: 'number',
      description: 'Equipment detection interval in seconds',
      category: 'monitoring',
    },
    {
      id: 'setting-12',
      key: 'default_session_duration',
      value: '180',
      type: 'number',
      description: 'Default lab session duration in minutes',
      category: 'booking',
    },
  ])

  console.log('✅ Database seeded successfully!')
  console.log('📊 Summary:')
  console.log(`   - Users: 10 (2 admins, 5 faculty, 3 custodians)`)
  console.log(`   - Laboratories: 8`)
  console.log(`   - Equipment: ${equipmentData.length} items`)
  console.log(`   - Schedules: 12 recurring classes`)
  console.log(`   - Settings: 12 system configurations`)
  console.log('\n🔐 Default Credentials:')
  console.log('   Admin: admin / admin123')
  console.log('   Faculty: rocampo / faculty123')
  console.log('   Custodian: labkeeper / custodian123')
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})