
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Search, Filter, CheckCircle, XCircle, AlertCircle, Building, Phone, Mail, DollarSign, Loader2, RefreshCw, ChevronDown, MapPin, Shield, Check, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { create } from 'zustand';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  updateDoc,
  doc,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ==================== TYPES ====================
interface Customer {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: string;
  role: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  createdAt: Timestamp;
  branch?: string;
  barber?: string;
  duration?: number;
  phone?: string;
  customerPhone?: string;
}

interface CustomerMap {
  [customerId: string]: Customer;
}

interface AppointmentsStore {
  // Data
  appointments: Appointment[];
  customers: CustomerMap;
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    noShow: number;
    totalRevenue: number;
    todayAppointments: number;
    activeCustomers: number;
  };
  
  // Actions
  fetchAppointments: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchCustomerPhone: (customerId: string) => Promise<string | null>;
  updateAppointmentStatus: (appointmentId: string, newStatus: Appointment['status']) => Promise<void>;
  calculateStats: () => void;
  setupRealtimeUpdates: () => () => void;
}

const useAppointmentsStore = create<AppointmentsStore>((set, get) => ({
  // Initial state
  appointments: [],
  customers: {},
  isLoading: false,
  error: null,
  stats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    totalRevenue: 0,
    todayAppointments: 0,
    activeCustomers: 0
  },

  // Fetch all appointments
  fetchAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const appointmentsRef = collection(db, 'bookings');
      const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const appointmentsData: Appointment[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        appointmentsData.push({
          id: doc.id,
          customerId: data.customerId || '',
          customerName: data.customerName || 'Unknown Customer',
          customerEmail: data.customerEmail || 'No Email',
          serviceId: data.serviceId || '',
          serviceName: data.serviceName || 'Unknown Service',
          servicePrice: Number(data.servicePrice) || 0,
          date: data.date || 'N/A',
          time: data.time || 'N/A',
          totalAmount: Number(data.totalAmount) || 0,
          status: (data.status as Appointment['status']) || 'pending',
          notes: data.notes || 'No notes',
          createdAt: data.createdAt || Timestamp.now(),
          branch: data.branch || 'Main Branch',
          barber: data.barber || 'Not Assigned',
          duration: Number(data.duration) || 30,
          phone: data.phone || data.customerPhone || null
        });
      });
      
      set({ appointments: appointmentsData, isLoading: false });
      get().calculateStats();
      
      // Fetch customers after appointments
      await get().fetchCustomers();
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      set({ 
        error: 'Failed to load appointments. Please try again.', 
        isLoading: false 
      });
    }
  },

  // Fetch all customers
  fetchCustomers: async () => {
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const customersData: CustomerMap = {};
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        customersData[doc.id] = {
          uid: doc.id,
          name: data.name || 'Unknown Customer',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          status: data.status || 'active',
          role: data.role || 'customer',
          createdAt: data.createdAt || Timestamp.now(),
          lastLogin: data.lastLogin || Timestamp.now()
        };
      });
      
      set({ customers: customersData });
      
      // Update stats with customer count
      const activeCustomers = Object.values(customersData).filter(c => c.status === 'active').length;
      set(state => ({
        stats: {
          ...state.stats,
          activeCustomers
        }
      }));
      
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  },

  // Fetch specific customer phone
  fetchCustomerPhone: async (customerId: string) => {
    try {
      // First check if customer exists in our local state
      const { customers } = get();
      const customer = customers[customerId];
      if (customer && customer.phone) {
        return customer.phone;
      }

      // If not in local state, fetch from Firebase
      const customerRef = doc(db, 'customers', customerId);
      const customerSnap = await getDoc(customerRef);
      
      if (customerSnap.exists()) {
        const data = customerSnap.data();
        const phone = data.phone || '';
        
        // Update local state
        if (phone) {
          set(state => ({
            customers: {
              ...state.customers,
              [customerId]: {
                ...state.customers[customerId],
                phone
              }
            }
          }));
        }
        
        return phone;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching customer phone:', error);
      return null;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const appointmentRef = doc(db, 'bookings', appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      // Update local state
      set(state => ({
        appointments: state.appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      }));

      // Recalculate stats
      get().calculateStats();
      
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Calculate statistics
  calculateStats: () => {
    const state = get();
    const appointments = state.appointments;
    
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const inProgress = appointments.filter(a => a.status === 'in-progress').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const noShow = appointments.filter(a => a.status === 'no-show').length;
    const totalRevenue = appointments
      .filter(a => a.status === 'completed')
      .reduce((sum, apt) => sum + apt.totalAmount, 0);
    
    // Calculate today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today).length;

    set({
      stats: {
        ...state.stats,
        total,
        pending,
        confirmed,
        inProgress,
        completed,
        cancelled,
        noShow,
        totalRevenue,
        todayAppointments
      }
    });
  },

  // Setup real-time updates
  setupRealtimeUpdates: () => {
    try {
      const appointmentsRef = collection(db, 'bookings');
      const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const appointmentsData: Appointment[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          appointmentsData.push({
            id: doc.id,
            customerId: data.customerId || '',
            customerName: data.customerName || 'Unknown Customer',
            customerEmail: data.customerEmail || 'No Email',
            serviceId: data.serviceId || '',
            serviceName: data.serviceName || 'Unknown Service',
            servicePrice: Number(data.servicePrice) || 0,
            date: data.date || 'N/A',
            time: data.time || 'N/A',
            totalAmount: Number(data.totalAmount) || 0,
            status: (data.status as Appointment['status']) || 'pending',
            notes: data.notes || 'No notes',
            createdAt: data.createdAt || Timestamp.now(),
            branch: data.branch || 'Main Branch',
            barber: data.barber || 'Not Assigned',
            duration: Number(data.duration) || 30,
            phone: data.phone || data.customerPhone || null
          });
        });
        
        set({ appointments: appointmentsData });
        get().calculateStats();
        
        // Refresh customers data
        await get().fetchCustomers();
      }, (error) => {
        console.error('Error in real-time update:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time updates:', error);
      return () => {};
    }
  },
}));

