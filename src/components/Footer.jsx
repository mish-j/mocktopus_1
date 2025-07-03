// components/Footer.js
import React from "react";

const Footer = () => (
<footer className="bg-white mt-10 py-20 px-6 border-t-2 border-grey-500">

    <div className="flex flex-col md:flex-row md:justify-between gap-y-6 text-sm text-gray-700">
      <div className="md:w-1/3">
        <span className="font-bold block mb-2 text-center">About</span>
        <p>
          Mocktopus is an AI-powered interview preparation platform connecting candidates with industry professionals
          for live mock interviews, instant feedback, and coaching.
        </p>
      </div>
      <div className="md:w-1/3">
        <span className="font-bold block mb-2 text-center">FAQs</span>
        <p>Who can use Mocktopus? Anyone preparing for interviews, including students and professionals.</p>
      </div>
      <div className="md:w-1/3">
        <span className="font-bold block mb-2 text-center">Contact</span>
        <ul className="space-y-1">
          <li>📧 Email: support@mocktopus.ai</li>
          <li>📞 Phone: +1 (555) 123-4567</li>
          <li>📍 Address: 123 Interview Lane, Career City, CA 90210</li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
