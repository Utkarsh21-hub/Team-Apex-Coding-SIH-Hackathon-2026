import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, ArrowRight, UserPlus, LogIn, Sparkles, Building2, User, Scale, Shield, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, signup, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  // Sign up fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('applicant');
  const [organization, setOrganization] = useState('');
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState('');

  const routeByRole = (userRole: UserRole) => {
    if (userRole === 'applicant') navigate('/applicant/dashboard');
    else if (userRole === 'lmo' || userRole === 'gatc') navigate('/queue');
    else if (userRole === 'admin') navigate('/admin');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const success = await login(email);
      if (success) {
        // Find role of that email
        const target = useAuth;
        // In our auth context login sets user
        navigate('/');
      } else {
        setError('User not found. Please click one of the instant Demo Logins or create an account.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !organization) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      const newProf = await signup({
        name,
        email,
        phone: phone || '+91 98000 00000',
        role,
        organization,
        address: address || 'Regional Business Address',
        designation: designation || (role === 'applicant' ? 'Authorized Representative' : 'Metrologist'),
      });
      routeByRole(newProf.role);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    }
  };

  const handleDemoClick = (role: UserRole) => {
    quickLoginAs(role);
    routeByRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-blue-100">
      {/* Top Header */}
      <header className="bg-slate-900 text-white py-4 px-6 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">VerifyMetro</span>
              <span className="text-xs text-slate-400 block">
                Digital Verification & Certification System • Legal Metrology Act, 2009
              </span>
            </div>
          </div>

          <Link
            to="/verify/IND-LM-2025-0482"
            className="text-xs text-blue-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public Certificate Verification Portal →</span>
          </Link>
        </div>
      </header>

      {/* Main Login / Demo Container */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        {/* Hackathon / Demo 1-Click Persona Bar */}
        <div className="mb-8 bg-blue-900/90 text-white rounded-2xl p-5 border border-blue-800 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-blue-100">
              Demo Quick-Start (1-Click Instant Persona Sign-In)
            </h2>
          </div>
          <p className="text-xs text-blue-200 mb-4">
            Select any official role below to evaluate role-specific dashboards, workflows, and permissions immediately without typing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => handleDemoClick('applicant')}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left border border-white/15 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1">
                <span>1. Applicant (Owner)</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs font-semibold text-white">Ramesh Patel</p>
              <p className="text-[11px] text-blue-200 truncate">Maa Durga Trading (Weighbridge)</p>
            </button>

            <button
              onClick={() => handleDemoClick('lmo')}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left border border-white/15 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                <span>2. Govt Officer (LMO)</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs font-semibold text-white">S. K. Sharma</p>
              <p className="text-[11px] text-blue-200 truncate">Senior Metrology Inspector</p>
            </button>

            <button
              onClick={() => handleDemoClick('gatc')}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left border border-white/15 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-300 mb-1">
                <span>3. GATC Test Lab</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs font-semibold text-white">Dr. Ananya Sen</p>
              <p className="text-[11px] text-blue-200 truncate">National Calibration Test Lab</p>
            </button>

            <button
              onClick={() => handleDemoClick('admin')}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left border border-white/15 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-sky-300 mb-1">
                <span>4. Administrator</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs font-semibold text-white">V. Joshi</p>
              <p className="text-[11px] text-blue-200 truncate">Joint Controller of Metrology</p>
            </button>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="max-w-md mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 text-sm font-semibold">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-3.5 text-center transition-colors ${
                !isSignUp
                  ? 'border-b-2 border-blue-700 text-blue-700 bg-blue-50/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-3.5 text-center transition-colors ${
                isSignUp
                  ? 'border-b-2 border-blue-700 text-blue-700 bg-blue-50/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            {!isSignUp ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh.patel@maadurgatrading.in"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Tip: Use any demo email or click the 1-click buttons above.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Security Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Access Metrology Workspace</span>
                </button>
              </form>
            ) : (
              /* Sign Up Form with Self-Selected Role */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Your Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  >
                    <option value="applicant">Business / Instrument Owner (Applicant)</option>
                    <option value="lmo">Legal Metrology Officer (LMO / Inspector)</option>
                    <option value="gatc">Govt Approved Test Centre (GATC Staff)</option>
                    <option value="admin">System Administrator (State Metrology HQ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Suresh V. Nair"
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@business.com"
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Establishment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder={
                      role === 'applicant'
                        ? 'e.g. Gujarat Petro Trading & Weighbridges'
                        : 'e.g. Legal Metrology Directorate Division'
                    }
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address / Station
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot No., Industrial Area, City"
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Complete Registration</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 border-t border-slate-800 text-xs text-center">
        VerifyMetro • Government of India Legal Metrology Act, 2009 Digital Verification Portal (Hackathon MVP)
      </footer>
    </div>
  );
};
