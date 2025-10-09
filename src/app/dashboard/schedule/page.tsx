'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, Watch, Shirt, MoreVertical, Calendar as CalendarIcon, Trash, Edit, X } from 'lucide-react';
import { format, isSameDay, isFuture } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Rehearsal, Service, ServiceType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { useForm, FormProvider } from 'react-hook-form';
import { t } from "@/utils/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type TEvent = (Rehearsal | Service) & { type: 'rehearsal' | 'service' };

interface EventFormProps {
    type: 'rehearsal' | 'service';
    event?: TEvent;
}

const EventForm = ({ type, event }: EventFormProps) => {
    const methods = useForm({
        defaultValues: {
            title: event?.title || '',
            date: event ? new Date(event.date) : new Date(),
            time: event?.time || '',
            location: type === 'rehearsal' ? (event as Rehearsal)?.location : '',
            churchLocation: type === 'service' ? (event as Service)?.churchLocation : '',
            attire: (event as Service)?.attire || '',
            notes: event?.notes || '',
            serviceType: type === 'service' ? (event as Service)?.serviceType : undefined,
        }
    });
    const [date, setDate] = useState<Date | undefined>(event ? new Date(event.date) : new Date());

    useEffect(() => {
        if (date) {
            methods.setValue('date', date);
        }
    }, [date, methods]);

    return (
        <FormProvider {...methods}>
            <form id={`event-form-${type}`} onSubmit={methods.handleSubmit(() => {})} className="space-y-4">
                <input type="hidden" {...methods.register('date')} value={date?.toISOString()} />
                <div>
                    <Label htmlFor="title">{t("eventForm.title")}</Label>
                    <Input id="title" {...methods.register('title')} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <Label>{t("eventForm.date")}</Label>
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
                            {date ? format(date, "PPP") : <span>{t("eventForm.pickDate")}</span>}
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
                    <Label htmlFor="time">{t("eventForm.time")}</Label>
                    <Input id="time" type="time" {...methods.register('time')} required />
                    </div>
                </div>
                <div>
                    <Label htmlFor="location">{type === 'rehearsal' ? t("eventForm.location") : t("eventForm.churchLocation")}</Label>
                    <Input id="location" {...methods.register(type === 'rehearsal' ? 'location' : 'churchLocation')} required />
                </div>
                {type === 'service' && (
                    <>
                        <div>
                            <Label htmlFor="serviceType">{t("eventForm.serviceType")}</Label>
                            <Select onValueChange={(value) => methods.setValue('serviceType', value as ServiceType)} defaultValue={methods.getValues('serviceType')}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("eventForm.selectServiceType")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Amateraniro ya 1">Amateraniro ya 1</SelectItem>
                                    <SelectItem value="Amateraniro ya 2">Amateraniro ya 2</SelectItem>
                                    <SelectItem value="Amateraniro ya 3">Amateraniro ya 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="attire">{t("eventForm.attire")}</Label>
                            <Input id="attire" {...methods.register('attire')} />
                        </div>
                    </>
                )}
                <div>
                    <Label htmlFor="notes">{t("eventForm.notes")}</Label>
                    <Textarea id="notes" {...methods.register('notes')} />
                </div>
            </form>
        </FormProvider>
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'rehearsal' | 'service'>('rehearsal');

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [rehearsalsRes, servicesRes] = await Promise.all([
        fetch('/api/secretary/rehearsals', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/secretary/services', { headers: { 'Authorization': `Bearer ${token}` } }),
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

  const filteredEvents = useMemo(() => {
    if (!selectedDate) {
        return events.filter(e => isFuture(new Date(e.date)) || isSameDay(new Date(e.date), new Date()));
    }
    return events.filter(event => isSameDay(new Date(event.date), selectedDate));
  }, [events, selectedDate]);
  
  const handleEventSubmit = async (formData: any) => {
    const isEditing = !!selectedEvent;
    const endpointType = isEditing ? selectedEvent.type : activeTab;

    const endpoint = isEditing 
        ? `/api/secretary/${endpointType}s/${selectedEvent.id}`
        : `/api/secretary/${endpointType}s`;
    
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} ${endpointType}`);

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
            <h1 className="text-3xl font-headline">{t("schedulePage.title")}</h1>
            <p className="text-muted-foreground">
              {t("schedulePage.description")}
            </p>
          </div>
          {user?.role === 'SECRETARY' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> {t("schedulePage.createEvent")}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("schedulePage.createDialogTitle")}</DialogTitle>
                    <DialogDescription>{t("schedulePage.createDialogDesc")}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="rehearsal" className="w-full" onValueChange={(value) => setActiveTab(value as 'rehearsal' | 'service')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rehearsal">{t("eventForm.rehearsal")}</TabsTrigger>
                        <TabsTrigger value="service">{t("eventForm.service")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="rehearsal">
                        <ScrollArea className="h-[60vh] pr-4">
                           <EventForm type="rehearsal" />
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="service">
                       <ScrollArea className="h-[60vh] pr-4">
                           <EventForm type="service" />
                       </ScrollArea>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>{t("schedulePage.cancel")}</Button>
                    <Button 
                        type="button"
                        onClick={async () => {
                            const form = document.getElementById(`event-form-${activeTab}`) as HTMLFormElement;
                            const formMethods = useForm().control._formValues;
                            const isValid = await (formMethods.trigger && formMethods.trigger());
                            if (isValid) {
                                handleEventSubmit(formMethods.getValues());
                            }
                        }}
                    >{t("schedulePage.saveEvent")}</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>
                          {selectedDate 
                            ? t("schedulePage.eventsOn").replace("{date}", format(selectedDate, 'PPP')) 
                            : t("schedulePage.upcomingEvents")}
                        </CardTitle>
                    </div>
                    {selectedDate && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
                            <X className="mr-2 h-4 w-4" />
                            {t("schedulePage.clearFilter")}
                        </Button>
                    )}
                </div>
            </CardHeader>
          <CardContent className="space-y-6">
             {isLoading && <p>{t("schedulePage.loading")}</p>}
            {!isLoading && filteredEvents.length === 0 && <p className="text-muted-foreground">{selectedDate ? t("schedulePage.noEventsDay") : t("schedulePage.noUpcomingEvents")}</p>}
            {filteredEvents.map((event, index) => (
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
                      {event.type === 'service' && (event as Service).serviceType && <p>{(event as Service).serviceType}</p>}
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
                            <DropdownMenuLabel>{t("schedulePage.actions")}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setSelectedEvent(event); setIsEditOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>{t("schedulePage.edit")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedEvent(event); setIsDeleteOpen(true); }}>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>{t("schedulePage.delete")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {index < filteredEvents.length - 1 && <Separator className="my-6" />}
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
                <CardTitle>{t("schedulePage.quickStats")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("schedulePage.totalEvents")}</span>
                    <span className="font-bold text-2xl text-primary">{events.length}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("schedulePage.rehearsals")}</span>
                    <span className="font-bold">{events.filter(e => e.type === 'rehearsal').length}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("schedulePage.services")}</span>
                    <span className="font-bold">{events.filter(e => e.type === 'service').length}</span>
                </div>
            </CardContent>
        </Card>
      </div>

       {/* Edit Dialog */}
       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("schedulePage.editDialogTitle").replace("{type}", selectedEvent?.type || "")}
                </DialogTitle>
                <DialogDescription>{t("schedulePage.editDialogDesc")}</DialogDescription>
              </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                    {selectedEvent && (
                        <EventForm
                            type={selectedEvent.type}
                            event={selectedEvent}
                        />
                    )}
                </ScrollArea>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => { setIsEditOpen(false); setSelectedEvent(null); }}>{t("schedulePage.cancel")}</Button>
                     <Button 
                        type="button" 
                        onClick={async () => {
                            const form = document.getElementById(`event-form-${selectedEvent?.type}`) as HTMLFormElement;
                            const formMethods = useForm().control._formValues;
                            const isValid = await (formMethods.trigger && formMethods.trigger());
                            if (isValid) {
                                handleEventSubmit(formMethods.getValues());
                            }
                        }}
                     >{t("schedulePage.saveChanges")}</Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("schedulePage.areYouSure")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("schedulePage.deleteDesc")}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedEvent(null)}>{t("schedulePage.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEvent}>{t("schedulePage.deleteConfirm")}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
