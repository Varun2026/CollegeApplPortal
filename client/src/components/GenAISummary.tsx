import React, { useState } from "react";

export function GenAISummary() {
  const [pdfText, setPdfText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSummary("");
    try {
      const res = await fetch("/api/genai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText }),
      });
      const data = await res.json();
      setSummary(data.summary || data.error || "No summary returned.");
    } catch (err) {
      setSummary("Error getting summary.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 border rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-2">AI PDF Summary for Admin Preview</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border rounded p-2 mb-2"
          rows={6}
          value={pdfText}
          onChange={e => setPdfText(e.target.value)}
          placeholder="Paste extracted PDF text here..."
          required
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Summarizing..." : "Get AI Summary"}
        </button>
      </form>
      {summary && (
        <div className="mt-4 p-2 bg-muted rounded">
          <strong>Summary:</strong>
          <div>{summary}</div>
        </div>
      )}
    </div>
  );
}
