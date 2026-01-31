# 🏢 Multi-Tenant Platform Documentation

## 📖 Table of Contents

1. [Overview](#overview)
2. [Largify Solutions Platform](#largify-solutions-platform)
3. [Architecture Design](#architecture-design)
4. [Database Schema](#database-schema)
5. [Implementation Guide](#implementation-guide)
6. [Security & Access Control](#security--access-control)
7. [Dynamic Theming & Branding](#dynamic-theming--branding)
8. [Tenant Management](#tenant-management)
9. [Migration Strategy](#migration-strategy)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Multi-Tenancy?

Multi-tenancy is a software architecture where a single instance of the application serves multiple customers (tenants). Each tenant's data is isolated and remains invisible to other tenants.

### Current vs. Multi-Tenant Architecture

#### **Current Architecture:**
```
Single Application
└── Single Firebase Database
    ├── branches/
    ├── clients/
    ├── bookings/
    └── staff/
    
❌ All clients share the same data
❌ Same UI/branding for everyone
❌ No tenant isolation
```

#### **Multi-Tenant Architecture:**
```
Single Application
└── Single Firebase Database
    ├── tenants/
    │   ├── tenant-abc (Salon Paradise)
    │   └── tenant-xyz (Beauty Elite)
    │
    ├── clients/
    │   ├── client-1 (tenantId: abc)
    │   └── client-2 (tenantId: xyz)
    │
    └── bookings/
        ├── booking-1 (tenantId: abc)
        └── booking-2 (tenantId: xyz)

✅ Each tenant has isolated data
✅ Custom branding per tenant
✅ Separate feature sets
✅ Individual billing
```

### Benefits

- **💰 Cost Efficiency**: Single codebase serving multiple clients
- **🎨 Customization**: Each client gets unique branding
- **🔒 Data Isolation**: Complete data privacy between tenants
- **📈 Scalability**: Easy to onboard new clients
- **💼 SaaS Model**: Recurring revenue from subscriptions

---

## Largify Solutions Platform

### Platform Overview

**Largify Solutions** is the parent company that provides a complete **Salon Management System** as a product. Salons and beauty businesses purchase this system to run their entire operations.

### Platform Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    LARGIFY SOLUTIONS                         │
│              (Main Platform - SaaS Provider)                 │
│                                                              │
│  🌐 Landing Page: www.saloons.largifysolutions.com                  │
│  📊 Platform Admin: saloons.admin.largifysolutions.com              │
│  💳 Subscription Management                                  │
│  👥 Client Portal                                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Sells System To
                          ↓
    ┌─────────────────────────────────────────────────┐
    │         INDIVIDUAL SALON BUSINESSES             │
    │          (Purchased Complete System)            │
    └─────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
    
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ SALON #1    │   │ SALON #2    │   │ SALON #3    │
│ Paradise    │   │ Elite Beauty│   │ Luxury Spa  │
├─────────────┤   ├─────────────┤   ├─────────────┤
│ Custom      │   │ Custom      │   │ Custom      │
│ Domain:     │   │ Domain:     │   │ Domain:     │
│ paradise.com│   │ elite.com   │   │ luxury.com  │
├─────────────┤   ├─────────────┤   ├─────────────┤
│ Own Theme   │   │ Own Theme   │   │ Own Theme   │
│ Own Data    │   │ Own Data    │   │ Own Data    │
│ Own Portal  │   │ Own Portal  │   │ Own Portal  │
└─────────────┘   └─────────────┘   └─────────────┘
```

### What Largify Solutions Provides

#### 1. **Main Landing Page** (www.largifysolutions.com)

**Purpose:** Showcase and sell the salon management system

**Features:**
- Product showcase (features, pricing, demos)
- Subscription plans (Basic, Professional, Enterprise)
- Sign-up flow for new salon businesses
- Customer testimonials
- Documentation & Support
- Live demo booking

**Pages Structure:**
```
largifysolutions.com/
├── / (Home - Product showcase)
├── /features (System features)
├── /pricing (Subscription plans)
├── /demo (Request demo)
├── /signup (Purchase & onboarding)
├── /login (Client portal login)
├── /docs (Documentation)
└── /support (Help center)
```

#### 2. **Platform Admin Portal** (admin.largifysolutions.com)

**Purpose:** Largify team manages all salon clients

**Capabilities:**
- View all purchased systems (salons)
- Monitor subscriptions & billing
- Approve domain connections
- Manage theme marketplace
- View platform analytics
- Customer support dashboard
- System health monitoring

#### 3. **Client Management Portal** (portal.largifysolutions.com)

**Purpose:** Salon owners manage their purchased system

**Capabilities:**
- View subscription details
- Connect custom domain
- Configure DNS settings
- Select website theme
- Manage billing information
- Access system documentation
- Submit support tickets
- View usage analytics

---

### Customer Journey Flow

```
Step 1: DISCOVERY
Salon owner visits → www.largifysolutions.com
Views features, pricing, demos

↓

Step 2: PURCHASE
Clicks "Get Started" → Selects plan
Fills registration form:
- Salon name
- Contact details
- Admin credentials
- Payment information

↓

Step 3: SYSTEM PROVISIONING (Automatic)
✅ Create tenant in database
✅ Generate unique subdomain (temp: paradise.largify.app)
✅ Create default admin user
✅ Setup initial database
✅ Send welcome email

↓

Step 4: INITIAL SETUP
Salon owner logs in → portal.largifysolutions.com
Completes setup wizard:
1. Business information
2. Theme selection
3. Domain connection (optional)
4. Initial configuration

↓

Step 5: DOMAIN CONNECTION (Optional)
If customer wants custom domain:
1. Purchase domain (paradise.com)
2. Enter domain in portal
3. Get DNS configuration
4. Add records to domain provider
5. Largify verifies & activates

↓

Step 6: SYSTEM READY
Salon website live at:
- paradise.com (custom domain) OR
- paradise.largify.app (default subdomain)

Admin portal accessible at:
- admin.paradise.com OR
- paradise.largify.app/admin

↓

Step 7: ONGOING MANAGEMENT
- Monthly/Annual billing
- Feature updates
- Support access
- Theme updates
- Analytics & reporting
```

---

### Database Schema for Platform Level

#### 1. **platform_clients** Collection

```typescript
interface PlatformClient {
  id: string;                        // Client ID
  
  // Business Information
  businessName: string;               // "Paradise Salon & Spa"
  ownerName: string;                  // "John Doe"
  email: string;                      // Primary contact
  phone: string;
  
  // Subscription
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise';
    status: 'trial' | 'active' | 'suspended' | 'cancelled';
    billingCycle: 'monthly' | 'annual';
    
    // Dates
    startDate: Date;
    trialEndsAt?: Date;
    nextBillingDate: Date;
    cancelledAt?: Date;
    
    // Pricing
    monthlyPrice: number;             // 99, 199, 499
    annualPrice: number;              // 999, 1999, 4999
    discount?: number;                // Promotional discount
    
    // Payment
    paymentMethod: 'card' | 'invoice' | 'check';
    lastPaymentDate?: Date;
    lastPaymentAmount?: number;
    paymentFailures: number;
  };
  
  // System Configuration
  system: {
    tenantId: string;                 // Reference to tenants collection
    subdomain: string;                // paradise.largify.app
    customDomain?: string;            // paradise.com
    domainStatus: 'pending' | 'verified' | 'failed';
    themeId: string;                  // Selected theme
    status: 'provisioning' | 'active' | 'suspended';
  };
  
  // Features & Limits (based on plan)
  limits: {
    maxBranches: number;
    maxStaff: number;
    maxClients: number;
    storageGB: number;
  };
  
  // Current Usage
  usage: {
    branches: number;
    staff: number;
    clients: number;
    storageGB: number;
    apiCalls: number;                 // Monthly API usage
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  setupCompleted: boolean;
  onboardingStep: number;             // Wizard step (1-5)
}
```

#### 2. **themes** Collection

```typescript
interface Theme {
  id: string;
  name: string;                       // "Elegant Pink", "Modern Dark"
  category: 'beauty' | 'barbershop' | 'spa' | 'wellness';
  
  preview: {
    thumbnail: string;                // Preview image URL
    demoUrl: string;                  // Live demo URL
    screenshots: string[];            // Multiple preview images
  };
  
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  
  layout: {
    headerStyle: 'classic' | 'modern' | 'minimal';
    footerStyle: 'detailed' | 'simple';
    navigationStyle: 'sidebar' | 'top' | 'hamburger';
  };
  
  features: string[];                 // Available components
  pricing: 'free' | 'premium';
  
  status: 'active' | 'draft' | 'deprecated';
  createdAt: Date;
  downloads: number;
}
```

#### 3. **domain_requests** Collection

```typescript
interface DomainRequest {
  id: string;
  clientId: string;                   // Reference to platform_clients
  
  domain: string;                     // "paradise.com"
  status: 'pending' | 'dns_configured' | 'verified' | 'failed';
  
  // DNS Configuration
  dnsRecords: {
    type: 'A' | 'CNAME';
    host: string;
    value: string;
    verified: boolean;
    lastChecked?: Date;
  }[];
  
  // SSL Certificate
  ssl: {
    status: 'pending' | 'issued' | 'failed';
    provider: 'letsencrypt' | 'cloudflare';
    expiresAt?: Date;
    autoRenew: boolean;
  };
  
  requestedAt: Date;
  verifiedAt?: Date;
  notes?: string;
}
```

#### 4. **billing_transactions** Collection

```typescript
interface BillingTransaction {
  id: string;
  clientId: string;
  
  type: 'subscription' | 'one_time' | 'refund' | 'addon';
  amount: number;
  currency: string;                   // USD, AED, EUR
  
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Payment Details
  paymentMethod: 'card' | 'bank_transfer' | 'invoice';
  paymentGateway?: 'stripe' | 'paypal' | 'square';
  transactionId?: string;             // Gateway transaction ID
  
  // Invoice
  invoiceNumber: string;
  invoiceUrl?: string;
  
  // Metadata
  description: string;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  
  createdAt: Date;
  paidAt?: Date;
  refundedAt?: Date;
}
```

#### 5. **support_tickets** Collection

```typescript
interface SupportTicket {
  id: string;
  clientId: string;
  
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'feature_request' | 'bug' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
  
  // Assignment
  assignedTo?: string;                // Platform admin user ID
  
  // Communication
  messages: {
    id: string;
    from: 'client' | 'support';
    message: string;
    attachments?: string[];
    timestamp: Date;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}
```

---

### Implementation: Landing Page & Onboarding

#### Landing Page Structure

```typescript
// app/(landing)/page.tsx - NEW DIRECTORY

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </>
  );
}

// Example Hero Section
function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Complete Salon Management System
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Everything you need to manage appointments, staff, clients, 
          inventory, and grow your beauty business.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/signup">Start Free Trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">Request Demo</Link>
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div>
            <div className="text-4xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Salons Using</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">50K+</div>
            <div className="text-sm text-muted-foreground">Appointments</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

#### Pricing Section with Plans

```typescript
// app/(landing)/pricing/page.tsx

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small salons',
    monthlyPrice: 99,
    annualPrice: 999,
    features: [
      '1 Location',
      'Up to 5 Staff Members',
      'Up to 500 Clients',
      'Online Booking',
      'Basic Analytics',
      'Email Support',
    ],
    limits: {
      maxBranches: 1,
      maxStaff: 5,
      maxClients: 500,
      storageGB: 5,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses',
    monthlyPrice: 199,
    annualPrice: 1999,
    popular: true,
    features: [
      'Up to 5 Locations',
      'Up to 25 Staff Members',
      'Up to 2,500 Clients',
      'Online Booking',
      'Advanced Analytics',
      'Custom Reports',
      'Priority Support',
      'SMS Notifications',
    ],
    limits: {
      maxBranches: 5,
      maxStaff: 25,
      maxClients: 2500,
      storageGB: 25,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For established chains',
    monthlyPrice: 499,
    annualPrice: 4999,
    features: [
      'Unlimited Locations',
      'Unlimited Staff',
      'Unlimited Clients',
      'Everything in Professional',
      'White Label Solution',
      'API Access',
      'Dedicated Account Manager',
      'Custom Integrations',
    ],
    limits: {
      maxBranches: -1,
      maxStaff: -1,
      maxClients: -1,
      storageGB: -1,
    },
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground mb-8">
          All plans include 14-day free trial. No credit card required.
        </p>
        
        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-6 py-2 rounded-md transition',
              billingCycle === 'monthly' ? 'bg-white shadow' : ''
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={cn(
              'px-6 py-2 rounded-md transition',
              billingCycle === 'annual' ? 'bg-white shadow' : ''
            )}
          >
            Annual
            <span className="ml-2 text-xs text-green-600 font-semibold">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={plan.popular ? 'border-primary border-2' : ''}>
            {plan.popular && (
              <div className="bg-primary text-white text-center py-1 text-sm font-semibold">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                </span>
                <span className="text-muted-foreground">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link href={`/signup?plan=${plan.id}&billing=${billingCycle}`}>
                  Start Free Trial
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### Signup Flow with System Provisioning

```typescript
// app/(landing)/signup/page.tsx

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'basic';
  const billingCycle = searchParams.get('billing') || 'monthly';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    
    // Step 2: Subdomain
    subdomain: '',
    
    // Step 3: Admin Credentials
    adminPassword: '',
    
    // Step 4: Payment (skip for trial)
    cardNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Business Information
  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Tell us about your business</h3>
      
      <div>
        <Label>Business Name</Label>
        <Input
          placeholder="Paradise Salon & Spa"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
        />
      </div>

      <div>
        <Label>Your Name</Label>
        <Input
          placeholder="John Doe"
          value={formData.ownerName}
          onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="john@paradise.com"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div>
        <Label>Phone</Label>
        <Input
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <Button onClick={() => setStep(2)} className="w-full">
        Continue
      </Button>
    </div>
  );

  // Step 2: Choose Subdomain
  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Choose your website address</h3>
      <p className="text-muted-foreground">
        You can connect a custom domain later
      </p>

      <div>
        <Label>Subdomain</Label>
        <div className="flex gap-2">
          <Input
            placeholder="paradise"
            value={formData.subdomain}
            onChange={(e) => {
              const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
              setFormData(prev => ({ ...prev, subdomain: cleaned }));
            }}
          />
          <span className="flex items-center text-muted-foreground">
            .largify.app
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Your website will be: {formData.subdomain || 'your-salon'}.largify.app
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );

  // Step 3: Admin Credentials
  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Create your admin account</h3>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          disabled
        />
      </div>

      <div>
        <Label>Password</Label>
        <Input
          type="password"
          placeholder="Minimum 8 characters"
          value={formData.adminPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button onClick={handleProvisionSystem} className="flex-1" disabled={loading}>
          {loading ? 'Creating your system...' : 'Start Free Trial'}
        </Button>
      </div>
    </div>
  );

  // System Provisioning
  const handleProvisionSystem = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Check subdomain availability
      const tenantsRef = collection(db, 'tenants');
      const q = query(tenantsRef, where('subdomain', '==', formData.subdomain));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setError('This subdomain is already taken');
        setLoading(false);
        return;
      }

      // 2. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.adminPassword
      );

      // 3. Create Tenant
      const tenantData = {
        name: formData.businessName,
        subdomain: formData.subdomain,
        branding: {
          logo: '',
          primaryColor: '#A81556',
          secondaryColor: '#F03E7F',
          accentColor: '#F27FA1',
          fontFamily: 'Poppins, sans-serif',
          borderRadius: '0.75rem',
        },
        settings: {
          companyName: formData.businessName,
          timezone: 'UTC',
          currency: 'USD',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          email: formData.email,
          phone: formData.phone,
          address: '',
        },
        subscription: {
          plan: selectedPlan,
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          limits: getPlanLimits(selectedPlan),
          usage: { branches: 0, staff: 0, clients: 0, storageGB: 0 },
        },
        features: getPlanFeatures(selectedPlan),
        status: 'active',
        createdAt: new Date(),
      };

      const tenantDoc = await addDoc(collection(db, 'tenants'), tenantData);

      // 4. Create Platform Client Record
      await addDoc(collection(db, 'platform_clients'), {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        subscription: {
          plan: selectedPlan,
          status: 'trial',
          billingCycle: billingCycle,
          startDate: new Date(),
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
        system: {
          tenantId: tenantDoc.id,
          subdomain: formData.subdomain,
          domainStatus: 'pending',
          themeId: 'default',
          status: 'active',
        },
        limits: getPlanLimits(selectedPlan),
        usage: { branches: 0, staff: 0, clients: 0, storageGB: 0, apiCalls: 0 },
        createdAt: new Date(),
        setupCompleted: false,
        onboardingStep: 1,
      });

      // 5. Create Admin User
      await addDoc(collection(db, 'users'), {
        tenantId: tenantDoc.id,
        email: formData.email,
        name: formData.ownerName,
        role: 'super_admin',
        status: 'active',
        createdAt: new Date(),
      });

      // 6. Redirect to new system
      const systemUrl = `https://${formData.subdomain}.largify.app`;
      window.location.href = systemUrl;

    } catch (err: any) {
      console.error('Provisioning error:', err);
      setError(err.message || 'Failed to create system');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Salon System</CardTitle>
          <CardDescription>
            Step {step} of 3 • {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getPlanLimits(plan: string) {
  const limits = {
    basic: { maxBranches: 1, maxStaff: 5, maxClients: 500, storageGB: 5 },
    professional: { maxBranches: 5, maxStaff: 25, maxClients: 2500, storageGB: 25 },
    enterprise: { maxBranches: -1, maxStaff: -1, maxClients: -1, storageGB: -1 },
  };
  return limits[plan as keyof typeof limits] || limits.basic;
}

function getPlanFeatures(plan: string) {
  // Same as before...
}
```

---

### Client Portal for Domain Management

```typescript
// app/portal/page.tsx - Client Portal

'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ClientPortalPage() {
  const { tenant } = useTenant();
  const [clientData, setClientData] = useState<any>(null);
  const [customDomain, setCustomDomain] = useState('');

  useEffect(() => {
    if (tenant) {
      loadClientData();
    }
  }, [tenant]);

  const loadClientData = async () => {
    // Load platform_clients data
    const q = query(
      collection(db, 'platform_clients'),
      where('system.tenantId', '==', tenant.id)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setClientData(snapshot.docs[0].data());
    }
  };

  const handleDomainConnection = async () => {
    // Create domain request
    await addDoc(collection(db, 'domain_requests'), {
      clientId: clientData.id,
      domain: customDomain,
      status: 'pending',
      dnsRecords: [
        {
          type: 'A',
          host: '@',
          value: 'YOUR_SERVER_IP',
          verified: false,
        },
        {
          type: 'CNAME',
          host: 'www',
          value: `${tenant.subdomain}.largify.app`,
          verified: false,
        },
      ],
      ssl: {
        status: 'pending',
        provider: 'letsencrypt',
        autoRenew: true,
      },
      requestedAt: new Date(),
    });

    alert('Domain request submitted! Check your email for DNS instructions.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Client Portal</h1>

      {/* Subscription Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Plan</dt>
              <dd className="font-semibold capitalize">{clientData?.subscription?.plan}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd>
                <Badge variant={clientData?.subscription?.status === 'active' ? 'default' : 'secondary'}>
                  {clientData?.subscription?.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Next Billing</dt>
              <dd>{clientData?.subscription?.nextBillingDate?.toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Amount</dt>
              <dd className="font-semibold">
                ${clientData?.subscription?.monthlyPrice}/month
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Domain Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Domain Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Domain</Label>
            <Input
              value={`${tenant?.subdomain}.largify.app`}
              disabled
            />
          </div>

          {clientData?.system?.customDomain && (
            <div>
              <Label>Custom Domain</Label>
              <Input
                value={clientData.system.customDomain}
                disabled
              />
              <Badge className="mt-2">
                {clientData.system.domainStatus}
              </Badge>
            </div>
          )}

          {!clientData?.system?.customDomain && (
            <div>
              <Label>Connect Custom Domain</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="www.yoursalon.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
                <Button onClick={handleDomainConnection}>
                  Connect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Website Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSelector currentTheme={clientData?.system?.themeId} />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Summary: Complete Platform Structure

```
LARGIFY SOLUTIONS PLATFORM
├── Landing Website (www.largifysolutions.com)
│   ├── Home, Features, Pricing
│   ├── Signup Flow
│   └── Documentation
│
├── Platform Admin (admin.largifysolutions.com)
│   ├── Manage all salon clients
│   ├── Monitor subscriptions
│   ├── Approve domains
│   └── Support tickets
│
├── Client Portal (portal.largifysolutions.com)
│   ├── Subscription management
│   ├── Domain connection
│   ├── Theme selection
│   └── Billing & invoices
│
└── Individual Salon Systems
    ├── Salon #1: paradise.com (or paradise.largify.app)
    │   ├── Public website (booking, services, gallery)
    │   ├── Admin portal (admin.paradise.com)
    │   ├── Staff portal
    │   └── Customer portal
    │
    ├── Salon #2: elite.com
    └── Salon #3: luxury.com
```

Each salon gets:
✅ Complete isolated system
✅ Custom domain capability
✅ Own theme/branding
✅ Own database (filtered by tenantId)
✅ Own admin/staff/customer portals
✅ Based on purchased subscription plan

---

### Custom Domain Setup for Salon Owners

#### How Salons Host on Their Own Domain

When a salon purchases the system from Largify Solutions, they initially get a subdomain like `paradise.largify.app`. However, **salon owners can connect their own custom domain** (e.g., `www.paradise.com`) to make it their primary business website.

#### Custom Domain Flow

```
Initial Setup (Default):
└── paradise.largify.app (Largify's subdomain)
    ├── Public website
    ├── Booking system
    └── Admin portal at paradise.largify.app/admin

↓ After Custom Domain Connection ↓

Custom Domain Setup:
├── www.paradise.com (Salon's own domain) ← MAIN WEBSITE
│   ├── Public website
│   ├── Booking system
│   └── Customer portal
│
└── admin.paradise.com ← ADMIN PORTAL
    ├── Super Admin dashboard
    ├── Branch management
    └── Staff portal

Note: paradise.largify.app redirects to www.paradise.com
```

---

### Complete Custom Domain Setup Process

#### Step 1: Purchase Domain

Salon owner purchases a domain from any domain registrar:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- Any other registrar

Example: Owner buys `paradise.com`

---

#### Step 2: Request Domain Connection in Client Portal

```typescript
// In Client Portal (portal.largifysolutions.com)

1. Salon owner logs in
2. Navigates to "Domain Settings"
3. Enters custom domain: www.paradise.com
4. Clicks "Connect Domain"
5. System generates DNS configuration
```

**System Response:**
```json
{
  "domain": "paradise.com",
  "status": "pending_dns",
  "dnsRecords": [
    {
      "type": "A",
      "name": "@",
      "value": "123.45.67.89",
      "ttl": 3600
    },
    {
      "type": "A",
      "name": "www",
      "value": "123.45.67.89",
      "ttl": 3600
    },
    {
      "type": "CNAME",
      "name": "admin",
      "value": "paradise.largify.app",
      "ttl": 3600
    }
  ],
  "sslStatus": "pending"
}
```

---

#### Step 3: Configure DNS Records

Salon owner adds DNS records in their domain registrar's control panel:

**Option A: Using A Records (Direct IP)**

```
DNS Configuration at Domain Registrar:
┌──────────────────────────────────────────────────────┐
│ Type    Name     Value              TTL              │
├──────────────────────────────────────────────────────┤
│ A       @        123.45.67.89       3600             │
│ A       www      123.45.67.89       3600             │
│ CNAME   admin    paradise.largify.app   3600         │
└──────────────────────────────────────────────────────┘

Result:
- paradise.com → Points to Largify server
- www.paradise.com → Points to Largify server
- admin.paradise.com → Points to admin system
```

**Option B: Using CNAME Records (Recommended)**

```
DNS Configuration:
┌──────────────────────────────────────────────────────┐
│ Type    Name     Value                    TTL        │
├──────────────────────────────────────────────────────┤
│ CNAME   www      paradise.largify.app    3600        │
│ CNAME   admin    paradise.largify.app    3600        │
│ URL     @        Redirect to www         -           │
│ Redirect                                             │
└──────────────────────────────────────────────────────┘

Result:
- paradise.com → Redirects to www.paradise.com
- www.paradise.com → Points to Largify system
- admin.paradise.com → Admin portal
```

---

#### Step 4: Domain Verification (Automatic)

```typescript
// Largify System Auto-Verification Process

// Every 5 minutes, check DNS propagation
async function verifyDomainDNS(domainRequest: DomainRequest) {
  try {
    // 1. Check A Record
    const aRecords = await dns.resolve4(domainRequest.domain);
    const correctIP = '123.45.67.89';
    
    if (aRecords.includes(correctIP)) {
      await updateDoc(doc(db, 'domain_requests', domainRequest.id), {
        'dnsRecords.0.verified': true,
        'dnsRecords.0.lastChecked': new Date(),
      });
    }

    // 2. Check CNAME
    const cnameRecords = await dns.resolveCname(`admin.${domainRequest.domain}`);
    
    if (cnameRecords.includes(`${subdomain}.largify.app`)) {
      await updateDoc(doc(db, 'domain_requests', domainRequest.id), {
        'dnsRecords.2.verified': true,
        status: 'dns_verified',
      });
      
      // 3. Trigger SSL Certificate issuance
      await provisionSSLCertificate(domainRequest);
    }

  } catch (error) {
    console.error('DNS verification failed:', error);
  }
}
```

**Verification Status Updates:**

```
Status Flow:
1. pending_dns        → Waiting for DNS configuration
2. dns_configured     → DNS records detected
3. dns_verified       → DNS fully propagated
4. ssl_pending        → Requesting SSL certificate
5. ssl_issued         → SSL certificate active
6. active             → Domain fully connected ✅
```

---

#### Step 5: SSL Certificate Provisioning (Automatic)

```typescript
// Auto SSL via Let's Encrypt or Cloudflare

async function provisionSSLCertificate(domainRequest: DomainRequest) {
  try {
    // Using Let's Encrypt ACME protocol
    const certificate = await letsencrypt.getCertificate({
      domains: [
        domainRequest.domain,
        `www.${domainRequest.domain}`,
        `admin.${domainRequest.domain}`,
      ],
      email: domainRequest.clientEmail,
      agreeTos: true,
    });

    // Store certificate
    await updateDoc(doc(db, 'domain_requests', domainRequest.id), {
      'ssl.status': 'issued',
      'ssl.expiresAt': certificate.expiresAt,
      'ssl.certificate': certificate.cert,
      'ssl.privateKey': certificate.key,
      'ssl.autoRenew': true,
    });

    // Update tenant configuration
    await updateDoc(doc(db, 'tenants', domainRequest.tenantId), {
      customDomain: domainRequest.domain,
      'branding.primaryUrl': `https://www.${domainRequest.domain}`,
    });

    // Send success email
    await sendEmail({
      to: domainRequest.clientEmail,
      subject: 'Your custom domain is now live! 🎉',
      body: `Your website is now accessible at https://www.${domainRequest.domain}`,
    });

    // Update status to active
    await updateDoc(doc(db, 'domain_requests', domainRequest.id), {
      status: 'active',
      verifiedAt: new Date(),
    });

  } catch (error) {
    console.error('SSL provisioning failed:', error);
    
    await updateDoc(doc(db, 'domain_requests', domainRequest.id), {
      'ssl.status': 'failed',
      notes: error.message,
    });
  }
}
```

---

#### Step 6: Server Configuration (Nginx/Apache)

**Nginx Virtual Host Configuration:**

```nginx
# /etc/nginx/sites-available/paradise.com

# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name paradise.com www.paradise.com admin.paradise.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main Website
server {
    listen 443 ssl http2;
    server_name www.paradise.com paradise.com;
    
    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/paradise.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paradise.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Pass tenant identifier
        proxy_set_header X-Custom-Domain $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Admin Portal
server {
    listen 443 ssl http2;
    server_name admin.paradise.com;
    
    ssl_certificate /etc/letsencrypt/live/paradise.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paradise.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Custom-Domain $host;
        # ... other headers
    }
}
```

**Enable Configuration:**
```bash
sudo ln -s /etc/nginx/sites-available/paradise.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

#### Step 7: Application Configuration

**Update Next.js to Handle Custom Domains:**

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const customDomain = request.headers.get('x-custom-domain') || hostname;
  
  console.log('🌐 Request:', customDomain);

  // Extract tenant identifier
  let subdomain: string;
  
  // Check if it's a custom domain
  if (isCustomDomain(customDomain)) {
    // Query database to find tenant by custom domain
    subdomain = await getTenantByCustomDomain(customDomain);
  } else {
    // Extract from Largify subdomain
    subdomain = extractSubdomain(customDomain);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-subdomain', subdomain);
  requestHeaders.set('x-is-custom-domain', isCustomDomain(customDomain).toString());

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function isCustomDomain(hostname: string): boolean {
  // Not a Largify subdomain
  return !hostname.includes('.largify.app') && 
         !hostname.includes('localhost');
}

async function getTenantByCustomDomain(domain: string): Promise<string> {
  // Clean domain (remove www.)
  const cleanDomain = domain.replace('www.', '');
  
  // Query Firestore
  const tenantsRef = collection(db, 'tenants');
  const q = query(
    tenantsRef,
    where('customDomain', '==', cleanDomain),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const tenantData = snapshot.docs[0].data();
    return tenantData.subdomain;
  }
  
  return 'default';
}
```

---

### Client Portal - Domain Management UI

```typescript
// app/portal/domains/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DomainManagementPage() {
  const [customDomain, setCustomDomain] = useState('');
  const [domainRequest, setDomainRequest] = useState<any>(null);

  const handleDomainConnection = async () => {
    try {
      // Create domain connection request
      const response = await fetch('/api/domains/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });

      const data = await response.json();
      setDomainRequest(data);

    } catch (error) {
      console.error('Failed to connect domain:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Custom Domain Setup</h1>

      {/* Current Domain */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Website Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              value="paradise.largify.app"
              disabled
              className="flex-1"
            />
            <Badge variant="secondary">Active</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Your website is accessible at this address
          </p>
        </CardContent>
      </Card>

      {/* Custom Domain Connection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connect Your Own Domain</CardTitle>
          <CardDescription>
            Use your own domain name for your business website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!domainRequest ? (
            <>
              <div>
                <Label>Enter your domain</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="www.yourbeautysalon.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                  />
                  <Button onClick={handleDomainConnection}>
                    Connect
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  You must own this domain and have access to DNS settings
                </p>
              </div>
            </>
          ) : (
            <DomainSetupInstructions domainRequest={domainRequest} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DomainSetupInstructions({ domainRequest }: any) {
  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">Domain: {domainRequest.domain}</h3>
          <p className="text-sm text-muted-foreground">
            Status: {domainRequest.status}
          </p>
        </div>
        <DomainStatusBadge status={domainRequest.status} />
      </div>

      {/* DNS Instructions */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="font-semibold mb-4">
          Step 1: Add these DNS records to your domain provider
        </h4>
        
        <div className="space-y-2">
          {domainRequest.dnsRecords.map((record: any, index: number) => (
            <div key={index} className="bg-white rounded p-3 font-mono text-sm">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <div className="font-semibold">{record.type}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <div className="font-semibold">{record.name}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Value:</span>
                  <div className="font-semibold flex items-center gap-2">
                    {record.value}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(record.value)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {record.verified && (
                <Badge variant="default" className="mt-2">
                  ✓ Verified
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Popular Providers Guide */}
      <div>
        <h4 className="font-semibold mb-2">Need help?</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Click on your domain provider for step-by-step instructions:
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/docs/dns/godaddy" target="_blank">
              GoDaddy
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/docs/dns/namecheap" target="_blank">
              Namecheap
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/docs/dns/cloudflare" target="_blank">
              Cloudflare
            </a>
          </Button>
        </div>
      </div>

      {/* Verification Status */}
      <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
        <h4 className="font-semibold mb-2">⏱️ Waiting for DNS propagation</h4>
        <p className="text-sm">
          DNS changes can take up to 48 hours to propagate, but usually complete within 1-2 hours.
          We'll automatically verify your settings and send you an email when your domain is ready.
        </p>
      </div>

      {/* SSL Status */}
      {domainRequest.ssl && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">🔒 SSL Certificate</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Status: {domainRequest.ssl.status}
          </p>
          <p className="text-sm">
            Once DNS is verified, we'll automatically provision a free SSL certificate 
            from Let's Encrypt for secure HTTPS access.
          </p>
        </div>
      )}
    </div>
  );
}

function DomainStatusBadge({ status }: { status: string }) {
  const variants = {
    pending_dns: { label: 'Pending DNS', variant: 'secondary' as const },
    dns_configured: { label: 'DNS Configured', variant: 'default' as const },
    dns_verified: { label: 'DNS Verified', variant: 'default' as const },
    ssl_pending: { label: 'SSL Pending', variant: 'default' as const },
    ssl_issued: { label: 'SSL Active', variant: 'default' as const },
    active: { label: 'Active ✓', variant: 'default' as const },
    failed: { label: 'Failed', variant: 'destructive' as const },
  };

  const config = variants[status as keyof typeof variants] || variants.pending_dns;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

---

### DNS Configuration Guides for Popular Providers

#### GoDaddy Instructions

```markdown
# Connecting Custom Domain - GoDaddy

1. Log in to GoDaddy account
2. Go to "My Products" → "Domains"
3. Click "DNS" next to your domain
4. Click "Add" to add new records

For paradise.com:

**A Record (Root Domain):**
- Type: A
- Name: @
- Value: 123.45.67.89
- TTL: 1 Hour

**A Record (WWW):**
- Type: A
- Name: www
- Value: 123.45.67.89
- TTL: 1 Hour

**CNAME (Admin):**
- Type: CNAME
- Name: admin
- Value: paradise.largify.app
- TTL: 1 Hour

5. Click "Save"
6. Wait 1-2 hours for propagation
```

#### Namecheap Instructions

```markdown
# Connecting Custom Domain - Namecheap

1. Log in to Namecheap
2. Go to "Domain List"
3. Click "Manage" next to your domain
4. Go to "Advanced DNS" tab
5. Click "Add New Record"

Add these records:

**A Record:**
- Type: A Record
- Host: @
- Value: 123.45.67.89
- TTL: Automatic

**A Record (WWW):**
- Type: A Record
- Host: www
- Value: 123.45.67.89
- TTL: Automatic

**CNAME (Admin):**
- Type: CNAME
- Host: admin
- Target: paradise.largify.app
- TTL: Automatic

6. Click "Save Changes"
```

#### Cloudflare Instructions

```markdown
# Connecting Custom Domain - Cloudflare

1. Add domain to Cloudflare (if not already)
2. Go to "DNS" tab
3. Click "Add record"

**A Record:**
- Type: A
- Name: @
- IPv4 address: 123.45.67.89
- Proxy status: Proxied (Orange cloud)
- TTL: Auto

**CNAME (WWW):**
- Type: CNAME
- Name: www
- Target: paradise.largify.app
- Proxy status: Proxied
- TTL: Auto

**CNAME (Admin):**
- Type: CNAME
- Name: admin
- Target: paradise.largify.app
- Proxy status: Proxied
- TTL: Auto

4. Cloudflare automatically provisions SSL (faster than Let's Encrypt)
```

---

### Testing Custom Domain

```bash
# Check DNS propagation
dig paradise.com
dig www.paradise.com
dig admin.paradise.com

# Check if domain resolves to correct IP
nslookup paradise.com

# Test HTTPS
curl -I https://www.paradise.com

# Check SSL certificate
openssl s_client -connect paradise.com:443 -servername paradise.com
```

---

### Summary: Custom Domain Benefits

Once custom domain is connected:

✅ **Primary Business Website**: `https://www.paradise.com`
✅ **Admin Portal**: `https://admin.paradise.com`
✅ **Professional Email**: `contact@paradise.com` (via email forwarding)
✅ **SEO Benefits**: Own domain ranks better
✅ **Brand Trust**: Customers trust own domain more
✅ **SSL Secured**: Free HTTPS certificate
✅ **Auto-Renewal**: SSL renews automatically every 90 days

The old `paradise.largify.app` still works but automatically redirects to the custom domain!

---

## Architecture Design

### Architecture Pattern: Shared Database with Tenant ID

We're using the **Shared Database, Shared Schema** pattern with tenant identification.

```typescript
// Every record has a tenantId
{
  id: "booking-123",
  tenantId: "salon-paradise-abc",  // ← Tenant identifier
  customerName: "John Doe",
  service: "Haircut",
  // ... other fields
}
```

### Tenant Resolution Flow

```
1. User visits: paradise.yourapp.com
                     ↓
2. Middleware extracts subdomain: "paradise"
                     ↓
3. Query tenants collection: where subdomain == "paradise"
                     ↓
4. Load tenant config (theme, settings, features)
                     ↓
5. Apply theme & store tenant in context
                     ↓
6. All queries automatically filtered by tenantId
```

### Domain Structure

```
Multi-Tenant Domains:
├── paradise.yourapp.com      → Tenant: Salon Paradise
├── elite.yourapp.com         → Tenant: Beauty Elite  
├── luxury.yourapp.com        → Tenant: Luxury Spa
└── admin.yourapp.com         → Platform Admin

Custom Domains (Optional):
├── www.salonparadise.com     → Points to paradise.yourapp.com
└── www.beautyelite.com       → Points to elite.yourapp.com
```

---

## Database Schema

### Core Collections Structure

#### 1. **tenants** Collection

```typescript
interface Tenant {
  id: string;                    // Auto-generated
  name: string;                  // "Salon Paradise"
  subdomain: string;             // "paradise" (unique)
  customDomain?: string;         // "www.salonparadise.com"
  
  // Branding
  branding: {
    logo: string;                // URL to logo
    favicon?: string;            // URL to favicon
    primaryColor: string;        // "#A81556"
    secondaryColor: string;      // "#F03E7F"
    accentColor: string;         // "#F27FA1"
    fontFamily: string;          // "Poppins, sans-serif"
    borderRadius: string;        // "0.75rem"
  };
  
  // Settings
  settings: {
    companyName: string;         // Legal business name
    timezone: string;            // "Asia/Dubai"
    currency: string;            // "AED"
    language: string;            // "en"
    dateFormat: string;          // "DD/MM/YYYY"
    timeFormat: string;          // "24h" | "12h"
    
    // Contact
    email: string;
    phone: string;
    address: string;
    website?: string;
    
    // Tax
    taxNumber?: string;          // TRN/VAT number
    taxRate: number;             // 5 (percentage)
  };
  
  // Subscription & Limits
  subscription: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'trial' | 'active' | 'suspended' | 'cancelled';
    trialEndsAt?: Date;
    billingCycle: 'monthly' | 'annual';
    nextBillingDate?: Date;
    amount: number;              // Monthly/Annual fee
    
    // Usage limits
    limits: {
      maxBranches: number;       // 3, 10, 50, unlimited
      maxStaff: number;          // 10, 50, 200, unlimited
      maxClients: number;        // 500, 5000, 50000, unlimited
      maxStorage: number;        // GB: 5, 25, 100, unlimited
    };
    
    // Current usage (updated via cloud functions)
    usage: {
      branches: number;
      staff: number;
      clients: number;
      storageGB: number;
    };
  };
  
  // Feature flags
  features: {
    // Core features
    onlineBooking: boolean;
    customerPortal: boolean;
    staffPortal: boolean;
    inventory: boolean;
    
    // Advanced features
    multiLocation: boolean;      // Multiple branches
    advancedAnalytics: boolean;
    customReports: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;         // Custom domain
    
    // Integrations
    smsNotifications: boolean;
    emailMarketing: boolean;
    loyaltyProgram: boolean;
    giftCards: boolean;
    
    // E-commerce
    onlineStore: boolean;
    productManagement: boolean;
    invoicing: boolean;
  };
  
  // Admin user
  owner: {
    userId: string;              // Reference to users collection
    name: string;
    email: string;
  };
  
  // Status & Metadata
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

**Firestore Document Example:**
```javascript
// /tenants/salon-paradise-abc
{
  name: "Salon Paradise",
  subdomain: "paradise",
  branding: {
    logo: "https://storage.googleapis.com/paradise/logo.png",
    primaryColor: "#E91E63",
    secondaryColor: "#FF4081",
    accentColor: "#F06292",
    fontFamily: "Montserrat, sans-serif",
    borderRadius: "1rem"
  },
  subscription: {
    plan: "professional",
    status: "active",
    limits: {
      maxBranches: 10,
      maxStaff: 50,
      maxClients: 5000
    }
  },
  features: {
    onlineBooking: true,
    multiLocation: true,
    advancedAnalytics: true,
    customReports: true
  },
  status: "active",
  createdAt: "2026-01-15T10:00:00Z"
}
```

---

#### 2. **users** Collection (Updated)

```typescript
interface User {
  id: string;
  tenantId: string;              // ← NEW: Links to tenant
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer';
  
  // Super Admin: Manages entire tenant
  // Admin: Manages specific branches
  // Staff: Limited access to own schedule
  // Customer: Portal access only
  
  branchId?: string;             // For admin/staff
  branchName?: string;
  
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  
  // Permissions (for granular control)
  permissions?: {
    bookings: { create: boolean; read: boolean; update: boolean; delete: boolean };
    clients: { create: boolean; read: boolean; update: boolean; delete: boolean };
    staff: { create: boolean; read: boolean; update: boolean; delete: boolean };
    reports: { view: boolean; export: boolean };
    settings: { view: boolean; edit: boolean };
  };
  
  createdAt: Date;
  lastLoginAt?: Date;
}
```

---

#### 3. **Updated Collections** (All need tenantId)

```typescript
// Add tenantId to EVERY collection:

interface Client {
  id: string;
  tenantId: string;              // ← ADD THIS
  firstName: string;
  lastName: string;
  email: string;
  // ... rest of fields
}

interface Booking {
  id: string;
  tenantId: string;              // ← ADD THIS
  bookingNumber: string;
  customerName: string;
  // ... rest of fields
}

interface Service {
  id: string;
  tenantId: string;              // ← ADD THIS
  name: string;
  price: number;
  // ... rest of fields
}

// Repeat for:
// - Staff
// - Products
// - Categories
// - Branches
// - Orders
// - Appointments
// - Expenses
// - Messages
// - Feedbacks
// - Memberships
```

---

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ================================
    // Helper Functions
    // ================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function getUserTenantId() {
      return getUserData().tenantId;
    }
    
    function getUserRole() {
      return getUserData().role;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && getUserRole() == 'super_admin';
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() in ['admin', 'super_admin'];
    }
    
    function belongsToSameTenant(resourceData) {
      return isAuthenticated() && resourceData.tenantId == getUserTenantId();
    }
    
    function isActiveTenant() {
      let tenant = get(/databases/$(database)/documents/tenants/$(getUserTenantId())).data;
      return tenant.status == 'active' || tenant.status == 'trial';
    }
    
    // ================================
    // Tenants Collection
    // ================================
    
    match /tenants/{tenantId} {
      // Users can read their own tenant
      allow read: if isAuthenticated() && getUserTenantId() == tenantId;
      
      // Only super_admin can update their tenant
      allow update: if isSuperAdmin() && getUserTenantId() == tenantId;
      
      // Platform admin can create (handled via Cloud Functions)
      allow create: if false;
      allow delete: if false;
    }
    
    // ================================
    // Users Collection
    // ================================
    
    match /users/{userId} {
      // Users can read their own data
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Super admins can read all users in their tenant
      allow read: if isSuperAdmin() && 
                     get(/databases/$(database)/documents/users/$(userId)).data.tenantId == getUserTenantId();
      
      // Super admins can create/update users in their tenant
      allow create, update: if isSuperAdmin() && 
                              request.resource.data.tenantId == getUserTenantId() &&
                              isActiveTenant();
      
      allow delete: if isSuperAdmin() && 
                       get(/databases/$(database)/documents/users/$(userId)).data.tenantId == getUserTenantId();
    }
    
    // ================================
    // Clients Collection
    // ================================
    
    match /clients/{clientId} {
      // Read: Any authenticated user in same tenant
      allow read: if belongsToSameTenant(resource.data) && isActiveTenant();
      
      // Create/Update: Admin or Super Admin
      allow create, update: if isAdmin() && 
                              belongsToSameTenant(request.resource.data) &&
                              isActiveTenant();
      
      // Delete: Super Admin only
      allow delete: if isSuperAdmin() && 
                       belongsToSameTenant(resource.data);
    }
    
    // ================================
    // Bookings Collection
    // ================================
    
    match /bookings/{bookingId} {
      allow read: if belongsToSameTenant(resource.data) && isActiveTenant();
      
      allow create, update: if isAdmin() && 
                              belongsToSameTenant(request.resource.data) &&
                              isActiveTenant();
      
      allow delete: if isSuperAdmin() && belongsToSameTenant(resource.data);
    }
    
    // ================================
    // Services Collection
    // ================================
    
    match /services/{serviceId} {
      // Anyone can read services (for public booking page)
      allow read: if true;
      
      allow create, update, delete: if isSuperAdmin() && 
                                       belongsToSameTenant(request.resource.data) &&
                                       isActiveTenant();
    }
    
    // ================================
    // Products Collection
    // ================================
    
    match /products/{productId} {
      allow read: if true; // Public catalog
      
      allow create, update, delete: if isAdmin() && 
                                       belongsToSameTenant(request.resource.data) &&
                                       isActiveTenant();
    }
    
    // ================================
    // Staff Collection
    // ================================
    
    match /staff/{staffId} {
      allow read: if belongsToSameTenant(resource.data) && isActiveTenant();
      
      allow create, update, delete: if isSuperAdmin() && 
                                       belongsToSameTenant(request.resource.data) &&
                                       isActiveTenant();
    }
    
    // ================================
    // Branches Collection
    // ================================
    
    match /branches/{branchId} {
      allow read: if belongsToSameTenant(resource.data) && isActiveTenant();
      
      allow create, update, delete: if isSuperAdmin() && 
                                       belongsToSameTenant(request.resource.data) &&
                                       isActiveTenant();
    }
    
    // ================================
    // Orders, Categories, Expenses, etc.
    // ================================
    
    match /{collection}/{docId} {
      allow read: if belongsToSameTenant(resource.data) && isActiveTenant();
      allow write: if isAdmin() && 
                      belongsToSameTenant(request.resource.data) &&
                      isActiveTenant();
    }
  }
}
```

---

## Implementation Guide

### Phase 1: Core Infrastructure (Week 1-2)

#### Step 1.1: Update Type Definitions

```typescript
// types/index.ts

// Add new Tenant interface
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  branding: {
    logo: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: string;
  };
  settings: {
    companyName: string;
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    email: string;
    phone: string;
    address: string;
  };
  subscription: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'trial' | 'active' | 'suspended' | 'cancelled';
    limits: {
      maxBranches: number;
      maxStaff: number;
      maxClients: number;
    };
  };
  features: {
    onlineBooking: boolean;
    multiLocation: boolean;
    advancedAnalytics: boolean;
    customReports: boolean;
    apiAccess: boolean;
  };
  status: 'active' | 'suspended' | 'trial';
  createdAt: Date;
  updatedAt: Date;
}

// Update existing interfaces - ADD tenantId to ALL:
export interface Appointment {
  id: string;
  tenantId: string;  // ← ADD
  firebaseId?: string;
  // ... rest
}

export interface Client {
  id: string;
  tenantId: string;  // ← ADD
  firstName: string;
  // ... rest
}

// Add to all other interfaces:
// Booking, Staff, Service, Product, Category, Branch, etc.
```

---

#### Step 1.2: Create Tenant Context

```typescript
// src/contexts/TenantContext.tsx - NEW FILE

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tenant } from '@/types';

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenantFromDomain();
  }, []);

  const loadTenantFromDomain = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const subdomain = getSubdomainFromHostname();
      console.log('🔍 Loading tenant for subdomain:', subdomain);

      // Query tenants collection
      const tenantsRef = collection(db, 'tenants');
      const q = query(
        tenantsRef,
        where('subdomain', '==', subdomain),
        where('status', 'in', ['active', 'trial']),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError(`No active tenant found for subdomain: ${subdomain}`);
        console.error('❌ Tenant not found');
        return;
      }

      const tenantData = snapshot.docs[0].data() as Tenant;
      const tenantWithId = {
        ...tenantData,
        id: snapshot.docs[0].id,
      };

      setTenant(tenantWithId);
      console.log('✅ Tenant loaded:', tenantWithId.name);

      // Apply dynamic theme
      applyTheme(tenantWithId.branding);

      // Store in localStorage for quick access
      localStorage.setItem('currentTenant', JSON.stringify(tenantWithId));

    } catch (err) {
      console.error('❌ Error loading tenant:', err);
      setError('Failed to load tenant configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (branding: Tenant['branding']) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--primary', branding.primaryColor);
    root.style.setProperty('--secondary', branding.secondaryColor);
    root.style.setProperty('--accent', branding.accentColor);
    root.style.setProperty('--font-sans', branding.fontFamily);
    root.style.setProperty('--radius', branding.borderRadius);

    // Update favicon if provided
    if (branding.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.favicon;
      }
    }

    // Update page title
    document.title = `${tenant?.name || 'Beauty Salon'} Management System`;
  };

  const refreshTenant = async () => {
    await loadTenantFromDomain();
  };

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error, refreshTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

function getSubdomainFromHostname(): string {
  if (typeof window === 'undefined') return 'default';

  const hostname = window.location.hostname;

  // Development: localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Check for subdomain in query params for testing
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant') || 'default';
  }

  // Production: subdomain.yourapp.com
  const parts = hostname.split('.');
  
  // If less than 3 parts, no subdomain (e.g., yourapp.com)
  if (parts.length < 3) return 'default';

  // First part is the subdomain
  return parts[0];
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
```

---

#### Step 1.3: Update Providers

```typescript
// src/components/providers.tsx

'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { BranchProvider } from '@/contexts/BranchContext';
import { TenantProvider } from '@/contexts/TenantContext';  // ← ADD
import { LanguageProvider } from '@/contexts/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>           {/* ← WRAP FIRST */}
      <AuthProvider>
        <BranchProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </BranchProvider>
      </AuthProvider>
    </TenantProvider>
  );
}
```

---

#### Step 1.4: Create Tenant-Aware Query Helper

```typescript
// src/lib/tenant-queries.ts - NEW FILE

import {
  collection,
  query,
  where,
  Query,
  CollectionReference,
  QueryConstraint,
  orderBy,
  limit,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Creates a Firestore query filtered by tenantId
 * 
 * @param collectionName - Firestore collection name
 * @param tenantId - Current tenant ID
 * @param constraints - Additional query constraints (orderBy, where, limit, etc.)
 * @returns Firestore Query filtered by tenantId
 */
export function getTenantQuery(
  collectionName: string,
  tenantId: string,
  constraints: QueryConstraint[] = []
): Query<DocumentData> {
  const collectionRef = collection(db, collectionName);

  return query(
    collectionRef,
    where('tenantId', '==', tenantId),
    ...constraints
  );
}

/**
 * Usage Examples:
 * 
 * // Simple query
 * const q = getTenantQuery('clients', tenant.id);
 * 
 * // With ordering
 * const q = getTenantQuery('clients', tenant.id, [
 *   orderBy('createdAt', 'desc')
 * ]);
 * 
 * // With multiple constraints
 * const q = getTenantQuery('bookings', tenant.id, [
 *   where('status', '==', 'confirmed'),
 *   orderBy('bookingDate', 'desc'),
 *   limit(10)
 * ]);
 */

/**
 * Gets a reference to a tenant's collection
 * Useful for adding documents
 */
export function getTenantCollectionRef(
  collectionName: string
): CollectionReference<DocumentData> {
  return collection(db, collectionName);
}

/**
 * Helper to add tenantId to document data
 */
export function withTenantId<T extends Record<string, any>>(
  data: T,
  tenantId: string
): T & { tenantId: string } {
  return {
    ...data,
    tenantId,
  };
}
```

---

#### Step 1.5: Update Existing Queries

**Example: Update ClientsManagement.tsx**

```typescript
// src/components/admin/ClientsManagement.tsx

import { useTenant } from '@/contexts/TenantContext';
import { getTenantQuery, withTenantId } from '@/lib/tenant-queries';

export default function ClientsManagement() {
  const { tenant } = useTenant();  // ← ADD
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    if (!tenant) return;  // ← GUARD

    const fetchClients = async () => {
      // BEFORE:
      // const clientsRef = collection(db, "clients");
      // const q = query(clientsRef, orderBy("createdAt", "desc"));

      // AFTER:
      const q = getTenantQuery('clients', tenant.id, [
        orderBy('createdAt', 'desc')
      ]);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const clientsData: Client[] = [];
        snapshot.forEach((doc) => {
          clientsData.push({ id: doc.id, ...doc.data() } as Client);
        });
        setClients(clientsData);
      });

      return () => unsubscribe();
    };

    fetchClients();
  }, [tenant]);  // ← ADD DEPENDENCY

  // When adding new client
  const handleAddClient = async (clientData: Omit<Client, 'id' | 'tenantId'>) => {
    try {
      // Add tenantId to the data
      const dataWithTenant = withTenantId(clientData, tenant!.id);
      
      await addDoc(collection(db, 'clients'), dataWithTenant);
      
      console.log('✅ Client added successfully');
    } catch (error) {
      console.error('❌ Error adding client:', error);
    }
  };
}
```

**Repeat this pattern for ALL files that query Firestore:**
- ✅ All store files (zustand)
- ✅ All admin pages
- ✅ All super-admin pages
- ✅ All components
- ✅ API routes

---

### Phase 2: Middleware & Routing (Week 2)

#### Step 2.1: Create Next.js Middleware

```typescript
// middleware.ts - CREATE IN ROOT

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = extractSubdomain(hostname);
  
  console.log('🌐 Middleware:', hostname, '→', subdomain);

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Add subdomain to headers for server components
  requestHeaders.set('x-tenant-subdomain', subdomain);
  
  // Add full hostname
  requestHeaders.set('x-hostname', hostname);

  // Create response with updated headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

function extractSubdomain(hostname: string): string {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Development
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'default';
  }

  // Custom domains (add your mappings)
  const customDomainMap: Record<string, string> = {
    'www.salonparadise.com': 'paradise',
    'salonparadise.com': 'paradise',
    // Add more custom domains here
  };

  if (customDomainMap[host]) {
    return customDomainMap[host];
  }

  // Subdomain format: subdomain.yourapp.com
  const parts = host.split('.');
  
  // If only 2 parts (yourapp.com), no subdomain
  if (parts.length < 3) {
    return 'default';
  }

  // Return first part as subdomain
  return parts[0];
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

#### Step 2.2: Update Next Config for Subdomains

```typescript
// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for deployment
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      // Add your custom domains
    ],
  },

  // Rewrites for subdomain handling
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>.*)\\.yourapp\\.com',
            },
          ],
          destination: '/:path*',
        },
      ],
    };
  },

  // Headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

### Phase 3: Dynamic Theming (Week 3)

#### Step 3.1: Update Global CSS

```css
/* app/globals.css */

:root {
  /* Default theme - will be overridden by tenant */
  --primary: #A81556;
  --secondary: #F03E7F;
  --accent: #F27FA1;
  --font-sans: 'Poppins', sans-serif;
  --radius: 0.75rem;
  
  /* Other variables remain the same */
}

/* Dark mode support (optional) */
.dark {
  --primary: #E91E63;
  --secondary: #FF4081;
  /* ... */
}

/* Tenant-specific overrides are applied via JavaScript */
/* See TenantContext.tsx -> applyTheme() */
```

---

#### Step 3.2: Create Dynamic Logo Component

```typescript
// src/components/shared/TenantLogo.tsx - NEW FILE

'use client';

import { useTenant } from '@/contexts/TenantContext';
import Image from 'next/image';

interface TenantLogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function TenantLogo({ 
  className = '', 
  width = 160, 
  height = 40,
  showText = true 
}: TenantLogoProps) {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width, height }}
      />
    );
  }

  if (!tenant) {
    return (
      <div className={className}>
        <span className="font-bold text-xl">Beauty Salon</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {tenant.branding.logo ? (
        <Image
          src={tenant.branding.logo}
          alt={tenant.name}
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      ) : (
        showText && (
          <span className="font-bold text-xl" style={{ 
            fontFamily: tenant.branding.fontFamily 
          }}>
            {tenant.name}
          </span>
        )
      )}
    </div>
  );
}
```

---

#### Step 3.3: Create Tenant Settings Display

```typescript
// src/components/shared/TenantInfo.tsx - NEW FILE

'use client';

import { useTenant } from '@/contexts/TenantContext';

export function TenantInfo() {
  const { tenant } = useTenant();

  if (!tenant) return null;

  return (
    <div className="p-4 bg-muted rounded-lg">
      <h3 className="font-semibold mb-2">Company Information</h3>
      <dl className="space-y-1 text-sm">
        <div>
          <dt className="text-muted-foreground inline">Name:</dt>
          <dd className="inline ml-2">{tenant.settings.companyName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground inline">Email:</dt>
          <dd className="inline ml-2">{tenant.settings.email}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground inline">Phone:</dt>
          <dd className="inline ml-2">{tenant.settings.phone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground inline">Plan:</dt>
          <dd className="inline ml-2 capitalize">{tenant.subscription.plan}</dd>
        </div>
      </dl>
    </div>
  );
}
```

---

### Phase 4: Feature Gates (Week 3-4)

#### Step 4.1: Create Feature Gate Component

```typescript
// src/components/shared/FeatureGate.tsx - NEW FILE

'use client';

import { useTenant } from '@/contexts/TenantContext';
import { ReactNode } from 'react';

interface FeatureGateProps {
  feature: keyof Tenant['features'];
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
  showUpgrade = true,
}: FeatureGateProps) {
  const { tenant } = useTenant();

  // During loading, don't show anything
  if (!tenant) return null;

  // Check if feature is enabled
  const isEnabled = tenant.features[feature];

  if (isEnabled) {
    return <>{children}</>;
  }

  // Show custom fallback or upgrade message
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    return (
      <div className="p-4 border-2 border-dashed rounded-lg text-center">
        <p className="text-sm text-muted-foreground mb-2">
          This feature is not available in your current plan
        </p>
        <button className="text-sm text-primary hover:underline">
          Upgrade to unlock
        </button>
      </div>
    );
  }

  return null;
}

// Usage example:
/*
<FeatureGate feature="advancedAnalytics">
  <AdvancedAnalyticsChart />
</FeatureGate>

<FeatureGate 
  feature="customReports"
  fallback={<BasicReportsView />}
>
  <CustomReportsBuilder />
</FeatureGate>
*/
```

---

#### Step 4.2: Create Usage Limit Hook

```typescript
// src/hooks/useUsageLimit.ts - NEW FILE

import { useTenant } from '@/contexts/TenantContext';
import { useState, useEffect } from 'react';

export function useUsageLimit(resource: 'branches' | 'staff' | 'clients') {
  const { tenant } = useTenant();
  const [isAtLimit, setIsAtLimit] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!tenant) return;

    const limit = tenant.subscription.limits[`max${capitalize(resource)}`];
    const usage = tenant.subscription.usage?.[resource] || 0;
    
    const remainingCount = limit - usage;
    setRemaining(remainingCount);
    setIsAtLimit(usage >= limit && limit !== -1); // -1 = unlimited

  }, [tenant, resource]);

  const canAdd = !isAtLimit;
  const percentage = tenant 
    ? (tenant.subscription.usage?.[resource] || 0) / tenant.subscription.limits[`max${capitalize(resource)}`] * 100
    : 0;

  return {
    canAdd,
    isAtLimit,
    remaining,
    percentage,
    limit: tenant?.subscription.limits[`max${capitalize(resource)}`] || 0,
    usage: tenant?.subscription.usage?.[resource] || 0,
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Usage:
/*
const { canAdd, isAtLimit, remaining } = useUsageLimit('staff');

if (!canAdd) {
  alert(`You've reached your staff limit. Upgrade to add more.`);
  return;
}
*/
```

---

### Phase 5: Tenant Management Portal (Week 4-5)

#### Step 5.1: Tenant Registration Page

```typescript
// app/register/page.tsx - NEW FILE

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TenantRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Company info
    companyName: '',
    subdomain: '',
    email: '',
    phone: '',
    
    // Admin user
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    
    // Plan
    plan: 'basic' as 'free' | 'basic' | 'professional' | 'enterprise',
  });

  const handleSubdomainChange = (value: string) => {
    // Only allow lowercase alphanumeric and hyphens
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, subdomain: cleaned }));
  };

  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    const tenantsRef = collection(db, 'tenants');
    const q = query(tenantsRef, where('subdomain', '==', subdomain));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Check subdomain availability
      const isAvailable = await checkSubdomainAvailability(formData.subdomain);
      if (!isAvailable) {
        setError('This subdomain is already taken');
        setLoading(false);
        return;
      }

      // 2. Create admin user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.adminEmail,
        formData.adminPassword
      );

      // 3. Create tenant
      const tenantData = {
        name: formData.companyName,
        subdomain: formData.subdomain,
        branding: {
          logo: '',
          primaryColor: '#A81556',
          secondaryColor: '#F03E7F',
          accentColor: '#F27FA1',
          fontFamily: 'Poppins, sans-serif',
          borderRadius: '0.75rem',
        },
        settings: {
          companyName: formData.companyName,
          timezone: 'UTC',
          currency: 'USD',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          email: formData.email,
          phone: formData.phone,
          address: '',
        },
        subscription: {
          plan: formData.plan,
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          limits: getPlanLimits(formData.plan),
          usage: {
            branches: 0,
            staff: 0,
            clients: 0,
          },
        },
        features: getPlanFeatures(formData.plan),
        owner: {
          userId: userCredential.user.uid,
          name: formData.adminName,
          email: formData.adminEmail,
        },
        status: 'trial',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tenantDoc = await addDoc(collection(db, 'tenants'), tenantData);

      // 4. Create user document
      await addDoc(collection(db, 'users'), {
        tenantId: tenantDoc.id,
        email: formData.adminEmail,
        name: formData.adminName,
        role: 'super_admin',
        status: 'active',
        createdAt: new Date(),
      });

      // 5. Redirect to tenant subdomain
      const tenantUrl = `https://${formData.subdomain}.yourapp.com`;
      window.location.href = tenantUrl;

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Your Beauty Salon Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Company Information</h3>
              
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex gap-2">
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    placeholder="your-salon"
                    required
                  />
                  <span className="flex items-center text-muted-foreground">.yourapp.com</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This will be your unique URL: {formData.subdomain || 'your-salon'}.yourapp.com
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Company Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Admin User */}
            <div className="space-y-4">
              <h3 className="font-semibold">Admin Account</h3>
              
              <div>
                <Label htmlFor="adminName">Your Name</Label>
                <Input
                  id="adminName"
                  value={formData.adminName}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Start 14-Day Free Trial'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function getPlanLimits(plan: string) {
  const limits = {
    free: { maxBranches: 1, maxStaff: 5, maxClients: 100 },
    basic: { maxBranches: 3, maxStaff: 15, maxClients: 1000 },
    professional: { maxBranches: 10, maxStaff: 50, maxClients: 5000 },
    enterprise: { maxBranches: -1, maxStaff: -1, maxClients: -1 }, // unlimited
  };
  return limits[plan as keyof typeof limits] || limits.basic;
}

