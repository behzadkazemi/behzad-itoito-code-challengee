import SVGUploader from "./components/SVGUploader";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          🧵 Behzad’s Sewing Pattern Viewer
        </h1>
        <SVGUploader />
      </div>
    </div>
  );
}

export default App;
