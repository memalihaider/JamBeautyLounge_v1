'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Palette, 
  Lock, 
  Bell, 
  CreditCard, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Wallet,
  Banknote,
  Smartphone
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

interface PortalBranding {
  portalName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  tagline: string;
  updatedAt: Timestamp;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  orderUpdates: boolean;
  reviewNotifications: boolean;
  updatedAt: Timestamp;
}

interface PaymentMethod {
  id: string;
  type: 'cash' | 'credit_card' | 'digital_wallet' | 'bank_transfer' | 'stripe' | 'paypal';
  name: string;
  isEnabled: boolean;
  config?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const paymentMethodOptions = [
  { value: 'cash', label: 'Cash on Delivery', icon: Banknote, color: 'bg-green-100 text-green-700' },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard, color: 'bg-blue-100 text-blue-700' },
  { value: 'digital_wallet', label: 'Digital Wallet', icon: Wallet, color: 'bg-purple-100 text-purple-700' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: DollarSign, color: 'bg-orange-100 text-orange-700' },
  { value: 'stripe', label: 'Stripe', icon: CreditCard, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'paypal', label: 'PayPal', icon: Smartphone, color: 'bg-cyan-100 text-cyan-700' },
];

export default function SuperAdminSettings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingMethodConfig, setEditingMethodConfig] = useState<PaymentMethod | null>(null);
  const [methodConfig, setMethodConfig] = useState<Record<string, any>>({});
  const auth = getAuth();

  // Branding state
  const [branding, setBranding] = useState<PortalBranding>({
    portalName: 'Man of Cave',
    primaryColor: '#1a1a1a',
    secondaryColor: '#FF6B00',
    logoUrl: '',
    tagline: 'Premium Beauty & Grooming Solutions',
    updatedAt: Timestamp.now(),
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    orderUpdates: true,
    reviewNotifications: true,
    updatedAt: Timestamp.now(),
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('');

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);

        // Fetch portal branding
        const brandingDoc = await getDoc(doc(db, 'settings', 'branding'));
        if (brandingDoc.exists()) {
          setBranding(brandingDoc.data() as PortalBranding);
        }

        // Fetch notifications
        const notificationsDoc = await getDoc(doc(db, 'settings', 'notifications'));
        if (notificationsDoc.exists()) {
          setNotifications(notificationsDoc.data() as NotificationSettings);
        }

        // Fetch payment methods
        const paymentMethodsQuery = query(
          collection(db, 'settings/payment_methods/methods'),
        );
        const paymentSnapshot = await getDocs(paymentMethodsQuery);
        const methods: PaymentMethod[] = [];
        paymentSnapshot.forEach((doc) => {
          methods.push({ id: doc.id, ...doc.data() } as PaymentMethod);
        });
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setErrorMessage('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Branding handlers
  const handleBrandingChange = (field: keyof PortalBranding, value: any) => {
    setBranding({ ...branding, [field]: value });
  };

  const saveBrandingSettings = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      await setDoc(doc(db, 'settings', 'branding'), {
        ...branding,
        updatedAt: Timestamp.now(),
      });

      setSuccessMessage('Portal branding updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving branding:', error);
      setErrorMessage('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('User not authenticated');
      }

      // Reauthenticate
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordForm.newPassword);

      setSuccessMessage('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        setErrorMessage('Current password is incorrect');
      } else {
        setErrorMessage('Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  };

  // Notifications handler
  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications({ ...notifications, [field]: value });
  };

  const saveNotificationSettings = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      await setDoc(doc(db, 'settings', 'notifications'), {
        ...notifications,
        updatedAt: Timestamp.now(),
      });

      setSuccessMessage('Notification settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving notifications:', error);
      setErrorMessage('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  // Payment methods handlers
  const addPaymentMethod = async () => {
    if (!selectedPaymentType) {
      setErrorMessage('Please select a payment method type');
      return;
    }

    const methodExists = paymentMethods.some(m => m.type === selectedPaymentType);
    if (methodExists) {
      setErrorMessage('This payment method is already added');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      const methodOption = paymentMethodOptions.find(m => m.value === selectedPaymentType);
      if (!methodOption) throw new Error('Invalid payment method');

      const newMethod: PaymentMethod = {
        id: selectedPaymentType,
        type: selectedPaymentType as any,
        name: methodOption.label,
        isEnabled: true,
        config: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(
        doc(db, `settings/payment_methods/methods/${selectedPaymentType}`),
        newMethod
      );

      setPaymentMethods([...paymentMethods, newMethod]);
      setSelectedPaymentType('');
      setSuccessMessage('Payment method added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding payment method:', error);
      setErrorMessage('Failed to add payment method');
    } finally {
      setSaving(false);
    }
  };

  const togglePaymentMethod = async (methodId: string, isEnabled: boolean) => {
    try {
      setSaving(true);

      await updateDoc(
        doc(db, `settings/payment_methods/methods/${methodId}`),
        { isEnabled: !isEnabled, updatedAt: Timestamp.now() }
      );

      setPaymentMethods(
        paymentMethods.map(m =>
          m.id === methodId ? { ...m, isEnabled: !m.isEnabled } : m
        )
      );
    } catch (error) {
      console.error('Error toggling payment method:', error);
      setErrorMessage('Failed to update payment method');
    } finally {
      setSaving(false);
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;

    try {
      setSaving(true);

      await deleteDoc(doc(db, `settings/payment_methods/methods/${methodId}`));
      setPaymentMethods(paymentMethods.filter(m => m.id !== methodId));
      setSuccessMessage('Payment method removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setErrorMessage('Failed to delete payment method');
    } finally {
      setSaving(false);
    }
  };

  // Payment method configuration handlers
  const openConfigModal = (method: PaymentMethod) => {
    setEditingMethodConfig(method);
    setMethodConfig(method.config || {});
    setShowConfigModal(true);
  };

  const closeConfigModal = () => {
    setShowConfigModal(false);
    setEditingMethodConfig(null);
    setMethodConfig({});
  };

  const savePaymentMethodConfig = async () => {
    if (!editingMethodConfig) return;

    try {
      setSaving(true);
      setErrorMessage('');

      const updatedMethod: PaymentMethod = {
        ...editingMethodConfig,
        config: methodConfig,
        updatedAt: Timestamp.now(),
      };

      await setDoc(
        doc(db, `settings/payment_methods/methods/${editingMethodConfig.id}`),
        updatedMethod
      );

      setPaymentMethods(
        paymentMethods.map(m =>
          m.id === editingMethodConfig.id ? updatedMethod : m
        )
      );

      setSuccessMessage(`${editingMethodConfig.name} configuration saved successfully!`);
      closeConfigModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving payment method config:', error);
      setErrorMessage('Failed to save payment method configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <AdminSidebar
          role="super_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
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
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Portal Settings</h1>
                  <p className="text-sm text-gray-600">Manage portal branding, security, notifications, and payment methods</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
                <Button variant="outline" onClick={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              {/* Messages */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700">{successMessage}</p>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Settings Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white border border-gray-200 shadow-sm">
                  <TabsTrigger value="branding" className="gap-2">
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">Branding</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-2">
                    <Lock className="w-4 h-4" />
                    <span className="hidden sm:inline">Security</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-2">
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden sm:inline">Payments</span>
                  </TabsTrigger>
                </TabsList>

                {/* Branding Tab */}
                <TabsContent value="branding" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Portal Branding</CardTitle>
                      <CardDescription>Customize your portal appearance and branding</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Portal Name */}
                        <div className="space-y-2">
                          <Label htmlFor="portalName">Portal Name</Label>
                          <Input
                            id="portalName"
                            value={branding.portalName}
                            onChange={(e) => handleBrandingChange('portalName', e.target.value)}
                            placeholder="Enter portal name"
                            className="text-base"
                          />
                          <p className="text-xs text-gray-500">Display name for your beauty salon portal</p>
                        </div>

                        {/* Tagline */}
                        <div className="space-y-2">
                          <Label htmlFor="tagline">Tagline</Label>
                          <Input
                            id="tagline"
                            value={branding.tagline}
                            onChange={(e) => handleBrandingChange('tagline', e.target.value)}
                            placeholder="Enter portal tagline"
                            className="text-base"
                          />
                          <p className="text-xs text-gray-500">Short description of your salon</p>
                        </div>

                        {/* Primary Color */}
                        <div className="space-y-2">
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="primaryColor"
                              type="color"
                              value={branding.primaryColor}
                              onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                              className="w-20 h-10 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={branding.primaryColor}
                              onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                              placeholder="#000000"
                              className="flex-1 text-sm font-mono"
                            />
                          </div>
                        </div>

                        {/* Secondary Color */}
                        <div className="space-y-2">
                          <Label htmlFor="secondaryColor">Secondary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="secondaryColor"
                              type="color"
                              value={branding.secondaryColor}
                              onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                              className="w-20 h-10 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={branding.secondaryColor}
                              onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                              placeholder="#FF6B00"
                              className="flex-1 text-sm font-mono"
                            />
                          </div>
                        </div>

                        {/* Logo URL */}
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="logoUrl">Logo URL</Label>
                          <Input
                            id="logoUrl"
                            value={branding.logoUrl}
                            onChange={(e) => handleBrandingChange('logoUrl', e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="text-base"
                          />
                          <p className="text-xs text-gray-500">URL to your portal logo image</p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="border-t pt-6">
                        <h3 className="font-semibold text-sm mb-4">Preview</h3>
                        <div className="p-6 rounded-lg border-2" style={{ borderColor: branding.secondaryColor }}>
                          <div style={{ color: branding.primaryColor }} className="mb-2">
                            <div className="text-2xl font-bold">{branding.portalName}</div>
                            <div className="text-sm opacity-75">{branding.tagline}</div>
                          </div>
                          <div className="flex gap-2">
                            <div
                              className="w-12 h-12 rounded"
                              style={{ backgroundColor: branding.primaryColor }}
                            />
                            <div
                              className="w-12 h-12 rounded"
                              style={{ backgroundColor: branding.secondaryColor }}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={saveBrandingSettings}
                        disabled={saving}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        {saving ? 'Saving...' : 'Save Branding Settings'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your account password and security</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        {/* Current Password */}
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              placeholder="Enter current password"
                              className="pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            required
                          />
                          <p className="text-xs text-gray-500">Minimum 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={saving}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                          {saving ? 'Updating...' : 'Update Password'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Configure how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {/* Notification Toggles */}
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                          { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via SMS' },
                          { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser notifications' },
                          { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Get reminded about upcoming appointments' },
                          { key: 'orderUpdates', label: 'Order Updates', description: 'Notifications for new orders' },
                          { key: 'reviewNotifications', label: 'Review Notifications', description: 'Notify when customers leave reviews' },
                        ].map(({ key, label, description }) => (
                          <div key={key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50">
                            <div>
                              <p className="font-medium text-sm">{label}</p>
                              <p className="text-xs text-gray-500">{description}</p>
                            </div>
                            <button
                              onClick={() =>
                                handleNotificationChange(
                                  key as keyof NotificationSettings,
                                  !notifications[key as keyof NotificationSettings]
                                )
                              }
                              className={cn(
                                'relative w-12 h-6 rounded-full transition-colors',
                                notifications[key as keyof NotificationSettings]
                                  ? 'bg-primary'
                                  : 'bg-gray-300'
                              )}
                            >
                              <div
                                className={cn(
                                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                                  notifications[key as keyof NotificationSettings] ? 'translate-x-6' : ''
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={saveNotificationSettings}
                        disabled={saving}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        {saving ? 'Saving...' : 'Save Notification Preferences'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment Methods Tab */}
                <TabsContent value="payments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Methods</CardTitle>
                      <CardDescription>Manage available payment methods for customers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Add Payment Method */}
                      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm">Add New Payment Method</h3>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={selectedPaymentType}
                              onChange={(e) => setSelectedPaymentType(e.target.value)}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="">Select payment method...</option>
                              {paymentMethodOptions
                                .filter(m => !paymentMethods.some(pm => pm.type === m.value))
                                .map(method => (
                                  <option key={method.value} value={method.value}>
                                    {method.label}
                                  </option>
                                ))}
                            </select>
                            <Button
                              onClick={addPaymentMethod}
                              disabled={saving || !selectedPaymentType}
                              className="bg-primary hover:bg-primary/90 gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="hidden sm:inline">Add</span>
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Active Payment Methods */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Active Payment Methods</h3>
                        {paymentMethods.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No payment methods added yet</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {paymentMethods.map(method => {
                              const methodOption = paymentMethodOptions.find(m => m.value === method.type);
                              const Icon = methodOption?.icon || CreditCard;

                              return (
                                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50">
                                  <div className="flex items-center gap-3">
                                    <div className={cn('p-2 rounded-lg', methodOption?.color || 'bg-gray-100 text-gray-700')}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{methodOption?.label || method.name}</p>
                                      <Badge
                                        className={cn(
                                          'text-[9px] mt-1',
                                          method.isEnabled
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                        )}
                                      >
                                        {method.isEnabled ? 'Enabled' : 'Disabled'}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openConfigModal(method)}
                                      disabled={saving}
                                      className="text-primary border-primary hover:bg-primary/10"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </Button>

                                    <button
                                      onClick={() => togglePaymentMethod(method.id, method.isEnabled)}
                                      disabled={saving}
                                      className={cn(
                                        'relative w-10 h-6 rounded-full transition-colors',
                                        method.isEnabled ? 'bg-primary' : 'bg-gray-300'
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                                          method.isEnabled ? 'translate-x-4' : ''
                                        )}
                                      />
                                    </button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deletePaymentMethod(method.id)}
                                      disabled={saving}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Integration Info */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-sm text-blue-900 mb-2">Integration Information</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• <strong>Cash on Delivery:</strong> No setup required - customers pay at salon</li>
                          <li>• <strong>Digital Wallet:</strong> Requires wallet provider API key</li>
                          <li>• <strong>Stripe:</strong> Connect your Stripe account in advanced settings</li>
                          <li>• <strong>PayPal:</strong> Link your PayPal business account for payments</li>
                          <li>• <strong>Bank Transfer:</strong> Provide account details in payment settings</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Payment Method Configuration Modal */}
              {showConfigModal && editingMethodConfig && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CardHeader>
                      <CardTitle>Configure {editingMethodConfig.name}</CardTitle>
                      <CardDescription>Set up your {editingMethodConfig.name} API credentials and configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Stripe Configuration */}
                      {editingMethodConfig.type === 'stripe' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="stripe_publishable_key">Publishable Key</Label>
                            <Input
                              id="stripe_publishable_key"
                              type="password"
                              value={methodConfig.publishable_key || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, publishable_key: e.target.value })}
                              placeholder="pk_live_..."
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">Your Stripe publishable key (starts with pk_)</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stripe_secret_key">Secret Key</Label>
                            <Input
                              id="stripe_secret_key"
                              type="password"
                              value={methodConfig.secret_key || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, secret_key: e.target.value })}
                              placeholder="sk_live_..."
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">Your Stripe secret key (starts with sk_)</p>
                          </div>
                        </div>
                      )}

                      {/* PayPal Configuration */}
                      {editingMethodConfig.type === 'paypal' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="paypal_client_id">Client ID</Label>
                            <Input
                              id="paypal_client_id"
                              type="password"
                              value={methodConfig.client_id || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, client_id: e.target.value })}
                              placeholder="AZ1234..."
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">Your PayPal API Client ID</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paypal_secret">Secret Key</Label>
                            <Input
                              id="paypal_secret"
                              type="password"
                              value={methodConfig.secret || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, secret: e.target.value })}
                              placeholder="EB1234..."
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">Your PayPal API Secret</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paypal_mode">Environment</Label>
                            <select
                              id="paypal_mode"
                              value={methodConfig.mode || 'sandbox'}
                              onChange={(e) => setMethodConfig({ ...methodConfig, mode: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="sandbox">Sandbox (Testing)</option>
                              <option value="live">Live (Production)</option>
                            </select>
                            <p className="text-xs text-gray-500">Choose environment for payments</p>
                          </div>
                        </div>
                      )}

                      {/* Digital Wallet Configuration */}
                      {editingMethodConfig.type === 'digital_wallet' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="wallet_provider">Wallet Provider</Label>
                            <select
                              id="wallet_provider"
                              value={methodConfig.provider || 'apple_pay'}
                              onChange={(e) => setMethodConfig({ ...methodConfig, provider: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="apple_pay">Apple Pay</option>
                              <option value="google_pay">Google Pay</option>
                              <option value="samsung_pay">Samsung Pay</option>
                              <option value="alipay">Alipay</option>
                              <option value="wechat_pay">WeChat Pay</option>
                            </select>
                            <p className="text-xs text-gray-500">Select which digital wallet to support</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wallet_api_key">API Key</Label>
                            <Input
                              id="wallet_api_key"
                              type="password"
                              value={methodConfig.api_key || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, api_key: e.target.value })}
                              placeholder="Your wallet provider API key"
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500">API key from your wallet provider</p>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer Configuration */}
                      {editingMethodConfig.type === 'bank_transfer' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="bank_account_name">Account Holder Name</Label>
                            <Input
                              id="bank_account_name"
                              value={methodConfig.account_name || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, account_name: e.target.value })}
                              placeholder="Your business name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank_account_number">Account Number</Label>
                            <Input
                              id="bank_account_number"
                              type="password"
                              value={methodConfig.account_number || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, account_number: e.target.value })}
                              placeholder="Bank account number"
                              className="font-mono text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank_routing_number">Routing Number</Label>
                            <Input
                              id="bank_routing_number"
                              value={methodConfig.routing_number || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, routing_number: e.target.value })}
                              placeholder="Bank routing number"
                              className="font-mono text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input
                              id="bank_name"
                              value={methodConfig.bank_name || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, bank_name: e.target.value })}
                              placeholder="Your bank name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank_swift_code">SWIFT Code</Label>
                            <Input
                              id="bank_swift_code"
                              value={methodConfig.swift_code || ''}
                              onChange={(e) => setMethodConfig({ ...methodConfig, swift_code: e.target.value })}
                              placeholder="International bank SWIFT code (optional)"
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Credit Card Configuration */}
                      {editingMethodConfig.type === 'credit_card' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="card_processor">Card Processor</Label>
                            <select
                              id="card_processor"
                              value={methodConfig.processor || 'stripe'}
                              onChange={(e) => setMethodConfig({ ...methodConfig, processor: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="stripe">Stripe</option>
                              <option value="square">Square</option>
                              <option value="paymentexpress">Payment Express</option>
                            </select>
                            <p className="text-xs text-gray-500">Choose your card processing provider</p>
                          </div>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                              <strong>Note:</strong> Credit card processing requires PCI DSS compliance. Make sure your provider handles all sensitive data.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Cash Configuration (No setup needed) */}
                      {editingMethodConfig.type === 'cash' && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Cash on Delivery</strong> requires no configuration. Customers will pay when they visit your salon.
                          </p>
                        </div>
                      )}

                      {/* Configuration Buttons */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={closeConfigModal}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={savePaymentMethodConfig}
                          disabled={saving}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                          {saving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}