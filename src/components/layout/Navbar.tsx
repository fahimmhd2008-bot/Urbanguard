'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  PlusCircle,
  FileText,
  LayoutDashboard,
  MapPin,
  Copy,
  Menu,
  X,
  UserCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { UserRole } from '@/types/civic';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');

  useEffect(() => {
    const saved = localStorage.getItem('civicai_current_role') as UserRole;
    if (saved) {
      setCurrentRole(saved);
    } else if (pathname.startsWith('/admin')) {
      setCurrentRole('admin');
    }
  }, [pathname]);

  const toggleRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('civicai_current_role', newRole);
  };

  const navLinks = [
    { href: '/submit', label: 'Report Issue', icon: PlusCircle, citizenOnly: true },
    { href: '/my-complaints', label: 'My Complaints', icon: FileText, citizenOnly: true },
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, adminOnly: true },
    { href: '/admin/complaints', label: 'Complaints', icon: FileText, adminOnly: true },
    { href: '/admin/map', label: 'Hotspot Map', icon: MapPin, adminOnly: true },
    { href: '/admin/duplicates', label: 'Duplicates', icon: Copy, adminOnly: true },
  ];

  const visibleLinks = navLinks.filter((link) => {
    if (currentRole === 'citizen' && link.adminOnly) return false;
    if (currentRole === 'admin' && link.citizenOnly) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0f19]/85 backdrop-blur-xl border-b border-white/10 text-white shadow-xl shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  Civic<span className="text-gradient-blue font-black">AI</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-900/60 to-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  Autonomous
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Complaints to Action Engine
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                pathname === '/'
                  ? 'text-white bg-white/10 shadow-inner border border-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>

            {visibleLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-600/30 border border-blue-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Role Switcher & Notifications */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Quick Demo Role Switcher */}
            <div className="flex items-center bg-[#131b2e] p-1 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => toggleRole('citizen')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  currentRole === 'citizen'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Citizen View"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Citizen</span>
              </button>
              <button
                onClick={() => toggleRole('admin')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  currentRole === 'admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Municipal Administrator View"
              >
                <Building className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>

            {/* Notification Bell */}
            <NotificationDropdown />

            {/* Primary Action Button */}
            {currentRole === 'citizen' ? (
              <Link
                href="/submit"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold tracking-wide shadow-lg shadow-blue-600/30 hover:shadow-cyan-500/40 transition-all duration-200 border border-cyan-400/30"
              >
                <PlusCircle className="w-4 h-4 text-cyan-200" />
                Report Issue
              </Link>
            ) : (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition-all duration-200 border border-purple-400/30"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-200" />
                Dashboard
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-white/10"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-2 bg-[#0b0f19] px-2 rounded-b-2xl animate-in slide-in-from-top duration-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              Home
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                <item.icon className="w-4 h-4 text-cyan-400" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
