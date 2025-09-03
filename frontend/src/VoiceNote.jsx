import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceNote = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // ✅ On mount, check browser support & fetch notes
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
    }
    fetchNotes();
  }, []);

  // ✅ Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://voicenoteswithai.onrender.com/api/notes"
      );
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Fetch notes error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Start listening
  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });

  // ✅ Stop listening & save transcript
  const stopListening = async () => {
  // Force stop listening
  SpeechRecognition.stopListening();
  if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    const recognition =
      new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.abort(); // ✅ hard stop
  }

  setTimeout(async () => {
    if (transcript.trim()) {
      const note = { text: transcript.trim(), summary: null };
      const saved = await sendData(note);
      setNotes((prev) => [saved, ...prev]);
    }
    resetTranscript();
  }, 500);
};


  // ✅ Save note to DB
  async function sendData(note) {
    const resp = await fetch(
      "https://voicenoteswithai.onrender.com/api/notes",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      }
    );
    return await resp.json();
  }

  // ✅ Generate summary
  const handleGenerateSummary = async (noteId) => {
    setSummaryLoading(noteId);
    try {
      const resp = await fetch(
        `https://voicenoteswithai.onrender.com/api/notes/${noteId}/summary`,
        { method: "POST" }
      );
      const updatedNote = await resp.json();
      setNotes((prev) =>
        prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
    } catch (err) {
      console.error("Summary error:", err);
    } finally {
      setSummaryLoading(null);
    }
  };

  // ✅ Delete note
  const handleDelete = async (noteId) => {
    try {
      await fetch(`https://voicenoteswithai.onrender.com/api/notes/${noteId}`, {
        method: "DELETE",
      });
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ✅ Edit note
  const handleEdit = async (note) => {
    const newText = prompt("Edit your note:", note.text);
    if (!newText || newText.trim() === note.text) return;

    try {
      const resp = await fetch(
        `https://voicenoteswithai.onrender.com/api/notes/${note._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText }),
        }
      );
      const updated = await resp.json();
      setNotes((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full md:w-[70%] lg:w-[40%] border border-gray-200 rounded-2xl shadow-2xl bg-white p-6 flex flex-col gap-6">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
          Voice Notes
        </h1>

        {/* Listening state */}
        <p className="text-gray-600">
          🎤 Listening: {listening ? "Yes" : "No"}
        </p>

        {/* Start/Stop buttons */}
        {listening ? (
          <button
            onClick={stopListening}
            className="w-full py-3 bg-red-500 text-lg md:text-xl font-semibold text-white rounded-xl"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startListening}
            className="w-full py-3 bg-green-500 text-lg md:text-xl font-semibold text-white rounded-xl"
          >
            Start Recording
          </button>
        )}

        {/* ✅ Always visible Live Transcript */}
        <div className="p-3 border rounded bg-gray-50 min-h-[80px]">
          <h2 className="text-lg font-semibold text-gray-800">
            Live Transcript
          </h2>
          <p className="text-gray-700">
            {transcript || "🎙️ Start speaking..."}
          </p>
        </div>

        {/* ✅ Notes History */}
        <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-2">
          <h2 className="text-xl font-bold text-gray-800">📝 History</h2>
          {loading ? (
            <p className="text-center text-gray-500">⏳ Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-center text-gray-400">
              No notes yet. Start recording!
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className="border border-gray-300 rounded-xl p-4 shadow-sm bg-gray-50 flex flex-col gap-3"
              >
                <p className="text-gray-700 text-base">{note.text}</p>

                <div className="flex flex-wrap gap-2 justify-between">
                  <button
                    onClick={() => handleEdit(note)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(note._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>

                  <button
                    disabled={!!note.summary || summaryLoading === note._id}
                    onClick={() => handleGenerateSummary(note._id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                  >
                    {summaryLoading === note._id
                      ? "Processing..."
                      : note.summary
                      ? "Summary Generated"
                      : "Generate Summary"}
                  </button>
                </div>

                {note.summary && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800">
                    <strong>Summary:</strong> {note.summary}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default VoiceNote;
