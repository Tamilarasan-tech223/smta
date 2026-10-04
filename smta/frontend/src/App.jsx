import React from "react";
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LiveTrends from "./pages/LiveTrends.jsx";
import SentimentAnalysis from "./pages/SentimentAnalysis.jsx";
import Topics from "./pages/Topics.jsx";
import Engagement from "./pages/Engagement.jsx";
import Posts from "./pages/Posts.jsx";
import ApiData from "./pages/ApiData.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 md:p-8 pt-16 md:pt-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live-trends" element={<LiveTrends />} />
          <Route path="/sentiment" element={<SentimentAnalysis />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/engagement" element={<Engagement />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/api-data" element={<ApiData />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
