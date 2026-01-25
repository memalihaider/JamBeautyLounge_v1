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
    subtitle: "Experience signature rituals at our premium flagships",
    ctaPrimary: "Book Now",
    ctaSecondary: "Find Location",
    backgroundImage: "https://images.unsplash.com/photo-1599351431247-f5094021186d?q=80&w=2070&auto=format&fit=crop"
  };

  const testimonials = [
    { id: 1, name: "Sophie L.", rating: 5, text: "The best aesthetic lounge I've ever visited.", status: "published" },
    { id: 2, name: "Maria R.", rating: 5, text: "Absolute magic. My skin has never looked better.", status: "published" },
    { id: 3, name: "Chloe T.", rating: 5, text: "A truly premium experience. Highly recommend!", status: "draft" },
  ];

  const services = [
    { id: 1, name: "Signature Hair Ritual", price: "From $85", description: "Artistic styling and transformation", status: "published" },
    { id: 2, name: "Glow Facial Therapy", price: "From $120", description: "Scientific skincare for lasting radiance", status: "published" },
    { id: 3, name: "Elite Bridal Package", price: "From $450", description: "Complete beauty journey for your day", status: "published" },
  ];

  const seoSettings = {
    metaTitle: "JAM Beauty Lounge - Signature Beauty | Book Online",
    metaDescription: "Experience signature beauty rituals at JAM Beauty Lounge. Professional artisans, premium atmosphere, luxury flagships.",
    keywords: "beauty, hair, skincare, luxury salon, jam beauty lounge",
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
                  <h1 className="text-2xl font-bold text-gray-900">Landing Page CMS</h1>
                  <p className="text-sm text-gray-600">Manage homepage content and SEO</p>
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
              <h2>Landing Page CMS</h2>
              <p className="text-gray-600 mt-2">Manage homepage content and SEO settings</p>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
