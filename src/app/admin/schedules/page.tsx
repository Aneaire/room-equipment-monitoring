'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Fingerprint
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Schedule {
  id: string
  labId: string
  userId: string
  dayOfWeek?: number
  startTime: string
  endTime: string
  courseCode?: string
  section?: string
  subject?: string
  isRecurring: boolean
  startDate?: number
  endDate?: number
  createdAt: number
  updatedAt: number
  userName?: string
  userEmail?: string
  labName?: string
  userBiometricId?: string
}

interface User {
  id: string
  fullName: string
  email: string
  biometricId?: string
  role: string
}

interface Laboratory {
  id: string
  name: string
  building: string
  roomNumber: string
  capacity: number
  status: string
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    labId: '',
    userId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    courseCode: '',
    section: '',
    subject: '',
    isRecurring: true,
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [schedulesRes, teachersRes, labsRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/users?role=faculty'),
        fetch('/api/laboratories')
      ])

      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json()
        setSchedules(schedulesData)
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json()
        setTeachers(teachersData.filter((user: User) => user.role === 'faculty'))
      }

      if (labsRes.ok) {
        const labsData = await labsRes.json()
        setLaboratories(labsData)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      labId: laboratories.length > 0 ? laboratories[0].id : '',
      userId: teachers.length > 0 ? teachers[0].id : '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      courseCode: '',
      section: '',
      subject: '',
      isRecurring: true,
      startDate: '',
      endDate: ''
    })
    setEditingSchedule(null)
  }

  const handleSubmit = async () => {
    if (!formData.labId || !formData.userId || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    try {
      const payload = {
        labId: formData.labId,
        userId: formData.userId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        courseCode: formData.courseCode || undefined,
        section: formData.section || undefined,
        subject: formData.subject || undefined,
        isRecurring: formData.isRecurring,
        ...(formData.isRecurring && formData.dayOfWeek ? { dayOfWeek: parseInt(formData.dayOfWeek) } : {}),
        ...(!formData.isRecurring && formData.startDate ? { startDate: Math.floor(new Date(formData.startDate).getTime() / 1000) } : {}),
        ...(formData.isRecurring && formData.endDate ? { endDate: Math.floor(new Date(formData.endDate).getTime() / 1000) } : {})
      }

      const url = editingSchedule ? `/api/schedules/${editingSchedule.id}` : '/api/schedules'
      const method = editingSchedule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const schedule = await response.json()
        
        if (editingSchedule) {
          setSchedules(schedules.map(s => s.id === editingSchedule.id ? schedule : s))
          toast({
            title: 'Schedule Updated',
            description: 'Schedule has been updated successfully.'
          })
        } else {
          setSchedules([...schedules, schedule])
          toast({
            title: 'Schedule Created',
            description: 'New schedule has been created successfully.'
          })
        }
        
        setIsDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to save schedule',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save schedule',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      labId: schedule.labId,
      userId: schedule.userId,
      dayOfWeek: schedule.dayOfWeek?.toString() || '',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      courseCode: schedule.courseCode || '',
      section: schedule.section || '',
      subject: schedule.subject || '',
      isRecurring: schedule.isRecurring,
      startDate: schedule.startDate ? new Date(schedule.startDate * 1000).toISOString().split('T')[0] : '',
      endDate: schedule.endDate ? new Date(schedule.endDate * 1000).toISOString().split('T')[0] : ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSchedules(schedules.filter(s => s.id !== scheduleId))
        toast({
          title: 'Schedule Deleted',
          description: 'Schedule has been deleted successfully.',
          variant: 'destructive'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete schedule',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive'
      })
    }
  }

  const getDayName = (dayOfWeek?: number) => {
    if (!dayOfWeek && dayOfWeek !== 0) return ''
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek]
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getBiometricStatus = (biometricId?: string) => {
    if (biometricId) {
      return (
        <div className="flex items-center space-x-1">
          <Fingerprint className="h-3 w-3 text-green-600" />
          <span className="text-xs text-green-600">Registered</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-1">
        <Fingerprint className="h-3 w-3 text-red-600" />
        <span className="text-xs text-red-600">Not Registered</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600 mt-1">Manage teacher schedules and laboratory assignments</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading schedules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-1">Manage teacher schedules and laboratory assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labId">Laboratory *</Label>
                  <Select value={formData.labId} onValueChange={(value) => setFormData({...formData, labId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select laboratory" />
                    </SelectTrigger>
                    <SelectContent>
                      {laboratories.map(lab => (
                        <SelectItem key={lab.id} value={lab.id}>
                          {lab.name} ({lab.building} {lab.roomNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userId">Teacher *</Label>
                  <Select value={formData.userId} onValueChange={(value) => setFormData({...formData, userId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.fullName} {getBiometricStatus(teacher.biometricId)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isRecurring">Schedule Type</Label>
                <Select value={formData.isRecurring.toString()} onValueChange={(value) => setFormData({...formData, isRecurring: value === 'true'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Recurring (Weekly)</SelectItem>
                    <SelectItem value="false">One-time Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.isRecurring ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({...formData, dayOfWeek: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="startDate">Event Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    placeholder="e.g., A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Biometric</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{schedule.userName}</div>
                        <div className="text-sm text-muted-foreground">{schedule.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{schedule.labName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {schedule.isRecurring ? (
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {getDayName(schedule.dayOfWeek)}
                            </Badge>
                            <span className="text-sm">{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              One-time
                            </Badge>
                            <div className="text-sm">
                              <div>{formatDate(schedule.startDate)}</div>
                              <div>{schedule.startTime} - {schedule.endTime}</div>
                            </div>
                          </div>
                        )}
                        {schedule.endDate && schedule.isRecurring && (
                          <div className="text-xs text-muted-foreground">
                            Until {formatDate(schedule.endDate)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {schedule.courseCode && (
                          <div className="font-medium">{schedule.courseCode}</div>
                        )}
                        {schedule.section && (
                          <div className="text-muted-foreground">Section {schedule.section}</div>
                        )}
                        {schedule.subject && (
                          <div className="text-muted-foreground">{schedule.subject}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getBiometricStatus(schedule.userBiometricId)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {schedules.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new schedule.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}