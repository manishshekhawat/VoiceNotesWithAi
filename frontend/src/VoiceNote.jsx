import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceNote = () => {
  const [notes, setNotes] = useState([]);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch("https://voicenoteswithai.onrender.com/api/notes");
    const data = await res.json();
    setNotes(data);
  };

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
      const note = { text: transcript, summary: null };
      const saved = await sendData(note);
      setNotes((prev) => [saved, ...prev]); // prepend saved note
    }
    resetTranscript();
  };

  const handleGenerateSummary = async (noteId) => {
    try {
      const resp = await fetch(
        `https://voicenoteswithai.onrender.com/api/notes/${noteId}/summary`,
        {
          method: "POST",
        }
      );

      if (!resp.ok) throw new Error("Error generating summary");

      const updatedNote = await resp.json();

      setNotes((prev) =>
        prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
    } catch (err) {
      console.error("Summary error:", err);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const resp = await fetch(`https://voicenoteswithai.onrender.com/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Delete failed");
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (note) => {
    const newText = prompt("Edit your note:", note.text);
    if (!newText || newText.trim() === note.text) return;

    try {
      const resp = await fetch(`https://voicenoteswithai.onrender.com/api/notes/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      });

      if (!resp.ok) throw new Error("Edit failed");
      const updated = await resp.json();

      setNotes((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  async function sendData(note) {
    const resp = await fetch("https://voicenoteswithai.onrender.com/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    return await resp.json();
  }

  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-[40%] min-h-[75%] border border-gray-200 rounded-2xl shadow-2xl bg-white p-6 flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Voice Notes
        </h1>

        <p className="text-gray-600">
          🎤 Listening: {listening ? "Yes" : "No"}
        </p>

        {listening ? (
          <button
            onClick={stopListening}
            className="w-full py-3 bg-red-500 text-xl font-semibold text-white rounded-xl cursor-pointer"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startListening}
            className="w-full py-3 bg-green-500 text-xl font-semibold text-white rounded-xl cursor-pointer"
          >
            Start Recording
          </button>
        )}

        {transcript && (
          <div className="p-3 border rounded bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Live Transcript
            </h2>
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}

        <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-2">
          {notes.map((note) => (
            <div
              key={note._id}
              className="border border-gray-300 rounded-xl p-4 shadow-sm bg-gray-50 flex flex-col gap-3"
            >
              <p className="text-gray-700 text-base">{note.text}</p>

              <div className="flex justify-between">
                <button
                  onClick={() => handleEdit(note)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(note._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
                >
                  Delete
                </button>

                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 cursor-pointer"
                  disabled={!!note.summary}
                  onClick={() => handleGenerateSummary(note._id)}
                >
                  {note.summary ? "Summary Generated" : "Generate Summary"}
                </button>
              </div>

              {note.summary && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-800">
                  <strong>Summary:</strong> {note.summary}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VoiceNote;
