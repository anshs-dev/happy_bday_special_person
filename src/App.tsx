import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  vx: number;
  vy: number;
  brightness: number;
  twinkle: number;
  size: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface FloatingElement {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  type: 'heart' | 'sparkle' | 'star';
  color: string;
  alpha: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [stars, setStars] = useState<Star[]>([]);
  const [textStars, setTextStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showMessage, setShowMessage] = useState(false);

  // Generate heart shape coordinates
  const generateHeartShape = (centerX: number, centerY: number, scale: number = 1) => {
    const points: { x: number; y: number }[] = [];
    const numPoints = 1200;
    
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * 2 * Math.PI;
      
      const x = 16 * Math.sin(t) * Math.sin(t) * Math.sin(t);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      
      const offsetX = (Math.random() - 0.5) * 3;
      const offsetY = (Math.random() - 0.5) * 3;
      
      points.push({
        x: centerX + (x * scale) + offsetX,
        y: centerY + (y * scale) + offsetY
      });
    }
    return points;
  };

  // Generate text shape coordinates
  const generateTextShape = (text: string, centerX: number, centerY: number, fontSize: number = 60) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    canvas.width = 800;
    canvas.height = 200;
    
    ctx.font = `bold ${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize / 3);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const points: { x: number; y: number }[] = [];
    
    for (let y = 0; y < canvas.height; y += 3) {
      for (let x = 0; x < canvas.width; x += 3) {
        const index = (y * canvas.width + x) * 4;
        const alpha = imageData.data[index + 3];
        
        if (alpha > 128) {
          const offsetX = (Math.random() - 0.5) * 2;
          const offsetY = (Math.random() - 0.5) * 2;
          
          points.push({
            x: centerX + (x - canvas.width / 2) + offsetX,
            y: centerY + (y - canvas.height / 2) + offsetY
          });
        }
      }
    }
    
    return points;
  };

  // Generate floating elements
  const generateFloatingElements = () => {
    const elements: FloatingElement[] = [];
    const types: ('heart' | 'sparkle' | 'star')[] = ['heart', 'sparkle', 'star'];
    const colors = ['#ff69b4', '#ffd700', '#ff1493', '#00ffff', '#ff6347'];
    
    for (let i = 0; i < 50; i++) {
      elements.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        size: 8 + Math.random() * 12,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.4
      });
    }
    
    return elements;
  };

  // Initialize dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize stars and elements when dimensions change
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2 - 50;
      const scale = Math.min(dimensions.width, dimensions.height) / 50;
      
      // Heart stars
      const heartPoints = generateHeartShape(centerX, centerY, scale);
      const heartColors = ['#ff69b4', '#ff1493', '#ffd700', '#ffffff', '#ff6347'];
      
      const newHeartStars: Star[] = heartPoints.map((point) => ({
        x: point.x,
        y: point.y,
        originalX: point.x,
        originalY: point.y,
        vx: 0,
        vy: 0,
        brightness: 0.6 + Math.random() * 0.4,
        twinkle: Math.random() * Math.PI * 2,
        size: 0.8 + Math.random() * 0.4,
        color: heartColors[Math.floor(Math.random() * heartColors.length)]
      }));
      
      // Text stars
      const textY = centerY + scale * 25 + 80;
      const textPoints = generateTextShape('Happy Birthday Anshu', centerX, textY, 45);
      const textColors = ['#ffd700', '#ff69b4', '#00ffff', '#ff1493', '#ffffff'];
      
      const newTextStars: Star[] = textPoints.map((point) => ({
        x: point.x,
        y: point.y,
        originalX: point.x,
        originalY: point.y,
        vx: 0,
        vy: 0,
        brightness: 0.7 + Math.random() * 0.3,
        twinkle: Math.random() * Math.PI * 2,
        size: 0.6 + Math.random() * 0.3,
        color: textColors[Math.floor(Math.random() * textColors.length)]
      }));
      
      setStars(newHeartStars);
      setTextStars(newTextStars);
      setFloatingElements(generateFloatingElements());
      
      // Show birthday message after a delay
      setTimeout(() => setShowMessage(true), 1000);
    }
  }, [dimensions]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2 - 50;
    
    const dx = centerX - clickX;
    const dy = centerY - clickY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const speed = 4;
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;
    
    const newShootingStar: ShootingStar = {
      x: clickX,
      y: clickY,
      vx,
      vy,
      life: 1,
      maxLife: 1,
      trail: []
    };
    
    setShootingStars(prev => [...prev, newShootingStar]);
  }, [dimensions]);

  // Draw floating element
  const drawFloatingElement = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
    ctx.save();
    ctx.translate(element.x, element.y);
    ctx.rotate(element.rotation);
    ctx.globalAlpha = element.alpha;
    ctx.fillStyle = element.color;
    ctx.strokeStyle = element.color;
    ctx.lineWidth = 2;

    switch (element.type) {
      case 'heart':
        ctx.beginPath();
        ctx.moveTo(0, element.size * 0.3);
        ctx.bezierCurveTo(-element.size * 0.5, -element.size * 0.2, -element.size, -element.size * 0.2, -element.size * 0.5, element.size * 0.1);
        ctx.bezierCurveTo(-element.size * 0.5, element.size * 0.3, 0, element.size * 0.6, 0, element.size);
        ctx.bezierCurveTo(0, element.size * 0.6, element.size * 0.5, element.size * 0.3, element.size * 0.5, element.size * 0.1);
        ctx.bezierCurveTo(element.size, -element.size * 0.2, element.size * 0.5, -element.size * 0.2, 0, element.size * 0.3);
        ctx.fill();
        break;
      case 'sparkle':
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(0, -element.size);
          ctx.lineTo(0, element.size);
          ctx.stroke();
          ctx.rotate(Math.PI / 4);
        }
        break;
      case 'star':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * element.size;
          const y = Math.sin(angle) * element.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          
          const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
          const innerX = Math.cos(innerAngle) * element.size * 0.4;
          const innerY = Math.sin(innerAngle) * element.size * 0.4;
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        break;
    }
    ctx.restore();
  };

  // Animation loop with delta time for consistent performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (stars.length === 0 && textStars.length === 0)) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Normalize delta time to 60fps (16.67ms per frame)
      const normalizedDelta = Math.min(deltaTime / 16.67, 2);
      
      // Create gradient background
      const gradient = ctx.createRadialGradient(
        dimensions.width / 2, dimensions.height / 2, 0,
        dimensions.width / 2, dimensions.height / 2, Math.max(dimensions.width, dimensions.height)
      );
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.5, '#000000');
      gradient.addColorStop(1, '#1a0a1a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw floating elements
      setFloatingElements(prev => prev.map(element => {
        element.x += element.vx * normalizedDelta;
        element.y += element.vy * normalizedDelta;
        element.rotation += element.rotationSpeed * normalizedDelta;
        
        // Wrap around screen
        if (element.x < -50) element.x = dimensions.width + 50;
        if (element.x > dimensions.width + 50) element.x = -50;
        if (element.y < -50) element.y = dimensions.height + 50;
        if (element.y > dimensions.height + 50) element.y = -50;
        
        drawFloatingElement(ctx, element);
        return element;
      }));
      
      // Update and draw all stars (heart + text) with consistent timing
      const allStars = [...stars, ...textStars];
      allStars.forEach(star => {
        const dx = star.originalX - star.x;
        const dy = star.originalY - star.y;
        const springForce = 0.012 * normalizedDelta; // Increased for more consistent response
        const damping = Math.pow(0.92, normalizedDelta); // Frame-rate independent damping
        
        star.vx += dx * springForce;
        star.vy += dy * springForce;
        star.vx *= damping;
        star.vy *= damping;
        
        star.x += star.vx * normalizedDelta;
        star.y += star.vy * normalizedDelta;
        
        star.twinkle += 0.05 * normalizedDelta;
        
        const twinkleAlpha = (Math.sin(star.twinkle) + 1) * 0.5;
        const alpha = star.brightness * (0.5 + twinkleAlpha * 0.5);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      
      // Update and draw shooting stars with consistent timing
      setShootingStars(prevShootingStars => {
        return prevShootingStars.filter(shootingStar => {
          shootingStar.trail.unshift({ 
            x: shootingStar.x, 
            y: shootingStar.y, 
            alpha: 1 
          });
          
          if (shootingStar.trail.length > 30) {
            shootingStar.trail.pop();
          }
          
          shootingStar.trail.forEach((point, i) => {
            point.alpha = 1 - (i / shootingStar.trail.length);
          });
          
          shootingStar.x += shootingStar.vx * normalizedDelta;
          shootingStar.y += shootingStar.vy * normalizedDelta;
          
          // Check collision with all stars
          allStars.forEach(star => {
            const dx = star.x - shootingStar.x;
            const dy = star.y - shootingStar.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 35) {
              const force = Math.max(0, 35 - distance) * 0.2 * normalizedDelta;
              const angle = Math.atan2(dy, dx);
              star.vx += Math.cos(angle) * force;
              star.vy += Math.sin(angle) * force;
            }
          });
          
          // Draw BLUE GLOWY shooting star trail
          ctx.save();
          shootingStar.trail.forEach((point, i) => {
            const trailSize = Math.max(0.5, (shootingStar.trail.length - i) / 6);
            const trailAlpha = point.alpha * 0.8;
            
            // Outer blue glow for trail
            ctx.globalAlpha = trailAlpha * 0.4;
            ctx.fillStyle = '#00bfff';
            ctx.shadowColor = '#00bfff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(point.x, point.y, trailSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner bright blue trail
            ctx.globalAlpha = trailAlpha * 0.7;
            ctx.fillStyle = '#0080ff';
            ctx.shadowColor = '#0080ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Core bright trail
            ctx.globalAlpha = trailAlpha;
            ctx.fillStyle = '#40a0ff';
            ctx.shadowColor = '#40a0ff';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(point.x, point.y, trailSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
          
          // Draw shooting star with BRIGHT BLUE effect
          ctx.save();
          
          // Outer bright blue glow
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = '#00bfff';
          ctx.shadowColor = '#00bfff';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(shootingStar.x, shootingStar.y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Middle electric blue core
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#0080ff';
          ctx.shadowColor = '#0080ff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(shootingStar.x, shootingStar.y, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // Inner bright blue center
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#40a0ff';
          ctx.shadowColor = '#40a0ff';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(shootingStar.x, shootingStar.y, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Tiny white core for contrast
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 2;
          ctx.beginPath();
          ctx.arc(shootingStar.x, shootingStar.y, 1, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
          
          return shootingStar.x > -300 && shootingStar.x < canvas.width + 300 &&
                 shootingStar.y > -300 && shootingStar.y < canvas.height + 300;
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    lastTimeRef.current = performance.now();
    animate(lastTimeRef.current);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [stars, textStars, dimensions]);

  return (
    <div className="w-full h-screen overflow-hidden bg-black cursor-crosshair relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        className="block"
      />
      
      {/* Birthday Message Overlay - Moved to BOTTOM */}
      <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none transition-opacity duration-2000 ${showMessage ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center">
          <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent mb-2 animate-pulse">
            🎉 Happy Birthday! 🎉
          </div>
          <div className="text-lg md:text-2xl text-white font-light opacity-90">
            Anshu, Only flowers, No Flaws ✨
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 text-white text-lg font-light opacity-80 pointer-events-none select-none">
        Click anywhere to send wishes to the birthday queen! 💫
      </div>
      
      {/* Birthday Wishes Corner */}
      <div className="absolute bottom-4 right-4 text-right text-white opacity-70 pointer-events-none select-none">
        <div className="text-lg font-light">Made with 💖 for the most amazing person</div>
        <div className="text-sm mt-1">May all your dreams come true! 🌟</div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 text-4xl animate-bounce pointer-events-none">
        🎂
      </div>
      <div className="absolute bottom-4 left-4 text-3xl animate-pulse pointer-events-none">
        🎈
      </div>
      <div className="absolute top-1/4 left-8 text-2xl animate-spin pointer-events-none" style={{animationDuration: '3s'}}>
        🎁
      </div>
      <div className="absolute top-1/3 right-8 text-2xl animate-bounce pointer-events-none" style={{animationDelay: '1s'}}>
        🌟
      </div>
    </div>
  );
}

export default App;