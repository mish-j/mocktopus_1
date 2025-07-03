import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { API_BASE_URL } from '../utils/config';
import img from "../assets/img1.jpg";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",  // note: use username here, not email, for JWT login
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination from navigation state
  const from = location.state?.from?.pathname || "/Practise1";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/api/token/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Use AuthProvider login method
          login(data.access, data.refresh, formData.username);
          console.log("✅ Login successful via AuthProvider");
          navigate(from, { replace: true });   
          alert("Login successful!");
          setErrors({});
          
        } else {
          // JWT login errors will come in data.detail or data non-field errors
          setErrors({ general: data.detail || "Login failed" });
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrors({ general: "Something went wrong. Try again." });
      }
    }
  };

  return (
    <div style={{ backgroundImage: `url(${img})` }} className="bg-cover bg-center">
      <div className="min-h-screen flex items-center justify-center ">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border-2 border-purple-400">
          <h2 className="text-2xl font-bold mb-6 text-center">Log in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {errors.general && (
              <p className="text-red-500 text-sm text-center">{errors.general}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
            >
              Log In
            </button>
          </form>

          <p className="mt-4 text-sm text-center">
            Don't have an account?{" "}
            <Link to="/Signup" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
