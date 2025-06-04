import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, MessageSquare, FileText, Activity, ArrowRight } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your appointments, messages, and health information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
              <span>Appointments</span>
            </CardTitle>
            <CardDescription>Upcoming sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-slate-600 mt-1">Next: June 15, 2:00 PM</p>
            <Button variant="link" className="p-0 h-auto mt-2 text-indigo-600" asChild>
              <a href="/portal/appointments" className="flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <span>Messages</span>
            </CardTitle>
            <CardDescription>Unread messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-slate-600 mt-1">From: Dr. Sarah Johnson</p>
            <Button variant="link" className="p-0 h-auto mt-2 text-indigo-600" asChild>
              <a href="/portal/messages" className="flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>Forms</span>
            </CardTitle>
            <CardDescription>Pending forms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-sm text-slate-600 mt-1">HIPAA Consent Form</p>
            <Button variant="link" className="p-0 h-auto mt-2 text-indigo-600" asChild>
              <a href="/portal/forms" className="flex items-center gap-1">
                Complete forms <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <span>Health Log</span>
            </CardTitle>
            <CardDescription>Track your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5</div>
            <p className="text-sm text-slate-600 mt-1">Current mood score</p>
            <Button variant="link" className="p-0 h-auto mt-2 text-indigo-600" asChild>
              <a href="/portal/health-log" className="flex items-center gap-1">
                View log <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">Appointment Completed</p>
                  <p className="text-xs text-slate-500">June 4, 2025 • 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium">Message Received</p>
                  <p className="text-xs text-slate-500">June 3, 2025 • 2:15 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div>
                  <p className="text-sm font-medium">Form Submitted</p>
                  <p className="text-xs text-slate-500">June 2, 2025 • 11:30 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-sm font-medium">Document Uploaded</p>
                  <p className="text-xs text-slate-500">June 1, 2025 • 9:45 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Therapy Session</p>
                    <p className="text-sm text-slate-500">Dr. Sarah Johnson</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span className="text-xs">June 15, 2025 • 2:00 PM</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Reschedule
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Follow-up Consultation</p>
                    <p className="text-sm text-slate-500">Dr. Michael Chen</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span className="text-xs">June 22, 2025 • 10:30 AM</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Reschedule
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
