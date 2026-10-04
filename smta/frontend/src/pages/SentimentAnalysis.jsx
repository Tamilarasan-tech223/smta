import React, { useState } from "react";
import { X } from "lucide-react";
import { Topbar } from "../components/Topbar.jsx";
import { SentimentBadge } from "../components/Badge.jsx";
import { ChartSkeleton, RowSkeleton } from "../components/Skeleton.jsx";
import { EmptyState, ErrorState } from "../components/EmptyState.jsx";
import { SentimentDonut } from "../charts/SentimentDonut.jsx";
import { useApi } from "../hooks/useApi.js";
import { endpoints } from "../services/api.js";

export default function SentimentAnalysis() {
  const { data, error, loading, lastFetched, refresh } = useApi(() => endpoints.sentiment(), []);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const posts = data?.posts || [];
  const filtered = query ? posts.filter((p) => p.post.toLowerCase().includes(query.toLowerCase())) : posts;
  const breakdown = data?.breakdown;
  const overallLabel =
    breakdown && breakdown.positive >= breakdown.negative && breakdown.positive >= breakdown.neutral
      ? "Mostly Positive"
      : breakdown && breakdown.negative >= breakdown.positive && breakdown.negative >= breakdown.neutral
      ? "Mostly Negative"
      : "Mostly Neutral";

  if (error && !data) {
    return (
      <div>
        <Topbar title="Sentiment Analysis" subtitle="TF-IDF + Logistic Regression sentiment classification results." />
        <div className="card"><ErrorState message={error} onRetry={refresh} /></div>
      </div>
    );
  }

  return (
    <div>
      <Topbar
        title="Sentiment Analysis"
        subtitle="TF-IDF + Logistic Regression sentiment classification results."
        mode={data?.mode}
        lastUpdated={lastFetched}
        onRefresh={refresh}
        refreshing={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-5 lg:col-span-1">
          <h3 className="text-sm font-medium text-ink mb-1">Overall Sentiment</h3>
          <p className="text-xs text-ink-faint mb-3">{overallLabel}</p>
          {loading && !data ? <ChartSkeleton /> : <SentimentDonut breakdown={breakdown} />}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Stat label="Positive" value={breakdown?.positive_pct} color="text-positive" />
            <Stat label="Negative" value={breakdown?.negative_pct} color="text-negative" />
            <Stat label="Neutral" value={breakdown?.neutral_pct} color="text-neutral" />
          </div>
        </div>

        <div className="card p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-ink">Posts &amp; Predictions</h3>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent-indigo/50 w-48"
            />
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-faint text-xs border-b border-surface-border">
                  <th className="font-medium py-2 px-1">Post</th>
                  <th className="font-medium py-2 px-1">Sentiment</th>
                  <th className="font-medium py-2 px-1">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {loading && !data &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={3}><RowSkeleton /></td></tr>
                  ))}
                {filtered.slice(0, 60).map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover cursor-pointer"
                  >
                    <td className="py-2.5 px-1 max-w-[380px] truncate text-ink">{p.post}</td>
                    <td className="py-2.5 px-1"><SentimentBadge sentiment={p.sentiment} /></td>
                    <td className="py-2.5 px-1 tabular text-ink-muted">{(p.confidence * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data && filtered.length === 0 && <EmptyState title="No matching posts" description="Try a different search term." />}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelected(null)}>
          <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-ink">Post Detail</h3>
              <button onClick={() => setSelected(null)} className="text-ink-faint hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <p className="text-ink text-sm mb-4 leading-relaxed">{selected.post}</p>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-ink-faint text-xs mb-1">Predicted Sentiment</p>
                <SentimentBadge sentiment={selected.sentiment} />
              </div>
              <div>
                <p className="text-ink-faint text-xs mb-1">Confidence Score</p>
                <p className="text-ink tabular font-medium">{(selected.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div>
              <p className="text-ink-faint text-xs mb-1.5">Extracted Hashtags</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.hashtags.length ? (
                  selected.hashtags.map((h) => (
                    <span key={h} className="text-xs px-2 py-1 rounded-full bg-accent-indigo/10 text-accent-indigo">
                      {h}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-faint">No hashtags found</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="text-center bg-surface-hover rounded-lg py-2">
      <p className={`text-sm font-semibold tabular ${color}`}>{value ?? 0}%</p>
      <p className="text-[10px] text-ink-faint">{label}</p>
    </div>
  );
}
