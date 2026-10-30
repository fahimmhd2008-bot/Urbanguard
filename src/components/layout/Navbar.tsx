'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
  UserCheck,
  Building2,
  LogIn,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import type { UserRole } from '@/types/civic';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('urbanguard_current_role') ||
      localStorage.getItem('urbangurad_current_role')) as UserRole;
    if (saved) {
      setCurrentRole(saved);
    } else if (pathname.startsWith('/admin')) {
      setCurrentRole('admin');
    }
  }, [pathname]);

  const toggleRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('urbanguard_current_role', newRole);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5EAF0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Urbanguard Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#183B66] text-white flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#183B66]">
                Urban<span className="text-[#3978C5]">guard</span>
              </span>
              <p className="text-[10px] text-[#718096] font-medium leading-none hidden sm:block">
                Municipal Action Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                pathname === '/'
                  ? 'text-[#183B66] bg-[#F1F5F9]'
                  : 'text-[#718096] hover:text-[#183B66] hover:bg-[#F8FAFC]'
              }`}
            >
              Home
            </Link>

            <Link
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#718096] hover:text-[#183B66] hover:bg-[#F8FAFC] transition-colors"
            >
              How It Works
            </Link>

            <Link
              href="/submit"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                pathname === '/submit'
                  ? 'text-[#183B66] bg-[#F1F5F9]'
                  : 'text-[#718096] hover:text-[#183B66] hover:bg-[#F8FAFC]'
              }`}
            >
              Report an Issue
            </Link>

            <Link
              href="/my-complaints"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                pathname.startsWith('/my-complaints')
                  ? 'text-[#183B66] bg-[#F1F5F9]'
                  : 'text-[#718096] hover:text-[#183B66] hover:bg-[#F8FAFC]'
              }`}
            >
              Track My Complaint
            </Link>

            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                pathname.startsWith('/admin')
                  ? 'text-[#183B66] bg-[#F1F5F9]'
                  : 'text-[#718096] hover:text-[#183B66] hover:bg-[#F8FAFC]'
              }`}
            >
              Admin Dashboard
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Role Switcher */}
            <div className="hidden lg:flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E5EAF0]">
              <button
                onClick={() => toggleRole('citizen')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'citizen'
                    ? 'bg-white text-[#183B66] shadow-sm'
                    : 'text-[#718096] hover:text-[#263445]'
                }`}
                title="Switch to Citizen View"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Citizen</span>
              </button>
              <button
                onClick={() => toggleRole('admin')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-white text-[#183B66] shadow-sm'
                    : 'text-[#718096] hover:text-[#263445]'
                }`}
                title="Switch to Municipal Admin View"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Sign In Button */}
            <button
              onClick={() => setShowSignInModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#183B66] hover:bg-[#F1F5F9] rounded-lg transition-colors border border-transparent hover:border-[#E5EAF0]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>

            {/* Primary CTA */}
            {currentRole === 'citizen' ? (
              <Link
                href="/submit"
                className="btn-primary text-xs !py-1.5 !px-3.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="btn-primary text-xs !py-1.5 !px-3.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9] rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E5EAF0] space-y-1 bg-white">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-[#263445] hover:bg-[#F5F7FA]"
            >
              Home
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-[#718096] hover:bg-[#F5F7FA]"
            >
              How It Works
            </Link>
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-[#718096] hover:bg-[#F5F7FA]"
            >
              Report an Issue
            </Link>
            <Link
              href="/my-complaints"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-[#718096] hover:bg-[#F5F7FA]"
            >
              Track My Complaint
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-[#718096] hover:bg-[#F5F7FA]"
            >
              Admin Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Clean Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-[#E5EAF0] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#183B66]" />
                <h3 className="font-bold text-[#183B66] text-base">Urbanguard Access</h3>
              </div>
              <button
                onClick={() => setShowSignInModal(false)}
                className="text-[#718096] hover:text-[#263445] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#718096] leading-relaxed">
              Sign in with your municipal or citizen account to manage verified records.
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  toggleRole('citizen');
                  setShowSignInModal(false);
                }}
                className="w-full btn-secondary text-xs !py-2.5 justify-start gap-2.5"
              >
                <UserCheck className="w-4 h-4 text-[#3978C5]" />
                <span>Continue as Citizen User</span>
              </button>
              <button
                onClick={() => {
                  toggleRole('admin');
                  setShowSignInModal(false);
                }}
                className="w-full btn-primary text-xs !py-2.5 justify-start gap-2.5"
              >
                <Building2 className="w-4 h-4 text-white" />
                <span>Continue as Municipal Administrator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
