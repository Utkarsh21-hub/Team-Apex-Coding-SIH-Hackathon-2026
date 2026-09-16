import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Scale,
  FileText,
  Award,
  Bell,
  Users,
  User,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();

  const applicantLinks = [
    { to: '/applicant/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/applicant/instruments', label: 'My Instruments', icon: Scale },
    { to: '/applicant/applications', label: 'Applications & Status', icon: FileText },
    { to: '/certificates', label: 'Digital Certificates', icon: Award },
    { to: '/notifications', label: 'Alerts & Expiries', icon: Bell },
    { to: '/profile', label: 'Business Profile', icon: User },
  ];

  const officerLinks = [
    { to: '/queue', label: 'Verification Queue', icon: ClipboardList },
    { to: '/certificates', label: 'Issued Certificates', icon: Award },
    { to: '/notifications', label: 'Officer Alerts', icon: Bell },
    { to: '/profile', label: 'Officer Profile', icon: User },
  ];

  const gatcLinks = [
    { to: '/queue', label: 'Lab Testing Queue', icon: ClipboardList },
    { to: '/certificates', label: 'Calibration Certificates', icon: Award },
    { to: '/notifications', label: 'Test Requests', icon: Bell },
    { to: '/profile', label: 'Lab Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin', label: 'System Analytics', icon: LayoutDashboard },
    { to: '/queue', label: 'All Applications', icon: ClipboardList },
    { to: '/certificates', label: 'Certificates Ledger', icon: Award },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/notifications', label: 'System Alerts', icon: Bell },
    { to: '/profile', label: 'Admin Profile', icon: User },
  ];

  const currentLinks =
    role === 'applicant'
      ? applicantLinks
      : role === 'lmo'
      ? officerLinks
      : role === 'gatc'
      ? gatcLinks
      : adminLinks;

  const baseClasses =
    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors';
  const activeClasses = 'bg-blue-800/90 text-white shadow-xs';
  const inactiveClasses = 'text-slate-300 hover:bg-slate-800 hover:text-white';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-5 px-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        <div className="space-y-6">
          {/* Role pill display */}
          <div className="px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Workspace</div>
            <div className="font-bold text-white mt-0.5 truncate">{user?.organization}</div>
            <div className="text-[11px] text-blue-300 mt-0.5 capitalize flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{role === 'lmo' ? 'Legal Metrology Officer' : role === 'gatc' ? 'GATC Staff' : role}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Navigation
            </div>
            {currentLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Public Portal Shortcut & Statutory Act Note */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <a
            href="/verify/IND-LM-2025-0482"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Verify Portal</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <div className="px-2 text-[10px] text-slate-500 text-center">
            Legal Metrology Act, 2009 • Section 24
          </div>
        </div>
      </aside>
    </>
  );
};
