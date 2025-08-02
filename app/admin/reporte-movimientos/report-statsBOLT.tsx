'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MKButton } from '@/components/shared/MKButton';
import Link from 'next/link'

import { 
  CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
//   Users, 
  FileText, 
  Download,
  Filter,
  Search,
  BarChart3,
//   PieChart,
  Activity,
  FolderPlus
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn, formatDateTime, formatCurrency } from '@/lib/utils';
import { createNewReport, getAllReports } from '@/lib/actions/reports.actions'
import { IReportInput } from '@/lib/validator';

// Mock data for demonstration
const mockReports = [
  {
    id: 1,
    type: 'sales',
    title: 'Q4 Sales Performance',
    status: 'completed',
    date: new Date('2024-01-15'),
    value: 125000,
    growth: 12.5,
    author: 'John Smith'
  },
  {
    id: 2,
    type: 'marketing',
    title: 'Campaign ROI Analysis',
    status: 'in-progress',
    date: new Date('2024-01-10'),
    value: 45000,
    growth: -3.2,
    author: 'Sarah Johnson'
  },
  {
    id: 3,
    type: 'operations',
    title: 'Operational Efficiency Report',
    status: 'completed',
    date: new Date('2024-01-08'),
    value: 89000,
    growth: 8.7,
    author: 'Mike Davis'
  },
  {
    id: 4,
    type: 'finance',
    title: 'Budget vs Actual Analysis',
    status: 'in-progress',
    date: new Date('2024-01-05'),
    value: 210000,
    growth: 15.3,
    author: 'Emma Wilson'
  },
  {
    id: 5,
    type: 'sales',
    title: 'Regional Sales Breakdown',
    status: 'completed', 
    date: new Date('2024-01-03'),
    value: 78000,
    growth: 6.8,
    author: 'Alex Brown'
  }
];

const reportTypes = [
  { value: 'all', label: 'Todos' },
  { value: 'sales', label: 'Ventas' },
  { value: 'order-received', label: 'Ordenes de compra' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operaciones' },
  { value: 'finance', label: 'Finanzas' }
];

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Completado' },
  { value: 'in-progress', label: 'En Progreso' },
];

