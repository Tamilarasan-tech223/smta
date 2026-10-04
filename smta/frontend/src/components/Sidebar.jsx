import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Smile,
  Layers,
  Activity,
  Table2,
  Radio,
  Info,
  ChevronsLeft,
  ChevronsRight,
  Waves,
  Menu,
  X,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/live-trends", label: "Live Trends", icon: Radio },
  { to: "/sentiment", label: "Sentiment Analysis", icon: Smile },
  { to: "/topics", label: "Topics", icon: Layers },
  { to: "/engagement", label: "Engagement", icon: Activity },
  { to: "/posts", label: "Posts", icon: Table2 },
  { to: "/api-data", label: "API Data", icon: TrendingUp },
  { to: "/about", label: "About Project", icon: Info },
];

function NavItems({ collapsed, onNavigate }) {
  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-accent-indigo/10 text-ink"
                : "text-ink-muted hover:bg-surface-hover hover:text-ink"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-accent-indigo to-accent-violet" />
              )}
              <Icon size={18} className={isActive ? "text-accent-indigo" : ""} />
              {!collapsed && <span className="truncate">{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 w-10 h-10 rounded-lg bg-surface border border-surface-border flex items-center justify-center text-ink"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-surface/60 backdrop-blur-xl border-r border-surface-border transition-all duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center shrink-0">
            <Waves size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-display font-semibold text-ink truncate">TrendPulse</p>
              <p className="text-[10px] text-ink-faint truncate">Social Analytics</p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <NavItems collapsed={collapsed} />
        </div>

        <div className="mt-auto p-3 border-t border-surface-border">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center shrink-0">
              <User size={15} className="text-ink-muted" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink truncate">Data Science Team</p>
                <p className="text-[10px] text-ink-faint truncate">BTech Project Demo</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-1 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-ink-faint hover:text-ink hover:bg-surface-hover text-xs transition-colors"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] h-full bg-surface border-r border-surface-border flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-surface-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center">
                  <Waves size={16} className="text-white" />
                </div>
                <p className="text-sm font-display font-semibold text-ink">TrendPulse</p>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-ink-muted p-1">
                <X size={18} />
              </button>
            </div>
            <div className="pt-4">
              <NavItems collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
