import NoteItem from "./NoteItem";

const NotesList = ({ notes, loading, summaryLoading, onEdit, onDelete, onGenerateSummary }) => {
  if (loading) {
    return <p className="text-center text-gray-500">⏳ Loading notes...</p>;
  }

  if (notes.length === 0) {
    return <p className="text-center text-gray-400">No notes yet. Start recording!</p>;
  }

  return (
    <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-2">
      {notes.map((note) => (
        <NoteItem
          key={note._id}
          note={note}
          summaryLoading={summaryLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onGenerateSummary={onGenerateSummary}
        />
      ))}
    </div>
  );
};

export default NotesList;
