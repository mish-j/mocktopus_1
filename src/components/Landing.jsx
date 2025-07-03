import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesGrid from "../components/FeaturesGrid";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import img from "../assets/img1.jpg";

const Landing = () => (
  <>
      <div   style={{ backgroundImage: `url(${img})` }} className="bg-cover bg-center font-sans text-gray-900 bagrounbd">

    <HeroSection />
    <FeaturesGrid />
    <HowItWorks />
    <Testimonials />
    <Footer />
    </div>
  </>
);

export default Landing;
