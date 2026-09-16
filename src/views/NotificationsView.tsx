import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataStore } from '../lib/dataStore';
import { AppNotification } from '../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  ArrowRight,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { user, refreshData } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!user) return null;

  const notifications = dataStore.getNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const filteredNotifs = filter === 'all'
    ? notifications
    : notifications.filter((n) => !n.read_at);

  const handleMarkAsRead = (id: string) => {
    dataStore.markNotificationAsRead(id);
    refreshData();
  };

  const handleMarkAllRead = () => {
    dataStore.markAllNotificationsAsRead(user.id);
    refreshData();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'expiry_alert':
        return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      case 'status_update':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'assignment_alert':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Statutory Alerts & Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official alerts for certificate expiries, verification schedules, and statutory compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Mark All Read</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'unread' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Notifications</h3>
          <p className="text-xs text-slate-500 mt-1">
            You are completely caught up on all verification notices and expiry alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const isUnread = !n.read_at;

            return (
              <div
                key={n.id}
                id={`notif-item-${n.id}`}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-white border-blue-300 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      n.type === 'expiry_alert'
                        ? 'bg-amber-100'
                        : n.type === 'status_update'
                        ? 'bg-emerald-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    {getIcon(n.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                    <div className="text-[11px] text-slate-400 font-medium pt-1">
                      {new Date(n.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => handleMarkAsRead(n.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Action</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-2 py-1"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
