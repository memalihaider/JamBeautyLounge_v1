'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/shared/Header';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles, Loader2, Check } from 'lucide-react';

// Firebase imports
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext'; // UPDATED: Import useAuth

export default function CustomerLogin() {
  const router = useRouter();
  const { login: authLogin } = useAuth(); // UPDATED: Use auth context
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use AuthContext for login (with isCustomer = true)
      await authLogin(loginData.email, loginData.password, true);
      // AuthContext will handle the redirect to /customer/portal
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      console.log('📝 Starting registration process...');
      
      // Step 1: Firebase Authentication mein user create karein
      console.log('1. Creating user in Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );

      const user = userCredential.user;
      console.log('✅ Firebase Auth user created with UID:', user.uid);
      
      // Step 2: Firestore ke "customers" collection mein data store karein
      // IMPORTANT: Use user.uid as document ID for consistency
      console.log('2. Saving to Firestore...');
      const customerData = {
        uid: user.uid,
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
        role: "customer",
        emailVerified: false,
        lastLogin: serverTimestamp()
      };

      // Use setDoc with user.uid as document ID
      await setDoc(doc(db, "customers", user.uid), customerData);
      console.log('✅ Customer saved to Firestore with UID:', user.uid);
      
      // Step 3: Also create in "users" collection for AuthContext compatibility
      // This prevents the "User document not found" error
      await setDoc(doc(db, "users", user.uid), {
        email: registerData.email,
        name: registerData.name,
        role: "customer", // IMPORTANT: Set role as customer
        createdAt: serverTimestamp(),
        status: "active"
      });
      console.log('✅ User also saved to users collection');

      // Step 4: Local storage mein save karein for customer portal
      const customerObj = {
        uid: user.uid,
        email: registerData.email,
        name: registerData.name,
        phone: registerData.phone,
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('customerAuth', JSON.stringify({
        isAuthenticated: true,
        customer: customerObj
      }));
      
      localStorage.setItem('user', JSON.stringify(customerObj));
      
      console.log('✅ Local storage updated');

      // Step 5: Auto login the user
      console.log('3. Auto-login after registration...');
      await signInWithEmailAndPassword(auth, registerData.email, registerData.password);
      
      // Success message
      setSuccess('Account created successfully! Redirecting...');
      
      // Redirect to customer portal
      setTimeout(() => {
        router.push('/customer/portal');
      }, 1500);

    } catch (firebaseError: any) {
      console.error("❌ Firebase Error: ", firebaseError);
      
      // Firebase specific error messages
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Registration failed: ${firebaseError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <Header />
      
      <div className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-6 border border-secondary/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-secondary font-black tracking-[0.2em] uppercase text-[10px]">The Sanctuary Portal</span>
            </div>
            <h1 className="text-5xl font-serif font-bold text-primary mb-4 tracking-tight">
              Welcome to <br /><span className="text-secondary italic">JAM Beauty Lounge</span>
            </h1>
            <p className="text-muted-foreground font-light text-lg">
              Sign in to manage your rituals and profile
            </p>
          </div>

          <Card className="border border-secondary/10 shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-50/50 p-2 rounded-none border-b border-gray-100">
                <TabsTrigger value="login" className="rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-500">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-500">Join Us</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="p-0">
                <CardHeader className="pb-4 pt-10 px-10">
                  <CardTitle className="text-2xl font-serif font-bold text-primary">Resume Your Journey</CardTitle>
                  <CardDescription className="text-gray-400">Enter your credentials to access your sanctuary account</CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                  <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[13px] font-medium flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="bg-green-50 border border-green-100 text-green-600 px-5 py-4 rounded-2xl text-[13px] font-medium flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        {success}
                      </div>
                    )}
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@sanctuary.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Secure Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          className="pl-11 pr-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input type="checkbox" className="peer appearance-none w-5 h-5 rounded-lg border-2 border-gray-200 checked:bg-secondary checked:border-secondary transition-all" />
                          <Check className="absolute w-3 h-3 text-primary opacity-0 peer-checked:opacity-100 left-1 transition-opacity" />
                        </div>
                        <span className="text-xs text-gray-400 font-medium group-hover:text-primary transition-colors">Remember my ritual</span>
                      </label>
                      <a href="#" className="text-xs text-secondary hover:text-primary font-bold tracking-tight transition-colors underline-offset-4 hover:underline">Forgot password?</a>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-16 bg-primary hover:bg-secondary text-white hover:text-primary font-black tracking-[0.3em] text-[10px] rounded-2xl transition-all duration-500 shadow-xl shadow-primary/10 hover:shadow-secondary/20 uppercase"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Entering...
                        </>
                      ) : (
                        <>
                          ENTER THE LOUNGE
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="p-0">
                <CardHeader className="pb-4 pt-10 px-10">
                  <CardTitle className="text-2xl font-serif font-bold text-primary">Begin Your Journey</CardTitle>
                  <CardDescription className="text-gray-400">Join the JAM elite and unlock a world of bespoke beauty</CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                  <form onSubmit={handleRegister} className="space-y-5">
                    {/* Success Message */}
                    {success && (
                      <div className="bg-green-50 border border-green-100 text-green-600 px-5 py-4 rounded-2xl text-[13px] font-medium flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        {success}
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[13px] font-medium flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your Name"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@example.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Phone Number</Label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Contact Number"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Choose Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          className="pl-11 pr-11 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-16 bg-secondary hover:bg-primary text-primary hover:text-white font-black tracking-[0.3em] text-[10px] rounded-2xl transition-all duration-500 shadow-xl shadow-secondary/10 hover:shadow-primary/20 uppercase"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create My Sanctuary Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Back Link */}
          <div className="text-center mt-12 pb-10">
            <Link href="/" className="text-gray-400 hover:text-secondary text-xs font-black tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 group">
              <span className="group-hover:-translate-x-2 transition-transform duration-500">←</span>
              Back to the Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}