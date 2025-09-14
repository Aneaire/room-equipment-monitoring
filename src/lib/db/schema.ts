import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'faculty', 'custodian'] }).notNull(),
  fullName: text('full_name').notNull(),
  department: text('department'),
  biometricId: text('biometric_id'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const laboratories = sqliteTable('laboratories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  building: text('building').notNull(),
  roomNumber: text('room_number').notNull(),
  capacity: integer('capacity').notNull(),
  status: text('status', { enum: ['active', 'maintenance', 'closed'] }).default('active'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const equipment = sqliteTable('equipment', {
  id: text('id').primaryKey(),
  labId: text('lab_id').notNull().references(() => laboratories.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['keyboard', 'mouse', 'monitor', 'cpu', 'other'] }).notNull(),
  serialNumber: text('serial_number'),
  brand: text('brand'),
  model: text('model'),
  status: text('status', { enum: ['present', 'missing', 'damaged', 'maintenance'] }).default('present'),
  lastDetected: integer('last_detected', { mode: 'timestamp' }),
  positionX: real('position_x'),
  positionY: real('position_y'),
  assignedStation: text('assigned_station'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const attendanceLogs = sqliteTable('attendance_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  labId: text('lab_id').notNull().references(() => laboratories.id, { onDelete: 'cascade' }),
  checkInTime: integer('check_in_time', { mode: 'timestamp' }).notNull(),
  checkOutTime: integer('check_out_time', { mode: 'timestamp' }),
  verificationMethod: text('verification_method', { enum: ['manual', 'biometric', 'qr_code'] }).notNull(),
  biometricData: text('biometric_data'),
  ipAddress: text('ip_address'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const occupancyLogs = sqliteTable('occupancy_logs', {
  id: text('id').primaryKey(),
  labId: text('lab_id').notNull().references(() => laboratories.id, { onDelete: 'cascade' }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  peopleCount: integer('people_count').notNull(),
  detectionConfidence: real('detection_confidence'),
  snapshotUrl: text('snapshot_url'),
  cameraId: text('camera_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  type: text('type', { 
    enum: ['equipment_missing', 'unauthorized_access', 'overcapacity', 'equipment_damaged', 'system_error'] 
  }).notNull(),
  labId: text('lab_id').references(() => laboratories.id, { onDelete: 'cascade' }),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  resolved: integer('resolved', { mode: 'boolean' }).default(false),
  resolvedBy: text('resolved_by').references(() => users.id),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  data: text('data', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const schedules = sqliteTable('schedules', {
  id: text('id').primaryKey(),
  labId: text('lab_id').notNull().references(() => laboratories.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week'), // 0 = Sunday, 1 = Monday, etc. (null for non-recurring)
  startTime: text('start_time').notNull(), // HH:MM format
  endTime: text('end_time').notNull(), // HH:MM format
  courseCode: text('course_code'),
  section: text('section'),
  subject: text('subject'),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(true),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const systemLogs = sqliteTable('system_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['info', 'warning', 'error', 'success'] }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).default(false),
  data: text('data', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  type: text('type', { enum: ['string', 'number', 'boolean', 'json'] }).default('string'),
  description: text('description'),
  category: text('category'),
  updatedBy: text('updated_by').references(() => users.id),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

// Type exports for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Laboratory = typeof laboratories.$inferSelect
export type NewLaboratory = typeof laboratories.$inferInsert
export type Equipment = typeof equipment.$inferSelect
export type NewEquipment = typeof equipment.$inferInsert
export type AttendanceLog = typeof attendanceLogs.$inferSelect
export type NewAttendanceLog = typeof attendanceLogs.$inferInsert
export type OccupancyLog = typeof occupancyLogs.$inferSelect
export type NewOccupancyLog = typeof occupancyLogs.$inferInsert
export type Alert = typeof alerts.$inferSelect
export type NewAlert = typeof alerts.$inferInsert
export type Schedule = typeof schedules.$inferSelect
export type NewSchedule = typeof schedules.$inferInsert
export type SystemLog = typeof systemLogs.$inferSelect
export type NewSystemLog = typeof systemLogs.$inferInsert
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
export type Setting = typeof settings.$inferSelect
export type NewSetting = typeof settings.$inferInsert