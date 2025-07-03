import React from "react";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

const Pricing = () => {
  const features = [
    { feature: "Access to limited courses", free: true, premium: true },
    { feature: "Mock interview samples", free: false, premium: true },
    { feature: "Private community access", free: false, premium: true },
    { feature: "AI Interview Assistant", free: false, premium: true },
    { feature: "Interview feedback", free: false, premium: true },
    { feature: "Video answers library", free: false, premium: true },
  ];

  return (
    <>
      <div className="px-8 py-8 pt-10">
        <h1 className="text-center font-extrabold text-4xl">
          Unlock the full member experience
        </h1>
        <h2 className="text-center pt-2 font-light text-gray-500">
          Get access to all courses, video answers, peer mock interviews, private community, AI features, and more.
        </h2>
      </div>

      <div className="flex flex-row justify-center space-x-6 px-6">
        {/* Free Plan */}
        <div className="flex flex-col border border-gray-300 px-6 py-6 rounded-xl w-1/4 hover:border-purple-900 hover:bg-indigo-50">
          <h1 className="text-center font-extrabold text-2xl text-black mb-2">Free</h1>
          <p className="text-center text-gray-600 mb-4">Get a taste of what Exponent has to offer</p>
          <h2 className="text-center text-3xl font-bold">$0<span className="text-lg font-medium">/month</span></h2>
          <ul className="mt-4 text-sm text-gray-700 list-disc pl-6 space-y-1">
            {features.map((item, idx) =>
              item.free ? (
                <li key={idx}>{item.feature}</li>
              ) : null
            )}
          </ul>
          <button className="mt-auto bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded mt-6">
            Start now
          </button>
        </div>

        {/* Premium Plan */}
        <div className="flex flex-col border border-purple-600 px-6 py-6 rounded-xl w-1/4 hover:border-purple-900 hover:bg-indigo-50">
          <h1 className="text-center font-extrabold text-2xl text-black mb-2">Annual</h1>
          <p className="text-center text-gray-600 mb-2">Access courses, mocks, videos, private community, and AI features</p>
          <div className="text-center mb-2">
            <span className="text-sm line-through text-green-500">$79/month</span>
            <span className="bg-green-100 text-green-700 text-xs font-semibold ml-2 px-2 py-1 rounded-full">
              SAVE 70%
            </span>
          </div>
          <h2 className="text-center text-3xl font-bold">$12<span className="text-lg font-medium">/month</span></h2>
          <ul className="mt-4 text-sm text-gray-700 list-disc pl-6 space-y-1">
            {features.map((item, idx) =>
              item.premium ? (
                <li key={idx}>{item.feature}</li>
              ) : null
            )}
          </ul>
          <button className=" bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded mt-10 my-4">
            Start now
          </button>
        </div>
      </div>

      <Testimonials />
      <Footer />
    </>
  );
};

export default Pricing;
