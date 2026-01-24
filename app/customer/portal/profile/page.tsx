'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ChevronLeft,
  Loader2,
  Save,
  CheckCircle,
  Camera,
  Building,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useCustomerStore, type Customer } from '@/stores/customer.store';

export default function CustomerProfile() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    preferredBranch: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { getCustomerByEmail, updateCustomer } = useCustomerStore();

  useEffect(() => {
    const checkAuth = () => {
      const authData = localStorage.getItem('customerAuth');
      if (!authData) {
        router.push('/customer/login');
        return;
      }

      try {
        const { isAuthenticated, customer: customerData } = JSON.parse(authData);
        if (!isAuthenticated) {
          router.push('/customer/login');
          return;
        }

        const fullCustomer = getCustomerByEmail(customerData.email);
        if (fullCustomer) {
          setCustomer(fullCustomer);
          setFormData({
            name: fullCustomer.name || '',
            email: fullCustomer.email || '',
            phone: fullCustomer.phone || '',
            dateOfBirth: fullCustomer.dateOfBirth || '',
            gender: fullCustomer.gender || '',
            address: fullCustomer.address || '',
            preferredBranch: fullCustomer.preferredBranch || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        } else {
          setCustomer({
            id: 'temp-' + customerData.email,
            email: customerData.email,
            name: customerData.name,
            phone: customerData.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setFormData({
            name: customerData.name || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            dateOfBirth: '',
            gender: '',
            address: '',
            preferredBranch: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
      } catch (error) {
        router.push('/customer/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, getCustomerByEmail]);

  const handleSave = async () => {
    if (!customer) return;
    
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateCustomer(customer.id, {
      name: formData.name,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as 'male' | 'female' | 'other' | undefined,
      address: formData.address,
      preferredBranch: formData.preferredBranch,
    });

    // Update localStorage
    const authData = localStorage.getItem('customerAuth');
    if (authData) {
      const parsed = JSON.parse(authData);
      parsed.customer.name = formData.name;
      parsed.customer.phone = formData.phone;
      localStorage.setItem('customerAuth', JSON.stringify(parsed));
    }
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Header />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/customer/portal">
              <Button variant="ghost" className="p-2 hover:bg-gray-100 rounded-xl">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary">My Profile</h1>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>
          </div>

          {/* Profile Avatar Section */}
          <Card className="border-none shadow-lg rounded-2xl mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-secondary">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-secondary text-white text-2xl font-bold">
                      {customer.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-primary">{customer.name}</h2>
                  <p className="text-muted-foreground">{customer.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border-none shadow-lg rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-secondary" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-12 rounded-xl border-gray-200"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10 h-12 rounded-xl border-gray-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-widest">
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="pl-10 h-12 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-widest">
                    Gender
                  </Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-xs font-bold uppercase tracking-widest">
                    Preferred Branch
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Select 
                      value={formData.preferredBranch} 
                      onValueChange={(value) => setFormData({ ...formData, preferredBranch: value })}
                    >
                      <SelectTrigger className="pl-10 h-12 rounded-xl border-gray-200">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="branch1">Downtown Branch</SelectItem>
                        <SelectItem value="branch2">Uptown Branch</SelectItem>
                        <SelectItem value="branch3">Mall Branch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10 rounded-xl border-gray-200 min-h-[100px]"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-none shadow-lg rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-secondary" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-widest">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="pl-10 pr-10 h-12 rounded-xl border-gray-200"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-widest">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="h-12 rounded-xl border-gray-200"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="h-12 rounded-xl border-gray-200"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Profile updated successfully!</span>
              </div>
            )}
            <div className="ml-auto">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-secondary hover:bg-secondary/90 text-primary rounded-xl px-8 h-12 font-bold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
