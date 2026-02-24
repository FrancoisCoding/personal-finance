import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'

const services = [
  { name: 'Core Dashboard', status: 'operational', uptime: '100%' },
  { name: 'Direct Bank Sync', status: 'operational', uptime: '99.98%' },
  { name: 'AI Insights Engine', status: 'operational', uptime: '99.95%' },
  { name: 'Mobile App API', status: 'operational', uptime: '100%' },
  {
    name: 'Report Generation',
    status: 'maintenance',
    uptime: '99.90%',
    note: 'Scheduled maintenance in progress',
  },
]

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-20 max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 font-medium text-sm">
            <CheckCircle className="w-4 h-4" />
            All systems operational
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold">
            Service Status
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time status and uptime monitoring for FinanceFlow services.
          </p>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.name} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      service.status === 'operational'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : service.status === 'maintenance'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {service.status === 'operational' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : service.status === 'maintenance' ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.note && (
                      <p className="text-xs text-muted-foreground">
                        {service.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                      Status
                    </span>
                    <span className="capitalize font-medium">
                      {service.status}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                      Uptime
                    </span>
                    <span className="font-medium">{service.uptime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-6">
            Experiencing an issue not listed here?
          </p>
          <Link href="/support">
            <button className="text-primary font-semibold hover:underline">
              Contact our support team
            </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