function getPlanFeatures(plan: string) {
  const features = {
    free: {
      onlineBooking: true,
      customerPortal: false,
      staffPortal: false,
      multiLocation: false,
      advancedAnalytics: false,
      customReports: false,
      apiAccess: false,
    },
    basic: {
      onlineBooking: true,
      customerPortal: true,
      staffPortal: true,
      multiLocation: true,
      advancedAnalytics: false,
      customReports: false,
      apiAccess: false,
    },
    professional: {
      onlineBooking: true,
      customerPortal: true,
      staffPortal: true,
      multiLocation: true,
      advancedAnalytics: true,
      customReports: true,
      apiAccess: false,
    },
    enterprise: {
      onlineBooking: true,
      customerPortal: true,
      staffPortal: true,
      multiLocation: true,
      advancedAnalytics: true,
      customReports: true,
      apiAccess: true,
    },
  };
  return features[plan as keyof typeof features] || features.basic;
}
```

---

## Migration Strategy

### Pre-Migration Checklist

- [ ] Backup entire Firestore database
- [ ] Create test Firebase project
- [ ] Test migration scripts on test data
- [ ] Notify users of upcoming changes
- [ ] Prepare rollback plan

### Migration Steps

#### Step 1: Create Migration Script

```typescript
// scripts/migrate-to-multi-tenant.ts

