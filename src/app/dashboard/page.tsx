import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Megaphone, Calendar, MapPin, Watch, Shirt } from 'lucide-react';
import { announcements, events } from '@/lib/data';
import { format } from 'date-fns';

export default function DashboardPage() {
  const upcomingEvents = events.filter(e => e.date > new Date()).slice(0, 2);
  const recentAnnouncements = announcements.slice(0, 2);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-headline">Welcome, Singer!</h1>
        <p className="text-muted-foreground">
          Here is your summary for the week.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map((ann, index) => (
                <div key={ann.id}>
                  <div className="mb-2">
                    <h3 className="font-semibold">{ann.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(ann.createdAt), 'MMMM d, yyyy')} by {ann.author}
                  </p>
                  {index < recentAnnouncements.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={event.id}>
                  <div className="mb-2">
                     <h3 className="font-semibold">{event.title}</h3>
                     <p className="text-sm font-bold text-primary">{format(event.date, 'eeee, MMMM d')}</p>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Watch className="h-4 w-4"/> {format(event.date, 'p')}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {event.location}</p>
                    <p className="flex items-center gap-2"><Shirt className="h-4 w-4"/> {event.attire}</p>
                  </div>
                   {index < upcomingEvents.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
