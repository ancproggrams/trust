
'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { mockAppointments, mockClients } from '@/lib/mock-data';
import { Appointment } from '@/lib/types';
import { 
  formatDate, 
  formatDateTime, 
  generateId, 
  getAppointmentStatusColor,
  translateStatus,
  getInitials 
} from '@/lib/utils';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    location: '',
    status: 'scheduled' as Appointment['status'],
  });

  // Filter appointments based on search term and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort appointments by date
  const sortedAppointments = filteredAppointments.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const resetForm = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      location: '',
      status: 'scheduled',
    });
  };

  const handleAdd = () => {
    setIsAddDialogOpen(true);
    resetForm();
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const appointmentDate = new Date(appointment.date);
    setFormData({
      clientId: appointment.clientId,
      title: appointment.title,
      description: appointment.description || '',
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5),
      duration: appointment.duration.toString(),
      location: appointment.location || '',
      status: appointment.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formData.clientId || !formData.title || !formData.date || !formData.time) {
      alert('Vul alle verplichte velden in');
      return;
    }

    const client = mockClients.find(c => c.id === formData.clientId);
    if (!client) {
      alert('Selecteer een geldige klant');
      return;
    }

    const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);

    const newAppointment: Appointment = {
      id: generateId(),
      clientId: formData.clientId,
      clientName: client.name,
      title: formData.title,
      description: formData.description || undefined,
      date: appointmentDateTime,
      duration: parseInt(formData.duration),
      status: formData.status,
      location: formData.location || undefined,
      createdAt: new Date(),
    };

    setAppointments([...appointments, newAppointment]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleSaveEdit = () => {
    if (!selectedAppointment || !formData.clientId || !formData.title || !formData.date || !formData.time) {
      alert('Vul alle verplichte velden in');
      return;
    }

    const client = mockClients.find(c => c.id === formData.clientId);
    if (!client) {
      alert('Selecteer een geldige klant');
      return;
    }

    const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);

    const updatedAppointments = appointments.map(appointment =>
      appointment.id === selectedAppointment.id
        ? {
            ...appointment,
            clientId: formData.clientId,
            clientName: client.name,
            title: formData.title,
            description: formData.description || undefined,
            date: appointmentDateTime,
            duration: parseInt(formData.duration),
            status: formData.status,
            location: formData.location || undefined,
          }
        : appointment
    );

    setAppointments(updatedAppointments);
    setIsEditDialogOpen(false);
    setSelectedAppointment(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!selectedAppointment) return;

    const updatedAppointments = appointments.filter(appointment => appointment.id !== selectedAppointment.id);
    setAppointments(updatedAppointments);
    setIsDeleteDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleStatusChange = (appointment: Appointment, newStatus: Appointment['status']) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === appointment.id ? { ...apt, status: newStatus } : apt
    );
    setAppointments(updatedAppointments);
  };

  const isUpcoming = (date: Date) => {
    return date > new Date();
  };

  const isPast = (date: Date) => {
    return date < new Date();
  };

  return (
    <div className="space-y-8">
      <Header 
        title="Afspraken" 
        description={`Beheer je ${appointments.length} afspraken en planning`}
      />
      
      <div className="px-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek afspraken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter op status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="scheduled">Gepland</SelectItem>
              <SelectItem value="completed">Voltooid</SelectItem>
              <SelectItem value="cancelled">Geannuleerd</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Afspraak
          </Button>
        </div>

        {/* Appointments Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {sortedAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Afspraak</TableHead>
                    <TableHead>Klant</TableHead>
                    <TableHead>Datum & Tijd</TableHead>
                    <TableHead>Duur</TableHead>
                    <TableHead>Locatie</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {appointment.title}
                          </div>
                          {appointment.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-48">
                              {appointment.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(appointment.clientName)}
                          </div>
                          <div className="font-medium">{appointment.clientName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatDateTime(appointment.date)}
                          </div>
                          <div className={`text-xs ${
                            isUpcoming(appointment.date) 
                              ? 'text-blue-600' 
                              : isPast(appointment.date) 
                                ? 'text-gray-500' 
                                : 'text-green-600'
                          }`}>
                            {isUpcoming(appointment.date) 
                              ? 'Aankomend' 
                              : isPast(appointment.date) 
                                ? 'Voorbij' 
                                : 'Vandaag'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{appointment.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {appointment.location?.toLowerCase().includes('online') || 
                           appointment.location?.toLowerCase().includes('teams') || 
                           appointment.location?.toLowerCase().includes('zoom') ? (
                            <Video className="h-4 w-4 text-blue-500" />
                          ) : (
                            <MapPin className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-sm truncate max-w-32">
                            {appointment.location || 'Geen locatie'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={appointment.status}
                          onValueChange={(value: Appointment['status']) => 
                            handleStatusChange(appointment, value)
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <Badge
                              variant="secondary"
                              className={getAppointmentStatusColor(appointment.status)}
                            >
                              {translateStatus(appointment.status, 'appointment')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Gepland</SelectItem>
                            <SelectItem value="completed">Voltooid</SelectItem>
                            <SelectItem value="cancelled">Geannuleerd</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {appointment.status === 'scheduled' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(appointment, 'completed')}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Markeer als voltooid
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(appointment, 'cancelled')}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Annuleren
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Bewerken
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(appointment)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'Geen afspraken gevonden' : 'Nog geen afspraken'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Probeer je zoekfilters aan te passen'
                    : 'Plan je eerste afspraak om te beginnen'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Eerste Afspraak Plannen
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nieuwe Afspraak Plannen</DialogTitle>
            <DialogDescription>
              Plan een nieuwe afspraak met een klant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-client">Klant *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een klant" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-title">Titel *</Label>
              <Input
                id="add-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Project bespreking"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Beschrijving</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Bespreken van project voortgang..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-date">Datum *</Label>
                <Input
                  id="add-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-time">Tijd *</Label>
                <Input
                  id="add-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-duration">Duur (minuten)</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minuten</SelectItem>
                  <SelectItem value="60">1 uur</SelectItem>
                  <SelectItem value="90">1,5 uur</SelectItem>
                  <SelectItem value="120">2 uur</SelectItem>
                  <SelectItem value="180">3 uur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-location">Locatie</Label>
              <Input
                id="add-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Online via Teams / Kantoor Amsterdam"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveAdd}>
              Afspraak Plannen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Afspraak Bewerken</DialogTitle>
            <DialogDescription>
              Bewerk de details van deze afspraak
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-client">Klant *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een klant" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Project bespreking"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschrijving</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Bespreken van project voortgang..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Datum *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Tijd *</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duur (minuten)</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minuten</SelectItem>
                  <SelectItem value="60">1 uur</SelectItem>
                  <SelectItem value="90">1,5 uur</SelectItem>
                  <SelectItem value="120">2 uur</SelectItem>
                  <SelectItem value="180">3 uur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Locatie</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Online via Teams / Kantoor Amsterdam"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Appointment['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Gepland</SelectItem>
                  <SelectItem value="completed">Voltooid</SelectItem>
                  <SelectItem value="cancelled">Geannuleerd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveEdit}>
              Wijzigingen Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Afspraak Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de afspraak <strong>{selectedAppointment?.title}</strong> wilt verwijderen? 
              Deze actie kan niet ongedaan gemaakt worden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
