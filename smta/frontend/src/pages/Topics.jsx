import React from "react";
import { motion } from "framer-motion";
import { Topbar } from "../components/Topbar.jsx";
import { SentimentBadge } from "../components/Badge.jsx";
import { ExternalLink } from "lucide-react";
import { ChartSkeleton } from "../components/Skeleton.jsx";
import { EmptyState, ErrorState } from "../components/EmptyState.jsx";
import { useApi } from "../hooks/useApi.js";
import { endpoints } from "../services/api.js";

export default function Topics() {
  const { data, error, loading, lastFetched, refresh } = useApi(() => endpoints.topics(), []);
  const clusters = data?.clusters || [];

  return (
    <div>
      <Topbar
        title="Topic Analysis"
        subtitle="K-Means clustering over TF-IDF vectors reveals groups of similar posts."
        mode={data?.mode}
        lastUpdated={lastFetched}
        onRefresh={refresh}
        refreshing={loading}
      />

      {error && !data && <div className="card"><ErrorState message={error} onRetry={refresh} /></div>}

      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <ChartSkeleton key={i} height="h-40" />)}
        </div>
      )}

      {data && clusters.length === 0 && (
        <div className="card"><EmptyState title="No clusters detected" description="Collect more posts to detect meaningful topic clusters." /></div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {clusters.map((c, i) => (
          <motion.div
            key={c.cluster}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-ink-faint">Cluster {c.cluster + 1}</span>
              <SentimentBadge sentiment={c.dominant_sentiment} />
            </div>
            <h3 className="font-display font-semibold text-ink mb-3">{c.label}</h3>

            <p className="text-xs text-ink-faint mb-1.5">Keywords</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {c.keywords.length ? (
                c.keywords.map((k) => (
                  <span key={k} className="text-xs px-2 py-1 rounded-full bg-surface-hover border border-surface-border text-ink-muted">
                    {k}
                  </span>
                ))
              ) : (
                <span className="text-xs text-ink-faint">No distinctive keywords</span>
              )}
            </div>

            {c.sample_posts?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-ink-faint mb-1.5">Top posts — click to open on {c.label ? "social media" : "social media"}</p>
                <ul className="space-y-1.5">
                  {c.sample_posts.map((p) => (
                    <li key={p.id}>
                      <a
                        href={p.url || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => !p.url && e.preventDefault()}
                        className={`group flex items-start gap-2 text-xs rounded-lg px-2.5 py-2 bg-surface-hover border border-surface-border transition-colors ${
                          p.url ? "hover:border-accent/50 cursor-pointer" : "opacity-70 cursor-default"
                        }`}
                      >
                        <ExternalLink size={12} className="mt-0.5 shrink-0 text-ink-faint group-hover:text-accent" />
                        <span className="min-w-0">
                          <span className="block text-ink-muted group-hover:text-ink line-clamp-2">{p.text}</span>
                          <span className="block text-[10px] text-ink-faint mt-0.5">
                            {p.platform} · {p.author} · engagement {p.engagement.toLocaleString()}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-surface-border">
              <div>
                <p className="text-[10px] text-ink-faint">Posts</p>
                <p className="text-sm font-medium tabular text-ink">{c.posts.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-ink-faint">Engagement</p>
                <p className="text-sm font-medium tabular text-ink">{c.engagement.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
