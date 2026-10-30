'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { NotificationItem } from '@/types/civic';
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
    const interval = setInterval(loadNotifications, 5000);
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
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'ASSIGNMENT':
        return <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'STATUS_CHANGE':
        return <Info className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9] transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3978C5] text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-[#E5EAF0] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-3.5 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#183B66]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3FC] text-[#183B66]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => {
                notifications.forEach((n) => complaintService.markNotificationRead(n.id));
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
              }}
              className="text-xs text-[#3978C5] hover:text-[#183B66] font-semibold transition-colors"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E5EAF0]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#718096]">
                No notifications logged yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 hover:bg-[#F8FAFC] transition-colors flex items-start gap-3 ${
                    !n.is_read ? 'bg-[#F4F8FD]' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-[#263445] truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-[#718096] shrink-0">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#718096] mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      {n.complaint_id && (
                        <Link
                          href={`/track/${n.complaint_id}`}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3978C5] hover:text-[#183B66]"
                        >
                          View Report <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      {!n.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="inline-flex items-center gap-1 text-[11px] text-[#718096] hover:text-[#263445]"
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
