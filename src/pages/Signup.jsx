import { useState } from "react";
import img from "../assets/img1.jpg";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../utils/config';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = "Username is required";
        if (!formData.email.includes("@")) newErrors.email = "Email is invalid";
        if (formData.password.length < 6)
            newErrors.password = "Password must be at least 6 characters";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            try {
                
                const response = await fetch(`${API_BASE_URL}/api/register/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                const data = await response.json();
                console.log(data);
                if (response.ok) {
                    alert("Registration successful!");
                    navigate("/login");  
                    setFormData({ username: "", email: "", password: "" });
                    setErrors({});
                } else {
                    setErrors(data);
                }
            } catch (err) {
                console.error("Signup error:", err);
            }
        }
    };

    return (
        <div style={{ backgroundImage: `url(${img})` }} className="bg-cover bg-center">
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border-2 border-purple-400">
                    <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>

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
                            {errors.username && (
                                <p className="text-red-500 text-sm">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="mt-1 block w-full rounded-md border-spacing-2 border-purple shadow-sm p-2 border"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
                        >
                            Sign Up
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-center">
                        Already have an account?{" "}
                        <Link to="/Login" className="text-blue-600 hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
