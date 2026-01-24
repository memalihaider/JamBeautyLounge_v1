import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-primary/10 z-50 shadow-sm fade-in">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-serif font-bold text-primary tracking-tight hidden sm:block">
            JAM <span className="text-secondary">BEAUTY LOUNGE</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: "Home", href: "/" },
            { name: "Services", href: "/services" },
            { name: "Products", href: "/products" },
            { name: "Branches", href: "/branches" },
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
        <div className="flex items-center gap-4">
          <Link href="/customer/login" className="text-xs uppercase tracking-widest font-semibold text-primary/70 hover:text-secondary hidden sm:block transition-colors">
            Sign In
          </Link>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-2 text-xs tracking-widest font-bold shadow-md shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95">
            <Link href="/services">BOOK NOW</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}