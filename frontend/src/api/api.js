const BASE_URL = "https://voicenoteswithai.onrender.com/api/notes";

// ✅ Fetch all notes
export async function fetchNotes() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

// ✅ Add new note
export async function addNote(note) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to add note");
  return res.json();
}

// ✅ Update a note
export async function updateNote(noteId, text) {
  const res = await fetch(`${BASE_URL}/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

// ✅ Delete a note
export async function deleteNote(noteId) {
  const res = await fetch(`${BASE_URL}/${noteId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
  return true;
}

// ✅ Generate summary
export async function generateSummary(noteId) {
  const res = await fetch(`${BASE_URL}/${noteId}/summary`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate summary");
  return res.json();
}