import admin from 'firebase-admin';

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
});

const db = admin.firestore();

async function migrateToMultiTenant() {
  console.log('🚀 Starting multi-tenant migration...');

  // 1. Create default tenant
  const defaultTenant = await db.collection('tenants').add({
    name: 'JAM Beauty Lounge',
    subdomain: 'default',
    branding: {
      logo: '',
      primaryColor: '#A81556',
      secondaryColor: '#F03E7F',
      accentColor: '#F27FA1',
      fontFamily: 'Poppins, sans-serif',
      borderRadius: '0.75rem',
    },
    settings: {
      companyName: 'JAM Beauty Lounge',
      timezone: 'Asia/Dubai',
      currency: 'AED',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      email: 'info@jambeauty.com',
      phone: '+971-xxx-xxxx',
      address: '',
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      limits: {
        maxBranches: -1,
        maxStaff: -1,
        maxClients: -1,
      },
    },
    features: {
      onlineBooking: true,
      customerPortal: true,
      staffPortal: true,
      multiLocation: true,
      advancedAnalytics: true,
      customReports: true,
      apiAccess: true,
    },
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const tenantId = defaultTenant.id;
  console.log(`✅ Created default tenant: ${tenantId}`);

  // 2. Add tenantId to all collections
  const collections = [
    'clients',
    'bookings',
    'services',
    'products',
    'staff',
    'branches',
    'categories',
    'orders',
    'appointments',
    'expenses',
    'feedbacks',
    'memberships',
  ];

  for (const collectionName of collections) {
    console.log(`\n📦 Migrating collection: ${collectionName}`);
    
    const snapshot = await db.collection(collectionName).get();
    console.log(`   Found ${snapshot.size} documents`);

    const batch = db.batch();
    let count = 0;

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { tenantId });
      count++;

      // Firestore batch limit is 500
      if (count % 500 === 0) {
        console.log(`   Processed ${count} documents...`);
      }
    });

    await batch.commit();
    console.log(`   ✅ Migrated ${count} documents`);
  }

  // 3. Update users collection
  console.log(`\n👥 Migrating users collection`);
  const usersSnapshot = await db.collection('users').get();
  const usersBatch = db.batch();

  usersSnapshot.forEach((doc) => {
    usersBatch.update(doc.ref, { tenantId });
  });

  await usersBatch.commit();
  console.log(`   ✅ Migrated ${usersSnapshot.size} users`);

  console.log('\n🎉 Migration completed successfully!');
}

