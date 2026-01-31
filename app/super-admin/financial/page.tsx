'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Banknote, PieChart, Download, RefreshCw, Building, AlertTriangle, CheckCircle, BarChart3, LineChart as LineChartIcon, Filter } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";

import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  bookingCount: number;
  averageBookingValue: number;
}

interface DailyData {
  date: string;
  revenue: number;
  expenses: number;
  bookings: number;
  profit: number;
}

interface WeeklyData {
  week: string;
  revenue: number;
  expenses: number;
  bookings: number;
  profit: number;
}

interface BranchFinancial {
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  bookings: number;
  avgBookingValue: number;
  status: 'profitable' | 'break-even' | 'loss';
}

export default function SuperAdminFinancial() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [reportType, setReportType] = useState('overview');
  const [filterBranch, setFilterBranch] = useState('all');
  const [searchPayment, setSearchPayment] = useState('');
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [branchData, setBranchData] = useState<BranchFinancial[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Helper function to get date range based on timeRange
  const getDateRange = (range: string) => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }
    
    return { start, end };
  };

  // Helper to format week label
  const getWeekLabel = (date: Date): string => {
    const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `W${weekNum} ${monthNames[date.getMonth()]}`;
  };

  // Fetch real-time financial data from Firebase
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const { start, end } = getDateRange(timeRange);

        // Fetch all bookings within the date range
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsRef,
          where('bookingDate', '>=', start.toISOString().split('T')[0]),
          where('bookingDate', '<=', end.toISOString().split('T')[0])
        );

        const bookingDocs = await getDocs(bookingsQuery);
        const bookings = bookingDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate total revenue from all bookings
        const totalRevenue = bookings.reduce((sum, booking: any) => {
          return sum + (booking.totalPrice || 0);
        }, 0);

        // Fetch all expenses
        const expensesRef = collection(db, 'expenses');
        const expensesQuery = query(
          expensesRef,
          where('date', '>=', start.toISOString().split('T')[0]),
          where('date', '<=', end.toISOString().split('T')[0])
        );

        const expenseDocs = await getDocs(expensesQuery);
        const expenses = expenseDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const totalExpenses = expenses.reduce((sum, expense: any) => {
          return sum + (expense.amount || 0);
        }, 0);

        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        setFinancialData({
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          bookingCount: bookings.length,
          averageBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0
        });

        // Calculate branch-wise financials
        const branchesRef = collection(db, 'branches');
        const branchDocs = await getDocs(branchesRef);
        const branchList = branchDocs.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unknown Branch',
          ...doc.data()
        }));
        setBranches(branchList);

        const branchFinancials: BranchFinancial[] = branchList.map((branch: any) => {
          const branchBookings = bookings.filter((b: any) => b.branch === branch.name || b.branchId === branch.id);
          const branchExpenses = expenses.filter((e: any) => e.branch === branch.name || e.branchId === branch.id);

          const branchRevenue = branchBookings.reduce((sum, b: any) => sum + (b.totalPrice || 0), 0);
          const branchExpensesTotal = branchExpenses.reduce((sum, e: any) => sum + (e.amount || 0), 0);
          const branchProfit = branchRevenue - branchExpensesTotal;
          const branchMargin = branchRevenue > 0 ? (branchProfit / branchRevenue) * 100 : 0;

          return {
            name: branch.name,
            revenue: branchRevenue,
            expenses: branchExpensesTotal,
            profit: branchProfit,
            margin: branchMargin,
            bookings: branchBookings.length,
            avgBookingValue: branchBookings.length > 0 ? branchRevenue / branchBookings.length : 0,
            status: branchProfit > 0 ? 'profitable' : branchProfit === 0 ? 'break-even' : 'loss'
          };
        });

        setBranchData(branchFinancials);

        // Calculate weekly data
        const weeks: { [key: string]: WeeklyData } = {};
        bookings.forEach((booking: any) => {
          const date = new Date(booking.bookingDate);
          const weekLabel = getWeekLabel(date);

          if (!weeks[weekLabel]) {
            weeks[weekLabel] = {
              week: weekLabel,
              revenue: 0,
              expenses: 0,
              bookings: 0,
              profit: 0
            };
          }

          weeks[weekLabel].revenue += booking.totalPrice || 0;
          weeks[weekLabel].bookings += 1;
        });

        expenses.forEach((expense: any) => {
          const date = new Date(expense.date);
          const weekLabel = getWeekLabel(date);

          if (weeks[weekLabel]) {
            weeks[weekLabel].expenses += expense.amount || 0;
          }
        });

        Object.values(weeks).forEach(week => {
          week.profit = week.revenue - week.expenses;
        });

        setWeeklyData(Object.values(weeks).sort((a, b) => {
          const dateA = new Date(a.week);
          const dateB = new Date(b.week);
          return dateA.getTime() - dateB.getTime();
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusBadge = (status: string) => {
    const status_lower = status.toLowerCase();
    switch (status_lower) {
      case 'profitable':
      case 'active':
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'break-even':
      case 'pending':
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case 'loss':
      case 'inactive':
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="text-red-600 border-red-600">Overdue</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar role="super_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar role="super_admin" onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
                  <p className="text-sm text-gray-600">Financial overview across all branches</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : !financialData ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <p className="text-red-800">Unable to load financial data. Please try again.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Report Type Selection */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { value: 'overview', label: 'Overview', icon: BarChart3 },
                      { value: 'weekly', label: 'Weekly Analysis', icon: LineChartIcon },
                      { value: 'branches', label: 'Branch Breakdown', icon: Building }
                    ].map(type => {
                      const IconComponent = type.icon;
                      return (
                        <Button
                          key={type.value}
                          variant={reportType === type.value ? 'default' : 'outline'}
                          onClick={() => setReportType(type.value)}
                          className="gap-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Financial Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(financialData.totalRevenue)}</div>
                        <p className="text-xs text-gray-500">{financialData.bookingCount} bookings</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium">Total Expenses</CardTitle>
                        <CreditCard className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(financialData.totalExpenses)}</div>
                        <p className="text-xs text-gray-500">{formatPercentage((financialData.totalExpenses / financialData.totalRevenue) * 100)} of revenue</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium">Net Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(financialData.netProfit)}</div>
                        <p className="text-xs text-gray-500">{financialData.profitMargin.toFixed(1)}% margin</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium">Avg Booking Value</CardTitle>
                        <Banknote className="h-4 w-4 text-purple-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(financialData.averageBookingValue)}</div>
                        <p className="text-xs text-gray-500">Per transaction</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium">Profit Margin</CardTitle>
                        <PieChart className="h-4 w-4 text-orange-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{financialData.profitMargin.toFixed(1)}%</div>
                        <p className="text-xs text-gray-500">Health score</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Report Content Based on Selection */}
                  {reportType === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Key Metrics */}
                      <Card className="lg:col-span-1">
                        <CardHeader>
                          <CardTitle className="text-base">Key Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600">Total Bookings</p>
                            <p className="text-lg font-bold">{financialData.bookingCount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600">Avg Revenue/Booking</p>
                            <p className="text-lg font-bold">{formatCurrency(financialData.averageBookingValue)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600">Profit/Booking</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(financialData.netProfit / (financialData.bookingCount || 1))}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Summary Stats */}
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-base">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                              <span className="text-sm">Revenue Generated</span>
                              <span className="font-bold text-green-700">{formatCurrency(financialData.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                              <span className="text-sm">Expenses Incurred</span>
                              <span className="font-bold text-red-700">{formatCurrency(financialData.totalExpenses)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="text-sm">Net Profit</span>
                              <span className="font-bold text-blue-700">{formatCurrency(financialData.netProfit)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                              <span className="text-sm">Profit Margin</span>
                              <span className="font-bold text-purple-700">{financialData.profitMargin.toFixed(2)}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {reportType === 'weekly' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Weekly Revenue & Expense Analysis</CardTitle>
                        <CardDescription>Week-by-week breakdown with profit trends</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {weeklyData.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No data available for the selected period</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Week</TableHead>
                                  <TableHead className="text-right">Revenue</TableHead>
                                  <TableHead className="text-right">Expenses</TableHead>
                                  <TableHead className="text-right">Profit</TableHead>
                                  <TableHead className="text-right">Bookings</TableHead>
                                  <TableHead className="text-right">Margin %</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {weeklyData.map((week, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="font-medium">{week.week}</TableCell>
                                    <TableCell className="text-right text-green-700 font-semibold">{formatCurrency(week.revenue)}</TableCell>
                                    <TableCell className="text-right text-red-700 font-semibold">{formatCurrency(week.expenses)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(week.profit)}</TableCell>
                                    <TableCell className="text-right">{week.bookings}</TableCell>
                                    <TableCell className="text-right">{((week.profit / week.revenue) * 100).toFixed(1)}%</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {reportType === 'branches' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Branch-wise Financial Performance</CardTitle>
                        <CardDescription>Detailed breakdown by location with advanced metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {branchData.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No branch data available</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Branch Name</TableHead>
                                  <TableHead className="text-right">Revenue</TableHead>
                                  <TableHead className="text-right">Expenses</TableHead>
                                  <TableHead className="text-right">Profit</TableHead>
                                  <TableHead className="text-right">Margin %</TableHead>
                                  <TableHead className="text-center">Bookings</TableHead>
                                  <TableHead className="text-right">Avg Value</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {branchData.map((branch, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="font-medium">{branch.name}</TableCell>
                                    <TableCell className="text-right text-green-700 font-semibold">{formatCurrency(branch.revenue)}</TableCell>
                                    <TableCell className="text-right text-red-700">{formatCurrency(branch.expenses)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(branch.profit)}</TableCell>
                                    <TableCell className="text-right">{branch.margin.toFixed(2)}%</TableCell>
                                    <TableCell className="text-center">{branch.bookings}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(branch.avgBookingValue)}</TableCell>
                                    <TableCell>{getStatusBadge(branch.status)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}