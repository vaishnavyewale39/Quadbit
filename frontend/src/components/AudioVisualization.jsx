import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const AudioVisualization = ({ isDistress, isCallActive, analyserNode }) => {
  const mountRef = useRef(null);
  const waveCanvasRef = useRef(null);

  // 1. FLOWING MULTI-STRAND AUDIO WAVE RIBBON & BACKGROUND PARTICLE MATRIX
  useEffect(() => {
    const waveCanvas = waveCanvasRef.current;
    if (!waveCanvas) return;
    const ctx = waveCanvas.getContext('2d');
    let waveAnimId;
    let waveTime = 0;

    const handleWaveResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      waveCanvas.width = waveCanvas.clientWidth * dpr;
      waveCanvas.height = waveCanvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    handleWaveResize();
    window.addEventListener('resize', handleWaveResize);

    const freqData = analyserNode 
      ? new Uint8Array(analyserNode.frequencyBinCount) 
      : new Uint8Array(64);

    const renderWave = () => {
      waveAnimId = requestAnimationFrame(renderWave);
      waveTime += 0.014;

      const w = waveCanvas.clientWidth;
      const h = waveCanvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Real-time audio amplitude factor
      let audioAmp = 0;
      if (analyserNode && isCallActive) {
        analyserNode.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < 24; i++) sum += freqData[i];
        audioAmp = (sum / 24) / 255;
      } else {
        audioAmp = Math.sin(waveTime * 1.5) * 0.03 + 0.05;
      }

      const centerY = h * 0.48;
      const primaryRgb = isDistress ? '201, 92, 92' : '112, 180, 138';
      const brightRgb = isDistress ? '230, 110, 110' : '147, 198, 163';

      // --- LAYER A: Outer background matrix dots (faint curved digital grid on left & right) ---
      const numCols = 16;
      for (let c = 0; c < numCols; c++) {
        // Left side dots
        const lx = 20 + c * 10;
        for (let r = 0; r < 14; r++) {
          const ly = centerY - 120 + r * 18 + Math.sin(c * 0.4 + waveTime) * 6;
          const distFromCenter = Math.abs(c - 8) / 8;
          ctx.fillStyle = `rgba(${primaryRgb}, ${(0.04 + (1 - distFromCenter) * 0.08)})`;
          ctx.beginPath();
          ctx.arc(lx, ly, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Right side dots
        const rx = w - 180 + c * 10;
        for (let r = 0; r < 14; r++) {
          const ry = centerY - 120 + r * 18 + Math.cos(c * 0.4 + waveTime) * 6;
          const distFromCenter = Math.abs(c - 8) / 8;
          ctx.fillStyle = `rgba(${primaryRgb}, ${(0.04 + (1 - distFromCenter) * 0.08)})`;
          ctx.beginPath();
          ctx.arc(rx, ry, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- LAYER B: Multi-strand Woven Audio Ribbon passing behind the sphere ---
      const numStrands = 14;
      const step = 5;

      for (let s = 0; s < numStrands; s++) {
        ctx.beginPath();
        const normS = s / (numStrands - 1);
        const strandOffset = (normS - 0.5) * 26; // vertical spread
        const phaseShift = s * 0.16;

        // Strands near center are slightly brighter
        const alphaBell = Math.sin(normS * Math.PI);
        const strandAlpha = (0.12 + alphaBell * 0.28 + audioAmp * 0.25) * (isDistress ? 1.15 : 1.0);
        ctx.lineWidth = s % 3 === 0 ? 1.3 : 0.9;
        ctx.strokeStyle = s % 2 === 0 
          ? `rgba(${primaryRgb}, ${strandAlpha})` 
          : `rgba(${brightRgb}, ${strandAlpha * 0.9})`;

        for (let x = 0; x <= w; x += step) {
          const nx = x / w;

          // Audio perturbation when speaking
          let audioLift = 0;
          if (analyserNode && isCallActive) {
            const bin = Math.floor(nx * (freqData.length / 2));
            audioLift = ((freqData[bin] || 0) / 255) * 32 * Math.sin(nx * Math.PI);
          }

          // Complex multi-harmonic sine ribbon
          const mainWave = Math.sin(nx * 4.4 + waveTime * 2.1 + phaseShift) * (34 + audioAmp * 30);
          const subWave = Math.cos(nx * 8.2 - waveTime * 1.6 + phaseShift * 0.5) * (14 + audioAmp * 14);
          const ripple = Math.sin(nx * 14 + waveTime * 3.2) * 5;

          const y = centerY + mainWave + subWave + ripple + audioLift + strandOffset * Math.cos(nx * 3.0 + waveTime * 0.8);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    renderWave();

    return () => {
      cancelAnimationFrame(waveAnimId);
      window.removeEventListener('resize', handleWaveResize);
    };
  }, [isDistress, isCallActive, analyserNode]);

  // 2. THREE.JS 3D GEODESIC SPHERE WITH GLOWING NODES, HIGHLIGHTED FACET & ORBITAL RINGS
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Palette Colors matching reference screenshot
    const COLOR_MINT_PRIMARY = 0x70B48A;
    const COLOR_MINT_BRIGHT = 0x93C6A3;
    const COLOR_FACET = 0x07150e;
    const COLOR_FACET_EMISSIVE = 0x020905;
    const COLOR_HIGHLIGHT = 0x85D8AB;

    const COLOR_ALERT = 0xC95C5C;
    const COLOR_ALERT_BRIGHT = 0xDE7676;
    const COLOR_ALERT_FACET = 0x221212;

    // Circular glowing dot texture for vertex nodes
    const createNodeTexture = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 64;
      const c = cvs.getContext('2d');
      const grad = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(147, 198, 163, 0.95)');
      grad.addColorStop(0.65, 'rgba(112, 180, 138, 0.5)');
      grad.addColorStop(1, 'rgba(112, 180, 138, 0)');
      c.fillStyle = grad;
      c.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(cvs);
    };

    const nodeTexture = createNodeTexture();

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x102018, 1.8);
    scene.add(ambientLight);

    // Directional light positioned to graze the upper right hemisphere
    const keyLight = new THREE.DirectionalLight(isDistress ? COLOR_ALERT_BRIGHT : COLOR_MINT_BRIGHT, 4.0);
    keyLight.position.set(3.5, 3.5, 4.2);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(isDistress ? COLOR_ALERT : COLOR_MINT_PRIMARY, 2.2, 20);
    fillLight.position.set(-3.5, -2, 4);
    scene.add(fillLight);

    // Group containing rotating sphere and its facets
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Geodesic Icosahedron (radius: 2.25, detail: 2) -> identical triangles to screenshot
    const radius = 2.25;
    const detail = 2;
    const geometry = new THREE.IcosahedronGeometry(radius, detail);

    const posAttr = geometry.attributes.position;
    const originalPositions = new Float32Array(posAttr.array);

    // 1. Semi-translucent Glass Facet Mesh (front faces show through to back lines)
    const facetMaterial = new THREE.MeshPhongMaterial({
      color: isDistress ? COLOR_ALERT_FACET : COLOR_FACET,
      emissive: isDistress ? 0x140808 : COLOR_FACET_EMISSIVE,
      specular: isDistress ? COLOR_ALERT_BRIGHT : COLOR_MINT_BRIGHT,
      shininess: 45,
      transparent: true,
      opacity: 0.38,
      flatShading: true,
      side: THREE.FrontSide,
      depthWrite: false
    });

    const facetMesh = new THREE.Mesh(geometry, facetMaterial);
    sphereGroup.add(facetMesh);

    // 2. Crisp Luminous Wireframe
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: isDistress ? COLOR_ALERT : COLOR_MINT_PRIMARY,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    sphereGroup.add(wireframeMesh);

    // 3. Glowing Vertex Nodes at every intersection
    const nodeMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: nodeTexture,
      transparent: true,
      opacity: 0.98,
      color: isDistress ? COLOR_ALERT_BRIGHT : COLOR_MINT_BRIGHT,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const nodePoints = new THREE.Points(geometry, nodeMaterial);
    sphereGroup.add(nodePoints);

    // 4. THE HIGHLIGHTED LUMINOUS FACET (at ~2 o'clock, exactly like screenshot!)
    // Best face index in detail 2 pointing to upper-right front: index 156
    const highlightFaceIdx = 156;
    const highlightGeo = new THREE.BufferGeometry();
    const highlightPos = new Float32Array([
      posAttr.getX(highlightFaceIdx), posAttr.getY(highlightFaceIdx), posAttr.getZ(highlightFaceIdx),
      posAttr.getX(highlightFaceIdx+1), posAttr.getY(highlightFaceIdx+1), posAttr.getZ(highlightFaceIdx+1),
      posAttr.getX(highlightFaceIdx+2), posAttr.getY(highlightFaceIdx+2), posAttr.getZ(highlightFaceIdx+2)
    ]);
    highlightGeo.setAttribute('position', new THREE.BufferAttribute(highlightPos, 3));
    highlightGeo.computeVertexNormals();

    const highlightMat = new THREE.MeshBasicMaterial({
      color: isDistress ? COLOR_ALERT_BRIGHT : COLOR_HIGHLIGHT,
      transparent: true,
      opacity: 0.76,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
    sphereGroup.add(highlightMesh);

    // Secondary subtle highlight facet next to it to create the soft gradient glow
    const adjFaceIdx = 159;
    const adjGeo = new THREE.BufferGeometry();
    const adjPos = new Float32Array([
      posAttr.getX(adjFaceIdx), posAttr.getY(adjFaceIdx), posAttr.getZ(adjFaceIdx),
      posAttr.getX(adjFaceIdx+1), posAttr.getY(adjFaceIdx+1), posAttr.getZ(adjFaceIdx+1),
      posAttr.getX(adjFaceIdx+2), posAttr.getY(adjFaceIdx+2), posAttr.getZ(adjFaceIdx+2)
    ]);
    adjGeo.setAttribute('position', new THREE.BufferAttribute(adjPos, 3));
    const adjMat = new THREE.MeshBasicMaterial({
      color: isDistress ? COLOR_ALERT_BRIGHT : COLOR_MINT_BRIGHT,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const adjMesh = new THREE.Mesh(adjGeo, adjMat);
    sphereGroup.add(adjMesh);

    // 5. CONCENTRIC CIRCULAR RINGS (Outer rim, line ring, and dotted orbital ring)
    // Ring A: Crisp circular silhouette rim ring
    const rimGeo = new THREE.RingGeometry(2.25, 2.29, 128);
    const rimMat = new THREE.MeshBasicMaterial({
      color: isDistress ? COLOR_ALERT : COLOR_MINT_PRIMARY,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    scene.add(rimMesh);

    // Ring B: Delicate outer circular line ring at radius 2.52
    const ring1Geo = new THREE.RingGeometry(2.51, 2.53, 128);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: isDistress ? COLOR_ALERT : COLOR_MINT_PRIMARY,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1Mesh);

    // Ring C: Dotted orbital ring at radius 2.76 with discrete circular dots
    const numDottedPoints = 48;
    const dottedGeo = new THREE.BufferGeometry();
    const dottedPos = new Float32Array(numDottedPoints * 3);
    for (let i = 0; i < numDottedPoints; i++) {
      const angle = (i / numDottedPoints) * Math.PI * 2;
      dottedPos[i * 3] = Math.cos(angle) * 2.76;
      dottedPos[i * 3 + 1] = Math.sin(angle) * 2.76;
      dottedPos[i * 3 + 2] = 0;
    }
    dottedGeo.setAttribute('position', new THREE.BufferAttribute(dottedPos, 3));
    const dottedMat = new THREE.PointsMaterial({
      size: 0.05,
      map: nodeTexture,
      transparent: true,
      opacity: 0.55,
      color: isDistress ? COLOR_ALERT : COLOR_MINT_BRIGHT,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const dottedRingMesh = new THREE.Points(dottedGeo, dottedMat);
    scene.add(dottedRingMesh);

    // Ring D: Surrounding cosmic particles
    const orbitalCount = 90;
    const orbitalGeo = new THREE.BufferGeometry();
    const orbitalPos = new Float32Array(orbitalCount * 3);
    for (let i = 0; i < orbitalCount; i++) {
      const r = 2.40 + Math.random() * 0.90;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      orbitalPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      orbitalPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      orbitalPos[i * 3 + 2] = r * Math.cos(phi);
    }
    orbitalGeo.setAttribute('position', new THREE.BufferAttribute(orbitalPos, 3));
    const orbitalMat = new THREE.PointsMaterial({
      size: 0.045,
      map: nodeTexture,
      transparent: true,
      opacity: 0.40,
      color: isDistress ? COLOR_ALERT : COLOR_MINT_PRIMARY,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const orbitalPoints = new THREE.Points(orbitalGeo, orbitalMat);
    scene.add(orbitalPoints);

    // Audio Analysis buffer
    const dataArray = analyserNode 
      ? new Uint8Array(analyserNode.frequencyBinCount) 
      : new Uint8Array(64);

    let animationFrameId;
    const clock = new THREE.Clock();

    // Mouse Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      sphereGroup.rotation.y += deltaX * 0.005;
      sphereGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Initial orientation matching the screenshot:
    // Notice the equator tilts slightly downward from left to right:
    sphereGroup.rotation.x = 0.20;
    sphereGroup.rotation.y = 0.35;

    // Render Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth auto-rotation
      if (!isDragging) {
        const rotSpeed = isDistress ? 0.010 : 0.003;
        sphereGroup.rotation.y += rotSpeed;
        sphereGroup.rotation.x = 0.20 + Math.sin(elapsedTime * 0.5) * 0.04;
      }

      // Orbital dots rotation
      dottedRingMesh.rotation.z += 0.0008;
      orbitalPoints.rotation.y += 0.0009;

      // Audio analysis factor
      let audioFactor = 0;
      if (analyserNode && isCallActive) {
        analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 28; i++) sum += dataArray[i];
        audioFactor = (sum / 28) / 255;
      } else {
        audioFactor = Math.sin(elapsedTime * 1.4) * 0.03 + 0.04;
      }

      // Subtle vertex ripple along normals
      const pos = geometry.attributes.position;
      const vertexCount = pos.count;

      for (let i = 0; i < vertexCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const ripple = Math.sin(ox * 2.2 + elapsedTime * 2.4) * Math.cos(oy * 2.2 + elapsedTime * 1.8);
        const displacement = isDistress 
          ? (ripple * 0.22 + Math.sin(elapsedTime * 10 + i) * 0.08)
          : (ripple * 0.075 * (1 + audioFactor * 2.2));

        const scale = 1 + displacement / radius;
        pos.setXYZ(i, ox * scale, oy * scale, oz * scale);
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      // Synchronize the highlighted facet geometry with the rippled vertices
      const hPos = highlightGeo.attributes.position;
      hPos.setXYZ(0, pos.getX(highlightFaceIdx), pos.getY(highlightFaceIdx), pos.getZ(highlightFaceIdx));
      hPos.setXYZ(1, pos.getX(highlightFaceIdx+1), pos.getY(highlightFaceIdx+1), pos.getZ(highlightFaceIdx+1));
      hPos.setXYZ(2, pos.getX(highlightFaceIdx+2), pos.getY(highlightFaceIdx+2), pos.getZ(highlightFaceIdx+2));
      hPos.needsUpdate = true;

      const aPos = adjGeo.attributes.position;
      aPos.setXYZ(0, pos.getX(adjFaceIdx), pos.getY(adjFaceIdx), pos.getZ(adjFaceIdx));
      aPos.setXYZ(1, pos.getX(adjFaceIdx+1), pos.getY(adjFaceIdx+1), pos.getZ(adjFaceIdx+1));
      aPos.setXYZ(2, pos.getX(adjFaceIdx+2), pos.getY(adjFaceIdx+2), pos.getZ(adjFaceIdx+2));
      aPos.needsUpdate = true;

      // Outer rim breathing scale
      const rimScale = 1 + (isDistress ? Math.sin(elapsedTime * 6) * 0.02 : audioFactor * 0.035);
      rimMesh.scale.set(rimScale, rimScale, 1);

      // Colors on distress
      if (isDistress) {
        wireframeMaterial.color.setHex(COLOR_ALERT);
        keyLight.color.setHex(COLOR_ALERT_BRIGHT);
        fillLight.color.setHex(COLOR_ALERT);
        facetMaterial.color.setHex(COLOR_ALERT_FACET);
        nodeMaterial.color.setHex(COLOR_ALERT_BRIGHT);
        highlightMat.color.setHex(COLOR_ALERT_BRIGHT);
        adjMat.color.setHex(COLOR_ALERT_BRIGHT);
        rimMat.color.setHex(COLOR_ALERT);
        ring1Mat.color.setHex(COLOR_ALERT);
        dottedMat.color.setHex(COLOR_ALERT);
        orbitalMat.color.setHex(COLOR_ALERT);
      } else {
        const activeNodeColor = audioFactor > 0.25 ? COLOR_MINT_BRIGHT : COLOR_MINT_PRIMARY;
        wireframeMaterial.color.setHex(COLOR_MINT_PRIMARY);
        keyLight.color.setHex(COLOR_MINT_BRIGHT);
        fillLight.color.setHex(COLOR_MINT_PRIMARY);
        facetMaterial.color.setHex(COLOR_FACET);
        nodeMaterial.color.setHex(activeNodeColor);
        highlightMat.color.setHex(COLOR_HIGHLIGHT);
        adjMat.color.setHex(COLOR_MINT_BRIGHT);
        rimMat.color.setHex(COLOR_MINT_PRIMARY);
        ring1Mat.color.setHex(COLOR_MINT_PRIMARY);
        dottedMat.color.setHex(COLOR_MINT_BRIGHT);
        orbitalMat.color.setHex(COLOR_MINT_PRIMARY);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      wireframeMaterial.dispose();
      facetMaterial.dispose();
      nodeMaterial.dispose();
      highlightGeo.dispose();
      highlightMat.dispose();
      adjGeo.dispose();
      adjMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      dottedGeo.dispose();
      dottedMat.dispose();
      orbitalGeo.dispose();
      orbitalMat.dispose();
      nodeTexture.dispose();
      renderer.dispose();
    };
  }, [isDistress, isCallActive, analyserNode]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Top Header Label */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 22px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`status-dot ${isDistress ? 'status-dot-danger' : 'status-dot-safe'}`} />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: 'var(--text-primary)',
            textTransform: 'uppercase'
          }}>
            LIVE AUDIO ANALYSIS
          </span>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '3px 12px',
          borderRadius: '9999px',
          backgroundColor: 'var(--bg-elevated)',
          color: isCallActive ? 'var(--primary-accent)' : 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)'
        }}>
          {isDistress ? 'Distress Field' : isCallActive ? 'Monitoring Active' : 'Harmonic Standby'}
        </span>
      </div>

      {/* Multi-Strand Flowing Audio Waveform Canvas (Traversing behind the 3D Sphere) */}
      <canvas 
        ref={waveCanvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* 3D WebGL Canvas: Rotating Geodesic Sphere with Nodes & Highlighted Facet */}
      <div 
        ref={mountRef} 
        style={{
          width: '100%',
          height: '310px',
          cursor: 'grab',
          position: 'relative',
          zIndex: 2
        }}
      />

      {/* Bottom Status: Centered Microphone Icon + "Listening for audio..." */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '9px',
        padding: '6px 20px 14px',
        position: 'relative',
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        {/* Crisp Outline Microphone Icon */}
        <svg 
          width="17" 
          height="17" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={isDistress ? 'var(--alert-red)' : 'var(--primary-accent)'} 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>

        <span style={{
          fontSize: '13px',
          fontWeight: 400,
          color: isDistress ? 'var(--alert-red)' : 'var(--text-secondary)',
          letterSpacing: '0.2px'
        }}>
          {isDistress ? 'Emergency alert active' : isCallActive ? 'Listening for audio...' : 'Acoustic listener idle'}
        </span>
      </div>
    </div>
  );
};

export default AudioVisualization;