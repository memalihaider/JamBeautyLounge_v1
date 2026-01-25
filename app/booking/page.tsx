'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Calendar, User, Phone, Mail, CheckCircle, Clock, Scissors, ChevronLeft, Wallet, CreditCard, Banknote, Star, Gift, Info, AlertCircle, X } from 'lucide-react';
import { useBookingStore } from '@/stores/booking.store';
import { useCustomerStore, type Customer, type CustomerWallet } from '@/stores/customer.store';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, doc, getDoc } from 'firebase/firestore';

interface StaffMember {
  id: string;
  name: string;
  image: string;
  position?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
  imageUrl?: string;
}

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

type PaymentMethod = 'cash' | 'wallet' | 'mixed';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

// Fetch staff from Firebase
async function fetchStaffFromFirebase(): Promise<StaffMember[]> {
  try {
    const staffRef = collection(db, 'staff');
    const querySnapshot = await getDocs(staffRef);
    
    const staffData: StaffMember[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      staffData.push({
        id: doc.id,
        name: data.name || data.fullName || 'Unknown Staff',
        image: data.imageUrl || data.image || data.photoURL || data.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop',
        position: data.position || data.role || 'Barber',
      });
    });
    
    console.log('Fetched staff from Firebase:', staffData);
    return staffData;
  } catch (error) {
    console.error('Error fetching staff from Firebase:', error);
    // Return empty array so app doesn't break
    return [];
  }
}

