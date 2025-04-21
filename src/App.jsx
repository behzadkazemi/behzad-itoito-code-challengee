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
    })
  }

  const handleAddLine = (line) => {
    setLines(prev => [...prev, line])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Sewing Line Definition Tool</h1>
        
        {svgFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <button 
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
            <p className="mt-4 text-gray-500">Please upload exactly 2 SVG files</p>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow">
            <CombinedSVGView 
              svgFiles={svgFiles}
              lines={lines}
              onAddLine={handleAddLine}
            />
          </div>
        )}
        
        {lines.length > 0 && (
          <div className="mt-8 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Defined Lines</h2>
            <ul className="space-y-2">
              {lines.map((line, i) => (
                <li key={i} className="flex items-center">
                  <span 
                    className="inline-block w-4 h-4 mr-2"
                    style={{ backgroundColor: line.color }}
                  ></span>
                  <span>
                    Line from ({line.start.x.toFixed(1)}, {line.start.y.toFixed(1)}) to 
                    ({line.end.x.toFixed(1)}, {line.end.y.toFixed(1)})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default App