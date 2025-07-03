import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Practice from "./pages/Practise";
import Practise1 from "./pages/Practise1";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./components/AuthProvider";
import HomePage from "./pages/HomePage";
import Questions from "./pages/Questions";
import Profile from "./pages/Profile";
import Coaching from "./pages/Coaching";
import { Navigate } from "react-router-dom";
import Pricing from "./pages/Pricing";
import InterviewRoom from "./pages/InterviewRoom";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Pricing" element={<Pricing/>}/>
          <Route path="/coaching" element={<Coaching />} />
          <Route path="/questions/:category" element={<Questions />} />
          
          {/* Protected Routes */}
          <Route 
            path="/interview-room/:room_id" 
            element={
              <ProtectedRoute>
                <InterviewRoom />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/questions"
            element={<Navigate to="/questions/Software-Engineering" replace />}
          />
       
          <Route path="/Practise" element={<Practice />} />
          
          <Route
            path="/Practise1"
            element={
              <ProtectedRoute>
                <Practise1 />
              </ProtectedRoute>
            }
          />

          <Route
            path="/HomePage"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
