// components/HowItWorks.js
import React from "react";

const steps = [
  { title: "Sign up", description: "Create your profile and choose your role (interviewee/interviewer)." },
  { title: "Schedule", description: "Pick your practice slot or take on-demand interviews." },
  { title: "Review", description: "Get instant feedback and personalized improvement tips." },
];

const HowItWorks = () => (
  <div className="py-12 px-6 md:px-16 mt-12 bg-white">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="shadow-md rounded-xl p-6 border hover:border-blue-400 transition">
            <h3 className="text-xl font-semibold text-purple-600 mb-2">{step.title}</h3>
            <p className="text-black">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default HowItWorks;
