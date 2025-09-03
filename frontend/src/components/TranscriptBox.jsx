const TranscriptBox = ({ transcript }) => {
  return (
    <div className="p-3 border rounded bg-gray-50 min-h-[80px]">
      <h2 className="text-lg font-semibold text-gray-800">Live Transcript</h2>
      <p className="text-gray-700">{transcript || "🎙️ Start speaking..."}</p>
    </div>
  );
};

export default TranscriptBox;
