"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Edit,
  Fingerprint,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useOptimistic, startTransition } from "react";

interface Schedule {
  id: string;
  labId: string;
  userId: string;
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  courseCode?: string;
  section?: string;
  subject?: string;
  isRecurring: boolean;
  startDate?: number;
  endDate?: number;
  createdAt: number;
  updatedAt: number;
  userName?: string;
  userEmail?: string;
  labName?: string;
  userBiometricId?: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  biometricId?: string;
  role: string;
}

interface Laboratory {
  id: string;
  name: string;
  building: string;
  roomNumber: string;
  capacity: number;
  status: string;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [optimisticSchedules, setOptimisticSchedules] = useOptimistic(
    schedules,
    (state, action: { type: 'add' | 'update' | 'delete'; schedule?: Schedule; scheduleId?: string }) => {
      switch (action.type) {
        case 'add':
          if (action.schedule) {
            return [action.schedule, ...state];
          }
          return state;
        case 'update':
          if (action.schedule) {
            return state.map(s => s.id === action.schedule?.id ? action.schedule : s);
          }
          return state;
        case 'delete':
          if (action.scheduleId) {
            return state.filter(s => s.id !== action.scheduleId);
          }
          return state;
        default:
          return state;
      }
    }
  );
  const [teachers, setTeachers] = useState<User[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    labId: "",
    userId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    courseCode: "",
    section: "",
    subject: "",
    isRecurring: true,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, teachersRes, labsRes] = await Promise.all([
        fetch("/api/schedules"),
        fetch("/api/users?role=faculty"),
        fetch("/api/laboratories"),
      ]);

if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        const usersArray = teachersData.users || teachersData;
        setTeachers(usersArray.filter((user: User) => user.role === "faculty"));
      }

      if (labsRes.ok) {
        const labsData = await labsRes.json();
        setLaboratories(labsData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      labId: laboratories.length > 0 ? laboratories[0].id : "",
      userId: teachers.length > 0 ? teachers[0].id : "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      courseCode: "",
      section: "",
      subject: "",
      isRecurring: true,
      startDate: "",
      endDate: "",
    });
    setEditingSchedule(null);
  };

const handleSubmit = async () => {
    if (
      !formData.labId ||
      !formData.userId ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if teachers and labs are loaded
    if (teachers.length === 0 || laboratories.length === 0) {
      toast({
        title: "Data Not Ready",
        description: "Please wait for teachers and laboratories to load.",
        variant: "destructive",
      });
      return;
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
        ...(formData.isRecurring && formData.dayOfWeek
          ? { dayOfWeek: parseInt(formData.dayOfWeek) }
          : {}),
        ...(!formData.isRecurring && formData.startDate
          ? {
              startDate: Math.floor(
                new Date(formData.startDate).getTime() / 1000
              ),
            }
          : {}),
        ...(formData.isRecurring && formData.endDate
          ? { endDate: Math.floor(new Date(formData.endDate).getTime() / 1000) }
          : {}),
      };

      const url = editingSchedule
        ? `/api/schedules/${editingSchedule.id}`
        : "/api/schedules";
      const method = editingSchedule ? "PUT" : "POST";

      // Create optimistic schedule for new additions
      if (!editingSchedule) {
        const selectedTeacher = teachers.find(t => t.id === formData.userId);
        const selectedLab = laboratories.find(l => l.id === formData.labId);
        
        const optimisticSchedule: Schedule = {
          id: `optimistic-${Date.now()}`,
          labId: formData.labId,
          userId: formData.userId,
          startTime: formData.startTime,
          endTime: formData.endTime,
          courseCode: formData.courseCode || undefined,
          section: formData.section || undefined,
          subject: formData.subject || undefined,
          isRecurring: formData.isRecurring,
          dayOfWeek: formData.isRecurring ? parseInt(formData.dayOfWeek) : undefined,
          startDate: !formData.isRecurring && formData.startDate 
            ? new Date(formData.startDate).getTime() / 1000
            : undefined,
          endDate: formData.isRecurring && formData.endDate 
            ? Math.floor(new Date(formData.endDate).getTime() / 1000) 
            : undefined,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
          userName: selectedTeacher?.fullName || 'Loading...',
          userEmail: selectedTeacher?.email || 'Loading...',
          labName: selectedLab?.name || 'Loading...',
          userBiometricId: selectedTeacher?.biometricId,
        };
        
        startTransition(() => {
          setOptimisticSchedules({ type: 'add', schedule: optimisticSchedule });
        });
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const schedule = await response.json();

if (editingSchedule) {
          // For updates, we need to update the actual schedules state, not just optimistic
          const selectedTeacher = teachers.find(t => t.id === schedule.userId);
          const selectedLab = laboratories.find(l => l.id === schedule.labId);
          
          const enhancedSchedule = {
            ...schedule,
            userName: selectedTeacher?.fullName || schedule.userName,
            userEmail: selectedTeacher?.email || schedule.userEmail,
            labName: selectedLab?.name || schedule.labName,
            userBiometricId: selectedTeacher?.biometricId || schedule.userBiometricId,
          };
          
          setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? enhancedSchedule : s));
          toast({
            title: "Schedule Updated",
            description: "Schedule has been updated successfully.",
          });
        } else {
          // Replace optimistic schedule with real one, preserving joined data
          const selectedTeacher = teachers.find(t => t.id === schedule.userId);
          const selectedLab = laboratories.find(l => l.id === schedule.labId);
          
          const enhancedSchedule = {
            ...schedule,
            userName: selectedTeacher?.fullName || schedule.userName,
            userEmail: selectedTeacher?.email || schedule.userEmail,
            labName: selectedLab?.name || schedule.labName,
            userBiometricId: selectedTeacher?.biometricId || schedule.userBiometricId,
          };
          
          setSchedules(prev => [enhancedSchedule, ...prev.filter(s => !s.id.startsWith('optimistic-'))]);
          toast({
            title: "Schedule Created",
            description: "New schedule has been created successfully.",
          });
        }

        setIsDialogOpen(false);
        resetForm();
      } else {
        // Remove optimistic schedule on error
        if (!editingSchedule) {
          setSchedules(prev => prev.filter(s => !s.id.startsWith('optimistic-')));
        }
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to save schedule",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Remove optimistic schedule on error
      if (!editingSchedule) {
        setSchedules(prev => prev.filter(s => !s.id.startsWith('optimistic-')));
      }
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      });
    }
  };

