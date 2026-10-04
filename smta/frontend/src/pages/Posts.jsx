import React, { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Topbar } from "../components/Topbar.jsx";
import { SentimentBadge } from "../components/Badge.jsx";
import { EmptyState, ErrorState } from "../components/EmptyState.jsx";
import { RowSkeleton } from "../components/Skeleton.jsx";
import { useApi } from "../hooks/useApi.js";
import { endpoints } from "../services/api.js";

const COLUMNS = [
  { key: "text", label: "Post" },
  { key: "created_at", label: "Date" },
  { key: "hashtags", label: "Hashtags" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "engagement", label: "Engagement" },
  { key: "sentiment", label: "Sentiment" },
  { key: "topic", label: "Topic" },
];

export default function Posts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, sentiment]);

  const { data, error, loading, refresh } = useApi(
    () => endpoints.posts({ search: debouncedSearch, sentiment, sort_by: sortBy, sort_dir: sortDir, page, page_size: pageSize }),
    [debouncedSearch, sentiment, sortBy, sortDir, page]
  );

  const rows = data?.results || [];
  const totalPages = data?.total_pages || 1;

  function toggleSort(key) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  return (
    <div>
      <Topbar title="Posts" subtitle="Search, sort and filter every collected post." mode={data?.mode} />

      <div className="card p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts or hashtags..."
            className="w-full bg-surface-hover border border-surface-border rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-accent-indigo/50"
          />
        </div>
        <select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
          className="bg-surface-hover border border-surface-border rounded-lg px-2.5 py-2 text-sm text-ink outline-none focus:border-accent-indigo/50 capitalize"
        >
          <option value="">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>
      </div>

      {error && <div className="card"><ErrorState message={error} onRetry={refresh} /></div>}

      {!error && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-ink-faint text-xs border-b border-surface-border bg-surface-hover/40">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className="font-medium py-3 px-3 cursor-pointer select-none whitespace-nowrap hover:text-ink"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortBy === col.key && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={COLUMNS.length}><RowSkeleton /></td></tr>
                  ))}
                {!loading &&
                  rows.map((p) => (
                    <tr key={p.id} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-hover">
                      <td className="py-2.5 px-3 max-w-[260px] truncate text-ink">{p.text}</td>
                      <td className="py-2.5 px-3 text-ink-muted whitespace-nowrap">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 text-accent-indigo whitespace-nowrap">{p.hashtags.slice(0, 2).join(" ")}</td>
                      <td className="py-2.5 px-3 tabular text-ink-muted">{p.likes.toLocaleString()}</td>
                      <td className="py-2.5 px-3 tabular text-ink-muted">{p.comments.toLocaleString()}</td>
                      <td className="py-2.5 px-3 tabular text-ink-muted">{p.shares.toLocaleString()}</td>
                      <td className="py-2.5 px-3 tabular font-medium text-ink">{p.engagement.toLocaleString()}</td>
                      <td className="py-2.5 px-3"><SentimentBadge sentiment={p.sentiment} /></td>
                      <td className="py-2.5 px-3 text-ink-muted whitespace-nowrap">{p.topic}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!loading && rows.length === 0 && <EmptyState title="No posts found" description="Try a different search term or filter." />}

          {!loading && rows.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
              <span className="text-xs text-ink-faint">
                Page {data?.page || 1} of {totalPages} &middot; {data?.total || 0} posts
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-md border border-surface-border disabled:opacity-30 hover:border-accent-indigo/50"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-md border border-surface-border disabled:opacity-30 hover:border-accent-indigo/50"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
