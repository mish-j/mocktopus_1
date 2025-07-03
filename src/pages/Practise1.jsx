import React, { useState, useEffect } from "react";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import ViewFeedbackModal from "../components/ViewFeedbackModal";
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../utils/config';
const Practise1 = () => {
  const [interviews, setInterviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD format
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const typeMap = {
    product_management: "Product Management",
    data_structures_algorithms: "Data Structures & Algorithms",
    system_design: "System Design",
    behavioral: "Behavioral",
    sql: "SQL",
    data_science_ml: "Data Science & ML",
    frontend: "Frontend",
  };

  const slotMap = {
    morning: "Morning (9:00 - 11:00 AM)",
    afternoon: "Afternoon (1:00 - 3:00 PM)",
    evening: "Evening (5:00 - 7:00 PM)",
  };

  const mapInterviewType = (displayType) => {
    const reverseMap = Object.entries(typeMap).reduce((acc, [key, val]) => {
      acc[val] = key;
      return acc;
    }, {});
    return reverseMap[displayType] || displayType;
  };

  const mapTimeSlot = (displaySlot) => {
    const reverseMap = Object.entries(slotMap).reduce((acc, [key, val]) => {
      acc[val] = key;
      return acc;
    }, {});
    return reverseMap[displaySlot] || displaySlot;
  };

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/interviews/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch interviews");
        const data = await res.json();
        // Filter out finished interviews
        const activeInterviews = data.filter(interview => interview.status !== 'finished');
        setInterviews(activeInterviews);
      } catch (err) {
        console.error("Error fetching interviews", err);
      }
    };

    const retryMatch = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/interviews/retry-match/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        fetchInterviews();
      } catch (err) {
        console.error("Error retrying match", err);
      }
    };

    fetchInterviews();
    const intervalId = setInterval(retryMatch, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const shouldShowJoinNow = (item) => {
    // If interview is finished, don't show join button
    if (item.status === 'finished') return false;
    if (!item.matched) return false;

    const now = new Date();
    const interviewDate = new Date(item.date);

    return true;  
  };

  const handleViewFeedback = (roomId) => {
    setSelectedRoomId(roomId);
    setShowFeedbackModal(true);
  };
//   const shouldShowJoinNow = (item) => {
//   if (!item.matched) return false;

//   const now = new Date();
//   const interviewDate = new Date(item.date);
//   if (
//     now.toDateString() !== interviewDate.toDateString()
//   ) return false;

//   // Determine slot start time
//   let startHour = 9;
//   if (item.slot === "afternoon") startHour = 13;
//   if (item.slot === "evening") startHour = 17;

//   const interviewTime = new Date(item.date);
//   interviewTime.setHours(startHour, 0, 0, 0);

//   const diffMinutes = (interviewTime - now) / 1000 / 60;
//   return diffMinutes <= 5 && diffMinutes >= -120; // allow joining 5 min before to 2hr after
// };


  const slots = Object.values(slotMap);

  const handleCancelInterview = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/interviews/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (res.status === 204) {
        alert("Interview cancelled successfully.");
        setInterviews(interviews.filter((item) => item.id !== id));
      } else {
        const errText = await res.text();
        throw new Error(errText);
      }
    } catch (err) {
      console.error("Error cancelling interview:", err);
      alert("Failed to cancel the interview.");
    }
  };

  return (
    <>
      <div className="flex-row w-1/2 mx-12 my-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Practice mock interviews with peers
        </h1>
        <p className="p-2 text-gray-500">
          Join thousands of tech candidates practicing interviews to land jobs.
          Practice real questions over video chat in a collaborative environment
          with helpful AI feedback.
        </p>
        <button
          className="p-2 bg-indigo-600 rounded-xl text-white font-bold my-4 mx-4 px-4 py-4"
          onClick={() => setShowModal(true)}
        >
          Schedule Practice Session
        </button>
      </div>

      {/* Modal 1 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select your interview type</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black text-xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.values(typeMap).map((title, i) => (
                <div
                  key={i}
                  className={`p-4 border rounded-lg cursor-pointer ${selectedInterviewType === title ? "border-indigo-600 bg-indigo-50" : "hover:border-indigo-500"}`}
                  onClick={() => setSelectedInterviewType(title)}
                >
                  <h3 className="font-semibold mt-2">{title}</h3>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button className="bg-indigo-600 text-white px-20 py-2 rounded-xl font-semibold" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="bg-indigo-600 text-white px-20 py-2 rounded-xl font-semibold"
                onClick={() => {
                  if (!selectedInterviewType) {
                    alert("Please select an interview type.");
                    return;
                  }
                  setShowModal(false);
                  setShowModal2(true);
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2 */}
      {showModal2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select your interview time</h2>
              <button onClick={() => setShowModal2(false)} className="text-gray-500 hover:text-black text-xl">&times;</button>
            </div>

            <h3 className="text-md font-medium mb-4">
              Interview Type: <span className="text-indigo-600">{selectedInterviewType}</span>
            </h3>
            <div className="mb-4">
              <label className="block text-md font-medium mb-2">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer ${selectedSlot === slot ? "border-indigo-600 bg-indigo-50" : "hover:border-indigo-500"}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button className="bg-indigo-600 text-white px-20 py-2 rounded-xl font-semibold" onClick={() => { setShowModal2(false); setShowModal(true); }}>
                Back
              </button>
              <button
                className="bg-indigo-600 text-white px-20 py-2 rounded-xl font-semibold"
                onClick={async () => {
                  if (!selectedSlot) {
                    alert("Please select a time slot.");
                    return;
                  }

                  try {
                    const res = await fetch(`${API_BASE_URL}/api/interviews/`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                      },
                      body: JSON.stringify({
                        type: mapInterviewType(selectedInterviewType),
                        slot: mapTimeSlot(selectedSlot),
                        date: selectedDate,
                      }),
                    });

                    if (!res.ok) {
                      const errText = await res.text();
                      let errorMessage = "Failed to schedule interview.";
                      
                      try {
                        const errorData = JSON.parse(errText);
                        if (errorData.error) {
                          errorMessage = errorData.error;
                        }
                      } catch {
                        // If parsing fails, use the raw error text
                        errorMessage = errText || errorMessage;
                      }
                      
                      throw new Error(errorMessage);
                    }

                    const result = await res.json();
                    alert("Interview scheduled successfully!");
                    setShowModal2(false);
                    // Only add to the list if it's not finished
                    if (result.status !== 'finished') {
                      setInterviews([...interviews, result]);
                    }
                  } catch (err) {
                    console.error("Error scheduling:", err);
                    alert(err.message || "Failed to schedule interview.");
                  }
                }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Interviews */}
      <div className="mx-12 py-6">
        <h1 className="font-bold text-lg mb-4">Upcoming Interviews</h1>
        <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Time Slot</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray-700">
              {interviews.filter(item => item.status !== 'finished').map((item) => (
                <tr className="border-t" key={item.id}>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {(() => {
                      const [year, month, day] = item.date.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      return date.toDateString();
                    })()} <span className="text-indigo-600 text-lg">📅</span>
                  </td>
                  <td className="px-6 py-4">{typeMap[item.type]}</td>
                  <td className="px-6 py-4">{slotMap[item.slot]}</td>
                  <td className="px-6 py-4">
                    {item.status === 'finished' ? (
                      <span className="text-green-600 font-semibold">✅ Finished</span>
                    ) : item.matched ? (
                      <span className="text-green-600 font-semibold">✅ Matched</span>
                    ) : (
                      <span className="text-yellow-500 animate-pulse">⏳ Searching...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === 'finished' ? (
                      <button
                        onClick={() => handleViewFeedback(item.room_id)}
                        className="w-full text-center bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        📊 View Feedback
                      </button>
                    ) : shouldShowJoinNow(item) ? (
                      <Link
                        to={`/interview-room/${item.room_id}`}
                        className="text-blue-600 text-center text-base px-4 hover:underline font-medium"
                      >
                        Join Now
                      </Link>
                    ) : (
                      <button
                        className="text-red-600 hover:underline font-medium"
                        onClick={() => handleCancelInterview(item.id)}
                      >
                        Cancel session
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {interviews.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    No upcoming interviews.
                  </td>
                </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Feedback Modal */}
      <ViewFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        roomId={selectedRoomId}
      />

      <HowItWorks />
      <Testimonials />
      <Footer />
    </>
  );
};

export default Practise1;