// Run migration
migrateToMultiTenant()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
```

#### Step 2: Run Migration

```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Download service account key from Firebase Console
# Place in project root as serviceAccountKey.json

# Run migration
npx ts-node scripts/migrate-to-multi-tenant.ts
```

---

## Best Practices

### 1. Always Filter by tenantId

```typescript
// ✅ CORRECT
const q = query(
  collection(db, 'clients'),
  where('tenantId', '==', currentTenantId)
);

// ❌ WRONG - Missing tenant filter
const q = query(collection(db, 'clients'));
```

### 2. Use Helper Functions

```typescript
// ✅ Use the helper
const q = getTenantQuery('clients', tenant.id, [orderBy('name')]);

// ❌ Don't manually construct queries everywhere
```

### 3. Validate Tenant on Every Request

```typescript
// In API routes
export async function POST(request: Request) {
  const tenantId = request.headers.get('x-tenant-id');
  
  if (!tenantId) {
    return new Response('Tenant ID required', { status: 400 });
  }
  
  // Verify tenant exists and is active
  const tenant = await getTenantById(tenantId);
  if (!tenant || tenant.status !== 'active') {
    return new Response('Invalid tenant', { status: 403 });
  }
  
  // Proceed with request
}
```

### 4. Implement Usage Tracking

```typescript
// Update usage after creating records
async function addClient(clientData, tenantId) {
  // Add client
  await addDoc(collection(db, 'clients'), {
    ...clientData,
    tenantId,
  });
  
  // Update usage counter
  await updateDoc(doc(db, 'tenants', tenantId), {
    'subscription.usage.clients': increment(1),
  });
}
```

### 5. Test with Multiple Tenants

```typescript
// Always test with at least 2 tenants to ensure isolation
describe('Multi-tenant isolation', () => {
  it('should not return data from other tenants', async () => {
    const tenant1Clients = await getClients('tenant-1');
    const tenant2Clients = await getClients('tenant-2');
    
    // Verify no overlap
    expect(tenant1Clients).not.toContainEqual(
      expect.objectContaining({ tenantId: 'tenant-2' })
    );
  });
});
```

---

## Troubleshooting

### Issue: Tenant not loading

**Symptoms:** Blank page, tenant is null

**Solutions:**
```typescript
// 1. Check subdomain extraction
console.log('Hostname:', window.location.hostname);
console.log('Subdomain:', getSubdomainFromHostname());

