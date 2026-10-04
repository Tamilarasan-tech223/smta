import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

const BAR_COLORS = ["#6C6CF5", "#7C74F6", "#8B7DF6", "#9B87F7", "#AA91F8", "#B99BF9", "#C8A5FA", "#33D6E8"];

export function HashtagBarChart({ data }) {
  const sorted = [...(data || [])].sort((a, b) => b.posts - a.posts);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="#1D2440" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#8B92B0", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="hashtag"
          tick={{ fill: "#E7E9F5", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={{ background: "#12172A", border: "1px solid #232A42", borderRadius: 10, fontSize: 12 }}
          cursor={{ fill: "rgba(108,108,245,0.06)" }}
        />
        <Bar dataKey="posts" name="Posts" radius={[0, 6, 6, 0]}>
          {sorted.map((entry, i) => (
            <Cell key={entry.hashtag} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
