import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeDPreview = ({ lines, width, height }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !lines || lines.length === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // Create a scale factor to normalize coordinates
    const scaleFactor = Math.max(width, height) / 2;

    // Add lines to the scene
    lines.forEach((line, i) => {
      const color = line.color === 'red' ? 0xff0000 : 0x0000ff;
      const material = new THREE.LineBasicMaterial({ color });
      
      // Convert SVG coordinates to 3D space
      const startX = (line.start.x - width/2) / scaleFactor;
      const startY = (height/2 - line.start.y) / scaleFactor;
      const startZ = line.start.svgIndex === 0 ? -1 : 1;
      
      const endX = (line.end.x - width/2) / scaleFactor;
      const endY = (height/2 - line.end.y) / scaleFactor;
      const endZ = line.end.svgIndex === 0 ? -1 : 1;

      const points = [
        new THREE.Vector3(startX, startY, startZ),
        new THREE.Vector3(endX, endY, endZ)
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const threeLine = new THREE.Line(geometry, material);
      scene.add(threeLine);
    });

    camera.position.z = 3;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [lines, width, height]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeDPreview;