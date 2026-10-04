import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "../components/Topbar.jsx";
import { SentimentBadge } from "../components/Badge.jsx";
import { EmptyState, ErrorState } from "../components/EmptyState.jsx";
import { ChartSkeleton } from "../components/Skeleton.jsx";
import { Sparkline } from "../charts/Sparkline.jsx";
import { useApi } from "../hooks/useApi.js";
import { endpoints } from "../services/api.js";

const TIME_OPTIONS = ["All time", "Last 24h", "Last 7d"];
const SENTIMENT_OPTIONS = ["All", "positive", "negative", "neutral"];
const ENGAGEMENT_OPTIONS = ["All", "High engagement", "Low engagement"];

export default function LiveTrends() {
  const { data, error, loading, lastFetched, refresh } = useApi(() => endpoints.trends(20), [], { autoRefreshMs: 30000 });
  const [timeFilter, setTimeFilter] = useState(TIME_OPTIONS[0]);
  const [sentimentFilter, setSentimentFilter] = useState(SENTIMENT_OPTIONS[0]);
  const [engagementFilter, setEngagementFilter] = useState(ENGAGEMENT_OPTIONS[0]);
  const [topicQuery, setTopicQuery] = useState("");

  const trends = data?.trends || [];
  const medianEngagement = useMemo(() => {
    const sorted = [...trends].map((t) => t.engagement).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] || 0;
  }, [trends]);

  const filtered = trends.filter((t) => {
    if (sentimentFilter !== "All" && t.sentiment !== sentimentFilter) return false;
    if (topicQuery && !t.hashtag.toLowerCase().includes(topicQuery.toLowerCase())) return false;
    if (engagementFilter === "High engagement" && t.engagement < medianEngagement) return false;
    if (engagementFilter === "Low engagement" && t.engagement >= medianEngagement) return false;
    // "timeFilter" is illustrative here since the demo dataset is generated
    // over a fixed 14-day window; wired to a real date range once a live
    // API with true timestamps is connected.
    return true;
  });

  return (
    <div>
      <Topbar
        title="Live Trends"
        subtitle="Currently detected trending hashtags and topics."
        mode={data?.mode}
        lastUpdated={lastFetched}
        onRefresh={refresh}
        refreshing={loading}
      />

      <div className="card p-4 mb-5 flex flex-wrap items-center gap-3">
        <input
          value={topicQuery}
          onChange={(e) => setTopicQuery(e.target.value)}
          placeholder="Filter by topic or hashtag..."
          className="bg-surface-hover border border-surface-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent-indigo/50 flex-1 min-w-[180px]"
        />
        <FilterSelect label="Time" value={timeFilter} options={TIME_OPTIONS} onChange={setTimeFilter} />
        <FilterSelect label="Sentiment" value={sentimentFilter} options={SENTIMENT_OPTIONS} onChange={setSentimentFilter} />
        <FilterSelect label="Engagement" value={engagementFilter} options={ENGAGEMENT_OPTIONS} onChange={setEngagementFilter} />
      </div>

      {error && !data && <div className="card"><ErrorState message={error} onRetry={refresh} /></div>}

      {loading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ChartSkeleton key={i} height="h-24" />)}
        </div>
      )}

      {data && filtered.length === 0 && (
        <div className="card"><EmptyState title="No trends match your filters" description="Try clearing a filter or broadening your search." /></div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, i) => (
          <motion.div
            key={t.hashtag}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-surface-hover border border-surface-border flex items-center justify-center text-xs text-ink-muted">
                  {t.rank}
                </span>
                <span className="font-display font-semibold text-ink">{t.hashtag}</span>
              </div>
              <SentimentBadge sentiment={t.sentiment} />
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-ink-muted">{t.posts.toLocaleString()} posts</span>
              <span className={`text-sm font-medium ${t.trend_pct >= 0 ? "text-positive" : "text-negative"}`}>
                {t.trend_pct >= 0 ? "+" : ""}
                {t.trend_pct}%
              </span>
            </div>
            <Sparkline values={t.sparkline} sentiment={t.sentiment} />
            <p className="text-xs text-ink-faint mt-1">{t.engagement.toLocaleString()} total engagement</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-faint hidden sm:block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-hover border border-surface-border rounded-lg px-2.5 py-2 text-sm text-ink outline-none focus:border-accent-indigo/50 capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
