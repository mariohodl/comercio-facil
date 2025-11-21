// "use client"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getReportById } from '@/lib/actions/reports.actions'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Filter,
  Package,
  TrendingUp,
  Download,
  Share,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Tipos de datos para el reporte
interface ReportItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category?: string
  sku?: string
}

interface Product {
  id: string
  name: string
  category: string
  listPrice: number
  stock: number
}



// Datos de ejemplo


const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "failed":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "sales":
      return <TrendingUp className="h-4 w-4" />
    case "inventory":
      return <Package className="h-4 w-4" />
    case "financial":
      return <DollarSign className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

export default async function ReportItemView(props) {
  const params = await props.params
  const { id } = params
  const report = await getReportById(id)
  // if(report) {
  //   reportData = report
  // }
  console.log('REPORT', report)
  if (!report) notFound()
  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat("es-ES", {
  //     style: "currency",
  //     currency: "EUR",
  //   }).format(amount)
  // }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={'/admin/reporte-movimientos'}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <div>
              <div className="flex items-center gap-3 mb-1">
                {/* {getTypeIcon(reportData.type)} */}
                <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                <Badge className={getStatusColor(report.status)}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {report.dateRangeFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicar reporte</DropdownMenuItem>
                <DropdownMenuItem>Programar envío</DropdownMenuItem>
                <DropdownMenuItem>Configurar alertas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.allTotalValue)}</div>
              <p className="text-xs text-muted-foreground">+12.5% desde el período anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subtotal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.allSubTotalValue)}</div>
              <p className="text-xs text-muted-foreground">Base antes de impuestos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.productsCount}</div>
              <p className="text-xs text-muted-foreground">Total de productos únicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items del Reporte</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.reportItems.length}</div>
              <p className="text-xs text-muted-foreground">Elementos en este reporte</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items del reporte */}
            <Card>
              <CardHeader>
                <CardTitle>Items del Reporte</CardTitle>
                <CardDescription>Detalle de todos los elementos incluidos en este reporte</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      {/* <TableHead className="text-right">Total</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.allProducts.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.category && <div className="text-sm text-muted-foreground">{item.category}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.category}</TableCell>
                        <TableCell className="text-right">{item.countInStock}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        {/* <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Resumen de productos */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Productos Relacionados</CardTitle>
                <CardDescription>Vista general de productos en el catálogo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.allProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(product.price)}</div>
                        <div className="text-sm text-muted-foreground">Stock: {product.stock}</div>
                      </div>
                    </div>
                  ))}
                  {report.allProducts.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        Ver todos los productos ({report.allProducts.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información del reporte */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(report.type)}
                    <span className="capitalize">{report.type}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Período</label>
                  <div className="mt-1">
                    <div className="text-sm">{report.dateRangeFormatted}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(report.dateRange.from).toLocaleDateString()} - {new Date(report.dateRange.to).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtros aplicados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros Aplicados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.filtersUsed && report.filtersUsed.length > 0 ? (
                    // @ts-expect-error
                    report.filtersUsed.map((filter, index) => (
                      <Badge key={index} variant="secondary" className="block w-fit">
                        {filter.toString()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No se aplicaron filtros</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumen financiero */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm font-medium">{formatCurrency(report.allSubTotalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Impuestos:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(report.allTotalValue - report.allSubTotalValue)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">{formatCurrency(report.allTotalValue)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
