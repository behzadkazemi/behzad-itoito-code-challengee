import { useState, useEffect, useRef } from 'react'
import ThreeDPreview from './ThreeDPreview'

const CombinedSVGView = ({ svgFiles, lines, onAddLine }) => {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, gap: 40, svgWidth: 0 })
  const [svgElements, setSvgElements] = useState([])
  const [startPoint, setStartPoint] = useState(null)
  const [activeDot, setActiveDot] = useState(null)
  const [mousePosition, setMousePosition] = useState(null)
  const [show3D, setShow3D] = useState(false)

  useEffect(() => {
    if (containerRef.current && svgFiles.length === 2) {
      const elements = []
      const parser = new DOMParser()

      svgFiles.forEach((file, index) => {
        const doc = parser.parseFromString(file.content, 'image/svg+xml')
        const svg = doc.querySelector('svg')

        if (svg) {
          svg.removeAttribute('width')
          svg.removeAttribute('height')
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

          if (!svg.getAttribute('viewBox')) {
            const width = svg.getAttribute('width') || '100%'
            const height = svg.getAttribute('height') || '100%'
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
          }

          svg.classList.add(`svg-${index}`)
          elements.push(svg)
        }
      })

      setSvgElements(elements)

      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({
        width: rect.width,
        height: rect.height,
        gap: 40,
        svgWidth: (rect.width - 40) / 2
      })
    }
  }, [svgFiles])

  const handleMouseMove = (e) => {
    if (!containerRef.current || !startPoint) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePosition({ x, y })
  }

  const handleClick = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const { svgWidth, gap } = dimensions

    let svgIndex = -1
    if (x < svgWidth) svgIndex = 0
    else if (x > svgWidth + gap) svgIndex = 1

    if (svgIndex === -1) {
      setStartPoint(null)
      setActiveDot(null)
      setMousePosition(null)
      return
    }

    const adjustedX = svgIndex === 0 ? x : x - svgWidth - gap

    if (e.button === 0 || e.button === 2) {
      if (!startPoint) {
        const newStartPoint = { x: adjustedX, y, svgIndex }
        setStartPoint(newStartPoint)
        setActiveDot({
          x: svgIndex === 0 ? adjustedX : adjustedX + svgWidth + gap,
          y,
          svgIndex
        })
      } else {
        const newLine = {
          start: startPoint,
          end: { x: adjustedX, y, svgIndex },
          color: e.button === 0 ? 'red' : 'blue'
        }
        onAddLine(newLine)
        setStartPoint(null)
        setActiveDot(null)
        setMousePosition(null)
      }
    }
  }

  const handleContextMenu = (e) => e.preventDefault()

  const handleMouseLeave = () => {
    if (startPoint) {
      setStartPoint(null)
      setActiveDot(null)
      setMousePosition(null)
    }
  }

  const handleToggle3D = () => {
    setShow3D((prev) => !prev)
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onContextMenu={handleContextMenu}
      onMouseDown={handleClick}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full min-h-[400px] cursor-crosshair flex"
    >
      {/* SVG 1 */}
      <div
        className="h-full overflow-hidden"
        style={{ width: dimensions.svgWidth, marginRight: dimensions.gap }}
        dangerouslySetInnerHTML={{ __html: svgElements[0]?.outerHTML || '' }}
      />

      {/* SVG 2 */}
      <div
        className="h-full overflow-hidden"
        style={{ width: dimensions.svgWidth }}
        dangerouslySetInnerHTML={{ __html: svgElements[1]?.outerHTML || '' }}
      />

      {/* Blue dashed lines */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {lines.filter(line => line.color === 'blue').map((line, i) => {
          const startX = line.start.svgIndex === 0 ? line.start.x : line.start.x + dimensions.svgWidth + dimensions.gap
          const endX = line.end.svgIndex === 0 ? line.end.x : line.end.x + dimensions.svgWidth + dimensions.gap
          return (
            <line
              key={`blue-${i}`}
              x1={startX}
              y1={line.start.y}
              x2={endX}
              y2={line.end.y}
              stroke="blue"
              strokeWidth="2"
              strokeDasharray="5,3"
              opacity="0.7"
            />
          )
        })}
      </svg>

      {/* Red lines + preview elements */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 2 }}
      >
        {lines.filter(line => line.color === 'red').map((line, i) => {
          const startX = line.start.svgIndex === 0 ? line.start.x : line.start.x + dimensions.svgWidth + dimensions.gap
          const endX = line.end.svgIndex === 0 ? line.end.x : line.end.x + dimensions.svgWidth + dimensions.gap
          return (
            <line
              key={`red-${i}`}
              x1={startX}
              y1={line.start.y}
              x2={endX}
              y2={line.end.y}
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )
        })}

        {/* Active green dot */}
        {activeDot && (
          <circle
            cx={activeDot.svgIndex === 0 ? activeDot.x : activeDot.x + dimensions.svgWidth + dimensions.gap}
            cy={activeDot.y}
            r="6"
            fill="green"
            stroke="white"
            strokeWidth="2"
          />
        )}

        {/* Mouse preview line */}
        {startPoint && mousePosition && (
          <line
            x1={startPoint.svgIndex === 0 ? startPoint.x : startPoint.x + dimensions.svgWidth + dimensions.gap}
            y1={startPoint.y}
            x2={mousePosition.x}
            y2={mousePosition.y}
            stroke="gray"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
        )}
      </svg>

      {/* 3D Preview Button */}
      <button
        onClick={handleToggle3D}
        className="absolute bottom-4 right-4 z-10 bg-black text-white px-4 py-2 rounded shadow-lg hover:bg-gray-800 transition"
      >
        {show3D ? 'Hide 3D Preview' : 'Show 3D Preview'}
      </button>

      {/* 3D Preview Viewer */}
      {show3D && (
        <div className="absolute inset-0 z-50 bg-white bg-opacity-95 flex items-center justify-center">
          <ThreeDPreview lines={lines} width={dimensions.width} height={dimensions.height} />
          <button
            onClick={handleToggle3D}
            className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export default CombinedSVGView
