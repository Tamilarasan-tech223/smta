import React from "react";
import { Inbox, AlertTriangle } from "lucide-react";

export function EmptyState({ title = "Nothing here yet", description = "", icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-xl2 bg-surface-hover border border-surface-border flex items-center justify-center mb-4">
        <Icon size={22} className="text-ink-faint" />
      </div>
      <p className="text-ink font-medium">{title}</p>
      {description && <p className="text-ink-muted text-sm mt-1 max-w-sm">{description}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-xl2 bg-negative/10 border border-negative/30 flex items-center justify-center mb-4">
        <AlertTriangle size={22} className="text-negative" />
      </div>
      <p className="text-ink font-medium">Couldn't load this data</p>
      <p className="text-ink-muted text-sm mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-lg bg-surface-hover border border-surface-border text-sm text-ink hover:border-accent-indigo/50 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