const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    
    // Handle date conversion safely with error handling
    let startDateStr = "";
    let endDateStr = "";
    
    if (schedule.startDate) {
      try {
        let startDate: Date;
        if (schedule.startDate instanceof Date) {
          startDate = schedule.startDate;
        } else if (typeof schedule.startDate === 'string') {
          // Handle ISO string format (e.g., "2025-09-19T00:00:00.000Z")
          startDate = new Date(schedule.startDate);
        } else {
          // Handle both timestamp formats (seconds and milliseconds)
          const timestamp = typeof schedule.startDate === 'number' ? schedule.startDate : Number(schedule.startDate);
          startDate = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
        }
        
        if (!isNaN(startDate.getTime())) {
          startDateStr = startDate.toISOString().split("T")[0];
        }
      } catch (error) {
        console.warn('Invalid startDate:', schedule.startDate);
      }
    }
    
    if (schedule.endDate) {
      try {
        let endDate: Date;
        if (schedule.endDate instanceof Date) {
          endDate = schedule.endDate;
        } else if (typeof schedule.endDate === 'string' && schedule.endDate) {
          // Handle ISO string format
          endDate = new Date(schedule.endDate);
        } else if (schedule.endDate) {
          // Handle both timestamp formats (seconds and milliseconds)
          const timestamp = typeof schedule.endDate === 'number' ? schedule.endDate : Number(schedule.endDate);
          endDate = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
        }
        
        if (endDate && !isNaN(endDate.getTime())) {
          endDateStr = endDate.toISOString().split("T")[0];
        }
      } catch (error) {
        console.warn('Invalid endDate:', schedule.endDate);
      }
    }
    
    setFormData({
      labId: schedule.labId,
      userId: schedule.userId,
      dayOfWeek: schedule.dayOfWeek?.toString() || "",
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      courseCode: schedule.courseCode || "",
      section: schedule.section || "",
      subject: schedule.subject || "",
      isRecurring: schedule.isRecurring,
      startDate: startDateStr,
      endDate: endDateStr,
    });
    setIsDialogOpen(true);
  };

const handleDelete = async (scheduleId: string) => {
    try {
      // Optimistically remove the schedule
      startTransition(() => {
          setOptimisticSchedules({ type: 'delete', scheduleId });
        });

      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Schedule Deleted",
          description: "Schedule has been deleted successfully.",
          variant: "destructive",
        });
      } else {
        // Restore schedule on error
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete schedule",
          variant: "destructive",
        });
        // Refetch to restore correct state
        fetchData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
      // Refetch to restore correct state
      fetchData();
    }
  };

  const getDayName = (dayOfWeek?: number) => {
    if (!dayOfWeek && dayOfWeek !== 0) return "";
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayOfWeek];
  };