// Fetch service from Firebase by ID
async function fetchServiceFromFirebase(serviceId: string): Promise<Service | null> {
  try {
    const serviceRef = doc(db, 'services', serviceId);
    const serviceSnap = await getDoc(serviceRef);
    
    if (serviceSnap.exists()) {
      const data = serviceSnap.data();
      return {
        id: serviceSnap.id,
        name: data.name || 'Unknown Service',
        description: data.description || '',
        price: data.price || 0,
        duration: data.duration || 30,
        category: data.category || '',
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching service from Firebase:', error);
    return null;
  }
}

// Inner component that uses useSearchParams
function BookingCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);

  // Coupon code state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
  const [couponError, setCouponError] = useState('');

  const {
    cartItems,
    customerName,
    customerEmail,
    customerPhone,
    specialRequests,
    selectedStaff,
    selectedDate,
    selectedTime,
    removeFromCart,
    setCustomerName,
    setCustomerEmail,
    setCustomerPhone,
    setSpecialRequests,
    setSelectedStaff,
    setSelectedDate,
    setSelectedTime,
    updateServiceStaff,
    confirmBooking,
    getCartTotal,
    getTotalDuration,
    clearCart,
  } = useBookingStore();

  const {
    getCustomerByEmail,
    getWalletByCustomerId,
    getActiveLoyaltySettings,
    calculatePointsForAmount,
    calculatePointsValue,
    addBooking,
    deductFromWalletBalance,
    redeemPoints,
  } = useCustomerStore();

  const loyaltySettings = getActiveLoyaltySettings();
  const cartTotal = getCartTotal();

  // Mock coupon database
  const validCoupons = {
    'WELCOME10': { discount: 10, type: 'percentage' as const },
    'SAVE50': { discount: 50, type: 'fixed' as const },
    'LOYALTY20': { discount: 20, type: 'percentage' as const },
    'PREMIUM25': { discount: 25, type: 'percentage' as const },
  };

  // Calculate coupon discount
  const couponDiscount = appliedCoupon 
    ? appliedCoupon.type === 'percentage' 
      ? (cartTotal * appliedCoupon.discount) / 100 
      : appliedCoupon.discount
    : 0;

  // Handle coupon application
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (validCoupons[code as keyof typeof validCoupons]) {
      const coupon = validCoupons[code as keyof typeof validCoupons];
      setAppliedCoupon({ code, discount: coupon.discount, type: coupon.type });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Check for logged in customer
  useEffect(() => {
    const authData = localStorage.getItem('customerAuth');
    if (authData) {
      try {
        const { isAuthenticated, customer: customerData } = JSON.parse(authData);
        if (isAuthenticated && customerData) {
          setIsLoggedIn(true);
          const fullCustomer = getCustomerByEmail(customerData.email);
          if (fullCustomer) {
            setCustomer(fullCustomer);
            setCustomerName(fullCustomer.name);
            setCustomerEmail(fullCustomer.email);
            setCustomerPhone(fullCustomer.phone);
            const customerWallet = getWalletByCustomerId(fullCustomer.id);
            setWallet(customerWallet || null);
          }
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    setIsLoading(false);
  }, [getCustomerByEmail, getWalletByCustomerId, setCustomerName, setCustomerEmail, setCustomerPhone]);

  // Fetch staff from Firebase
  useEffect(() => {
    const loadStaff = async () => {
      const staff = await fetchStaffFromFirebase();
      setStaffMembers(staff);
      console.log('Staff loaded:', staff);
    };
    loadStaff();
  }, []);

  // Fetch service from URL params if provided
  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId && cartItems.length === 0) {
      const loadService = async () => {
        console.log('Fetching service with ID:', serviceId);
        const service = await fetchServiceFromFirebase(serviceId);
        if (service) {
          console.log('Service fetched:', service);
          // Add to cart directly
          const cartItem = {
            serviceId: service.id,
            serviceName: service.name,
            price: service.price,
            duration: service.duration.toString(),
            description: service.description,
            image: service.imageUrl || 'https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop',
            rating: 5,
            reviews: 0,
            id: service.id,
            name: service.name,
            category: service.category || 'Service'
          };
          useBookingStore.setState((state) => ({
            cartItems: [...state.cartItems, cartItem as any]
          }));
        }
      };
      loadService();
    }
  }, [searchParams]);


  // Calculate points value
  const pointsValueInDollars = loyaltySettings ? calculatePointsValue(pointsToUse) : 0;
  const maxPointsValue = wallet && loyaltySettings 
    ? Math.min(
        calculatePointsValue(wallet.loyaltyPoints),
        cartTotal,
        loyaltySettings.maximumPointsPerTransaction * loyaltySettings.pointsValueInDollars
      )
    : 0;
  const maxPointsToUse = maxPointsValue && loyaltySettings 
    ? Math.floor(maxPointsValue / loyaltySettings.pointsValueInDollars) 
    : 0;

  // Get staff image from staffMembers array
  const getStaffImage = (staffName: string): string => {
    const staff = staffMembers.find(s => s.name === staffName);
    return staff?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop';
  };

  // Calculate final amounts
  const walletDeduction = useWalletBalance ? Math.min(walletAmount, wallet?.balance || 0, cartTotal - couponDiscount) : 0;
  const pointsDeduction = usePoints ? pointsValueInDollars : 0;
  const totalDeductions = walletDeduction + pointsDeduction;
  const finalTotal = Math.max(0, cartTotal - couponDiscount - totalDeductions);
  const remainingAmount = Math.max(0, finalTotal);
  
  // Points to be earned
  const pointsToEarn = loyaltySettings ? calculatePointsForAmount(cartTotal) : 0;

  const handleConfirmBooking = () => {
    // Validate that all services have staff assigned
    const servicesWithoutStaff = cartItems.filter(item => !item.staffMember);
    if (servicesWithoutStaff.length > 0) {
      setValidationError(`Please assign a specialist to all ${servicesWithoutStaff.length} service(s)`);
      return;
    }
    
    if (!customerName || !customerEmail || !selectedDate || !selectedTime) {
      setValidationError('Please fill in all required fields');
      return;
    }

    // Validate payment
    if (paymentMethod === 'wallet' && remainingAmount > 0) {
      setValidationError('Insufficient wallet balance. Please add more funds or choose a different payment method.');
      return;
    }

    setValidationError('');

    // Process payment deductions
    if (customer && isLoggedIn) {
      // Deduct wallet balance if used
      if (useWalletBalance && walletDeduction > 0) {
        deductFromWalletBalance(customer.id, walletDeduction, 'Payment for booking', '');
      }
      
      // Redeem points if used
      if (usePoints && pointsToUse > 0) {
        redeemPoints(customer.id, pointsToUse, 'Points redeemed for booking', '');
      }

      // Create booking in customer store
      const newBooking = addBooking({
        customerId: customer.id,
        services: cartItems.map(item => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          price: item.price,
          duration: parseInt(item.duration, 10),
          staffMember: item.staffMember,
        })),
        date: selectedDate,
        time: selectedTime,
        totalAmount: cartTotal,
        pointsEarned: pointsToEarn,
        pointsUsed: usePoints ? pointsToUse : 0,
        walletAmountUsed: walletDeduction,
        cashAmount: remainingAmount,
        paymentMethod: paymentMethod,
        status: 'pending',
        specialRequests: specialRequests,
      });

      setConfirmedBookingId(newBooking.id);
      clearCart();
      setBookingConfirmed(true);
      setTimeout(() => {
        router.push('/customer/portal/bookings');
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <Header />
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-[#fcfcfc]">
        <Header />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-primary">Thank You.</h1>
            <p className="text-lg text-muted-foreground font-light">
              Your luxury grooming experience is confirmed.
            </p>
            <Card className="border-none bg-white shadow-xl rounded-none p-6">
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Booking Reference</p>
                  <p className="text-xl font-serif font-bold text-primary">{confirmedBookingId}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-left">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-bold text-sm">{selectedDate} at {selectedTime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Specialist</p>
                    <p className="font-bold text-sm">{selectedStaff || 'Multiple'}</p>
                  </div>
                </div>
                {pointsToEarn > 0 && customer && (
                  <div className="bg-secondary/10 rounded-xl p-4 mt-4">
                    <div className="flex items-center justify-center gap-2 text-secondary">
                      <Star className="w-5 h-5" />
                      <span className="font-bold">+{pointsToEarn} loyalty points earned!</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            <div className="pt-6">
              <Button onClick={() => router.push('/customer/portal/bookings')} className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 py-5 font-bold tracking-widest text-xs">
                VIEW MY BOOKINGS
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" asChild className="p-0 hover:bg-transparent text-muted-foreground hover:text-primary">
              <Link href="/services" className="flex items-center text-xs font-bold tracking-widest">
                <ChevronLeft className="w-4 h-4 mr-1" /> BACK TO SERVICES
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mandatory Sign-In Alert */}
              {!isLoggedIn && (
                <Card className="border-2 border-red-200 shadow-lg rounded-2xl bg-linear-to-r from-red-50 to-red-50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-red-900 text-lg">Account Login Required</p>
                          <p className="text-sm text-red-700 mt-1">
                            Booking a service requires an active customer account. Sign in to access Digital Wallet payments, loyalty points, and exclusive member benefits.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 pl-16">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-gray-700">Digital Wallet</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-secondary" />
                          <span className="text-xs font-semibold text-gray-700">Loyalty Points</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-700">Exclusive Offers</span>
                        </div>
                      </div>

                      <div className="flex gap-3 pl-16 pt-2">
                        <Link href="/customer/login">
                          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-widest text-xs px-6">
                            Sign In Now
                          </Button>
                        </Link>
                        <Link href="/customer/login">
                          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold tracking-widest text-xs">
                            Create Account
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sign-In Confirmation for Authenticated Users */}
              {isLoggedIn && (
                <Card className="border-2 border-secondary/20 shadow-sm rounded-2xl bg-linear-to-r from-secondary/5 to-secondary/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm">Account Verified</p>
                        <p className="text-xs text-muted-foreground">Signed in as {customerEmail}</p>
                      </div>
                    </div>
                    <Badge className="bg-secondary text-white">Authenticated</Badge>
                  </CardContent>
                </Card>
              )}

              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="border-b border-gray-50 py-4">
                  <CardTitle className="text-xl font-serif font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-secondary" /> Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold">Full Name</Label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        className="rounded-none border-gray-200 h-10 text-sm"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        disabled={isLoggedIn}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        className="rounded-none border-gray-200 h-10 text-sm"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        disabled={isLoggedIn}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest font-bold">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="+1 (555) 000-0000" 
                        className="rounded-none border-gray-200 h-10 text-sm"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="staff" className="text-[10px] uppercase tracking-widest font-bold">Preferred Specialist</Label>
                      <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                        <SelectTrigger className="rounded-none border-gray-200 h-10 text-sm">
                          <SelectValue placeholder="Select barber" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.length > 0 ? (
                            staffMembers.map(staff => (
                              <SelectItem key={staff.id} value={staff.name}>{staff.name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>Loading staff...</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="requests" className="text-[10px] uppercase tracking-widest font-bold">Special Requests</Label>
                    <Textarea 
                      id="requests" 
                      placeholder="Any specific requirements or preferences..." 
                      className="rounded-none border-gray-200 min-h-20 text-sm"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="border-b border-gray-50 py-4">
                  <CardTitle className="text-xl font-serif font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-secondary" /> Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold">Select Date</Label>
                      <Input 
                        type="date" 
                        className="rounded-none border-gray-200 h-10 text-sm"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold">Available Times</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map(time => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className={cn(
                              "rounded-none h-9 text-[10px] font-bold tracking-tighter",
                              selectedTime === time ? "bg-primary text-white" : "border-gray-100 hover:border-primary"
                            )}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Section */}
              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="border-b border-gray-50 py-4">
                  <CardTitle className="text-xl font-serif font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-secondary" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        paymentMethod === 'cash' 
                          ? "border-secondary bg-secondary/10" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Banknote className={cn("w-6 h-6", paymentMethod === 'cash' ? "text-secondary" : "text-gray-500")} />
                      <span className="text-xs font-bold">Cash on Delivery</span>
                    </button>
                    <button
                      onClick={() => isLoggedIn && setPaymentMethod('wallet')}
                      disabled={!isLoggedIn}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        paymentMethod === 'wallet' 
                          ? "border-secondary bg-secondary/10" 
                          : "border-gray-200 hover:border-gray-300",
                        !isLoggedIn && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Wallet className={cn("w-6 h-6", paymentMethod === 'wallet' ? "text-secondary" : "text-gray-500")} />
                      <span className="text-xs font-bold">Digital Wallet</span>
                      {isLoggedIn && wallet && (
                        <span className="text-[10px] text-muted-foreground">${wallet.balance.toFixed(2)}</span>
                      )}
                    </button>
                    <button
                      onClick={() => isLoggedIn && setPaymentMethod('mixed')}
                      disabled={!isLoggedIn}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        paymentMethod === 'mixed' 
                          ? "border-secondary bg-secondary/10" 
                          : "border-gray-200 hover:border-gray-300",
                        !isLoggedIn && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <CreditCard className={cn("w-6 h-6", paymentMethod === 'mixed' ? "text-secondary" : "text-gray-500")} />
                      <span className="text-xs font-bold">Mixed Payment</span>
                    </button>
                  </div>

                  {!isLoggedIn && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold">Sign in to unlock more payment options</p>
                        <p className="text-blue-600">Use your wallet balance and loyalty points to pay</p>
                      </div>
                    </div>
                  )}

                  {/* Wallet & Points Options (for logged in users with mixed/wallet payment) */}
                  {isLoggedIn && wallet && (paymentMethod === 'wallet' || paymentMethod === 'mixed') && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      {/* Wallet Balance */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-sm">Wallet Balance</p>
                              <p className="text-xs text-muted-foreground">Available: ${wallet.balance.toFixed(2)}</p>
                            </div>
                          </div>
                          <Switch
                            checked={useWalletBalance}
                            onCheckedChange={(checked) => {
                              setUseWalletBalance(checked);
                              if (checked) {
                                setWalletAmount(Math.min(wallet.balance, cartTotal - pointsDeduction));
                              } else {
                                setWalletAmount(0);
                              }
                            }}
                          />
                        </div>
                        {useWalletBalance && (
                          <div className="space-y-2">
                            <Label className="text-xs">Amount to use</Label>
                            <Input
                              type="number"
                              value={walletAmount}
                              onChange={(e) => setWalletAmount(Math.min(parseFloat(e.target.value) || 0, wallet.balance, cartTotal - pointsDeduction))}
                              min={0}
                              max={Math.min(wallet.balance, cartTotal - pointsDeduction)}
                              step={0.01}
                              className="h-10 rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      {/* Loyalty Points */}
                      {loyaltySettings && wallet.loyaltyPoints >= loyaltySettings.minimumPointsToRedeem && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Star className="w-5 h-5 text-secondary" />
                              <div>
                                <p className="font-semibold text-sm">Loyalty Points</p>
                                <p className="text-xs text-muted-foreground">
                                  Available: {wallet.loyaltyPoints.toLocaleString()} pts (${calculatePointsValue(wallet.loyaltyPoints).toFixed(2)})
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={usePoints}
                              onCheckedChange={(checked) => {
                                setUsePoints(checked);
                                if (checked) {
                                  setPointsToUse(Math.min(maxPointsToUse, wallet.loyaltyPoints));
                                } else {
                                  setPointsToUse(0);
                                }
                              }}
                            />
                          </div>
                          {usePoints && (
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span>Points to redeem: {pointsToUse}</span>
                                <span className="text-secondary font-bold">-${pointsValueInDollars.toFixed(2)}</span>
                              </div>
                              <input
                                type="range"
                                value={pointsToUse}
                                onChange={(e) => setPointsToUse(parseInt(e.target.value))}
                                min={loyaltySettings.minimumPointsToRedeem}
                                max={Math.min(maxPointsToUse, wallet.loyaltyPoints)}
                                step={10}
                                className="w-full accent-secondary"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{loyaltySettings.minimumPointsToRedeem} pts</span>
                                <span>{Math.min(maxPointsToUse, wallet.loyaltyPoints)} pts</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Coupon Code Section */}
              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="border-b border-gray-50 py-4">
                  <CardTitle className="text-lg font-serif font-bold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-secondary" /> Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {appliedCoupon ? (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-bold text-green-900">Coupon Applied! 🎉</p>
                          <p className="text-sm text-green-700">
                            {appliedCoupon.code} 
                            {appliedCoupon.type === 'percentage' 
                              ? ` - ${appliedCoupon.discount}% Off` 
                              : ` - $${appliedCoupon.discount.toFixed(2)} Off`}
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            You save: ${couponDiscount.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-green-600 hover:bg-green-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code (e.g., WELCOME10)"
                          className="rounded-lg border-gray-200 h-10 text-sm"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleApplyCoupon();
                            }
                          }}
                        />
                        <Button
                          onClick={handleApplyCoupon}
                          className="bg-secondary hover:bg-secondary/90 text-primary font-bold rounded-lg px-6 tracking-widest text-xs"
                        >
                          Apply
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-600 font-semibold">{couponError}</p>
                      )}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-2">Available Codes</p>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-800"><span className="font-bold">WELCOME10</span> - 10% off</p>
                          <p className="text-xs text-blue-800"><span className="font-bold">LOYALTY20</span> - 20% off</p>
                          <p className="text-xs text-blue-800"><span className="font-bold">SAVE50</span> - $50 off</p>
                          <p className="text-xs text-blue-800"><span className="font-bold">PREMIUM25</span> - 25% off</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="border-b border-gray-50 py-4">
                  <CardTitle className="text-lg font-serif font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-secondary" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600 border-t border-gray-100 pt-2">
                        <span className="font-semibold">Discount ({appliedCoupon.code})</span>
                        <span className="font-bold">-${couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {isLoggedIn && walletDeduction > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Wallet Balance</span>
                        <span>-${walletDeduction.toFixed(2)}</span>
                      </div>
                    )}
                    {isLoggedIn && pointsDeduction > 0 && (
                      <div className="flex justify-between text-secondary">
                        <span>Loyalty Points ({pointsToUse} pts)</span>
                        <span>-${pointsDeduction.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-3 border-t-2 border-gray-200">
                      <span className="text-lg">Total</span>
                      <span className="text-2xl text-secondary">${Math.max(0, cartTotal - couponDiscount - totalDeductions).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Summary */}
            <div className="space-y-6">
              <Card className="border-none shadow-lg rounded-none bg-primary text-white sticky top-24">
                {/* Staff Profile Section - Fixed Height */}
                <div className="h-40 w-full bg-linear-to-b from-secondary/20 to-primary flex items-center justify-center overflow-hidden">
                  {selectedStaff ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={getStaffImage(selectedStaff)}
                        alt={selectedStaff}
                        width={300}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-primary via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                        <p className="font-serif font-bold text-lg text-white">{selectedStaff}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white/50">
                      <Scissors className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-bold tracking-widest uppercase">Select a specialist</p>
                    </div>
                  )}
                </div>

                <CardHeader className="border-b border-white/10 py-4">
                  <CardTitle className="text-xl font-serif font-bold">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8 space-y-3">
                        <Scissors className="w-8 h-8 text-white/20 mx-auto" />
                        <p className="text-xs text-white/60">Your selection is empty</p>
                        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-lg text-[10px] font-bold tracking-widest">
                          <Link href="/services">BROWSE SERVICES</Link>
                        </Button>
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div key={item.serviceId} className="space-y-3 pb-4 border-b border-white/10 last:border-0">
                          <div className="flex justify-between items-start group">
                            <div className="space-y-0.5">
                              <p className="font-serif font-bold text-sm">{item.serviceName}</p>
                              <div className="flex items-center gap-2 text-[10px] text-white/60">
                                <Clock className="w-3 h-3" />
                                <span>{item.duration} min</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm">${item.price}</span>
                              <button 
                                onClick={() => removeFromCart(item.serviceId)}
                                className="text-white/40 hover:text-secondary transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-1.5">
                            Assign Specialist
                          </div>
                          <Select value={item.staffMember || ''} onValueChange={(value) => updateServiceStaff(item.serviceId, value)}>
                            <SelectTrigger className="rounded-none border-white/20 h-9 text-[11px] text-white bg-white/5 hover:bg-white/10">
                              <SelectValue placeholder="Select specialist for this service" />
                            </SelectTrigger>
                            <SelectContent>
                              {staffMembers.map(staff => (
                                <SelectItem key={staff.id} value={staff.name}>{staff.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <>
                      {validationError && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                          <p className="text-xs text-red-200 font-bold uppercase tracking-widest">{validationError}</p>
                        </div>
                      )}
                      
                      <div className="border-t border-white/10 pt-4 space-y-2">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Subtotal</span>
                          <span>${cartTotal.toFixed(2)}</span>
                        </div>

                        {/* Coupon Discount */}
                        {appliedCoupon && couponDiscount > 0 && (
                          <div className="flex justify-between text-xs text-green-400 font-bold">
                            <span>Promo ({appliedCoupon.code})</span>
                            <span>-${couponDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Total Duration</span>
                          <span>{getTotalDuration()} min</span>
                        </div>
                        
                        {/* Points to Earn */}
                        {pointsToEarn > 0 && customer && (
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1 text-secondary">
                              <Gift className="w-3 h-3" />
                              Points to Earn
                            </span>
                            <span className="text-secondary font-bold">+{pointsToEarn} pts</span>
                          </div>
                        )}

                        {/* Deductions */}
                        {walletDeduction > 0 && (
                          <div className="flex justify-between text-xs text-green-400">
                            <span>Wallet Balance</span>
                            <span>-${walletDeduction.toFixed(2)}</span>
                          </div>
                        )}
                        {pointsDeduction > 0 && (
                          <div className="flex justify-between text-xs text-secondary">
                            <span>Points Redeemed</span>
                            <span>-${pointsDeduction.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-white/10">
                          <span className="text-sm font-serif font-bold">
                            Final Amount to Pay
                          </span>
                          <span className="text-2xl font-serif font-bold text-secondary">
                            ${(cartTotal - couponDiscount - totalDeductions).toFixed(2)}
                          </span>
                        </div>

                        {/* Payment Method Badge */}
                        <div className="flex justify-center">
                          <Badge variant="outline" className="border-white/20 text-white/80 text-[10px]">
                            {paymentMethod === 'cash' && 'Cash on Delivery'}
                            {paymentMethod === 'wallet' && 'Digital Wallet'}
                            {paymentMethod === 'mixed' && 'Mixed Payment'}
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-secondary hover:bg-secondary/90 text-primary font-bold py-6 rounded-lg tracking-[0.2em] text-xs shadow-lg shadow-secondary/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                        disabled={!customerName || !customerEmail || !selectedDate || !selectedTime || cartItems.some(item => !item.staffMember) || !isLoggedIn}
                        onClick={handleConfirmBooking}
                      >
                        CONFIRM BOOKING
                      </Button>
                      <p className="text-[9px] text-center text-white/40 uppercase tracking-widest">
                        Secure checkout & instant confirmation
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export default with Suspense wrapper
export default function BookingCheckout() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading...</div>}>
      <BookingCheckoutContent />
    </Suspense>
  );
}
