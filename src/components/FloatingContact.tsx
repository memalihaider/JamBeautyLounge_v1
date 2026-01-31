'use client';

import { useState } from 'react';
import { MessageSquare, Phone, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranch } from '@/contexts/BranchContext';

export function FloatingContact() {
  const [showChat, setShowChat] = useState(false);
  const { selectedBranch } = useBranch();

  const contactButtons = [
    {
      icon: Phone,
      label: 'Call',
      href: 'tel:+1234567890',
      color: 'bg-blue-500 hover:bg-blue-600',
      order: 1,
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: 'https://wa.me/1234567890',
      color: 'bg-green-500 hover:bg-green-600',
      order: 2,
    },
    {
      icon: MessageSquare,
      label: 'Chatbot',
      action: () => setShowChat(true),
      color: 'bg-purple-500 hover:bg-purple-600',
      order: 3,
    },
  ];

  return (
    <>
      {/* Floating Contact Buttons - Desktop */}
      <div className="hidden md:fixed md:bottom-6 md:right-6 md:z-40 md:flex md:flex-col md:items-end md:gap-3">
        {contactButtons.map((contact) => {
          const Icon = contact.icon;
          if (contact.action) {
            return (
              <button
                key={contact.label}
                onClick={contact.action}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                  contact.color
                )}
                title={contact.label}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          }
          return (
            <a
              key={contact.label}
              href={contact.href}
              target={contact.href?.startsWith('http') ? '_blank' : undefined}
              rel={contact.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                contact.color
              )}
              title={contact.label}
            >
              <Icon className="w-6 h-6" />
            </a>
          );
        })}
      </div>

      {/* Mobile Optimized Version - Three Floating Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 md:hidden">
        {contactButtons.map((contact) => {
          const Icon = contact.icon;
          if (contact.action) {
            return (
              <button
                key={contact.label}
                onClick={contact.action}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                  contact.color
                )}
                title={contact.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          }
          return (
            <a
              key={contact.label}
              href={contact.href}
              target={contact.href?.startsWith('http') ? '_blank' : undefined}
              rel={contact.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
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

      {/* Live Chat Modal */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-secondary to-purple-500 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-xs opacity-90">{selectedBranch?.name || 'JAM Beauty Lounge'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-secondary" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 max-w-xs">
                <p>👋 Welcome to JAM Beauty Lounge!</p>
                <p className="text-xs text-gray-600 mt-2">Our team is here to help. Ask us anything about our services, bookings, or products!</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold">Quick replies:</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="text-xs bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg p-2 transition-all">
                  Services & Pricing
                </button>
                <button className="text-xs bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg p-2 transition-all">
                  Book Appointment
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button className="bg-secondary hover:bg-secondary/90 text-white rounded-lg px-4 py-2 transition-all">
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              💬 Typically replies in <span className="font-semibold">minutes</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
