import React, { useState } from "react";

export function ApplicationQualityScoring() {
  const [gpa, setGpa] = useState("");
  const [course, setCourse] = useState("");
  const [department, setDepartment] = useState("");
  const [scoreFeedback, setScoreFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setScoreFeedback("");
    try {
      const res = await fetch("/api/genai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gpa, course, department }),
      });
      const data = await res.json();
      setScoreFeedback(data.scoreFeedback || data.error || "No feedback returned.");
    } catch (err) {
      setScoreFeedback("Error getting feedback.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 border rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-2">Application Quality Scoring (AI)</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full border rounded p-2 mb-2 text-black"
          type="text"
          value={gpa}
          onChange={e => setGpa(e.target.value)}
          placeholder="GPA (e.g. 3.8)"
          required
        />
        <input
          className="w-full border rounded p-2 mb-2 text-black"
          type="text"
          value={course}
          onChange={e => setCourse(e.target.value)}
          placeholder="Course (e.g. Computer Science)"
          required
        />
        <input
          className="w-full border rounded p-2 mb-2 text-black"
          type="text"
          value={department}
          onChange={e => setDepartment(e.target.value)}
          placeholder="Department (e.g. Engineering)"
          required
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Scoring..." : "Get AI Score & Feedback"}
        </button>
      </form>
      {scoreFeedback && (
        <div className="mt-4 p-2 bg-muted rounded">
          <strong>Score & Feedback:</strong>
          <div>{scoreFeedback}</div>
        </div>
      )}
    </div>
  );
}
