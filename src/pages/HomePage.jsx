import { Link } from "react-router-dom";
import img from "../assets/img1.jpg";

const HomePage = () => {
  return (
    <div
      style={{ backgroundImage: `url(${img})` }}
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center"
    >
      <h1 className="text-4xl font-bold text-white">Welcome to Mocktopus 🐙</h1>
      <p className="text-white mt-4 text-lg">
        You are successfully logged in!
      </p>
      <Link
        to="/Practise"
        className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
      >
        Start Practicing
      </Link>
    </div>
  );
};

export default HomePage;
