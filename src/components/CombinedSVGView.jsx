import { useState, useEffect, useRef } from 'react'

const CombinedSVGView = ({ svgFiles, lines, onAddLine }) => {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ 
    width: 0, 
    height: 0,
    gap: 40 // Added gap between SVGs
  })
  const [svgElements, setSvgElements] = useState([])
  const [startPoint, setStartPoint] = useState(null)

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
      setDimensions(prev => ({
        ...prev,
        width: rect.width,
        height: rect.height,
        svgWidth: (rect.width - prev.gap) / 2 // Account for gap in width calculation
      }))
    }
  }, [svgFiles])

  const handleClick = (e) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Determine which SVG was clicked (accounting for gap)
    const svgIndex = x < dimensions.svgWidth ? 0 : 
                     x > dimensions.svgWidth + dimensions.gap ? 1 : -1
    
    if (svgIndex === -1) return // Clicked in the gap
    
    const adjustedX = svgIndex === 0 ? x : x - dimensions.svgWidth - dimensions.gap
    
    if (e.button === 0 || e.button === 2) {
      if (!startPoint) {
        setStartPoint({ x: adjustedX, y, svgIndex })
      } else {
        if (startPoint.svgIndex !== svgIndex) {
          onAddLine({
            start: startPoint,
            end: { x: adjustedX, y, svgIndex },
            color: e.button === 0 ? 'red' : 'blue'
          })
        }
        setStartPoint(null)
      }
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
  }

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleClick}
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
      
      {/* Render lines on top */}
      <svg 
        width={dimensions.width} 
        height={dimensions.height} 
        className="absolute top-0 left-0 pointer-events-none"
      >
        {lines.map((line, i) => {
          // Adjust coordinates accounting for gap
          const startX = line.start.svgIndex === 0 ? 
            line.start.x : 
            line.start.x + dimensions.svgWidth + dimensions.gap
          
          const endX = line.end.svgIndex === 0 ? 
            line.end.x : 
            line.end.x + dimensions.svgWidth + dimensions.gap
            
          return (
            <line
              key={i}
              x1={startX}
              y1={line.start.y}
              x2={endX}
              y2={line.end.y}
              stroke={line.color}
              strokeWidth="2"
            />
          )
        })}
      </svg>
    </div>
  )
}

export default CombinedSVGView