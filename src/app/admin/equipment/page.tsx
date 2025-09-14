'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Shield,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Monitor,
  Keyboard,
  Mouse,
  Cpu,
  ScanLine,
  MapPin
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Equipment {
  id: string
  type: 'keyboard' | 'mouse' | 'monitor' | 'cpu' | 'other'
  serialNumber: string
  brand: string
  model: string
  status: 'present' | 'missing' | 'damaged' | 'maintenance'
  labId: string
  labName: string
  assignedStation: string
  positionX: number
  positionY: number
  lastDetected: Date | number | string | null
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [labs, setLabs] = useState<{ id: string; name: string }[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLab, setFilterLab] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLabViewOpen, setIsLabViewOpen] = useState(false)
  const [selectedLab, setSelectedLab] = useState<string>('lab-1')
  
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch equipment and labs from API
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [equipmentResponse, labsResponse] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/laboratories')
      ])

      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json()
        setEquipment(equipmentData)
      }

      if (labsResponse.ok) {
        const labsData = await labsResponse.json()
        setLabs(labsData)
      }

      if (!equipmentResponse.ok || !labsResponse.ok) {
        toast({
          title: 'Error',
          description: 'Failed to fetch data',
          variant: 'destructive'
        })
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

  const [formData, setFormData] = useState({
    type: 'keyboard' as const,
    serialNumber: '',
    brand: '',
    model: '',
    labId: 'lab-1',
    assignedStation: ''
  })

  

  // Auto-refresh equipment status (simulating real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setEquipment(prev => prev.map(eq => ({
        ...eq,
        lastDetected: eq.status === 'present' ? Date.now() : eq.lastDetected
      })))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Filter equipment
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.assignedStation.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLab = filterLab === 'all' || eq.labId === filterLab
    const matchesType = filterType === 'all' || eq.type === filterType
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus

    return matchesSearch && matchesLab && matchesType && matchesStatus
  })

  const resetForm = () => {
    setFormData({
      type: 'keyboard',
      serialNumber: '',
      brand: '',
      model: '',
      labId: labs.length > 0 ? labs[0].id : '',
      assignedStation: ''
    })
  }

  const handleAddEquipment = async () => {
    if (!formData.serialNumber || !formData.brand || !formData.model || !formData.assignedStation) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newEquipment = await response.json()
        setEquipment([...equipment, newEquipment])
        setIsAddDialogOpen(false)
        resetForm()
        
        toast({
          title: 'Equipment Added',
          description: `${newEquipment.type} ${newEquipment.serialNumber} has been added.`
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to add equipment',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add equipment',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteEquipment = async (equipmentId: string) => {
    const eq = equipment.find(e => e.id === equipmentId)
    if (!eq) return

    try {
      const response = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEquipment(equipment.filter(e => e.id !== equipmentId))
        
        toast({
          title: 'Equipment Removed',
          description: `${eq.type} ${eq.serialNumber} has been removed from the system.`,
          variant: 'destructive'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete equipment',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete equipment',
        variant: 'destructive'
      })
    }
  }

  const handleStartScan = async () => {
    setIsScanning(true)
    toast({
      title: 'YOLO Detection Started',
      description: 'Scanning all laboratories for equipment...'
    })

    // Simulate YOLO detection process
    setTimeout(() => {
      // Randomly update some equipment status
      setEquipment(prev => prev.map(eq => {
        if (Math.random() < 0.1) { // 10% chance to change status
          const statuses: Equipment['status'][] = ['present', 'missing']
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
          return { ...eq, status: newStatus, lastDetected: Date.now() }
        }
        return eq
      }))

      setIsScanning(false)
      toast({
        title: 'Scan Complete',
        description: 'Equipment detection finished. Status updated.'
      })
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800'
      case 'missing': return 'bg-red-100 text-red-800'
      case 'damaged': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'missing': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'damaged': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'maintenance': return <Clock className="h-4 w-4 text-blue-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keyboard': return <Keyboard className="h-4 w-4" />
      case 'mouse': return <Mouse className="h-4 w-4" />
      case 'monitor': return <Monitor className="h-4 w-4" />
      case 'cpu': return <Cpu className="h-4 w-4" />
      case 'other': return <Shield className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getTimeSince = (date: Date | number | string | null | undefined) => {
    if (!date) return 'Never'
    
    // Convert to Date object safely
    let dateObj: Date
    try {
      if (typeof date === 'number') {
        // Handle Unix timestamp (milliseconds or seconds)
        dateObj = new Date(date < 10000000000 ? date * 1000 : date)
      } else if (date instanceof Date) {
        dateObj = date
      } else if (typeof date === 'string') {
        // Handle ISO string or other string formats
        dateObj = new Date(date)
      } else {
        // Fallback
        dateObj = new Date()
      }
      
      // Validate that we have a valid Date object
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date'
      }
      
    } catch (error) {
      return 'Invalid date'
    }
    
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage laboratory equipment with YOLO detection</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading equipment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage laboratory equipment with YOLO detection</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleStartScan}
            disabled={isScanning}
          >
            <ScanLine className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Start YOLO Scan'}
          </Button>
          <Dialog open={isLabViewOpen} onOpenChange={setIsLabViewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Lab View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Laboratory Equipment Layout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedLab} onValueChange={setSelectedLab}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {labs.map(lab => (
                      <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="bg-gray-50 rounded-lg p-4 relative" style={{ height: '400px' }}>
                  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  {equipment
                    .filter(eq => eq.labId === selectedLab)
                    .map(eq => (
                      <div
                        key={eq.id}
                        className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-transform hover:scale-110 ${
                          eq.status === 'present' ? 'bg-green-500' :
                          eq.status === 'missing' ? 'bg-red-500' :
                          eq.status === 'damaged' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          left: `${Math.min(eq.positionX, 350)}px`, 
                          top: `${Math.min(eq.positionY, 350)}px` 
                        }}
                        title={`${eq.type} ${eq.serialNumber} - ${eq.status}`}
                      >
                        {eq.type === 'keyboard' ? 'K' : 
                         eq.type === 'mouse' ? 'M' : 
                         eq.type === 'monitor' ? 'D' : 
                         eq.type === 'cpu' ? 'C' : 'O'}
                      </div>
                    ))}
                  <div className="absolute bottom-2 left-2 flex space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Present</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Missing</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Damaged</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value: 'keyboard' | 'mouse' | 'monitor' | 'cpu' | 'other') => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keyboard">Keyboard</SelectItem>
                        <SelectItem value="mouse">Mouse</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
<SelectItem value="cpu">CPU</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labId">Laboratory</Label>
                  <Select value={formData.labId} onValueChange={(value) => setFormData({...formData, labId: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {labs.map(lab => (
                        <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedStation">Assigned Station *</Label>
                  <Input
                    id="assignedStation"
                    value={formData.assignedStation}
                    onChange={(e) => setFormData({...formData, assignedStation: e.target.value})}
                    placeholder="e.g., Station 1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEquipment}>
                    Add Equipment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
            <p className="text-xs text-muted-foreground">
              Tracked items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {equipment.filter(eq => eq.status === 'present').length}
            </div>
            <p className="text-xs text-muted-foreground">
              In position
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {equipment.filter(eq => eq.status === 'missing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {equipment.filter(eq => eq.status === 'damaged' || eq.status === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Damaged/maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterLab} onValueChange={setFilterLab}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by lab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labs</SelectItem>
                {labs.map(lab => (
                  <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="keyboard">Keyboard</SelectItem>
                <SelectItem value="mouse">Mouse</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
<SelectItem value="cpu">CPU</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Detected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((eq) => (
                  <TableRow key={eq.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(eq.type)}
                          <div>
                            <div className="font-medium">{eq.serialNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {eq.brand} {eq.model}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{eq.labName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {eq.assignedStation}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(eq.status)}
                        <Badge className={getStatusColor(eq.status)}>
                          {eq.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getTimeSince(eq.lastDetected)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEquipment(eq.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterLab !== 'all' || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding equipment to track'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}