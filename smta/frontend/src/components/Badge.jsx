import React from "react";

const SENTIMENT_STYLES = {
  positive: "bg-positive/10 text-positive border-positive/30",
  negative: "bg-negative/10 text-negative border-negative/30",
  neutral: "bg-neutral/10 text-neutral border-neutral/30",
};

export function SentimentBadge({ sentiment }) {
  const style = SENTIMENT_STYLES[sentiment] || SENTIMENT_STYLES.neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium capitalize ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {sentiment}
    </span>
  );
}

export function ModeBadge({ mode }) {
  const isLive = mode === "live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
        isLive
          ? "bg-positive/10 text-positive border-positive/30"
          : "bg-neutral/10 text-neutral border-neutral/30"
      }`}
      title={isLive ? "Live data from a connected social API" : "Demo/mock data — no live API credentials configured"}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${isLive ? "animate-pulseDot" : ""}`} />
      {isLive ? "Live Data" : "Demo Data"}
    </span>
  );
}
