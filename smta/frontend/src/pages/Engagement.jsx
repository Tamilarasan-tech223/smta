import React, { useState } from "react";
import { Topbar } from "../components/Topbar.jsx";
import { SentimentBadge } from "../components/Badge.jsx";
import { ChartSkeleton } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/EmptyState.jsx";
import { EngagementScatter } from "../charts/EngagementScatter.jsx";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useApi } from "../hooks/useApi.js";
import { endpoints } from "../services/api.js";

export default function Engagement() {
  const { data, error, loading, lastFetched, refresh } = useApi(() => endpoints.engagement(10), []);
  const [topicFilter, setTopicFilter] = useState("All");

  if (error && !data) {
    return (
      <div>
        <Topbar title="Engagement Analysis" subtitle="Which posts and days perform best." />
        <div className="card"><ErrorState message={error} onRetry={refresh} /></div>
      </div>
    );
  }

  const topPosts = data?.top_posts || [];
  const topics = ["All", ...new Set(topPosts.map((p) => p.topic))];
  const filteredPosts = topicFilter === "All" ? topPosts : topPosts.filter((p) => p.topic === topicFilter);
  const avgEngagement = topPosts.length
    ? Math.round(topPosts.reduce((sum, p) => sum + p.engagement, 0) / topPosts.length)
    : 0;

  return (
    <div>
      <Topbar
        title="Engagement Analysis"
        subtitle="Which posts, days and topics receive the most engagement."
        mode={data?.mode}
        lastUpdated={lastFetched}
        onRefresh={refresh}
        refreshing={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-ink mb-1">Likes vs. Comments</h3>
          <p className="text-xs text-ink-faint mb-3">Each point is a post, colored by predicted sentiment</p>
          {loading && !data ? <ChartSkeleton /> : <EngagementScatter points={data?.scatter || []} />}
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-medium text-ink mb-1">Average Engagement by Day</h3>
          <p className="text-xs text-ink-faint mb-3">Average likes + comments + shares per post</p>
          {loading && !data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.by_weekday || []} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#1D2440" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#8B92B0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8B92B0", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#12172A", border: "1px solid #232A42", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="avg_engagement" name="Avg. Engagement" radius={[6, 6, 0, 0]} fill="#33D6E8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-medium text-ink">Top Performing Posts</h3>
            <p className="text-xs text-ink-faint">Average engagement across shown posts: {avgEngagement.toLocaleString()}</p>
          </div>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="bg-surface-hover border border-surface-border rounded-lg px-2.5 py-2 text-sm text-ink outline-none focus:border-accent-indigo/50"
          >
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-faint text-xs border-b border-surface-border">
                <th className="font-medium py-2 px-1">Post</th>
                <th className="font-medium py-2 px-1">Topic</th>
                <th className="font-medium py-2 px-1">Sentiment</th>
                <th className="font-medium py-2 px-1 text-right">Likes</th>
                <th className="font-medium py-2 px-1 text-right">Comments</th>
                <th className="font-medium py-2 px-1 text-right">Shares</th>
                <th className="font-medium py-2 px-1 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((p) => (
                <tr key={p.id} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover">
                  <td className="py-2.5 px-1 max-w-[280px] truncate text-ink">{p.text}</td>
                  <td className="py-2.5 px-1 text-ink-muted whitespace-nowrap">{p.topic}</td>
                  <td className="py-2.5 px-1"><SentimentBadge sentiment={p.sentiment} /></td>
                  <td className="py-2.5 px-1 text-right tabular text-ink-muted">{p.likes.toLocaleString()}</td>
                  <td className="py-2.5 px-1 text-right tabular text-ink-muted">{p.comments.toLocaleString()}</td>
                  <td className="py-2.5 px-1 text-right tabular text-ink-muted">{p.shares.toLocaleString()}</td>
                  <td className="py-2.5 px-1 text-right tabular font-medium text-ink">{p.engagement.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
