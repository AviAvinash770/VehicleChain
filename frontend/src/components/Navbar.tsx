import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Car,
  FileCheck2,
  Bell,
  Wallet,
  LogOut,
  Menu,
  X,
  QrCode,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { api } from "../services/api";
import { NotificationItem } from "../types";

export const Navbar: React.FC = () => {
  const { user, logout, updateUserWallet } = useAuth();
  const { account, connectWallet, isConnecting } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Sync wallet address to user account if logged in and wallet connects
  useEffect(() => {
    if (account && user && (!user.walletAddress || user.walletAddress !== account)) {
      updateUserWallet(account).catch(() => {});
    }
  }, [account, user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const getDashboardRoute = () => {
    if (!user) return "/";
    switch (user.role) {
      case "AUTHORITY":
        return "/dashboard/authority";
      case "OWNER":
        return "/dashboard/owner";
      case "BUYER":
        return "/dashboard/buyer";
      case "VERIFIER":
        return "/verify";
      default:
        return "/";
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#070a12]/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
              <Shield className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1 font-sans">
                VEHICLE<span className="text-cyan-400">CHAIN</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block -mt-1">
                Blockchain RTO
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/verify"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith("/verify")
                  ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              Verify Vehicle
            </Link>

            {user && (
              <>
                <Link
                  to={getDashboardRoute()}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith("/dashboard")
                      ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/40"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Dashboard
                </Link>

                {user.role === "AUTHORITY" && (
                  <Link
                    to="/vehicles/register"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname === "/vehicles/register"
                        ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/40"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Car className="w-4 h-4 text-emerald-400" />
                    Register Vehicle
                  </Link>
                )}

                {user.role === "OWNER" && (
                  <Link
                    to="/transfers/initiate"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname === "/transfers/initiate"
                        ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/40"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    Initiate Transfer
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Controls: Wallet & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* MetaMask Wallet Connect Button */}
            {account ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all active:scale-95 hover:border-cyan-500/50"
              >
                <Wallet className="w-4 h-4 text-cyan-400" />
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
              </button>
            )}

            {/* In-App Notifications */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Notifications ({unreadCount} new)
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-cyan-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n._id}
                            className={`p-2 rounded-lg text-xs transition-colors ${
                              n.read ? "bg-slate-950/40 text-slate-400" : "bg-slate-800 text-slate-200 border-l-2 border-cyan-400"
                            }`}
                          >
                            <p className="font-semibold text-white">{n.title}</p>
                            <p className="text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[9px] text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 inline-block mt-0.5">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-lg hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-800/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-glow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {account && (
              <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-cyan-800">
                {account.slice(0, 4)}..{account.slice(-2)}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-[#0a0f1c] border-b border-slate-800">
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Verify Vehicle
          </Link>
          {user ? (
            <>
              <Link
                to={getDashboardRoute()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Dashboard ({user.role})
              </Link>
              {user.role === "AUTHORITY" && (
                <Link
                  to="/vehicles/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:bg-slate-800"
                >
                  Register Vehicle
                </Link>
              )}
              {user.role === "OWNER" && (
                <Link
                  to="/transfers/initiate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-amber-400 hover:bg-slate-800"
                >
                  Initiate Transfer
                </Link>
              )}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 bg-red-950/60 border border-red-800/60 text-red-300 text-xs rounded"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm text-slate-300 bg-slate-800 rounded"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm text-black font-semibold bg-cyan-400 rounded"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
