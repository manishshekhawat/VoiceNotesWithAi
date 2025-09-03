import { useState, useEffect, useRef } from "react";
import TranscriptBox from "./TranscriptBox";
import NotesList from "./NoteList.jsx";
import {
  fetchNotes,
  addNote,
  updateNote,
  deleteNote,
  generateSummary,
} from "../api/api";

const VoiceNote = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  // ✅ SpeechRecognition setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptChunk + " ";
        } else {
          interim += transcriptChunk;
        }
      }
      setTranscript(final + interim);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // ✅ Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      console.error("Fetch notes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }

    if (transcript.trim()) {
      try {
        const saved = await addNote({ text: transcript.trim(), summary: null });
        setNotes((prev) => [saved, ...prev]);
        setTranscript("");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerateSummary = async (noteId) => {
    setSummaryLoading(noteId);
    try {
      const updatedNote = await generateSummary(noteId);
      setNotes((prev) =>
        prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
    } catch (err) {
      console.error("Summary error:", err);
    } finally {
      setSummaryLoading(null);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (note) => {
    const newText = prompt("Edit your note:", note.text);
    if (!newText || newText.trim() === note.text) return;

    try {
      const updated = await updateNote(note._id, newText.trim());
      setNotes((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full md:w-[70%] lg:w-[40%] border border-gray-200 rounded-2xl shadow-2xl bg-white p-6 flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
          Voice Notes
        </h1>

        <p className="text-gray-600">
          🎤 Listening: {listening ? "Yes" : "No"}
        </p>

        {listening ? (
          <button
            onClick={stopListening}
            className="w-full py-3 bg-red-500 text-lg md:text-xl font-semibold text-white rounded-xl cursor-pointer"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startListening}
            className="w-full py-3 bg-green-500 text-lg md:text-xl font-semibold text-white rounded-xl cursor-pointer"
          >
            Start Recording
          </button>
        )}

        {/* Transcript Component */}
        <TranscriptBox transcript={transcript} />

        {/* Notes List Component */}
        <NotesList
          notes={notes}
          loading={loading}
          summaryLoading={summaryLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGenerateSummary={handleGenerateSummary}
        />
      </div>
    </section>
  );
};

export default VoiceNote;
