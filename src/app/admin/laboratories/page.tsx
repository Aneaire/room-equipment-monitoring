'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Monitor,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle,
  Settings,
  Eye,
  MapPin
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Laboratory {
  id: string
  name: string
  building: string
  roomNumber: string
  capacity: number
  status: 'active' | 'maintenance' | 'closed'
  description?: string
  createdAt: Date
  updatedAt: Date
}

interface Laboratory {
  id: string
  name: string
  building: string
  roomNumber: string
  capacity: number
  status: 'active' | 'maintenance' | 'closed'
  description?: string
  currentOccupancy: number
  equipmentCount: number
  issuesCount: number
  lastMaintenance: string
  nextMaintenance: string
}

export default function LaboratoriesPage() {
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch laboratories from API
  useEffect(() => {
    fetchLabs()
  }, [])

  const fetchLabs = async () => {
    try {
      const response = await fetch('/api/laboratories')
      if (response.ok) {
        const data = await response.json()
        setLabs(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch laboratories',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch laboratories',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    building: '',
    roomNumber: '',
    capacity: '',
    status: 'active' as const,
    description: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      building: '',
      roomNumber: '',
      capacity: '',
      status: 'active',
      description: ''
    })
    setEditingLab(null)
  }

  const handleAddLab = async () => {
    if (!formData.name || !formData.building || !formData.roomNumber || !formData.capacity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/laboratories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newLab = await response.json()
        setLabs([...labs, newLab])
        setIsAddDialogOpen(false)
        resetForm()
        
        toast({
          title: 'Laboratory Added',
          description: `${newLab.name} has been successfully added.`
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to add laboratory',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add laboratory',
        variant: 'destructive'
      })
    }
  }

  const handleEditLab = (lab: Laboratory) => {
    setEditingLab(lab)
    setFormData({
      name: lab.name,
      building: lab.building,
      roomNumber: lab.roomNumber,
      capacity: lab.capacity.toString(),
      status: lab.status,
      description: lab.description || ''
    })
    setIsAddDialogOpen(true)
  }

  const handleUpdateLab = () => {
    if (!formData.name || !formData.building || !formData.roomNumber || !formData.capacity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    const updatedLabs = labs.map(lab => 
      lab.id === editingLab?.id 
        ? { ...lab, ...formData, capacity: parseInt(formData.capacity) }
        : lab
    )

    setLabs(updatedLabs)
    setIsAddDialogOpen(false)
    resetForm()
    
    toast({
      title: 'Laboratory Updated',
      description: `${formData.name} has been successfully updated.`
    })
  }

  const handleDeleteLab = async (labId: string) => {
    const lab = labs.find(l => l.id === labId)
    if (!lab) return

    try {
      const response = await fetch(`/api/laboratories/${labId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLabs(labs.filter(l => l.id !== labId))
        
        toast({
          title: 'Laboratory Deleted',
          description: `${lab.name} has been removed from the system.`,
          variant: 'destructive'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete laboratory',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete laboratory',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'maintenance': return <Settings className="h-4 w-4 text-yellow-600" />
      case 'closed': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laboratory Management</h1>
            <p className="text-gray-600 mt-1">Manage laboratory spaces and monitor their status</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading laboratories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratory Management</h1>
          <p className="text-gray-600 mt-1">Manage laboratory spaces and monitor their status</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Laboratory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLab ? 'Edit Laboratory' : 'Add New Laboratory'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Laboratory Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Computer Laboratory 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Building *</Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) => setFormData({...formData, building: e.target.value})}
                    placeholder="e.g., CCS Building"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                    placeholder="e.g., 101"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'maintenance' | 'closed') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the laboratory"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingLab ? handleUpdateLab : handleAddLab}>
                  {editingLab ? 'Update Laboratory' : 'Add Laboratory'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Labs</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labs.length}</div>
            <p className="text-xs text-muted-foreground">
              {labs.filter(l => l.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labs.reduce((sum, lab) => sum + lab.capacity, 0)}</div>
            <p className="text-xs text-muted-foreground">
              seats available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labs.filter(l => l.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              active labs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{labs.filter(l => l.status === 'maintenance').length}</div>
            <p className="text-xs text-muted-foreground">
              in maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Laboratory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labs.map((lab) => (
          <Card key={lab.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{lab.name}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{lab.building} - Room {lab.roomNumber}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditLab(lab)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteLab(lab.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(lab.status)}
                  <Badge className={getStatusColor(lab.status)}>
                    {lab.status}
                  </Badge>
                </div>
                
              </div>

              {/* Capacity */}
              <div className="flex justify-between text-sm">
                <span>Capacity</span>
                <span>{lab.capacity} seats</span>
              </div>

              {/* Description */}
              {lab.description && (
                <p className="text-sm text-muted-foreground">{lab.description}</p>
              )}

              {/* Created Date */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(lab.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {labs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No laboratories</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first laboratory.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Laboratory
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}