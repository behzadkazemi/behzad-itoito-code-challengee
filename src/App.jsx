import { useState, useRef } from 'react'
import CombinedSVGView from './components/CombinedSVGView'

function App() {
  const [svgFiles, setSvgFiles] = useState([])
  const [lines, setLines] = useState([])
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length !== 2) {
      alert('Please upload exactly 2 SVG files')
      return
    }

    const readers = files.map(file => {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (e) => resolve({
          content: e.target.result,
          name: file.name
        })
        reader.readAsText(file)
      })
    })

    Promise.all(readers).then(results => {
      setSvgFiles(results)
      setLines([]) // reset old lines when uploading new files
    })
  }

  const handleAddLine = (line) => {
    setLines(prev => [...prev, line])
  }

  const handleResetLines = () => {
    if (confirm("Are you sure you want to remove all lines?")) {
      setLines([])
    }
  }

  const handleUndoLine = () => {
    setLines(prev => prev.slice(0, -1))
  }

  return (
    <div className="h-screen grid grid-cols-2 gap-4 p-6 bg-gray-100">
      {/* LEFT: SVG Upload & View */}
      <div className="bg-white rounded-lg shadow p-4 overflow-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Upload SVG Patterns</h1>

        {svgFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <button 
              onClick={() => fileInputRef.current.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload 2 SVG Files
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".svg"
              multiple
              className="hidden"
            />
            <p className="mt-4 text-gray-500">Please upload exactly 2 SVG files.</p>
          </div>
        ) : (
          <CombinedSVGView 
            svgFiles={svgFiles}
            lines={lines}
            onAddLine={handleAddLine}
          />
        )}
      </div>

      {/* RIGHT: Line Controls and List */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center">Defined Lines</h2>

        <div className="flex justify-center mb-4 space-x-4">
          <button
            onClick={handleUndoLine}
            className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
          >
            Undo Last
          </button>
          <button
            onClick={handleResetLines}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset All
          </button>
        </div>

        {lines.length > 0 ? (
          <ul className="overflow-auto flex-grow space-y-2 border-t pt-2">
            {lines.map((line, i) => (
              <li key={i} className="text-sm flex items-center">
                <span 
                  className="inline-block w-4 h-4 mr-2 rounded"
                  style={{ backgroundColor: line.color }}
                ></span>
                Line {i + 1}: ({line.start.x.toFixed(1)}, {line.start.y.toFixed(1)}) → ({line.end.x.toFixed(1)}, {line.end.y.toFixed(1)})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center mt-4">No lines defined yet.</p>
        )}
      </div>
    </div>
  )
}

export default App