// 2. Verify tenant exists in Firestore
// Check tenants collection for matching subdomain

// 3. Check tenant status
// Ensure status is 'active' or 'trial'

// 4. Check for query errors in console
```

### Issue: Data leaking between tenants

**Symptoms:** Seeing other tenant's data

**Solutions:**
```typescript
// 1. Verify all queries have tenantId filter
// Search codebase for: collection(db,
// Each should have: where('tenantId', '==', ...)

// 2. Check Firestore security rules
// Ensure rules enforce tenantId matching

// 3. Review recent code changes
// New queries might be missing tenant filter
```

### Issue: Feature gates not working

**Symptoms:** Features showing despite being disabled

**Solutions:**
```typescript
// 1. Check tenant features in Firestore
// Verify the feature flag is set correctly

// 2. Check FeatureGate usage
<FeatureGate feature="advancedAnalytics">
  {/* Component */}
</FeatureGate>

// 3. Verify tenant context is available
const { tenant } = useTenant();
console.log('Tenant features:', tenant?.features);
```

### Issue: Subdomain routing not working

**Symptoms:** All subdomains show same tenant

**Solutions:**
```typescript
// 1. Check DNS configuration
// Ensure wildcard DNS: *.yourapp.com → Your server

// 2. Verify middleware
// Check middleware.ts is extracting subdomain

