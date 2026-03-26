"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AvoraLogo } from "@/components/ui/AvoraLogo";
import {
  LayoutDashboard, Target, Map, Trophy, Send, Search, Package, BarChart3, Users2,
  TrendingUp, ChevronRight, ChevronLeft, LogOut, Menu, X, Bell, Settings, Shield, MessageSquare, HelpCircle
} from "lucide-react";

interface SidebarProps {
  user: {
    name: string | null;
    email: string;
    plan: string;
    isAdmin: boolean;
    sessionType?: string;
    teamRole?: string;
  };
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  visibleTabIds: string[];
}

const TAB_META: Record<string, { label: string; icon: typeof LayoutDashboard }> = {
  icp:       { label: "ICP",               icon: Target },
  dmu:       { label: "DMU Map",           icon: Map },
  abm:       { label: "ABM Strategy",     icon: Trophy },
  outreach:  { label: "Outreach",         icon: Send },
  lookalike: { label: "Lookalike",        icon: Search },
  leads:     { label: "Request Leads",    icon: Package },
  progress:  { label: "Progress",         icon: TrendingUp },
  crm:       { label: "My CRM",           icon: BarChart3 },
  team:      { label: "Team",             icon: Users2 },
};

export function Sidebar({ user, onLogout, activeTab, onTabChange, visibleTabIds }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = visibleTabIds
    .filter((id) => TAB_META[id])
    .map((id) => ({ id, ...TAB_META[id] }));

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
        style={{ background: "#061a1a" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/8">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AvoraLogo variant="light" height={28} />
              </motion.div>
            ) : (
              <motion.div key="mini" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto">
                <div className="w-9 h-9 rounded-lg bg-[#1A6B6B] flex items-center justify-center text-white font-extrabold text-sm">A</div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/40 hover:text-[#2DD4BF] transition-colors p-1"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative group ${
                    isActive
                      ? "bg-[#1A6B6B]/25 text-[#2DD4BF]"
                      : "text-white/50 hover:bg-white/5 hover:text-white/90"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#2DD4BF] rounded-l-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-3 bg-[#0d2626] text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Extra links */}
          <div className="mt-6 px-3 pt-4 border-t border-white/8 space-y-1">
            {user.isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white/90 transition-all">
                <Shield size={20} className="flex-shrink-0" />
                {!collapsed && <span>Admin Panel</span>}
              </Link>
            )}
            <Link href="/contact" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white/90 transition-all">
              <HelpCircle size={20} className="flex-shrink-0" />
              {!collapsed && <span>Contact Us</span>}
            </Link>
            <Link href="/onboarding" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white/90 transition-all">
              <Settings size={20} className="flex-shrink-0" />
              {!collapsed && <span>Edit Onboarding</span>}
            </Link>
          </div>
        </nav>

        {/* User card at bottom */}
        <div className="border-t border-white/8 p-3">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-[#1A6B6B]/40 flex items-center justify-center text-[#2DD4BF] font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name || user.email}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  user.plan === "PLUS" ? "bg-[#2DD4BF]/15 text-[#2DD4BF]" : "bg-white/10 text-white/60"
                }`}>
                  {user.plan || "LITE"}
                </span>
              </div>
            )}
            {!collapsed && (
              <button onClick={onLogout} className="text-white/40 hover:text-red-400 transition p-1" title="Sign Out">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10" style={{ background: "#061a1a" }}>
        <div className="flex items-center justify-around py-2 safe-area-inset-bottom">
          {navItems.slice(0, 4).map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => onTabChange(item.id)} className="flex flex-col items-center gap-0.5">
                <div className={`p-1.5 rounded-xl transition ${isActive ? "text-[#2DD4BF] bg-[#1A6B6B]/25" : "text-white/40"}`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] ${isActive ? "text-[#2DD4BF]" : "text-white/40"}`}>{item.label}</span>
              </button>
            );
          })}
          <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-0.5">
            <div className="p-1.5 text-white/40"><Menu size={20} /></div>
            <span className="text-[10px] text-white/40">More</span>
          </button>
        </div>
      </div>

      {/* ── Mobile slide-out drawer ───────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col"
              style={{ background: "#061a1a" }}
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-white/8">
                <AvoraLogo variant="light" height={28} />
                <button onClick={() => setMobileOpen(false)} className="text-white/40"><X size={20} /></button>
              </div>
              <nav className="flex-1 py-4 overflow-y-auto">
                <div className="space-y-1 px-3">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button key={item.id} onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                          isActive ? "bg-[#1A6B6B]/25 text-[#2DD4BF]" : "text-white/50 hover:bg-white/5 hover:text-white/90"
                        }`}>
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
              <div className="border-t border-white/8 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A6B6B]/40 flex items-center justify-center text-[#2DD4BF] font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{user.name || user.email}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.plan === "PLUS" ? "bg-[#2DD4BF]/15 text-[#2DD4BF]" : "bg-white/10 text-white/60"
                    }`}>{user.plan}</span>
                  </div>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 text-sm text-white/40 hover:text-red-400 transition">
                  <LogOut size={16} /><span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
