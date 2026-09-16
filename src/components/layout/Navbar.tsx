import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataStore';
import { RoleBadge } from '../common/StatusBadge';
import {
  ShieldCheck,
  Search,
  Bell,
  LogOut,
  User,
  RotateCcw,
  Menu,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onToggleSidebar }) => {
  const { user, role, quickLoginAs, logout, resetDemoData, refreshData } = useAuth();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = user ? dataStore.getNotifications(user.id) : [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const roleOptions: { role: UserRole; title: string; subtitle: string }[] = [
    { role: 'applicant', title: 'Applicant / Instrument Owner', subtitle: 'Ramesh Patel (Maa Durga Trading)' },
    { role: 'lmo', title: 'Legal Metrology Officer (LMO)', subtitle: 'S. K. Sharma (Govt. Inspector)' },
    { role: 'gatc', title: 'GATC Test Centre Staff', subtitle: 'Dr. Ananya Sen (NABL Lab)' },
    { role: 'admin', title: 'System Administrator', subtitle: 'Vikramaditya Joshi (Joint Controller)' },
  ];

  const handleRoleSwitch = (newRole: UserRole) => {
    quickLoginAs(newRole);
    setShowRoleMenu(false);
    refreshData();
    if (newRole === 'applicant') navigate('/applicant/dashboard');
    else if (newRole === 'lmo' || newRole === 'gatc') navigate('/queue');
    else if (newRole === 'admin') navigate('/admin');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all instruments, applications, and certificates to initial demo state?')) {
      resetDemoData();
      alert('Demo data restored successfully!');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white">VerifyMetro</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 hidden sm:inline-block">
                    Govt. Compliance
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                  Legal Metrology Act, 2009 Digital System
                </span>
              </div>
            </Link>
          </div>

          {/* Center/Search Bar Trigger */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <button
              id="global-search-trigger"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search certificate #, serial number, make...</span>
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded border border-slate-600">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Demo Role Switcher, Notifications & User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search icon on mobile */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                id="role-switcher-button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 border border-blue-700/60 text-xs text-blue-200 transition-colors"
                title="Switch Demo Role"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-semibold">Demo Role:</span>
                <span className="font-bold text-white capitalize">{role}</span>
                <ChevronDown className="w-3 h-3 text-blue-300 ml-0.5" />
              </button>

              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowRoleMenu(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Perspective (Demo/Hackathon)
                  </div>
                  {roleOptions.map((opt) => (
                    <button
                      key={opt.role}
                      onClick={() => handleRoleSwitch(opt.role)}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-50 transition-colors ${
                        role === opt.role ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <span className="font-bold text-slate-900">{opt.title}</span>
                      <span className="text-[11px] text-slate-500">{opt.subtitle}</span>
                    </button>
                  ))}
                  <div className="px-3 pt-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={handleResetData}
                      className="w-full text-left text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 py-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Demo Database</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              id="notifications-link"
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  id="unread-notifications-badge"
                  className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center border border-slate-900 animate-pulse"
                >
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs border border-slate-600">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <div className="font-semibold text-white truncate max-w-[120px]">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                  </div>
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.organization}</p>
                      <div className="mt-1">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
