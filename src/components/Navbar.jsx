import React from "react";
import logo from "../assets/logo.png";
import logo1 from "../assets/user.png";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const hideAuthLinks = location.pathname === "/HomePage" || isAuthenticated;

  // Logout functionality using AuthProvider
  const handleLogout = () => {
    logout(); // This will clear tokens and redirect to login
    alert("Logged out successfully!");
  };

  return (
    <nav className="flex sm:flex-row md:h-20 items-center justify-between px-6 py-2 bg-gradient-to-r from-[#4E28D4] via-[#6C35D3] to-[#00D4FF] h-20 text-white border-b-2 border-gray-300">
      {/* Left - Logo */}
      <Link to="/" className="flex items-center space-x-3 text-lg font-bold">
        <img src={logo} alt="Logo" className="h-16 w-auto" />
        <span>Mocktopus</span>
      </Link>
      
      {/* Center - Menu */}
      <ul className="ml-5 hidden md:flex space-x-16 font-medium tracking-wide text-white">
        <li className="relative group">
  <Link 
    to={isAuthenticated ? "/Practise1" : "/Practise"} 
    className="hover:underline"
  >
    Practice
  </Link>
</li>

        {/* Questions Dropdown */}
        <li className="relative group">
          <Link 
            to="#" 
            className="flex items-center gap-1 font-medium text-white hover:text-purple-200 transition duration-200"
          >
            Questions ▽
          </Link>

          <div className="absolute top-full mt-3 w-56 bg-white text-purple-800 border border-purple-200 rounded-2xl shadow-lg p-3 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transform transition-all duration-300 z-20">
            <Link 
              to="/questions/Software-Engineering" 
              className="block px-4 py-2 rounded-lg hover:bg-purple-100 hover:text-purple-900 transition-colors"
            >
              💻 Software Engineering
            </Link>
            <Link 
              to="/questions/Data-Science" 
              className="block px-4 py-2 rounded-lg hover:bg-purple-100 hover:text-purple-900 transition-colors"
            >
              📊 Data Science
            </Link>
            <Link 
              to="/questions/System-Design" 
              className="block px-4 py-2 rounded-lg hover:bg-purple-100 hover:text-purple-900 transition-colors"
            >
              🏗️ System Design
            </Link>
          </div>
        </li>

        {/* Coaching Link */}
        <li>
          <Link 
            to="/coaching" 
            className="font-medium text-white hover:text-purple-200 transition duration-200 hover:underline"
          >
            Coaching
          </Link>
        </li>

        {/* Pricing Dropdown */}
        <li className="relative group">
          <Link 
            to="/Pricing" 
            className="flex items-center gap-1 font-medium text-white hover:text-purple-200 transition duration-200"
          >
            Pricing  
          </Link>
        </li>
      </ul>

      {/* Right side - Auth Links or User Profile */}
      <div className="flex justify-between items-center relative">
        {!hideAuthLinks && (
          <ul className="flex space-x-10 font-semibold tracking-wide text-white items-center">
            <li>
              <Link to="/Login">Login</Link>
            </li>
            <li className="rounded-xl border border-white bg-white/10 hover:bg-white/20 text-white py-2 px-4">
              <Link to="/Signup">Signup</Link>
            </li>
          </ul>
        )}

        {hideAuthLinks && (
          <div className="relative group">
            {/* Improved User Icon with gradient background and better styling */}
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <svg 
                className="w-6 h-6 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="absolute top-full right-0 mt-3 w-48 bg-white text-purple-800 border border-purple-200 rounded-2xl shadow-xl p-3 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transform transition-all duration-300 z-20">
              <div className="border-b border-purple-100 pb-2 mb-2">
                <p className="text-sm font-medium text-purple-900">Welcome back!</p>
                <p className="text-xs text-purple-600">{localStorage.getItem('username') || 'User'}</p>
              </div>
              
              <Link 
                to="/Profile" 
                className="flex items-center px-4 py-2 rounded-lg hover:bg-purple-100 hover:text-purple-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Profile & History
              </Link>
              
              <div className="border-t border-purple-100 pt-2 mt-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center text-left px-4 py-2 rounded-lg hover:bg-red-100 hover:text-red-900 transition-colors text-red-600 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;