'use client';

import { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  const contactLinks = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: 'https://wa.me/1234567890', // Replace with your WhatsApp number
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-500',
      hoverBg: 'hover:bg-green-50',
      order: 2,
    },
    {
      icon: Phone,
      label: 'Call Us',
      href: 'tel:+1234567890', // Replace with your phone number
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-500',
      hoverBg: 'hover:bg-blue-50',
      order: 1,
    },
  ];

  return (
    <>
      {/* Floating Contact Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Expanded Menu */}
        {isOpen && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {contactLinks.map((contact) => {
              const Icon = contact.icon;
              return (
                <a
                  key={contact.label}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3"
                >
                  {/* Label */}
                  <div className="flex flex-col items-end">
                    <div className={cn(
                      "px-4 py-2 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-300",
                      contact.hoverBg
                    )}>
                      <span className={cn("text-sm font-semibold transition-colors", contact.textColor)}>
                        {contact.label}
                      </span>
                    </div>
                  </div>

                  {/* Icon Button */}
                  <button
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                      contact.color
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                </a>
              );
            })}
          </div>
        )}

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95",
            isOpen ? "bg-red-500 hover:bg-red-600 rotate-45" : "bg-secondary hover:bg-secondary/90"
          )}
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <div className="flex items-center justify-center">
              <MessageCircle className="w-7 h-7 absolute" />
              <div className="absolute w-3 h-3 bg-red-500 rounded-full top-1 right-1 animate-pulse"></div>
            </div>
          )}
        </button>
      </div>

      {/* Mobile Optimized Version */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 md:hidden">
        {isOpen && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {contactLinks.map((contact) => {
              const Icon = contact.icon;
              return (
                <a
                  key={contact.label}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                    contact.color
                  )}
                  title={contact.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}

        {/* Mobile Main Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95",
            isOpen ? "bg-red-500 hover:bg-red-600 rotate-45" : "bg-secondary hover:bg-secondary/90"
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="flex items-center justify-center">
              <MessageCircle className="w-6 h-6 absolute" />
              <div className="absolute w-2 h-2 bg-red-500 rounded-full top-0.5 right-0.5 animate-pulse"></div>
            </div>
          )}
        </button>
      </div>
    </>
  );
}
