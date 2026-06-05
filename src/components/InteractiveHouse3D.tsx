import React, { useRef, useState, useEffect } from 'react';

interface InteractiveHouse3DProps {
  wallColor: string;
  accentColor: string;
  onSelectPart?: (part: 'wall' | 'accent' | 'roof' | 'door') => void;
  selectedPart?: 'wall' | 'accent' | 'roof' | 'door';
}

// Simple 3D Vector types
type Point3D = [number, number, number]; // [x, y, z]
interface Face {
  indices: number[];
  type: 'wall' | 'accent' | 'roof' | 'glass' | 'ground' | 'frame' | 'door';
  tag: string;
  normalSign?: number; // adjustment for normal vector direction
}

export default function InteractiveHouse3D({
  wallColor,
  accentColor,
  onSelectPart,
  selectedPart = 'wall'
}: InteractiveHouse3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [angleX, setAngleX] = useState<number>(-22); // Tilt angle in degrees
  const [angleY, setAngleY] = useState<number>(45);  // Rotation angle in degrees
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0, angleY: 0, angleX: 0 });

  // Canvas Dimensions
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });

  // 3D Geometry of a Modern Luxury Villa
  // Units are arbitrary. Center is roughly [0, 0, 0]. Y is up.
  const vertices: Point3D[] = [
    // --- GROUND FLOOR BLOCK ---
    [-1.0, -0.6, -1.0], // 0
    [ 1.0, -0.6, -1.0], // 1
    [ 1.0,  0.2, -1.0], // 2
    [-1.0,  0.2, -1.0], // 3
    [-1.0, -0.6,  1.0], // 4
    [ 1.0, -0.6,  1.0], // 5
    [ 1.0,  0.2,  1.0], // 6
    [-1.0,  0.2,  1.0], // 7

    // --- SECOND FLOOR CANTILEVER (Slightly offset, overlaps trim) ---
    [-1.2,  0.2, -0.8], // 8
    [ 0.8,  0.2, -0.8], // 9
    [ 0.8,  0.9, -0.8], // 10
    [-1.2,  0.9, -0.8], // 11
    [-1.2,  0.2,  0.8], // 12
    [ 0.8,  0.2,  0.8], // 13
    [ 0.8,  0.9,  0.8], // 14
    [-1.2,  0.9,  0.8], // 15

    // --- ROOF OVERHANG (Slabs) ---
    [-1.3,  0.9, -0.9], // 16
    [ 0.9,  0.9, -0.9], // 17
    [ 0.9,  1.0, -0.9], // 18
    [-1.3,  1.0, -0.9], // 19
    [-1.3,  0.9,  0.9], // 20
    [ 0.9,  0.9,  0.9], // 21
    [ 0.9,  1.0,  0.9], // 22
    [-1.3,  1.0,  0.9], // 23

    // --- BASE PLATE / LAWN ---
    [-1.8, -0.6, -1.8], // 24
    [ 1.8, -0.6, -1.8], // 25
    [ 1.8, -0.6,  1.8], // 26
    [-1.8, -0.6,  1.8], // 27

    // --- FRONT ENTRANCE DOOR (Embedded in ground floor) ---
    [0.1, -0.6, 1.01],  // 28
    [0.5, -0.6, 1.01],  // 29
    [0.5,  0.0, 1.01],  // 30
    [0.1,  0.0, 1.01],  // 31

    // --- GLASS COLUMN AND WINDOW BLOCKS ON GROUND FLOOR ---
    [-0.8, -0.6,  1.01], // 32
    [-0.1, -0.6,  1.01], // 33
    [-0.1,  0.1,  1.01], // 34
    [-0.8,  0.1,  1.01], // 35
  ];

  const faces: Face[] = [
    // Base Slate
    { indices: [24, 25, 26, 27], type: 'ground', tag: 'Landscape Podium' },

    // Ground floor walls
    { indices: [0, 4, 7, 3], type: 'wall', tag: 'Main Exterior Facade' }, // Left wall
    { indices: [1, 2, 6, 5], type: 'wall', tag: 'Main Exterior Facade' }, // Right wall
    { indices: [0, 1, 2, 3], type: 'wall', tag: 'Main Exterior Facade' }, // Back wall
    { indices: [4, 5, 6, 7], type: 'wall', tag: 'Main Exterior Facade' }, // Front wall

    // Second floor Cantilever blocks
    { indices: [8, 12, 15, 11], type: 'accent', tag: 'Upper Cantilever Module' }, // Left wall
    { indices: [9, 10, 14, 13], type: 'accent', tag: 'Upper Cantilever Module' }, // Right wall
    { indices: [8, 9, 10, 11], type: 'accent', tag: 'Upper Cantilever Module' }, // Back wall
    { indices: [12, 13, 14, 15], type: 'accent', tag: 'Upper Cantilever Module' }, // Front wall

    // Roof panels
    { indices: [16, 17, 21, 20], type: 'roof', tag: 'Solar Slab Overhang' },
    { indices: [18, 19, 23, 22], type: 'roof', tag: 'Solar Slab Overhang' },
    { indices: [16, 17, 18, 19], type: 'roof', tag: 'Solar Slab Overhang' },
    { indices: [20, 21, 22, 23], type: 'roof', tag: 'Solar Slab Overhang' },

    // Decorative Front Glass Frame Window
    { indices: [32, 33, 34, 35], type: 'glass', tag: 'Ground Glazed Facade' },

    // Core Luxury Wood Door
    { indices: [28, 29, 30, 31], type: 'door', tag: 'Bespoke Walnut Entrance' }
  ];

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 350)
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Projection math & Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const dpi = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpi;
    canvas.height = dimensions.height * dpi;
    ctx.scale(dpi, dpi);

    // Canvas background
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Coordinate conversion formulas matching rotation X & Y (Euler Angles)
    const radX = (angleX * Math.PI) / 180;
    const radY = (angleY * Math.PI) / 180;

    const rotatedVertices: [number, number, number][] = vertices.map(([x, y, z]) => {
      // 1. Rotate Y-Axis
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // 2. Rotate X-Axis (Tilt)
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      return [x1, y2, z2]; // [x', y', depth]
    });

    // Project to Screen Space
    const scale = Math.min(dimensions.width, dimensions.height) * 0.28;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height * 0.52;

    const screenPoints = rotatedVertices.map(([rx, ry, rz]) => {
      // Simple perspective foreshortening
      const fovFactor = 1 / (1 + rz * 0.12);
      return {
        x: centerX + rx * scale * fovFactor,
        y: centerY - ry * scale * fovFactor,
        depth: rz
      };
    });

    // Calculate face parameters for sorting
    interface RenderableFace {
      face: Face;
      points: { x: number; y: number }[];
      avgDepth: number;
      isHovered: boolean;
    }

    const renderableFaces: RenderableFace[] = faces.map((face) => {
      const facePoints = face.indices.map(i => screenPoints[i]);
      // Average depth for Painter's algorithm sorting
      const avgDepth = facePoints.reduce((sum, pt) => sum + pt.depth, 0) / facePoints.length;
      return {
        face,
        points: facePoints.map(pt => ({ x: pt.x, y: pt.y })),
        avgDepth,
        isHovered: false
      };
    });

    // Sort by depth descending (Painter's algorithm: draw back-to-front)
    renderableFaces.sort((a, b) => b.avgDepth - a.avgDepth);

    // Render each face
    renderableFaces.forEach(({ face, points }) => {
      if (points.length < 3) return;

      // Lighting normal calculations (using simple cross product of two edge vectors in screen space or flat depth)
      // We will do simple directional lighting based on depth
      const baseLighting = 0.85;
      const depthLight = face.type === 'ground' ? 0.95 : Math.max(0.4, Math.min(1.0, 0.7 + (points[0].x - centerX) / dimensions.width * 0.4));

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();

      // Style determination
      let brushColor = '#27272a';
      let strokeStyle = 'rgba(255, 255, 255, 0.12)';
      let glowSelected = false;

      switch (face.type) {
        case 'ground':
          brushColor = '#0f172a'; // Luxury obsidian basalt podium
          strokeStyle = 'rgba(212, 175, 55, 0.1)';
          break;
        case 'wall':
          brushColor = wallColor;
          glowSelected = selectedPart === 'wall';
          break;
        case 'accent':
          brushColor = accentColor;
          glowSelected = selectedPart === 'accent';
          break;
        case 'roof':
          brushColor = '#1e1b4b'; // Sleek titanium deep blue roof
          glowSelected = selectedPart === 'roof';
          break;
        case 'glass':
          // Soft luxury reflective transparent turquoise with gold edges
          brushColor = 'rgba(16, 185, 129, 0.25)';
          strokeStyle = 'rgba(212, 175, 55, 0.4)';
          break;
        case 'door':
          brushColor = '#854d0e'; // Rich warm mahogany/walnut wood front door
          strokeStyle = '#d4af37';
          glowSelected = selectedPart === 'door';
          break;
      }

      ctx.fillStyle = brushColor;
      ctx.fill();

      // Apply light gradient overlay for realistic 3D volume
      const gradient = ctx.createLinearGradient(centerX - scale, centerY - scale, centerX + scale, centerY + scale);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${glowSelected ? 0.28 : 0.12})`);
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw outlines
      ctx.lineWidth = glowSelected ? 2.5 : 1.2;
      ctx.strokeStyle = glowSelected ? '#d4af37' : strokeStyle; // Golden highlight for current part
      ctx.stroke();

      // For interactive door / main exterior walls, draw luxury grid mesh textures if selected
      if (face.type === 'door') {
        // Luxury premium brass handles
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        const handleX = (points[0].x + points[1].x) / 2 + 3;
        const handleY = (points[0].y + points[3].y) / 2;
        ctx.arc(handleX, handleY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw ambient grid dust (Tesla-style minimal dashboard overlay)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
    ctx.lineWidth = 1;
    for (let r = 0; r < dimensions.height; r += 40) {
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(dimensions.width, r);
      ctx.stroke();
    }

    // Interactive compass element in the corner
    ctx.save();
    ctx.translate(dimensions.width - 50, dimensions.height - 50);
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();
    // Needle
    ctx.rotate(-radY);
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(5, 0);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fillStyle = '#d4af37'; // North indicator Gold style
    ctx.fill();
    ctx.restore();

  }, [angleX, angleY, dimensions, wallColor, accentColor, selectedPart]);

  // Touch and mouse hand gesture handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = {
      x: clientX,
      y: clientY,
      angleY: angleY,
      angleX: angleX
    };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    
    // Slow down rotation to keep control comfortable
    setAngleY(dragStart.current.angleY + deltaX * 0.65);
    setAngleX(Math.max(-45, Math.min(5, dragStart.current.angleX - deltaY * 0.45))); // clamp tilt
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[380px] bg-gradient-to-b from-[#0c0c0e] to-[#141416] rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center cursor-grab active:cursor-grabbing group select-none"
      id="house-3d-visualizer"
    >
      {/* Absolute Overlays for premium style */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 pointer-events-none">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#d4af37] uppercase">Interactive 3D Architectural CAD</span>
        <h4 className="text-sm font-semibold text-white tracking-tight">Luxury Villa Render (360° Rotatable)</h4>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="flex bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-1 gap-1 text-[11px] font-mono select-none">
          <button 
            id="part-select-wall"
            onClick={() => onSelectPart?.('wall')}
            className={`px-2 py-1 rounded transition-colors ${selectedPart === 'wall' ? 'bg-[#d4af37] text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
          >
            Walls
          </button>
          <button 
            id="part-select-accent"
            onClick={() => onSelectPart?.('accent')}
            className={`px-2 py-1 rounded transition-colors ${selectedPart === 'accent' ? 'bg-[#d4af37] text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
          >
            Cantilever
          </button>
          <button 
            id="part-select-door"
            onClick={() => onSelectPart?.('door')}
            className={`px-2 py-1 rounded transition-colors ${selectedPart === 'door' ? 'bg-[#d4af37] text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}
          >
            Wood Door
          </button>
        </div>
      </div>

      {/* Manual Rotator Sliders */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 bg-black/45 backdrop-blur-sm border border-white/5 py-2 px-3 rounded-xl gap-4">
        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse"></span>
          SWIPE & ROTATE MODEL
        </span>
        <div className="flex items-center gap-3 w-[60%] justify-end">
          <span className="text-[10px] text-zinc-500 font-mono">ANGLE_Y: {Math.round(angleY)}°</span>
          <input 
            type="range"
            min="-180"
            max="180"
            value={Math.round(angleY)}
            onChange={(e) => setAngleY(Number(e.target.value))}
            className="w-full max-w-[124px] accent-[#d4af37] h-1 bg-zinc-800 rounded-md cursor-pointer"
            id="house-angle-slider"
          />
        </div>
      </div>

      {/* Core Rotating Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => {
          if (e.touches[0]) handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleDragEnd}
      />
    </div>
  );
}