const formatDate = (timestamp?: number | Date | string) => {
    if (!timestamp) return "";
    
    let date: Date;
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      date = timestamp;
    }
    // If it's a string, try to parse it
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    // If it's a number, handle both timestamp formats (seconds and milliseconds)
    else {
      date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return date.toLocaleDateString();
  };

  const getBiometricStatus = (biometricId?: string) => {
    if (biometricId) {
      return (
        <div className="flex items-center space-x-1">
          <Fingerprint className="h-3 w-3 text-green-600" />
          <span className="text-xs text-green-600">Registered</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1">
        <Fingerprint className="h-3 w-3 text-red-600" />
        <span className="text-xs text-red-600">Not Registered</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Schedule Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage teacher schedules and laboratory assignments
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Schedule Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage teacher schedules and laboratory assignments
          </p>
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
              <DialogTitle>
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labId">Laboratory *</Label>
                  <Select
                    value={formData.labId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, labId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select laboratory" />
                    </SelectTrigger>
                    <SelectContent>
{laboratories.map((lab) => (
                        <SelectItem key={lab.id} value={lab.id}>
                          <span 
                            className="line-clamp-1 block" 
                            title={`${lab.building} ${lab.roomNumber}`}
                          >
                            {lab.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isRecurring">Schedule Type</Label>
                  <Select
                    value={formData.isRecurring.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        isRecurring: value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Recurring (Weekly)</SelectItem>
                      <SelectItem value="false">One-time Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">Teacher *</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, userId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName}{" "}
                        {getBiometricStatus(teacher.biometricId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.isRecurring ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) =>
                        setFormData({ ...formData, dayOfWeek: value })
                      }
                    >
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
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
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
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({ ...formData, courseCode: e.target.value })
                    }
                    placeholder="e.g., CS101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                    placeholder="e.g., A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
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
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Teacher</TableHead>
                    <TableHead className="w-[180px]">Laboratory</TableHead>
                    <TableHead className="w-[200px]">Schedule</TableHead>
                    <TableHead className="w-[180px]">Course</TableHead>
                    <TableHead className="w-[120px]">Biometric</TableHead>
                    <TableHead className="w-[80px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
<TableBody>
                  {optimisticSchedules.map((schedule) => (
<TableRow key={schedule.id} className={schedule.id.startsWith('optimistic-') ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="min-w-0">
                          <div
                            className="font-medium truncate"
                            title={schedule.userName || 'Unknown Teacher'}
                          >
                            {schedule.userName || 'Unknown Teacher'}
                            {schedule.id.startsWith('optimistic-') && (
                              <span className="ml-2 text-xs text-blue-600 animate-pulse">Adding...</span>
                            )}
                          </div>
                          <div
                            className="text-sm text-muted-foreground truncate"
                            title={schedule.userEmail || 'No email'}
                          >
                            {schedule.userEmail || 'No email'}
                          </div>
                        </div>
                      </TableCell>
<TableCell>
                        <div className="flex items-center space-x-2 min-w-0">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate" title={schedule.labName || 'Unknown Laboratory'}>
                            {schedule.labName || 'Unknown Laboratory'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {schedule.isRecurring ? (
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">
                                {getDayName(schedule.dayOfWeek)}
                              </Badge>
                              <span className="text-sm">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                <Calendar className="h-3 w-3 mr-1" />
                                One-time
                              </Badge>
                              <div className="text-sm">
                                <div>{formatDate(schedule.startDate)}</div>
                                <div>
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
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
                        <div className="text-sm min-w-0">
                          {schedule.courseCode && (
                            <div
                              className="font-medium truncate"
                              title={schedule.courseCode}
                            >
                              {schedule.courseCode}
                            </div>
                          )}
                          {schedule.section && (
                            <div
                              className="text-muted-foreground truncate"
                              title={`Section ${schedule.section}`}
                            >
                              Section {schedule.section}
                            </div>
                          )}
                          {schedule.subject && (
                            <div
                              className="text-muted-foreground truncate"
                              title={schedule.subject}
                            >
                              {schedule.subject}
                            </div>
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
                            <DropdownMenuItem
                              onClick={() => handleEdit(schedule)}
                            >
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
          </div>

          {optimisticSchedules.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No schedules found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new schedule.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
