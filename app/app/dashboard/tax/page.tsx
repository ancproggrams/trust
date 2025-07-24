

'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Receipt, 
  Plus, 
  Calculator, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  TrendingUp,
  FileText,
  CreditCard,
  PiggyBank
} from 'lucide-react';
import { 
  mockBTWRecords,
  mockTaxReservations,
  mockTaxSettings,
  getBTWRecordsByQuarter,
  getTaxReservationsByYear,
  getCurrentQuarterBTW,
  getTotalBTWOwed,
  getTotalBTWPrepaid,
  getTotalTaxReserved
} from '@/lib/mock-data';
import { BTWRecord, TaxReservation } from '@/lib/types';
import { 
  formatCurrency, 
  formatDate, 
  getBTWStatusColor,
  getTaxReservationStatusColor,
  translateBTWStatus,
  translateTaxReservationStatus,
  getBTWQuarter,
  getNextBTWDeadline
} from '@/lib/utils';

export default function TaxPage() {
  const [btwRecords, setBTWRecords] = useState<BTWRecord[]>(mockBTWRecords);
  const [taxReservations, setTaxReservations] = useState<TaxReservation[]>(mockTaxReservations);
  const [selectedQuarter, setSelectedQuarter] = useState<string>(getBTWQuarter(new Date()));
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedBTWRecord, setSelectedBTWRecord] = useState<BTWRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Calculate stats
  const totalBTWOwed = getTotalBTWOwed();
  const totalBTWPrepaid = getTotalBTWPrepaid();
  const totalTaxReserved = getTotalTaxReserved();
  const currentQuarterBTW = getCurrentQuarterBTW();
  
  // Get quarters for dropdown
  const availableQuarters = Array.from(new Set(btwRecords.map(record => record.quarter))).sort();
  const availableYears = Array.from(new Set(taxReservations.map(reservation => reservation.year))).sort().reverse();

  // Filter records
  const quarterBTWRecords = getBTWRecordsByQuarter(selectedQuarter);
  const yearTaxReservations = getTaxReservationsByYear(selectedYear);

  // Get upcoming deadlines
  const upcomingDeadlines = btwRecords
    .filter(record => record.status === 'pending' || record.status === 'reserved')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  const handleBTWPayment = (record: BTWRecord) => {
    setSelectedBTWRecord(record);
    setPaymentAmount(record.btwAmount.toString());
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedBTWRecord) return;

    const updatedRecords = btwRecords.map(record =>
      record.id === selectedBTWRecord.id
        ? { ...record, status: 'paid' as const, paidDate: new Date() }
        : record
    );

    setBTWRecords(updatedRecords);
    setIsPaymentDialogOpen(false);
    setSelectedBTWRecord(null);
    setPaymentAmount('');
  };

  const handlePrePayment = (amount: number) => {
    const newRecord: BTWRecord = {
      id: `prepay-${Date.now()}`,
      invoiceId: '',
      amount: 0,
      btwAmount: amount,
      btwRate: 0,
      status: 'prepaid',
      quarter: selectedQuarter,
      dueDate: getNextBTWDeadline(selectedQuarter),
      paidDate: new Date(),
      createdAt: new Date(),
    };

    setBTWRecords([...btwRecords, newRecord]);
  };

  return (
    <div className="space-y-8">
      <Header 
        title="BTW & Belasting Beheer" 
        description="Beheer je BTW verplichtingen en belasting reserveringen"
      />
      
      <div className="px-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">BTW Openstaand</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBTWOwed)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentQuarterBTW.length} facturen dit kwartaal
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">BTW Vooruitbetaald</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBTWPrepaid)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dit kwartaal
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Belasting Gereserveerd</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalTaxReserved)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Voor jaaraangifte
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="btw-overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="btw-overview">BTW Overzicht</TabsTrigger>
            <TabsTrigger value="prepayments">Vooruitbetalingen</TabsTrigger>
            <TabsTrigger value="reservations">Reserveringen</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          </TabsList>

          {/* BTW Overview Tab */}
          <TabsContent value="btw-overview" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">BTW per Kwartaal</CardTitle>
                <div className="flex items-center space-x-4">
                  <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableQuarters.map((quarter) => (
                        <SelectItem key={quarter} value={quarter}>
                          {quarter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {quarterBTWRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Factuur</TableHead>
                        <TableHead>BTW Bedrag</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vervaldatum</TableHead>
                        <TableHead>Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quarterBTWRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="font-medium">
                              {record.invoiceId ? `Factuur ${record.invoiceId}` : 'Vooruitbetaling'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {record.quarter}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(record.btwAmount)}
                            </div>
                            {record.btwRate > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {record.btwRate}% over {formatCurrency(record.amount)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={getBTWStatusColor(record.status)}
                            >
                              {translateBTWStatus(record.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(record.dueDate)}
                            </div>
                            {record.paidDate && (
                              <div className="text-xs text-muted-foreground">
                                Betaald: {formatDate(record.paidDate)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {(record.status === 'pending' || record.status === 'reserved') && (
                              <Button
                                size="sm"
                                onClick={() => handleBTWPayment(record)}
                              >
                                <Euro className="h-4 w-4 mr-1" />
                                Betalen
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Geen BTW records voor {selectedQuarter}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prepayments Tab */}
          <TabsContent value="prepayments" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">BTW Vooruitbetalingen</CardTitle>
                <Button onClick={() => setIsReservationDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Vooruitbetaling Doen
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <PiggyBank className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Kwartaal Vooruitbetaling</p>
                        <p className="text-sm text-blue-700">
                          Standaard vooruitbetaling: {formatCurrency(mockTaxSettings.btwPrepaymentAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periode</TableHead>
                        <TableHead>Bedrag</TableHead>
                        <TableHead>Datum Betaald</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {btwRecords
                        .filter(record => record.status === 'prepaid')
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="font-medium">{record.quarter}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(record.btwAmount)}</div>
                            </TableCell>
                            <TableCell>
                              {record.paidDate && formatDate(record.paidDate)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={getBTWStatusColor(record.status)}>
                                {translateBTWStatus(record.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">Omzetbelasting Reserveringen</CardTitle>
                <div className="flex items-center space-x-4">
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calculator className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Jaarlijkse Reservering</p>
                          <p className="text-sm text-green-700">
                            {mockTaxSettings.taxReservationRate}% van omzet wordt automatisch gereserveerd
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-900">
                          {formatCurrency(yearTaxReservations.reduce((sum, res) => sum + res.amount, 0))}
                        </p>
                        <p className="text-sm text-green-700">Totaal {selectedYear}</p>
                      </div>
                    </div>
                  </div>

                  {yearTaxReservations.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Factuur</TableHead>
                          <TableHead>Gereserveerd Bedrag</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Datum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {yearTaxReservations.map((reservation) => (
                          <TableRow key={reservation.id}>
                            <TableCell>
                              <div className="font-medium">Factuur {reservation.invoiceId}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatCurrency(reservation.amount)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{reservation.reservationRate}%</div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={getTaxReservationStatusColor(reservation.status)}
                              >
                                {translateTaxReservationStatus(reservation.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(reservation.createdAt)}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Geen reserveringen voor {selectedYear}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deadlines Tab */}
          <TabsContent value="deadlines" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Aankomende Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((record) => {
                      const isOverdue = record.dueDate < new Date();
                      const daysUntilDue = Math.ceil((record.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div
                          key={record.id}
                          className={`p-4 rounded-lg border ${
                            isOverdue
                              ? 'bg-red-50 border-red-200'
                              : daysUntilDue <= 7
                              ? 'bg-orange-50 border-orange-200'
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isOverdue ? (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              ) : daysUntilDue <= 7 ? (
                                <Clock className="h-5 w-5 text-orange-600" />
                              ) : (
                                <Calendar className="h-5 w-5 text-blue-600" />
                              )}
                              <div>
                                <p className="font-medium">
                                  BTW {record.quarter} - {formatCurrency(record.btwAmount)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {isOverdue
                                    ? `${Math.abs(daysUntilDue)} dagen te laat`
                                    : daysUntilDue === 0
                                    ? 'Vandaag vervallen'
                                    : `${daysUntilDue} dagen resterend`
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatDate(record.dueDate)}</p>
                              <Button
                                size="sm"
                                variant={isOverdue ? "destructive" : "default"}
                                onClick={() => handleBTWPayment(record)}
                              >
                                <Euro className="h-4 w-4 mr-1" />
                                Betalen
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium text-green-600">Geen openstaande deadlines!</p>
                      <p className="text-muted-foreground">Alle BTW verplichtingen zijn up-to-date</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>BTW Betaling</DialogTitle>
            <DialogDescription>
              Bevestig de BTW betaling voor {selectedBTWRecord?.quarter}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Bedrag</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Periode:</span>
                  <span className="font-medium">{selectedBTWRecord?.quarter}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vervaldatum:</span>
                  <span className="font-medium">
                    {selectedBTWRecord && formatDate(selectedBTWRecord.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Te betalen:</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(paymentAmount) || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleConfirmPayment}>
              <Euro className="h-4 w-4 mr-2" />
              Betaling Bevestigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prepayment Dialog */}
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>BTW Vooruitbetaling</DialogTitle>
            <DialogDescription>
              Doe een BTW vooruitbetaling voor het huidige kwartaal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Kwartaal:</span>
                  <span className="font-medium">{selectedQuarter}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standaard bedrag:</span>
                  <span className="font-medium">
                    {formatCurrency(mockTaxSettings.btwPrepaymentAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReservationDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={() => {
              handlePrePayment(mockTaxSettings.btwPrepaymentAmount);
              setIsReservationDialogOpen(false);
            }}>
              <PiggyBank className="h-4 w-4 mr-2" />
              Vooruitbetaling Doen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
