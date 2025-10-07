
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, Watch, Shirt, MoreVertical, Calendar as CalendarIcon, Trash, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Rehearsal, Service } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';


type TEvent = (Rehearsal | Service) & { type: 'rehearsal' | 'service' };

interface EventFormProps {
    type: 'rehearsal' | 'service';
    event?: TEvent;
    onSave: (e: React.FormEvent<HTMLFormElement>, type: 'rehearsal' | 'service', date?: Date) => void;
    onClose: () => void;
}

const EventForm = ({ type, event, onSave, onClose }: EventFormProps) => {
    const [date, setDate] = useState<Date | undefined>(event ? new Date(event.date) : new Date());

    return (
        <form onSubmit={(e) => onSave(e, type, date)} className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required defaultValue={event?.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <Label>Date</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                </div>
                <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" required defaultValue={event?.time} />
                </div>
            </div>
            <div>
                <Label htmlFor="location">{type === 'rehearsal' ? 'Location' : 'Church Location'}</Label>
                <Input id="location" name={type === 'rehearsal' ? 'location' : 'churchLocation'} required defaultValue={type === 'rehearsal' ? (event as Rehearsal)?.location : (event as Service)?.churchLocation} />
            </div>
            {type === 'service' && (
                <div>
                <Label htmlFor="attire">Attire</Label>
                <Input id="attire" name="attire" defaultValue={(event as Service)?.attire} />
                </div>
            )}
            <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={event?.notes} />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Event</Button>
            </DialogFooter>
        </form>
    );
  }


export default function SchedulePage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<TEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<TEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [rehearsalsRes, servicesRes] = await Promise.all([
        fetch('/api/rehearsals', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const rehearsals = await rehearsalsRes.json();
      const services = await servicesRes.json();

      const allEvents: TEvent[] = [
        ...rehearsals.map((r: Rehearsal) => ({ ...r, type: 'rehearsal' as 'rehearsal' })),
        ...services.map((s: Service) => ({ ...s, type: 'service' as 'service' })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setEvents(allEvents);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch schedule.' });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>, type: 'rehearsal' | 'service', date?: Date) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(formData.entries());
    
    if (date) {
        data = {...data, date: date.toISOString()};
    }

    const isEditing = !!selectedEvent;
    const endpoint = isEditing 
        ? `/api/secretary/${type}s/${selectedEvent.id}`
        : `/api/secretary/${type}s`;
    
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} ${type}`);

      toast({ title: 'Success', description: `Event ${isEditing ? 'updated' : 'created'} successfully.` });
      fetchEvents();
      setIsCreateOpen(false);
      setIsEditOpen(false);
      setSelectedEvent(null);
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !token) return;
    try {
        const response = await fetch(`/api/secretary/${selectedEvent.type}s/${selectedEvent.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
        toast({ title: 'Success', description: 'Event deleted successfully.' });
        fetchEvents();
        setIsDeleteOpen(false);
        setSelectedEvent(null);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };


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
          {user?.role === 'SECRETARY' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>Select the event type and fill in the details.</DialogDescription>
              </DialogHeader>
                <Tabs defaultValue="rehearsal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="rehearsal">Rehearsal</TabsTrigger>
                    <TabsTrigger value="service">Service</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rehearsal">
                      <ScrollArea className="max-h-[60vh] pr-4">
                        <EventForm type="rehearsal" onSave={handleEventSubmit} onClose={() => setIsCreateOpen(false)} />
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="service">
                       <ScrollArea className="max-h-[60vh] pr-4">
                        <EventForm type="service" onSave={handleEventSubmit} onClose={() => setIsCreateOpen(false)} />
                      </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
          </Dialog>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {isLoading && <p>Loading schedule...</p>}
            {!isLoading && events.length === 0 && <p>No upcoming events scheduled.</p>}
            {events.map((event, index) => (
              <div key={event.id}>
                <div className="flex items-start gap-4">
                  <div className="text-center w-16 shrink-0">
                    <p className="text-sm font-bold text-primary uppercase">{format(new Date(event.date), 'MMM')}</p>
                    <p className="text-3xl font-bold">{format(new Date(event.date), 'd')}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground mt-1">
                      <p className="flex items-center gap-2"><Watch className="h-4 w-4"/> {event.time}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {event.type === 'rehearsal' ? (event as Rehearsal).location : (event as Service).churchLocation}</p>
                      {event.type === 'service' && (event as Service).attire && <p className="flex items-center gap-2"><Shirt className="h-4 w-4"/> {(event as Service).attire}</p>}
                    </div>
                  </div>
                  {user?.role === 'SECRETARY' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setSelectedEvent(event); setIsEditOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedEvent(event); setIsDeleteOpen(true); }}>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {index < events.length - 1 && <Separator className="my-6" />}
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
              selected={selectedDate}
              onSelect={setSelectedDate}
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
                    <span className="text-muted-foreground">Total Events</span>
                    <span className="font-bold text-2xl text-primary">{events.length}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rehearsals</span>
                    <span className="font-bold">{events.filter(e => e.type === 'rehearsal').length}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Services</span>
                    <span className="font-bold">{events.filter(e => e.type === 'service').length}</span>
                </div>
            </CardContent>
        </Card>
      </div>

       {/* Edit Dialog */}
       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Edit {selectedEvent?.type}</DialogTitle>
                <DialogDescription>Update the details for this event.</DialogDescription>
              </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    {selectedEvent && (
                        <EventForm
                            type={selectedEvent.type}
                            event={selectedEvent}
                            onSave={handleEventSubmit}
                            onClose={() => { setIsEditOpen(false); setSelectedEvent(null); }}
                        />
                    )}
                </ScrollArea>
            </DialogContent>
       </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event
                        and all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedEvent(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEvent}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
