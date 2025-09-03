const express = require("express");
const Note = require("../models/Note");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Router = express.Router();

/*<------For create note------>*/
Router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    const note = new Note({ text });
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*<------ for get all notes ------>*/
Router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*<------ for generate summary ------>*/
Router.post("/:id/summary", async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `Summarize the following note in 2-3 sentences:\n\n${note.text}`
    );

    const summary = result.response.text();
    note.summary = summary;
    await note.save();

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*<------ for update a note ------>*/
Router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const updated = await Note.findByIdAndUpdate(
      id,
      { text, summary: null }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*<------ for delete a note ------>*/
Router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Note.findByIdAndDelete(id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = Router;
