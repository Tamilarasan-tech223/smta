import React from "react";

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function KPISkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-72" }) {
  return (
    <div className="card p-5">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className={`${height} w-full`} />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
