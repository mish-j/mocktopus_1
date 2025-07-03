import React from "react";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import i1 from '../assets/i1.jpg'
import img from "../assets/img1.jpg";
const Practice = () => {
  return (
    <div   style={{ backgroundImage: `url(${img})` }} className="bg-cover bg-center font-sans text-gray-900 bagrounbd">

      {/* Hero Section */}
      <section className="bg-white py-16 px-8 flex flex-col md:flex-row items-center justify-between">
        {/* Left Side */}
        <div className="max-w-xl">
           
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Practice mock interviews with peers and AI
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Join thousands of tech candidates practicing interviews to land jobs.
            Practice real questions over video chat in a collaborative environment with helpful AI feedback.
          </p>
          <div className="flex gap-4">
            <Link to="/Signup" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold">
              Start practicing for free
            </Link>
            {/* <button className="text-indigo-600 font-medium underline">
              See how it works
            </button> */}
          </div>
        </div>

        {/* Right Side (Image placeholder) */}
        <div className="mt-10 md:mt-0 md:w-1/2">
          <img src={i1} alt="Interview Mockup" className="rounded-xl shadow-lg" />
        </div>
      </section>

      {/* Topics Grid */}
      <section className="bg-gray-100 py-10 px-8">
        <div className="flex flex-wrap gap-4 justify-center">
          {[
            "Product Management",
            "Data Structures & Algorithms",
            "Behavioral",
            "System Design",
            "Data Science",
            "SQL",
            "Data Analytics",
            "Machine Learning",
            "BizOps & Strategy",
          ].map((topic, i) => (
            <span
              key={i}
className="bg-white text-purple-600 hover:bg-purple-500 hover:text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:shadow-lg transition"
            >
              {topic}
            </span>
          ))}
        </div>
      </section>

      {/* "How everyone in tech prepares" Section */}
      <section className="py-16 px-8 text-center">
        <p className="text-sm text-indigo-600 font-semibold mb-2">Who's using it</p>
        <h2 className="text-3xl font-bold mb-4">How everyone in tech prepares</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Exponent Practice supports interview prep for everyone in tech. From product management to
          software engineering and data roles, there are thousands of practice questions to choose from.
        </p>
      </section>

      {/* Reuse components */}
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Practice;
