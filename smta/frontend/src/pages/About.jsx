import React from "react";
import { Topbar } from "../components/Topbar.jsx";

const TECHS = [
  "React", "Tailwind CSS", "FastAPI", "Python",
  "Pandas", "Scikit-learn", "TF-IDF", "Logistic Regression", "K-Means",
];

export default function About() {
  return (
    <div>
      <Topbar title="About This Project" subtitle="Social Media Trend Analysis Using API, NLP and Machine Learning." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-ink mb-2">Problem</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            Social media generates huge amounts of data, making it difficult to manually identify
            trends, sentiment, and engagement patterns.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-semibold text-ink mb-2">Solution</h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            The system collects social media data through APIs and applies NLP and Machine Learning
            to identify trends, classify sentiment, and analyze engagement.
          </p>
        </div>
      </div>

      <div className="card p-6 mb-5">
        <h3 className="font-display font-semibold text-ink mb-4">Technologies Used</h3>
        <div className="flex flex-wrap gap-2">
          {TECHS.map((t) => (
            <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-surface-hover border border-surface-border text-ink-muted">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Pipeline
          title="Sentiment Pipeline"
          steps={["API Data", "Preprocessing", "TF-IDF", "Logistic Regression", "Sentiment"]}
        />
        <Pipeline
          title="Topic / Trend Pipeline"
          steps={["API Data", "Preprocessing", "TF-IDF", "K-Means", "Topic / Trend Detection"]}
        />
      </div>
    </div>
  );
}

function Pipeline({ title, steps }) {
  return (
    <div className="card p-6">
      <h3 className="font-display font-semibold text-ink mb-4">{title}</h3>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <span className="text-xs px-3 py-1.5 rounded-lg bg-accent-indigo/10 text-accent-indigo whitespace-nowrap">
              {step}
            </span>
            {i < steps.length - 1 && <span className="text-ink-faint">&rarr;</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
