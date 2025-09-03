const NoteItem = ({ note, summaryLoading, onEdit, onDelete, onGenerateSummary }) => {
  return (
    <div className="border border-gray-300 rounded-xl p-4 shadow-sm bg-gray-50 flex flex-col gap-3">
      <p className="text-gray-700 text-base">{note.text}</p>

      <div className="flex flex-wrap gap-2 justify-between">
        <button
          onClick={() => onEdit(note)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(note._id)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
        >
          Delete
        </button>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 cursor-pointer"
          disabled={!!note.summary || summaryLoading === note._id}
          onClick={() => onGenerateSummary(note._id)}
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
  );
};

export default NoteItem;
