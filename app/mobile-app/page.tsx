'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Image, Star, Users, Edit, Eye, Save, LogOut } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LandingPageCMS() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mock data for CMS content
  const heroSection = {
    title: "JAM Beauty Lounge",
    subtitle: "Experience signature rituals any time, anywhere",
    ctaPrimary: "Download Now",
    ctaSecondary: "Learn More",
    backgroundImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
  };

  const testimonials = [
    { id: 1, name: "Sophie L.", rating: 5, text: "The app is so convenient for booking my rituals.", status: "published" },
    { id: 2, name: "Maria R.", rating: 5, text: "Love the loyalty points tracking!", status: "published" },
    { id: 3, name: "Chloe T.", rating: 5, text: "Seamless experience from start to finish.", status: "draft" },
  ];

  const services = [
    { id: 1, name: "Mobile Booking", price: "Free", description: "Instantly secure your artisan chair", status: "published" },
    { id: 2, name: "Loyalty Hub", price: "Free", description: "Track points and exclusive rewards", status: "published" },
    { id: 3, name: "Premium Shop", price: "Varies", description: "Purchase couture skincare on the go", status: "published" },
  ];

  const seoSettings = {
    metaTitle: "JAM Beauty - Luxury Mobile Experience",
    metaDescription: "The official premium mobile application for JAM Beauty Lounge rituals.",
    keywords: "beauty app, booking, luxury salon, jam beauty lounge",
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar
          role="super_admin"
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <AdminMobileSidebar
                  role="super_admin"
                  onLogout={handleLogout}
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mobile App Management</h1>
                  <p className="text-sm text-gray-600">JAM Beauty Mobile App Console</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <h2>Mobile App Management</h2>
              <p className="text-gray-600 mt-2">JAM Beauty Mobile App Console</p>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
