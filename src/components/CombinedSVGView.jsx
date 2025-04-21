import { useState, useEffect, useRef } from 'react'

const CombinedSVGView = ({ svgFiles, lines, onAddLine }) => {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ 
    width: 0, 
    height: 0,
    gap: 40,
    svgWidth: 0
  })
  const [svgElements, setSvgElements] = useState([])
  const [startPoint, setStartPoint] = useState(null)
  const [activeDot, setActiveDot] = useState(null)
  const [mousePosition, setMousePosition] = useState(null)

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
    
    // Determine which SVG was clicked (accounting for gap)
    const svgIndex = x < dimensions.svgWidth ? 0 : 
                     x > dimensions.svgWidth + dimensions.gap ? 1 : -1
    
    if (svgIndex === -1) {
      // Clicked in the gap - cancel operation
      setStartPoint(null)
      setActiveDot(null)
      setMousePosition(null)
      return
    }
    
    const adjustedX = svgIndex === 0 ? x : x - dimensions.svgWidth - dimensions.gap
    
    if (e.button === 0 || e.button === 2) {
      if (!startPoint) {
        // First click - set start point
        const newStartPoint = { x: adjustedX, y, svgIndex }
        setStartPoint(newStartPoint)
        setActiveDot({
          x: svgIndex === 0 ? adjustedX : adjustedX + dimensions.svgWidth + dimensions.gap,
          y,
          svgIndex
        })
      } else {
        // Second click - complete the line
        if (startPoint.svgIndex !== svgIndex) {
          onAddLine({
            start: startPoint,
            end: { x: adjustedX, y, svgIndex },
            color: e.button === 0 ? 'red' : 'blue'
          })
        }
        setStartPoint(null)
        setActiveDot(null)
        setMousePosition(null)
      }
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
  }

  const handleMouseLeave = () => {
    if (startPoint) {
      // Cancel operation if mouse leaves the container
      setStartPoint(null)
      setActiveDot(null)
      setMousePosition(null)
    }
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
      {/* First SVG with right margin */}
      <div 
        className="h-full overflow-hidden"
        style={{ width: dimensions.svgWidth, marginRight: dimensions.gap }}
        dangerouslySetInnerHTML={{ __html: svgElements[0]?.outerHTML || '' }}
      />
      
      {/* Second SVG with left margin */}
      <div 
        className="h-full overflow-hidden"
        style={{ width: dimensions.svgWidth }}
        dangerouslySetInnerHTML={{ __html: svgElements[1]?.outerHTML || '' }}
      />
      
      {/* Render blue lines (backside stitching) under all layers */}
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 1 }} // Below other elements
      >
        {lines.filter(line => line.color === 'blue').map((line, i) => {
          const startX = line.start.svgIndex === 0 ? 
            line.start.x : 
            line.start.x + dimensions.svgWidth + dimensions.gap
          
          const endX = line.end.svgIndex === 0 ? 
            line.end.x : 
            line.end.x + dimensions.svgWidth + dimensions.gap
            
          return (
            <line
              key={`blue-${i}`}
              x1={startX}
              y1={line.start.y}
              x2={endX}
              y2={line.end.y}
              stroke="blue"
              strokeWidth="2"
              strokeDasharray="5,3" // Dashed line for backside stitching
              opacity="0.7" // Semi-transparent
            />
          )
        })}
      </svg>
      
      {/* Render red lines (frontside stitching) and other interactive elements on top */}
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 2 }} // Above other elements
      >
        {/* Red lines (frontside stitching) */}
        {lines.filter(line => line.color === 'red').map((line, i) => {
          const startX = line.start.svgIndex === 0 ? 
            line.start.x : 
            line.start.x + dimensions.svgWidth + dimensions.gap
          
          const endX = line.end.svgIndex === 0 ? 
            line.end.x : 
            line.end.x + dimensions.svgWidth + dimensions.gap
            
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
            cx={activeDot.svgIndex === 0 ? 
                activeDot.x : 
                activeDot.x + dimensions.svgWidth + dimensions.gap}
            cy={activeDot.y}
            r="6"
            fill="green"
            stroke="white"
            strokeWidth="2"
          />
        )}
        
        {/* Preview line that follows mouse */}
        {startPoint && mousePosition && (
          <line
            x1={startPoint.svgIndex === 0 ? 
                startPoint.x : 
                startPoint.x + dimensions.svgWidth + dimensions.gap}
            y1={startPoint.y}
            x2={mousePosition.x}
            y2={mousePosition.y}
            stroke="gray"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
        )}
      </svg>
    </div>
  )
}

export default CombinedSVGView