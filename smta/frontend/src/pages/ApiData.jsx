import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, Database, Clock, Loader2, Download } from "lucide-react";
import { Topbar } from "../components/Topbar.jsx";
import { ErrorState } from "../components/EmptyState.jsx";
import { useApi } from "../hooks/useApi.js";
import { endpoints } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";

export default function ApiData() {
  const { data, error, loading, refresh } = useApi(() => endpoints.status(), [], { autoRefreshMs: 15000 });
  const [fetching, setFetching] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const push = useToast();

  async function handleFetch() {
    setFetching(true);
    const { data, error } = await endpoints.fetchNewData();
    setFetching(false);
    if (error) {
      push(error, "error");
      return;
    }
    setLastResult(data);
    push(`Fetched ${data.new_posts} new post${data.new_posts === 1 ? "" : "s"}.`, "success");
    refresh();
  }

  if (error && !data) {
    return (
      <div>
        <Topbar title="API Data" subtitle="Monitor the connection to the social media data source." />
        <div className="card"><ErrorState message={error} onRetry={refresh} /></div>
      </div>
    );
  }

  const connected = data?.connected;
  const isLive = data?.mode === "live";

  return (
    <div>
      <Topbar title="API Data" subtitle="Monitor the connection to the social media data source." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            {connected ? <Wifi size={16} className="text-positive" /> : <WifiOff size={16} className="text-negative" />}
            <span className="text-xs text-ink-faint">API Status</span>
          </div>
          <p className={`text-lg font-display font-semibold ${connected ? "text-positive" : "text-negative"}`}>
            {connected ? "Connected" : "Disconnected"}
          </p>
          <p className="text-xs text-ink-faint mt-1">
            Mode: <span className={isLive ? "text-positive" : "text-neutral"}>{isLive ? "Live API" : "Demo dataset"}</span>
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-accent-cyan" />
            <span className="text-xs text-ink-faint">Last Successful Request</span>
          </div>
          <p className="text-lg font-display font-semibold text-ink">
            {data?.last_successful_request ? new Date(data.last_successful_request).toLocaleTimeString() : "—"}
          </p>
          <p className="text-xs text-ink-faint mt-1">
            {data?.last_successful_request ? new Date(data.last_successful_request).toLocaleDateString() : "No requests yet"}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-accent-indigo" />
            <span className="text-xs text-ink-faint">Records Collected</span>
          </div>
          <p className="text-lg font-display font-semibold tabular text-ink">{(data?.records_collected || 0).toLocaleString()}</p>
          <p className="text-xs text-ink-faint mt-1">Total posts currently in memory</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-ink mb-1">Fetch New Data</h3>
            <p className="text-xs text-ink-faint max-w-md">
              Triggers a new collection request. With no API credentials configured in the backend's
              <code className="mx-1 px-1.5 py-0.5 rounded bg-surface-hover text-accent-cyan">.env</code>
              file, this pulls a fresh batch of clearly-labeled demo data instead.
            </p>
          </div>
          <button
            onClick={handleFetch}
            disabled={fetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-indigo to-accent-violet text-white text-sm font-medium disabled:opacity-60 shrink-0"
          >
            {fetching ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {fetching ? "Fetching..." : "Fetch New Data"}
          </button>
        </div>

        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 pt-5 border-t border-surface-border grid grid-cols-3 gap-3 text-center"
          >
            <Result label="Status" value={lastResult.status} />
            <Result label="New Posts" value={lastResult.new_posts} />
            <Result label="Total Posts" value={lastResult.total_posts} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Result({ label, value }) {
  return (
    <div className="bg-surface-hover rounded-lg py-3">
      <p className="text-base font-medium tabular text-ink capitalize">{value}</p>
      <p className="text-[10px] text-ink-faint mt-0.5">{label}</p>
    </div>
  );
}