// 3. Test locally with query params
// http://localhost:3000?tenant=paradise
```

---

## Testing Multi-Tenant Locally

### Option 1: Query Parameters

```typescript
// Update getSubdomainFromHostname
function getSubdomainFromHostname(): string {
  if (typeof window === 'undefined') return 'default';

  const hostname = window.location.hostname;

  // Check for tenant query param (for local testing)
  const params = new URLSearchParams(window.location.search);
  const tenantParam = params.get('tenant');
  if (tenantParam) {
    console.log('🧪 Using tenant from query param:', tenantParam);
    return tenantParam;
  }

  // ... rest of logic
}

// Test URLs:
// http://localhost:3000?tenant=paradise
// http://localhost:3000?tenant=elite
```

### Option 2: Hosts File

```bash
# Edit /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)

127.0.0.1 paradise.localhost
127.0.0.1 elite.localhost

# Access:
# http://paradise.localhost:3000
# http://elite.localhost:3000
```

---

## Deployment Checklist

### DNS Configuration

```
Type: A
Host: @
Value: Your-Server-IP

Type: CNAME
Host: *
Value: yourapp.com
```

### Environment Variables

```env
# .env.production
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_APP_DOMAIN=yourapp.com
```

### Vercel Configuration

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/:path*"
    }
  ],
  "headers": [
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "x-tenant-subdomain",
          "value": "$host"
        }
      ]
    }
  ]
}
```

---

## Next Steps

1. ✅ Review this documentation
2. ✅ Backup your current database
3. ✅ Create test Firebase project
4. ✅ Implement Phase 1 (Core Infrastructure)
5. ✅ Test with sample data
6. ✅ Implement remaining phases
7. ✅ Run migration on production
8. ✅ Monitor and iterate

---

## Support & Resources

- **Firebase Multi-Tenancy:** https://firebase.google.com/docs/firestore/solutions/multi-tenancy
- **Next.js Middleware:** https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Firestore Security Rules:** https://firebase.google.com/docs/firestore/security/get-started

---

**Last Updated:** January 28, 2026
**Version:** 1.0.0
