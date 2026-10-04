import React from "react";
import { FileText, Activity, Layers, Smile, Frown, Meh } from "lucide-react";
import { Topbar } from "../components/Topbar.jsx";
import { KPICard } from "../components/KPICard.jsx";
import { ChartSkeleton, KPISkeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/EmptyState.jsx";
import { EngagementLineChart } from "../charts/EngagementLineChart.jsx";
import { SentimentDonut } from "../charts/SentimentDonut.jsx";
import { HashtagBarChart } from "../charts/HashtagBarChart.jsx";
import { PlatformBarChart } from "../charts/PlatformBarChart.jsx";
import { useApi } from "../hooks/useApi.js";
import { endpoints } from "../services/api.js";

export default function Dashboard() {
  const { data, error, loading, lastFetched, refresh } = useApi(
    () => endpoints.dashboard(),
    [],
    { autoRefreshMs: 30000 }
  );

  if (error && !data) {
    return (
      <div>
        <Topbar title="Social Media Trend Analysis" subtitle="Real-time insights from social media data using NLP and Machine Learning." />
        <div className="card"><ErrorState message={error} onRetry={refresh} /></div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div>
      <Topbar
        title="Social Media Trend Analysis"
        subtitle="Real-time insights from social media data using NLP and Machine Learning."
        mode={data?.mode}
        lastUpdated={lastFetched}
        onRefresh={refresh}
        refreshing={loading}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {loading && !data
          ? Array.from({ length: 6 }).map((_, i) => <KPISkeleton key={i} />)
          : [
              { label: "Total Posts", value: kpis?.total_posts, icon: FileText, accent: "indigo", index: 0 },
              { label: "Total Engagement", value: kpis?.total_engagement, icon: Activity, accent: "cyan", index: 1 },
              { label: "Trending Topics", value: kpis?.trending_topics, icon: Layers, accent: "indigo", index: 2 },
              { label: "Positive Sentiment", value: kpis?.positive_sentiment_pct, unit: "pct", icon: Smile, accent: "positive", index: 3 },
              { label: "Negative Sentiment", value: kpis?.negative_sentiment_pct, unit: "pct", icon: Frown, accent: "negative", index: 4 },
              { label: "Neutral Sentiment", value: kpis?.neutral_sentiment_pct, unit: "pct", icon: Meh, accent: "neutral", index: 5 },
            ].map((k) => <KPICard key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="xl:col-span-2 card p-5">
          <h3 className="text-sm font-medium text-ink mb-1">Engagement Over Time</h3>
          <p className="text-xs text-ink-faint mb-3">Likes, comments and shares across the collected posts</p>
          {loading && !data ? <ChartSkeleton /> : <EngagementLineChart data={data?.engagement_over_time || []} />}
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-medium text-ink mb-1">Sentiment Distribution</h3>
          <p className="text-xs text-ink-faint mb-3">Across all analyzed posts</p>
          {loading && !data ? <ChartSkeleton /> : <SentimentDonut breakdown={data?.sentiment_breakdown} />}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-ink mb-1">Top Trending Hashtags</h3>
          <p className="text-xs text-ink-faint mb-3">Ranked by number of posts</p>
          {loading && !data ? <ChartSkeleton /> : <HashtagBarChart data={data?.top_hashtags || []} />}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-ink mb-3">Trending Topics</h3>
          {loading && !data ? (
            <ChartSkeleton height="h-56" />
          ) : (
            <div className="space-y-1">
              {(data?.trending_topics || []).map((t) => (
                <div key={t.hashtag} className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-ink-faint w-4 shrink-0">{t.rank}</span>
                    <span className="text-sm text-ink truncate">{t.hashtag}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-ink-muted tabular">{t.posts.toLocaleString()} posts</span>
                    <span className={`text-xs font-medium tabular ${t.trend_pct >= 0 ? "text-positive" : "text-negative"}`}>
                      {t.trend_pct >= 0 ? "+" : ""}
                      {t.trend_pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-ink mb-1">Platform Distribution</h3>
          <p className="text-xs text-ink-faint mb-3">Posts collected per platform</p>
          {loading && !data ? <ChartSkeleton height="h-52" /> : <PlatformBarChart data={data?.platform_distribution || []} />}
        </div>
      </div>
    </div>
  );
}
