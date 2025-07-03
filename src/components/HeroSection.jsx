// components/HeroSection.js
import React from "react";

 import { Link } from "react-router-dom";


const HeroSection = () =>
  { 
    const isLoggedIn = localStorage.getItem("access_token");
    return (
  <>

     <div className="flex flex-col space-y-2 items-center my-12 bg-white py-6">
      <p className="text-4xl font-bold text-gray-900 text-center my-6">
        Ace Your Next Interview with Confidence
      </p>
      <p className="text-lg font-medium text-gray-700 text-center mx-17">
        Mocktopus helps you prepare with real-time mock interviews, feedback from experts, and personalized coaching.
      </p>
      <Link
       to={isLoggedIn ? "/Practise1" : "/Practise"} 
     
      
        className="rounded-xl bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600 transition"
      >
        Start Practicing
      

      </Link>
   </div></>);}


export default HeroSection;
