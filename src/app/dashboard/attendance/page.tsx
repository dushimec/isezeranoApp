import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch';
import { users, events } from '@/lib/data';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function AttendancePage() {
  // We'll track attendance for the first event for this demo
  const eventToTrack = events[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-headline">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Mark attendance for rehearsals and services.
          </p>
        </div>
        <Button>Save Attendance</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                Select an event and mark who is present.
              </CardDescription>
            </div>
            <div className="w-full md:w-72">
               <Select defaultValue={eventToTrack.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} - {format(event.date, 'MMM d, yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Singer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Present</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.filter(u => u.role === 'Singer').map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={user.avatar}
                        width={40}
                        height={40}
                        alt={user.name}
                        className="rounded-full"
                        data-ai-hint="person portrait"
                      />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell className="text-right">
                    <Switch
                      id={`attendance-${user.id}`}
                      defaultChecked={Math.random() > 0.2} // Randomly check some users
                      aria-label={`Mark ${user.name} as present`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
