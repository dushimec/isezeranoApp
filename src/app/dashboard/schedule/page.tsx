import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, Watch, Shirt, MoreVertical } from 'lucide-react';
import { events } from '@/lib/data';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';

export default function SchedulePage() {
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-headline">Schedule</h1>
            <p className="text-muted-foreground">
              Manage rehearsal and service schedules.
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div key={event.id}>
                <div className="flex items-start gap-4">
                  <div className="text-center w-16 shrink-0">
                    <p className="text-sm font-bold text-primary uppercase">{format(event.date, 'MMM')}</p>
                    <p className="text-3xl font-bold">{format(event.date, 'd')}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground mt-1">
                      <p className="flex items-center gap-2"><Watch className="h-4 w-4"/> {format(event.date, 'p')}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {event.location}</p>
                      <p className="flex items-center gap-2"><Shirt className="h-4 w-4"/> {event.attire}</p>
                    </div>
                  </div>
                  <div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {index < sortedEvents.length - 1 && <Separator className="my-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md"
            />
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Events this Month</span>
                    <span className="font-bold text-2xl text-primary">12</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rehearsals</span>
                    <span className="font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Services</span>
                    <span className="font-bold">4</span>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
