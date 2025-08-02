"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, Filter, TrendingUp } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Mock data
const reportTypes = [
  { value: "all", label: "All Types" },
  { value: "sales", label: "Sales Reports" },
  { value: "marketing", label: "Marketing Reports" },
  { value: "financial", label: "Financial Reports" },
  { value: "operational", label: "Operational Reports" },
]

const chartData = [
  { date: "2024-01-01", sales: 45, marketing: 32, financial: 28, operational: 15 },
  { date: "2024-01-02", sales: 52, marketing: 28, financial: 35, operational: 18 },
  { date: "2024-01-03", sales: 48, marketing: 35, financial: 32, operational: 22 },
  { date: "2024-01-04", sales: 61, marketing: 42, financial: 28, operational: 25 },
  { date: "2024-01-05", sales: 55, marketing: 38, financial: 45, operational: 19 },
  { date: "2024-01-06", sales: 67, marketing: 45, financial: 38, operational: 28 },
  { date: "2024-01-07", sales: 59, marketing: 41, financial: 42, operational: 31 },
]

const reportsData = [
  {
    id: "RPT-001",
    title: "Q4 Sales Performance",
    type: "sales",
    status: "completed",
    createdAt: "2024-01-07",
    views: 245,
    downloads: 12,
  },
  {
    id: "RPT-002",
    title: "Marketing Campaign Analysis",
    type: "marketing",
    status: "in-progress",
    createdAt: "2024-01-06",
    views: 189,
    downloads: 8,
  },
  {
    id: "RPT-003",
    title: "Financial Summary 2024",
    type: "financial",
    status: "completed",
    createdAt: "2024-01-05",
    views: 312,
    downloads: 25,
  },
  {
    id: "RPT-004",
    title: "Operational Efficiency Report",
    type: "operational",
    status: "draft",
    createdAt: "2024-01-04",
    views: 67,
    downloads: 3,
  },
  {
    id: "RPT-005",
    title: "Customer Acquisition Report",
    type: "marketing",
    status: "completed",
    createdAt: "2024-01-03",
    views: 198,
    downloads: 15,
  },
]

export default function Component() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [selectedType, setSelectedType] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sales":
        return "bg-purple-100 text-purple-800"
      case "marketing":
        return "bg-orange-100 text-orange-800"
      case "financial":
        return "bg-emerald-100 text-emerald-800"
      case "operational":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter reports based on selected type
  const filteredReports =
    selectedType === "all" ? reportsData : reportsData.filter((report) => report.type === selectedType)

  // Calculate stats
  const totalReports = filteredReports.length
  const totalViews = filteredReports.reduce((sum, report) => sum + report.views, 0)
  const totalDownloads = filteredReports.reduce((sum, report) => sum + report.downloads, 0)
  const completedReports = filteredReports.filter((report) => report.status === "completed").length

  useEffect(()=>{
    console.log(dateRange)
  },[dateRange])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/40">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Report Statistics</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Report Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
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
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDownloads}</div>
              <p className="text-xs text-muted-foreground">+23% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReports}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((completedReports / totalReports) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Report Trends
            </CardTitle>
            <CardDescription>Daily report generation over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sales: {
                  label: "Sales",
                  color: "hsl(var(--chart-1))",
                },
                marketing: {
                  label: "Marketing",
                  color: "hsl(var(--chart-2))",
                },
                financial: {
                  label: "Financial",
                  color: "hsl(var(--chart-3))",
                },
                operational: {
                  label: "Operational",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), "MMM dd")} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stackId="1"
                    stroke="var(--color-sales)"
                    fill="var(--color-sales)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="marketing"
                    stackId="1"
                    stroke="var(--color-marketing)"
                    fill="var(--color-marketing)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="financial"
                    stackId="1"
                    stroke="var(--color-financial)"
                    fill="var(--color-financial)"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="operational"
                    stackId="1"
                    stroke="var(--color-operational)"
                    fill="var(--color-operational)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>A list of your recent reports with their statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Downloads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-muted-foreground">{report.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(report.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">{report.views}</TableCell>
                    <TableCell className="text-right">{report.downloads}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
