// components/Testimonials.js
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    name: "Ananya Patel",
    role: "Software Engineer @ Google",
    quote: "Mocktopus gave me the confidence to crack tough interviews. The mock sessions felt real!",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Raj Malhotra",
    role: "Data Scientist @ Microsoft",
    quote: "The feedback I received was game-changing. I could clearly track my improvement.",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Sara Verma",
    role: "Product Manager @ Amazon",
    quote: "Loved the personalized coaching. My coach helped me master behavioral questions.",
    image: "https://randomuser.me/api/portraits/women/85.jpg",
  },
  {
    name: "Aditya Kumar",
    role: "ML Engineer @ NVIDIA",
    quote: "I practiced with AI-generated questions tailored to my domain. Super effective!",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
  },
];

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  responsive: [{ breakpoint: 768, settings: { slidesToShow: 1 } }],
};

const Testimonials = () => (
  <div className="max-w-6xl mx-auto px-6 py-16">
    <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
    <Slider {...settings}>
      {testimonials.map((t, idx) => (
        <div key={idx} className="p-4">
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition">
            <img src={t.image} alt={t.name} className="w-20 h-20 mx-auto rounded-full mb-4 object-cover" />
            <h3 className="text-lg font-semibold">{t.name}</h3>
            <p className="text-sm text-gray-500">{t.role}</p>
            <p className="italic text-gray-700 mt-2">“{t.quote}”</p>
          </div>
        </div>
      ))}
    </Slider>
  </div>
);

export default Testimonials;
