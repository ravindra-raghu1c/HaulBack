import React, { useEffect, useRef, useState } from 'react';
import { Truck, Sun, Moon, Zap, Sliders, Eye, Compass, Activity, Image as ImageIcon } from 'lucide-react';
import soundFx from '../../services/soundFx.js';

/**
 * High-Performance Animated Highway Backdrop
 * Renders an interactive 3D perspective highway with moving trucks, light trails, and telemetry nodes.
 */
export default function HighwayBackdrop({ mode = 'night', intensity = 'vivid', showControls = false, onModeChange }) {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(mode); // 'night', 'day', 'cyber', 'sunset'
  const [trafficDensity, setTrafficDensity] = useState('medium'); // 'low', 'medium', 'high'
  const [truckSpeed, setTruckSpeed] = useState(1);

  useEffect(() => {
    setActiveTheme(mode);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Highway Geometry Config
    const horizonY = height * 0.42;
    const roadBottomWidth = width * 0.85;
    const roadTopWidth = width * 0.08;
    const roadCenterX = width * 0.5;

    // Indian Highway Trucks config
    const count = trafficDensity === 'high' ? 12 : trafficDensity === 'medium' ? 8 : 5;
    
    // Iconic Indian Truck Art color themes
    const indianTruckPalettes = [
      { cab: '#f59e0b', body: '#0284c7', crown: '#ef4444', banner: 'HORN OK PLEASE', art: '#fde047' }, // Classic Yellow-Blue-Red
      { cab: '#16a34a', body: '#eab308', crown: '#ea580c', banner: 'BLOW HORN', art: '#ffffff' }, // Parrot Green-Yellow
      { cab: '#dc2626', body: '#f59e0b', crown: '#2563eb', banner: 'USE DIPPER AT NIGHT', art: '#fef08a' }, // Crimson-Mustard
      { cab: '#0284c7', body: '#16a34a', crown: '#f59e0b', banner: 'GOODS CARRIER', art: '#f43f5e' }, // Peacock Blue-Green
      { cab: '#ea580c', body: '#0f172a', crown: '#eab308', banner: 'NATIONAL PERMIT', art: '#38bdf8' }  // Saffron-Midnight
    ];

    const trucks = Array.from({ length: count }, (_, i) => {
      const isOutbound = i % 2 === 0; // True: going away (taillights & HORN OK PLEASE), False: coming toward (headlights & Taj crown)
      const palette = indianTruckPalettes[i % indianTruckPalettes.length];
      const truckType = i % 3 === 0 ? 'wooden_dala' : i % 3 === 1 ? 'container' : 'multi_axle_tarpaulin';

      return {
        id: i,
        z: Math.random(), // 0 (horizon) to 1 (near bottom)
        speed: (0.0015 + Math.random() * 0.0022) * (isOutbound ? 1 : -1) * truckSpeed,
        lane: isOutbound ? (Math.random() > 0.5 ? 0.65 : 0.85) : (Math.random() > 0.5 ? 0.15 : 0.35),
        type: truckType,
        palette,
        color: palette.cab,
        bannerText: palette.banner,
        hasCrown: true,
        axles: truckType === 'multi_axle_tarpaulin' ? 5 : 4,
        pulse: Math.random() * Math.PI,
        isOutbound
      };
    });

    // Telemetry node particles floating in ambient air
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * horizonY,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.5 + 0.2
    }));

    let dashOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // --- 1. Sky & Horizon Gradient ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 80);
      if (activeTheme === 'night') {
        skyGrad.addColorStop(0, '#060a12');
        skyGrad.addColorStop(0.6, '#0f172a');
        skyGrad.addColorStop(1, '#1e293b');
      } else if (activeTheme === 'sunset') {
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.4, '#431407');
        skyGrad.addColorStop(0.75, '#c2410c');
        skyGrad.addColorStop(1, '#ea580c');
      } else if (activeTheme === 'cyber') {
        skyGrad.addColorStop(0, '#030712');
        skyGrad.addColorStop(0.5, '#0b132b');
        skyGrad.addColorStop(1, '#1c1917');
      } else {
        // Daylight clean
        skyGrad.addColorStop(0, '#e0f2fe');
        skyGrad.addColorStop(0.6, '#bae6fd');
        skyGrad.addColorStop(1, '#f1f5f9');
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Mountain / Distant Skyline Silhouette
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 40) {
        const h = Math.sin(x * 0.005) * 25 + Math.cos(x * 0.015) * 15 + 10;
        ctx.lineTo(x, horizonY - h);
      }
      ctx.lineTo(width, horizonY);
      ctx.closePath();
      ctx.fillStyle = activeTheme === 'day' ? '#cbd5e1' : '#090d16';
      ctx.fill();

      // Ambient Horizon Glow
      const glowGrad = ctx.createRadialGradient(roadCenterX, horizonY, 10, roadCenterX, horizonY, width * 0.5);
      glowGrad.addColorStop(0, activeTheme === 'sunset' ? 'rgba(251, 146, 60, 0.4)' : activeTheme === 'night' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(14, 165, 233, 0.2)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, horizonY - 100, width, 180);

      // --- 2. Ground & Highway Terrain ---
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      groundGrad.addColorStop(0, activeTheme === 'day' ? '#f1f5f9' : '#090e17');
      groundGrad.addColorStop(1, activeTheme === 'day' ? '#e2e8f0' : '#030712');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // --- 3. Perspective Highway Road Surface ---
      const roadTopLeft = roadCenterX - roadTopWidth / 2;
      const roadTopRight = roadCenterX + roadTopWidth / 2;
      const roadBottomLeft = roadCenterX - roadBottomWidth / 2;
      const roadBottomRight = roadCenterX + roadBottomWidth / 2;

      // Road base asphalt
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.lineTo(roadBottomLeft, height);
      ctx.closePath();
      const asphaltGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      asphaltGrad.addColorStop(0, activeTheme === 'day' ? '#64748b' : '#1e293b');
      asphaltGrad.addColorStop(1, activeTheme === 'day' ? '#334155' : '#0f172a');
      ctx.fillStyle = asphaltGrad;
      ctx.fill();

      // Road Shoulders & Guardrails (Glowing Amber / Cyan)
      ctx.strokeStyle = activeTheme === 'day' ? '#94a3b8' : activeTheme === 'cyber' ? '#38bdf8' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, horizonY);
      ctx.lineTo(roadBottomLeft, height);
      ctx.moveTo(roadTopRight, horizonY);
      ctx.lineTo(roadBottomRight, height);
      ctx.stroke();

      // Central Highway Divider Barrier
      const dividerTop = roadCenterX;
      const dividerBottom = roadCenterX;
      ctx.strokeStyle = activeTheme === 'day' ? '#cbd5e1' : '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(dividerTop, horizonY);
      ctx.lineTo(dividerBottom, height);
      ctx.stroke();

      // Moving Dashed Lane Markers
      dashOffset = (dashOffset + 0.008 * truckSpeed) % 1;
      const laneFractions = [0.25, 0.75]; // Left and right carriage lanes

      laneFractions.forEach((lf) => {
        const laneTopX = roadTopLeft + (roadTopRight - roadTopLeft) * lf;
        const laneBottomX = roadBottomLeft + (roadBottomRight - roadBottomLeft) * lf;

        ctx.strokeStyle = activeTheme === 'day' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 2;

        const segments = 16;
        for (let s = 0; s < segments; s++) {
          const t1 = ((s / segments) + dashOffset) % 1;
          const t2 = Math.min(1, t1 + 0.03);

          if (t1 < t2) {
            // Apply perspective non-linear curve
            const p1 = Math.pow(t1, 2.2);
            const p2 = Math.pow(t2, 2.2);

            const x1 = laneTopX + (laneBottomX - laneTopX) * p1;
            const y1 = horizonY + (height - horizonY) * p1;
            const x2 = laneTopX + (laneBottomX - laneTopX) * p2;
            const y2 = horizonY + (height - horizonY) * p2;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      });

      // --- 4. Render Realistic Moving Indian Commercial Trucks & Light Beams ---
      trucks.forEach((truck) => {
        // Move truck
        truck.z += truck.speed;
        if (truck.z > 1) truck.z = 0;
        if (truck.z < 0) truck.z = 1;

        const p = Math.pow(truck.z, 2.3); // perspective curve
        const roadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * p;
        const roadL = roadCenterX - roadW / 2;
        const truckX = roadL + roadW * truck.lane;
        const truckY = horizonY + (height - horizonY) * p;

        const scale = Math.max(0.13, p);
        const truckWidth = 56 * scale;
        const truckLength = 118 * scale;
        const isOutbound = truck.isOutbound; // Going away from camera (see rear tailgate) vs oncoming (see front cab & Taj)
        const palette = truck.palette || { cab: '#f59e0b', body: '#0284c7', crown: '#ef4444', banner: 'HORN OK PLEASE', art: '#fde047' };

        // 1. Vehicle Drop Shadow on Asphalt
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(truckX, truckY + truckLength * 0.46, truckWidth * 0.78, truckLength * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Volumetric Headlights or Taillights
        if (activeTheme !== 'day') {
          if (isOutbound) {
            // Outbound: Dual Red LED Taillight Trails & Asphalt Glow
            const trailLen = 90 * scale;
            const gradTrail = ctx.createLinearGradient(truckX, truckY, truckX, truckY - trailLen);
            gradTrail.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
            gradTrail.addColorStop(0.3, 'rgba(239, 68, 68, 0.45)');
            gradTrail.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradTrail;
            ctx.lineWidth = Math.max(2, 4.5 * scale);
            ctx.beginPath();
            ctx.moveTo(truckX - truckWidth * 0.4, truckY + truckLength * 0.42);
            ctx.lineTo(truckX - truckWidth * 0.4, truckY - trailLen);
            ctx.moveTo(truckX + truckWidth * 0.4, truckY + truckLength * 0.42);
            ctx.lineTo(truckX + truckWidth * 0.4, truckY - trailLen);
            ctx.stroke();

            // Ground Red Reflection Glow
            const redGlow = ctx.createRadialGradient(truckX, truckY + truckLength * 0.4, 2, truckX, truckY + truckLength * 0.4, truckWidth * 0.9);
            redGlow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
            redGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = redGlow;
            ctx.fillRect(truckX - truckWidth, truckY, truckWidth * 2, truckLength * 0.8);
          } else {
            // Inbound: Bright Volumetric High-Beam Cones onto Road
            const beamLen = 170 * scale;
            const gradBeam = ctx.createLinearGradient(truckX, truckY + truckLength * 0.4, truckX, truckY + truckLength * 0.4 + beamLen);
            gradBeam.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
            gradBeam.addColorStop(0.2, 'rgba(254, 240, 138, 0.7)');
            gradBeam.addColorStop(0.6, 'rgba(245, 158, 11, 0.3)');
            gradBeam.addColorStop(1, 'transparent');

            ctx.fillStyle = gradBeam;
            ctx.beginPath();
            ctx.moveTo(truckX - truckWidth * 0.35, truckY + truckLength * 0.4);
            ctx.lineTo(truckX - truckWidth * 1.4, truckY + truckLength * 0.4 + beamLen);
            ctx.lineTo(truckX + truckWidth * 1.4, truckY + truckLength * 0.4 + beamLen);
            ctx.lineTo(truckX + truckWidth * 0.35, truckY + truckLength * 0.4);
            ctx.closePath();
            ctx.fill();
          }
        }

        // 3. Heavy Multi-Axle Indian Truck Wheels (Tata / Ashok Leyland 10-14 Wheeler)
        const wheelW = 6 * scale;
        const wheelH = 16 * scale;
        const wheelPositions = [-0.38, 0.05, 0.24, 0.42]; // 4 Axles

        wheelPositions.forEach((posRatio) => {
          const wheelY = truckY + truckLength * posRatio;
          // Outer black rubber tire
          ctx.fillStyle = '#090d16';
          ctx.fillRect(truckX - truckWidth / 2 - wheelW * 0.6, wheelY - wheelH / 2, wheelW, wheelH);
          ctx.fillRect(truckX + truckWidth / 2 - wheelW * 0.4, wheelY - wheelH / 2, wheelW, wheelH);

          // Inner yellow/silver chrome wheel hub rim
          ctx.fillStyle = '#eab308';
          ctx.fillRect(truckX - truckWidth / 2 - wheelW * 0.3, wheelY - wheelH * 0.25, wheelW * 0.4, wheelH * 0.5);
          ctx.fillRect(truckX + truckWidth / 2 - wheelW * 0.1, wheelY - wheelH * 0.25, wheelW * 0.4, wheelH * 0.5);
        });

        // 4. Indian Wooden High-Sided Cargo Body ("Dala" / Container / Tarpaulin Load)
        const bodyLength = truckLength * 0.7;
        const bodyY = isOutbound ? truckY - truckLength * 0.1 : truckY - truckLength * 0.14;
        const bodyWidth = truckWidth * 0.94;

        // Base Dala Body Gradient
        const bodyGrad = ctx.createLinearGradient(truckX - bodyWidth / 2, 0, truckX + bodyWidth / 2, 0);
        bodyGrad.addColorStop(0, '#0f172a');
        bodyGrad.addColorStop(0.25, palette.body);
        bodyGrad.addColorStop(0.75, palette.body);
        bodyGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = activeTheme === 'day' ? '#1e293b' : '#f8fafc';
        ctx.lineWidth = Math.max(0.8, 1.3 * scale);

        // Body rectangle
        ctx.beginPath();
        ctx.roundRect(truckX - bodyWidth / 2, bodyY - bodyLength / 2, bodyWidth, bodyLength, Math.max(1.5, 3 * scale));
        ctx.fill();
        ctx.stroke();

        // Authentic Indian Truck Painted Side Stripes & Wooden Battens
        const stripeCount = 5;
        const stripeColors = ['#f59e0b', '#dc2626', '#16a34a', '#0284c7', '#ffffff'];
        for (let s = 0; s < stripeCount; s++) {
          const sy = (bodyY - bodyLength / 2) + (bodyLength / (stripeCount + 1)) * (s + 1);
          ctx.strokeStyle = stripeColors[s % stripeColors.length];
          ctx.lineWidth = Math.max(1, 1.8 * scale);
          ctx.beginPath();
          ctx.moveTo(truckX - bodyWidth * 0.48, sy);
          ctx.lineTo(truckX + bodyWidth * 0.48, sy);
          ctx.stroke();
        }

        // Tarpaulin (Tirpal) Blue Canvas Cover & Yellow Ropes if loaded type
        if (truck.type === 'multi_axle_tarpaulin' || truck.type === 'wooden_dala') {
          ctx.fillStyle = truck.type === 'multi_axle_tarpaulin' ? 'rgba(30, 64, 175, 0.9)' : 'rgba(202, 138, 4, 0.85)';
          ctx.beginPath();
          ctx.roundRect(truckX - bodyWidth * 0.42, bodyY - bodyLength * 0.45, bodyWidth * 0.84, bodyLength * 0.88, Math.max(2, 4 * scale));
          ctx.fill();

          // Crisscross Yellow Tarpaulin Ropes
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = Math.max(0.6, 1.2 * scale);
          ctx.beginPath();
          ctx.moveTo(truckX - bodyWidth * 0.4, bodyY - bodyLength * 0.4);
          ctx.lineTo(truckX + bodyWidth * 0.4, bodyY + bodyLength * 0.4);
          ctx.moveTo(truckX + bodyWidth * 0.4, bodyY - bodyLength * 0.4);
          ctx.lineTo(truckX - bodyWidth * 0.4, bodyY + bodyLength * 0.4);
          ctx.stroke();
        }

        // 5. Traditional Indian Truck Cabin & Iconic Ornamental Crown ("Taj")
        const cabLength = truckLength * 0.28;
        const cabY = isOutbound ? truckY - truckLength * 0.42 : truckY + truckLength * 0.32;
        const cabWidth = truckWidth * 0.86;

        // Cabin body
        const cabGrad = ctx.createLinearGradient(truckX - cabWidth / 2, 0, truckX + cabWidth / 2, 0);
        cabGrad.addColorStop(0, '#0f172a');
        cabGrad.addColorStop(0.3, palette.cab);
        cabGrad.addColorStop(0.7, palette.cab);
        cabGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = cabGrad;
        ctx.beginPath();
        ctx.roundRect(truckX - cabWidth / 2, cabY - cabLength / 2, cabWidth, cabLength, Math.max(2, 4 * scale));
        ctx.fill();
        ctx.stroke();

        // The Iconic "Taj" (Stepped Wooden Crown / Top Visor Structure) atop Cabin
        const tajHeight = 7 * scale;
        const tajWidth = cabWidth * 0.92;
        const tajY = isOutbound ? cabY - cabLength / 2 - tajHeight * 0.3 : cabY + cabLength / 2 - tajHeight * 0.2;

        ctx.fillStyle = palette.crown || '#ef4444';
        ctx.beginPath();
        ctx.moveTo(truckX - tajWidth / 2, tajY);
        ctx.lineTo(truckX - tajWidth * 0.3, tajY - tajHeight);
        ctx.lineTo(truckX, tajY - tajHeight * 1.3);
        ctx.lineTo(truckX + tajWidth * 0.3, tajY - tajHeight);
        ctx.lineTo(truckX + tajWidth / 2, tajY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = Math.max(0.6, 1.2 * scale);
        ctx.stroke();

        // 5 Multi-colored Indian Roof Jewel Clearance Lights (Green, Amber, Red, Cyan)
        const jewelColors = ['#10b981', '#f59e0b', '#ef4444', '#f59e0b', '#06b6d4'];
        jewelColors.forEach((jColor, idx) => {
          const jX = truckX - tajWidth * 0.36 + (tajWidth * 0.72 / 4) * idx;
          ctx.beginPath();
          ctx.arc(jX, tajY - tajHeight * 0.5, Math.max(1, 2.2 * scale), 0, Math.PI * 2);
          ctx.fillStyle = jColor;
          ctx.shadowColor = jColor;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Windshield Glass & Indian Sunvisor
        ctx.fillStyle = activeTheme === 'day' ? '#0284c7' : '#0f172a';
        ctx.beginPath();
        ctx.roundRect(truckX - cabWidth * 0.38, cabY - cabLength * 0.22, cabWidth * 0.76, cabLength * 0.44, Math.max(1, 2 * scale));
        ctx.fill();

        // Windshield Glare Reflection & Om/Ganesh Garland Trim
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(truckX - cabWidth * 0.3, cabY - cabLength * 0.18, cabWidth * 0.25, cabLength * 0.32);

        // Extended Heavy Chrome Side Mirrors with Indian Tassels
        const mirrorW = 4 * scale;
        const mirrorH = 7 * scale;
        ctx.fillStyle = '#eab308';
        ctx.fillRect(truckX - cabWidth / 2 - mirrorW * 1.3, cabY - mirrorH / 2, mirrorW, mirrorH);
        ctx.fillRect(truckX + cabWidth / 2 + mirrorW * 0.3, cabY - mirrorH / 2, mirrorW, mirrorH);

        // 6. Iconic Rear Tailgate Art (For Outbound Trucks) or Heavy Front Crash Grille (For Inbound Trucks)
        if (isOutbound) {
          const rearY = bodyY + bodyLength / 2;

          // Tailgate Wooden Decorative Art Board
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(truckX - bodyWidth * 0.46, rearY - 14 * scale, bodyWidth * 0.92, 13 * scale);

          // Iconic Central Painted Text Banner: "HORN OK PLEASE" or "BLOW HORN"
          if (scale > 0.3) {
            const bannerBgW = bodyWidth * 0.84;
            const bannerBgH = Math.max(6, 9 * scale);
            ctx.fillStyle = '#fef08a'; // Bright Yellow Banner
            ctx.beginPath();
            ctx.roundRect(truckX - bannerBgW / 2, rearY - 12.5 * scale, bannerBgW, bannerBgH, Math.max(1, 2 * scale));
            ctx.fill();

            // Text Rendering
            ctx.fillStyle = '#dc2626'; // Bold Red Indian Truck Lettering
            ctx.font = `bold ${Math.max(4, Math.floor(5.5 * scale))}px "Outfit", "Arial Black", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(truck.bannerText || 'HORN OK PLEASE', truckX, rearY - 12.5 * scale + bannerBgH / 2);
          }

          // Safety Hazard Bumper: Alternate Yellow & Black Diagonal Stripes
          const bumperH = 4.5 * scale;
          const bumperW = bodyWidth * 0.92;
          const bumperY = rearY - 2 * scale;
          
          ctx.fillStyle = '#eab308';
          ctx.fillRect(truckX - bumperW / 2, bumperY, bumperW, bumperH);
          
          // Black Diagonal Hazard Chevrons
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = Math.max(1, 2 * scale);
          const chevCount = 7;
          for (let c = 0; c < chevCount; c++) {
            const cx = truckX - bumperW / 2 + (bumperW / chevCount) * c;
            ctx.beginPath();
            ctx.moveTo(cx, bumperY + bumperH);
            ctx.lineTo(cx + 4 * scale, bumperY);
            ctx.stroke();
          }

          // Dual Iconic Indian Rubber Mudflaps ("STOP")
          const flapW = 9 * scale;
          const flapH = 8 * scale;
          const flapY = bumperY + bumperH;
          ctx.fillStyle = '#0f172a';
          // Left Mudflap
          ctx.fillRect(truckX - bodyWidth * 0.44, flapY, flapW, flapH);
          // Right Mudflap
          ctx.fillRect(truckX + bodyWidth * 0.44 - flapW, flapY, flapW, flapH);
          // White slash on mudflaps
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(0.8, 1.4 * scale);
          ctx.beginPath();
          ctx.moveTo(truckX - bodyWidth * 0.44 + 2 * scale, flapY + flapH - 2 * scale);
          ctx.lineTo(truckX - bodyWidth * 0.44 + flapW - 2 * scale, flapY + 2 * scale);
          ctx.moveTo(truckX + bodyWidth * 0.44 - flapW + 2 * scale, flapY + flapH - 2 * scale);
          ctx.lineTo(truckX + bodyWidth * 0.44 - 2 * scale, flapY + 2 * scale);
          ctx.stroke();

          // Authentic Indian Triple Taillights (Amber Indicator + Red Brake + White)
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(truckX - bodyWidth * 0.42, rearY - 7 * scale, 5 * scale, 3 * scale);
          ctx.fillRect(truckX + bodyWidth * 0.42 - 5 * scale, rearY - 7 * scale, 5 * scale, 3 * scale);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(truckX - bodyWidth * 0.42, rearY - 4 * scale, 5 * scale, 2.5 * scale);
          ctx.fillRect(truckX + bodyWidth * 0.42 - 5 * scale, rearY - 4 * scale, 5 * scale, 2.5 * scale);

          // Yellow Indian Registration Plate (e.g. HR 55 / MP 09 / MH 12)
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(truckX - 7 * scale, rearY - 6 * scale, 14 * scale, 3.5 * scale);
        } else {
          // Inbound Front Heavy Crash Bumper with Tata/Ashok Leyland Grille
          const frontY = cabY + cabLength / 2;

          // Chrome Bumper Bar
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(truckX - cabWidth * 0.46, frontY - 2 * scale, cabWidth * 0.92, 4.5 * scale);

          // Dual Round Projector Headlights
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(truckX - cabWidth * 0.32, frontY, 3.5 * scale, 0, Math.PI * 2);
          ctx.arc(truckX + cabWidth * 0.32, frontY, 3.5 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Dual Amber Fog Lamps
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(truckX - cabWidth * 0.16, frontY + 1 * scale, 2.2 * scale, 0, Math.PI * 2);
          ctx.arc(truckX + cabWidth * 0.16, frontY + 1 * scale, 2.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // "ALL INDIA PERMIT" / "A.I.P." Red Front Plate
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(truckX - 8 * scale, frontY - 6 * scale, 16 * scale, 3.5 * scale);
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(2.5, Math.floor(3 * scale))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('A.I.P.', truckX, frontY - 4.2 * scale);
        }

        // 7. Active HaulBack IoT GPS Telemetry Strobe on Truck
        ctx.beginPath();
        ctx.arc(truckX, cabY, Math.max(1.8, 3.5 * scale), 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // --- 5. Ambient Telemetry Nodes & Grid Lines ---
      particles.forEach((pt, i) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.x < 0 || pt.x > width) pt.vx *= -1;
        if (pt.y < 0 || pt.y > horizonY) pt.vy *= -1;

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const pt2 = particles[j];
          const dist = Math.hypot(pt.x - pt2.x, pt.y - pt2.y);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = activeTheme === 'day' ? 'rgba(2, 132, 199, 0.4)' : 'rgba(251, 191, 36, 0.6)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTheme, trafficDensity, truckSpeed]);

  const handleThemeChange = (newTheme) => {
    soundFx.radarPing();
    setActiveTheme(newTheme);
    if (onModeChange) onModeChange(newTheme);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* High-Performance Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover transition-opacity duration-700"
        style={{
          opacity: intensity === 'vivid' ? 0.95 : intensity === 'frosted' ? 0.65 : 0.3
        }}
      />

      {/* Frosted Vignette Overlay for UI Legibility */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          intensity === 'vivid'
            ? 'bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/60 backdrop-blur-[0.5px]'
            : intensity === 'frosted'
            ? 'bg-gradient-to-b from-white/70 via-slate-50/75 to-slate-100/90 backdrop-blur-[3px]'
            : 'bg-slate-100/90 backdrop-blur-[6px]'
        }`}
      />

      {/* Floating Interactive Controls (When enabled) */}
      {showControls && (
        <div className="absolute top-20 right-6 pointer-events-auto z-40 bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-xl space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-100">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>Highway Visualizer</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800">
              60 FPS
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleThemeChange('night')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                activeTheme === 'night' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Night</span>
            </button>
            <button
              onClick={() => handleThemeChange('sunset')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                activeTheme === 'sunset' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Sunset</span>
            </button>
            <button
              onClick={() => handleThemeChange('day')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                activeTheme === 'day' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Day</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>Speed:</span>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setTruckSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    truckSpeed === s ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