// ==================== MAIN COMPONENT ====================
export default function SuperAdminAppointments() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar by default open
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const { 
    appointments, 
    customers,
    isLoading, 
    error, 
    stats,
    fetchAppointments, 
    updateAppointmentStatus,
    fetchCustomerPhone
  } = useAppointmentsStore();

  // Fetch data on mount and setup real-time updates
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Get unique branches from appointments
  const branches = Array.from(new Set(appointments.map(apt => apt.branch || 'Main Branch')));

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const customerPhone = customers[appointment.customerId]?.phone || '';
    
    const matchesSearch = 
      appointment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || appointment.branch === branchFilter;
    const matchesDate = !selectedDate || appointment.date === selectedDate;

    return matchesSearch && matchesStatus && matchesBranch && matchesDate;
  });

  // Status configuration
  const statusConfig = {
    pending: { 
      label: 'Pending', 
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      icon: AlertCircle,
      badgeColor: 'bg-yellow-500'
    },
    confirmed: { 
      label: 'Confirmed', 
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      icon: CheckCircle,
      badgeColor: 'bg-blue-500'
    },
    'in-progress': { 
      label: 'In Progress', 
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      icon: Clock,
      badgeColor: 'bg-purple-500'
    },
    completed: { 
      label: 'Completed', 
      color: 'bg-green-100 text-green-800 hover:bg-green-100',
      icon: CheckCircle,
      badgeColor: 'bg-green-500'
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'bg-red-100 text-red-800 hover:bg-red-100',
      icon: XCircle,
      badgeColor: 'bg-red-500'
    },
    'no-show': { 
      label: 'No Show', 
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      icon: XCircle,
      badgeColor: 'bg-gray-500'
    }
  };

  // Status options for dropdown
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' }
  ];

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
    } catch (error) {
      alert('Failed to update appointment status. Please try again.');
    }
  };

  // Function to get phone number with fallback
  const getCustomerPhone = (customerId: string, appointment: Appointment) => {
    // First check customer data
    const customer = customers[customerId];
    if (customer && customer.phone) {
      return customer.phone;
    }
    
    // Check appointment data
    if (appointment.phone) {
      return appointment.phone;
    }
    
    // Check customerPhone field
    if (appointment.customerPhone) {
      return appointment.customerPhone;
    }
    
    return 'N/A';
  };

  // Function to get customer details
  const getCustomerDetails = (customerId: string) => {
    const customer = customers[customerId];
    return customer || null;
  };

  // Get today's date for the date picker
  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="super_admin">
        <div className="flex h-screen bg-gray-50 items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-semibold text-primary">Loading appointments...</p>
            <p className="text-sm text-gray-500">Fetching real-time data from Firebase</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar - Always Visible */}
        <AdminSidebar
          role="super_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          className ={cn(
            "hidden lg:block transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0"
          )}
        />

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-white">
              <AdminMobileSidebar
                role="super_admin"
                onLogout={handleLogout}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-0" : "lg:ml-0"
        )}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
                  <p className="text-sm text-gray-600">Manage appointments across all branches (Real-time Firebase Data)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={fetchAppointments}
                  variant="outline" 
                  className="gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {user?.email}
                </span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-primary opacity-70" />
                  </CardHeader>
                  <CardContent className="pb-3 px-4">
                    <div className="text-xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Active Customers</CardTitle>
                    <User className="h-4 w-4 text-primary opacity-70" />
                  </CardHeader>
                  <CardContent className="pb-3 px-4">
                    <div className="text-xl font-bold">{stats.activeCustomers}</div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Today's Appointments</CardTitle>
                    <Clock className="h-4 w-4 text-primary opacity-70" />
                  </CardHeader>
                  <CardContent className="pb-3 px-4">
                    <div className="text-xl font-bold">{stats.todayAppointments}</div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary opacity-70" />
                  </CardHeader>
                  <CardContent className="pb-3 px-4">
                    <div className="text-xl font-bold">${stats.totalRevenue}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex flex-col items-center justify-center text-center">
                  <div className="text-lg font-bold text-yellow-700 leading-none">{stats.pending}</div>
                  <div className="text-[10px] text-yellow-600 font-bold uppercase mt-1">Pending</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center">
                  <div className="text-lg font-bold text-blue-700 leading-none">{stats.confirmed}</div>
                  <div className="text-[10px] text-blue-600 font-bold uppercase mt-1">Confirmed</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex flex-col items-center justify-center text-center">
                  <div className="text-lg font-bold text-purple-700 leading-none">{stats.inProgress}</div>
                  <div className="text-[10px] text-purple-600 font-bold uppercase mt-1">In Progress</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col items-center justify-center text-center">
                  <div className="text-lg font-bold text-green-700 leading-none">{stats.completed}</div>
                  <div className="text-[10px] text-green-600 font-bold uppercase mt-1">Completed</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex flex-col items-center justify-center text-center">
                  <div className="text-lg font-bold text-red-700 leading-none">{stats.cancelled}</div>
                  <div className="text-[10px] text-red-600 font-bold uppercase mt-1">Cancelled</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center justify-center text-center">
                  <div className="text-lg font-bold text-gray-700 leading-none">{stats.noShow}</div>
                  <div className="text-[10px] text-gray-600 font-bold uppercase mt-1">No Show</div>
                </div>
              </div>

              {/* Filters */}
              <Card className="mb-6 shadow-sm border-gray-100">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search customer, service, email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-9 text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Date Filter */}
                    <div className="w-full sm:w-auto">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-9 text-sm"
                        max={today}
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-xs">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[option.value as keyof typeof statusConfig].badgeColor}`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
                        <SelectValue placeholder="Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch} className="text-xs">{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Active filters indicator */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {statusFilter !== 'all' && (
                      <Badge variant="outline" className="gap-2">
                        Status: {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                        <button onClick={() => setStatusFilter('all')} className="text-gray-400 hover:text-gray-600">
                          ×
                        </button>
                      </Badge>
                    )}
                    {branchFilter !== 'all' && (
                      <Badge variant="outline" className="gap-2">
                        Branch: {branchFilter}
                        <button onClick={() => setBranchFilter('all')} className="text-gray-400 hover:text-gray-600">
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedDate && (
                      <Badge variant="outline" className="gap-2">
                        Date: {selectedDate}
                        <button onClick={() => setSelectedDate('')} className="text-gray-400 hover:text-gray-600">
                          ×
                        </button>
                      </Badge>
                    )}
                    {searchQuery && (
                      <Badge variant="outline" className="gap-2">
                        Search: {searchQuery}
                        <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                          ×
                        </button>
                      </Badge>
                    )}
                    {(statusFilter !== 'all' || branchFilter !== 'all' || selectedDate || searchQuery) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setStatusFilter('all');
                          setBranchFilter('all');
                          setSelectedDate('');
                          setSearchQuery('');
                        }}
                        className="text-xs"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Appointments List */}
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => {
                  const status = statusConfig[appointment.status];
                  const StatusIcon = status?.icon || AlertCircle;
                  const customer = getCustomerDetails(appointment.customerId);
                  const customerPhone = getCustomerPhone(appointment.customerId, appointment);
                  
                  return (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          {/* Appointment Details */}
                          <div className="flex items-start gap-3 flex-1">
                            {/* Time/Date */}
                            <div className="text-center min-w-[70px] flex flex-col items-center justify-center">
                              <div className="text-base font-bold text-primary leading-tight">{appointment.time}</div>
                              <div className="text-[11px] text-gray-500 font-medium">{appointment.date}</div>
                              <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 h-5">
                                ${appointment.totalAmount}
                              </Badge>
                            </div>
                            
                            {/* Customer & Service Details */}
                            <div className="border-l pl-3 flex-1 py-0.5">
                              {/* Branch & Barber */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                                <div className="flex items-center gap-1">
                                  <Building className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                                    {appointment.branch || 'Main Branch'}
                                  </span>
                                </div>
                                {appointment.barber && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-[11px] text-gray-600 font-medium italic">{appointment.barber}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Customer Name with Status */}
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-bold text-gray-900 text-base">
                                  {appointment.customerName}
                                </h3>
                                {customer && (
                                  <Badge className={cn(
                                    "text-[9px] h-4 px-1.5 leading-none font-bold uppercase",
                                    customer.status === 'active' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  )}>
                                    {customer.status}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Service Details */}
                              <p className="text-xs text-gray-700 font-medium mb-1.5">
                                {appointment.serviceName} <span className="text-gray-400 mx-1">|</span> ${appointment.servicePrice}
                                {appointment.duration && <span className="text-gray-400 ml-1">({appointment.duration} min)</span>}
                              </p>
                              
                              {/* Contact Info */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                {/* Email */}
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  <span className="truncate max-w-[150px]">
                                    {appointment.customerEmail}
                                  </span>
                                </div>
                                
                                {/* Phone */}
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  <span className="font-semibold text-gray-700">
                                    {customerPhone}
                                  </span>
                                </div>
                                
                                {/* Address */}
                                {customer?.address && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-muted-foreground" />
                                    <span className="truncate max-w-[120px]">
                                      {customer.address}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex flex-row lg:flex-col xl:flex-row items-center gap-2 min-w-[300px] lg:min-w-0 justify-end">
                            {/* Status Badge */}
                            <Badge className={cn(
                              "gap-1.5 px-2 py-1 font-bold text-[10px] uppercase w-28 justify-center shadow-none border-none",
                              status?.color
                            )}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              <span>{status?.label || appointment.status}</span>
                            </Badge>

                            {/* Status Dropdown */}
                            <Select
                              value={appointment.status}
                              onValueChange={(value) => 
                                handleStatusChange(appointment.id, value as Appointment['status'])
                              }
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${status?.badgeColor}`}></div>
                                  <span>Update</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map(option => {
                                  const optionStatus = statusConfig[option.value as keyof typeof statusConfig];
                                  const OptionIcon = optionStatus.icon;
                                  
                                  return (
                                    <SelectItem 
                                      key={option.value} 
                                      value={option.value}
                                      className="text-xs py-1.5"
                                    >
                                      <div className="flex items-center gap-2">
                                        <OptionIcon className="w-3.5 h-3.5" />
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Notes - Compact */}
                        {appointment.notes && (
                          <div className="mt-2 pt-2 border-t border-dashed">
                            <p className="text-[11px] text-gray-600 line-clamp-1 hover:line-clamp-none transition-all duration-300">
                              <span className="font-bold text-gray-400 mr-1 uppercase text-[9px]">Notes:</span> {appointment.notes}
                            </p>
                          </div>
                        )}

                        {/* Technical Info - Tiny and dim */}
                        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-300">
                          <div className="flex flex-wrap gap-3">
                            <span>ID: {appointment.id.substring(0, 6)}</span>
                            <span>Created: {appointment.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}</span>
                          </div>
                          {customer?.city && (
                            <span className="hidden sm:inline italic">{customer.city}, {customer.country}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* No Results */}
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStatusFilter('all');
                      setBranchFilter('all');
                      setSelectedDate('');
                      setSearchQuery('');
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card className="mt-6 border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Error loading appointments</p>
                        <p className="text-sm mt-1">{error}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={fetchAppointments} 
                      variant="outline" 
                      className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Total Results */}
              <div className="mt-6 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <div>
                    Showing {filteredAppointments.length} of {appointments.length} total appointments
                  </div>
                  <div className="text-xs text-gray-400">
                    {Object.keys(customers).length} customers loaded from Firebase
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
