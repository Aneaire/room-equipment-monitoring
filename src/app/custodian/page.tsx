'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, AlertTriangle, CheckCircle, Clock, Monitor, Keyboard, Mouse, Cpu } from 'lucide-react'

export default function CustodianDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'custodian') {
      router.push('/unauthorized')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'custodian') {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Custodian Dashboard</h1>
        <p className="text-gray-600 mt-2">Equipment Monitoring & Maintenance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">720</div>
            <p className="text-xs text-muted-foreground">Across 8 laboratories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Reported</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">5 high priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Today</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Lab 2, Lab 4, Lab 6</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">95% resolution rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Equipment Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mouse className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Mouse Missing - Station 15</p>
                    <p className="text-sm text-gray-600">Lab 1 • Reported 30 min ago</p>
                  </div>
                </div>
                <Badge variant="destructive">High</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Monitor Flickering - Station 8</p>
                    <p className="text-sm text-gray-600">Lab 2 • Reported 2 hours ago</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Keyboard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Keyboard Keys Stuck - Station 22</p>
                    <p className="text-sm text-gray-600">Lab 3 • Reported 5 hours ago</p>
                  </div>
                </div>
                <Badge variant="secondary">Low</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Cpu className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">CPU Overheating - Station 5</p>
                    <p className="text-sm text-gray-600">Lab 4 • Reported yesterday</p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800">In Progress</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Today</span>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    <p className="font-medium">Lab 2 - Routine Check</p>
                    <p className="text-xs text-gray-600">10:00 AM</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    <p className="font-medium">Lab 6 - Equipment Repair</p>
                    <p className="text-xs text-gray-600">2:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tomorrow</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium">Lab 1 - Deep Cleaning</p>
                    <p className="text-xs text-gray-600">8:00 AM</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium">Lab 5 - Software Updates</p>
                    <p className="text-xs text-gray-600">3:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laboratory Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { lab: 'Lab 1', status: 'Operational', equipment: 160, issues: 2 },
              { lab: 'Lab 2', status: 'Maintenance', equipment: 140, issues: 5 },
              { lab: 'Lab 3', status: 'Operational', equipment: 120, issues: 1 },
              { lab: 'Lab 4', status: 'Operational', equipment: 100, issues: 3 },
            ].map((lab) => (
              <div key={lab.lab} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{lab.lab}</h3>
                  <Badge 
                    variant={lab.status === 'Operational' ? 'default' : 'secondary'}
                    className={lab.status === 'Operational' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {lab.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Equipment: {lab.equipment}</p>
                  <p className="text-gray-600">
                    Issues: <span className={lab.issues > 0 ? 'text-red-600 font-medium' : ''}>{lab.issues}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}