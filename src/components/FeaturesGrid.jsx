// components/FeaturesGrid.js
import React from "react";

const features = [
  { emoji: "🎤", title: "Live Mock Interviews", desc: "Practice real-time interviews with peers or experts." },
  { emoji: "✍️", title: "Instant Feedback", desc: "Get structured feedback to improve your answers." },
  { emoji: "📈", title: "Performance Tracking", desc: "Track your growth over time with reports and analytics." },
  { emoji: "👨‍🏫", title: "Expert Coaching", desc: "1-on-1 coaching from professionals in tech, product, and more." },
  { emoji: "🧠", title: "AI Questions Generator", desc: "Practice with tailored questions by domain and difficulty." },
];

const FeaturesGrid = () => (
  <section className="py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
        Everything You Need to Succeed in Interviews
      </h2>
      <p className="mt-4 text-lg text-gray-600">
        From AI-powered question generation to expert coaching — we’ve got you covered.
      </p>
    </div>
    <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {features.map((item, idx) => (
        <div key={idx} className="text-center rounded-md py-2 hover:bg-[#F3CD8F]">
          <div className="text-4xl mb-4">{item.emoji}</div>
          <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
          <p className="mt-2 text-gray-600">{item.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesGrid;
