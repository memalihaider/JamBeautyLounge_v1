'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { BranchProvider } from '@/contexts/BranchContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FloatingContact } from './FloatingContact';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <BranchProvider>
        <AuthProvider>
          {children}
          <FloatingContact />
        </AuthProvider>
      </BranchProvider>
    </LanguageProvider>
  );
}