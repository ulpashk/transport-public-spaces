import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen font-inter bg-gray-50 overflow-hidden">
      {children}
    </div>
  );
}