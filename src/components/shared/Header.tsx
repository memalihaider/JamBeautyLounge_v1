'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Sparkles, Globe, User, LogOut } from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const router = useRouter();
  const { branches, selectedBranch, setSelectedBranch } = useBranch();
  const { language, setLanguage, t } = useLanguage();
  
  // Get auth from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsed = JSON.parse(user);
          return parsed.role === 'customer';
        } catch {
          return false;
        }
      }
    }
    return false;
  });

  const [customer, setCustomer] = useState(() => {
    if (typeof window !== 'undefined' && isLoggedIn) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          return JSON.parse(user);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('customerAuth');
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    router.push('/customer/login');
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-primary/10 z-50 shadow-sm fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-serif font-bold text-primary tracking-tight hidden sm:block">
            JAM <span className="text-secondary">BEAUTY LOUNGE</span>
          </span>
        </Link>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: t('nav.home'), href: "/" },
            { name: t('nav.services'), href: "/services" },
            { name: t('nav.products'), href: "/products" },
            { name: t('nav.branches'), href: "/branches" },
          ].map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              className="text-xs uppercase tracking-widest font-semibold text-primary/70 hover:text-secondary transition-all duration-300 hover:-translate-y-0.5"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Branch Selector */}
          <Select 
            value={selectedBranch?.id || ""} 
            onValueChange={(branchId) => {
              const branch = branches.find(b => b.id === branchId);
              if (branch) setSelectedBranch(branch);
            }}
          >
            <SelectTrigger className="w-[180px] h-10 rounded-lg border-primary/20 text-xs font-semibold bg-white hover:border-primary/40 transition-colors">
              <SelectValue placeholder={t('branch.select')} />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id} className="text-xs">
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Language Switcher */}
          <Select value={language} onValueChange={(lang) => setLanguage(lang as 'en' | 'ar')}>
            <SelectTrigger className="w-[100px] h-10 rounded-lg border-primary/20 text-xs font-semibold bg-white hover:border-primary/40 transition-colors">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en" className="text-xs">English</SelectItem>
              <SelectItem value="ar" className="text-xs">العربية</SelectItem>
            </SelectContent>
          </Select>

          {/* Profile or Sign In */}
          {isLoggedIn && customer ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 hover:scale-110"
                title={customer.name}
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-primary/10 overflow-hidden min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-primary/10">
                    <p className="text-sm font-semibold text-primary">{customer.name}</p>
                    <p className="text-xs text-primary/60">{customer.email}</p>
                  </div>
                  <Link
                    href="/customer/portal"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-primary/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Sign In & Book Now */}
              <Link href="/customer/login" className="text-xs uppercase tracking-widest font-semibold text-primary/70 hover:text-secondary hidden sm:block transition-colors">
                {t('nav.signIn')}
              </Link>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2 text-xs tracking-widest font-bold shadow-md shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95">
                <Link href="/services">{t('nav.bookNow')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}