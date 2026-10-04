import React from "react";
import { RefreshCw } from "lucide-react";
import { ModeBadge } from "./Badge.jsx";

export function Topbar({ title, subtitle, mode, lastUpdated, onRefresh, refreshing }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 pl-12 md:pl-0">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl md:text-2xl font-display font-semibold text-ink">{title}</h1>
          {mode && <ModeBadge mode={mode} />}
        </div>
        {subtitle && <p className="text-ink-muted text-sm mt-1 max-w-xl">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-ink-faint tabular hidden sm:block">
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-surface-border text-sm text-ink hover:border-accent-indigo/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
