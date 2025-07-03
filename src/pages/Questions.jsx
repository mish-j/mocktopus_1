import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import { API_BASE_URL } from '../utils/config';

const Questions = () => {
  const { category } = useParams(); // Get category from URL
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/questions/${category}/`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [category]);

  return (
    <>
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-4 capitalize p-5 mx-4 my-4">
          Questions in {category} Category
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading questions...</p>
        ) : questions.length > 0 ? (
          <div className="space-y-4 mx-6">
            {questions.map((q) => (
              <div
                key={q.id}
                className="border-2  rounded-md p-4 transition duration-300 ease-in-out hover:bg-purple-100"
              >
                <p className="text-lg">{q.question_text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No questions found in this category.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Questions;
