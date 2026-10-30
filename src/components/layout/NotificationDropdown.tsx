'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { NotificationItem } from '@/types/civic';
import { complaintService } from '@/lib/data/complaintService';
import { formatRelativeTime } from '@/lib/utils/formatters';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    const list = await complaintService.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await complaintService.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'RESOLUTION':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'ASSIGNMENT':
        return <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'STATUS_CHANGE':
        return <Info className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-mono font-bold text-slate-950 shadow-md shadow-cyan-500/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-[#0f172a] shadow-2xl border border-white/15 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#090d16]/80">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => {
                notifications.forEach((n) => complaintService.markNotificationRead(n.id));
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No notifications logged yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 hover:bg-white/5 transition-colors flex items-start gap-3.5 ${
                    !n.is_read ? 'bg-cyan-950/20' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="mt-2.5 flex items-center gap-3">
                      {n.complaint_id && (
                        <Link
                          href={`/track/${n.complaint_id}`}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                        >
                          View Report <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      {!n.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