export default function ReportsPage() {
  const [isPending, startTransition] = useTransition()
  
  const [showCreateNewReport, setShowCreateNewReport] = useState(false)
  const [reports, setReports] = useState(mockReports);
  const [filteredReports, setFilteredReports] = useState(mockReports);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subDays(new Date('2021-01-15'), 1),
    to: new Date()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [nameNewReport, setNameNewReport] = useState('');
  const [dateRangeForNew, setDateRangeForNew] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subDays(new Date('2025-01-15'), 1),
    to: new Date()
  });


  // Filter reports based on criteria
  useEffect(() => {
    let filtered = reports;
    console.log('fil',filtered)
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= startOfDay(dateRange.from!) && reportDate <= endOfDay(dateRange.to!);
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) 
        // ||
        // report.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [reports, selectedType, selectedStatus, dateRange, searchTerm]);

  // Calculate summary statistics
  const totalReports = filteredReports.length;
  const totalValue = filteredReports.reduce((sum, report) => sum + report.allTotalValue, 0);
  const avgGrowth = filteredReports.reduce((sum, report) => sum + report.growth, 0) / filteredReports.length || 0;
  const completedReports = filteredReports.filter(report => report.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales': return 'bg-purple-100 text-purple-800';
      case 'marketing': return 'bg-orange-100 text-orange-800';
      case 'operations': return 'bg-teal-100 text-teal-800';
      case 'finance': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateNewReport = () => {
    // console.log('dateRANGE', dateRangeForNew)
    const queryData = {
      title: nameNewReport,
      status: selectedStatus,
      type: selectedType,
      dateRange: dateRangeForNew
    }
    createNewReport(queryData)
  }
  const handleCancelNewReport = () => {
    setNameNewReport('')
    setSelectedStatus('all')
    setSelectedType('all')
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date()
    })
    setShowCreateNewReport(false)
  }

  const getAllReportsData = async () => {
    const reportes = await getAllReports()
    return reportes
  }

  useEffect(()=> {
    // const data = getAllReportsData()
    // console.log('saved',data)
    startTransition(async () => {
          const { reportes } = await getAllReportsData()
          // setData(data)
          console.log('dataSaved', reportes)
          setReports(reportes)

        })
  }, [])

  console.log(filteredReports)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reporte de Movimientos</h1>
            {/* <p className="text-gray-600 mt-2">Analiza con reportes de comportamiento de áreas.</p> */}
          </div>
          <div className='flex items-center'>
            {
                !showCreateNewReport && (
                    <div className='mr-5'>
                        <div className='underline hover:cursor-pointer hover:no-underline' onClick={()=> setShowCreateNewReport(true)}>
                            <h3 className='font-bold flex '>Crear nuevo reporte <FolderPlus className=''/></h3>
                        </div>
                    </div>
                )
            }
            <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Exportar Datos
            </Button>
          </div>
            
        </div>
        
        {/* Create new */}
        {
            showCreateNewReport && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className='flex'>
                  <div className='mr-5'>
                        <div className=''>
                            <h3 className='font-bold flex '>Crear nuevo reporte <FolderPlus className='ml-1'/></h3>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="search">Nombre del Reporte</Label>
                      <div className="relative">
                        <Input
                          id="reportName"
                          placeholder="Escribe un nombre para nuevo reporte"
                          value={nameNewReport}
                          onChange={(e) => setNameNewReport(e.target.value)}
                          className="pl-5"
                        />
                      </div>
                    </div>
      
                    {/* Type Filter */}
                    <div className="space-y-2">
                      <Label>Tipo de Reporte</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
      
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
      
                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label>Rango de fechas</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRangeForNew.from ? (
                              dateRangeForNew.to ? (
                                <>
                                  {format(dateRangeForNew.from, "LLL dd, y")} -{" "}
                                  {format(dateRangeForNew.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRangeForNew.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Elige rango de fechas</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRangeForNew.from}
                            selected={dateRangeForNew}
                            onSelect={(range) => setDateRangeForNew(range || { from: undefined, to: undefined })}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
                <div>
                  <div className='flex flex-col items-center'>
                    <MKButton onClick={handleGenerateNewReport}>
                      Generar nuevo reporte
                    </MKButton>
                    <p onClick={handleCancelNewReport} className='flex justify-center text-lg underline hover:cursor-pointer hover:no-underline mt-2'>Cancelar</p>
                  </div>
                </div>
                  
              </Card>
            )
        }
        {
            !showCreateNewReport && (
                <section className='space-y-8'>
                    {/* Filters */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label htmlFor="search">Buscar</Label>
                            <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="search"
                                placeholder="Buscar por titulo de reporte..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="space-y-2">
                            <Label>Tipo de Reporte</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {reportTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <Label>Creacion de reporte en rango de fechas</Label>
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange.from && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                    ) : (
                                    format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Elige rango de fechas</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange.from}
                                selected={dateRange}
                                onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                                numberOfMonths={2}
                                />
                            </PopoverContent>
                            </Popover>
                        </div>
                        </div>
                    </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de  Reportes</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{totalReports}</div>
                        <p className="text-xs text-blue-600">
                            {completedReports} completados
                        </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                        <BarChart3 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold text-green-700">
                            ${totalValue.toLocaleString()}
                        </div>
                        <p className="text-xs text-green-600">
                            Across all reports
                        </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Growth</CardTitle>
                        {avgGrowth >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-purple-600" />
                        )}
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold text-purple-700">
                            {avgGrowth.toFixed(1)}%
                        </div>
                        <p className="text-xs text-purple-600">
                            {avgGrowth >= 0 ? 'Positive trend' : 'Negative trend'}
                        </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <Activity className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold text-orange-700">
                            {totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0}%
                        </div>
                        <p className="text-xs text-orange-600">
                            Reports completed
                        </p>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Reports Table */}
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Detalle de Reportes</CardTitle>
                        <CardDescription>
                            Vista de detalle de todos los reportes generados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className='font-bold'>Reporte</TableHead>
                                <TableHead className='font-bold'>Tipo</TableHead>
                                <TableHead className='font-bold'>Status</TableHead>
                                <TableHead className='font-bold'>Fecha de Creación</TableHead>
                                <TableHead className='font-bold'>Valor</TableHead>
                                <TableHead className='font-bold'>Creciemiento</TableHead>
                                <TableHead className='text-center font-bold'>Acciones</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {filteredReports.map((report) => (
                                <TableRow key={report.id} className="hover:bg-gray-50 transition-colors">
                                <TableCell className="font-medium">{report.title}</TableCell>
                                <TableCell>
                                    <Badge className={getTypeColor(report.type)}>
                                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(report.status)}>
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell>{formatDateTime(report.createdAt).dateOnly}</TableCell>
                                <TableCell>{formatCurrency(report.allTotalValue)}</TableCell>
                                <TableCell>
                                    <div className={cn(
                                    "flex items-center gap-1",
                                    report.growth >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                    {report.growth >= 0 ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {Math.abs(report.growth).toFixed(1)}%
                                    </div>
                                </TableCell>
                                <TableCell className='flex justify-center'>
                                  <Link href={`/admin/reporte-movimientos/${report._id}`}>
                                    <Button  className='mr-2' variant="outline" size='sm'>Ver</Button>
                                  </Link>
                                  <Button  size='sm'>Eliminar</Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                        {filteredReports.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No hay reportes con filtros elegidos</p>
                        </div>
                        )}
                    </CardContent>
                    </Card>
                </section>
            )
        }
        
        
      </div>
    </div>
  );
}