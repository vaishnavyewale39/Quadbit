import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const ThreeSphere = ({ isDistress, isCallActive, analyserNode }) => {
  const mountRef = useRef(null);
  const [latency, setLatency] = useState(14);
  const [polarDeform, setPolarDeform] = useState(0.12);

  // Latency micro-jitter for cyber realism
  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(Math.floor(12 + Math.random() * 5));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x002244, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 4, 30);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0x003366, 2, 20);
    backLight.position.set(-5, -5, -3);
    scene.add(backLight);

    // Geodesic Icosahedron geometry
    const radius = 2.4;
    const detail = 3; // Yields a rich tessellation matching the screenshot
    const geometry = new THREE.IcosahedronGeometry(radius, detail);

    // Save original vertex positions for deformation
    const positionAttr = geometry.attributes.position;
    const originalPositions = new Float32Array(positionAttr.array);

    // Wireframe Mesh (Outer glow grid)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: isDistress ? 0xff1a53 : 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    // Inner Facet Mesh (with soft cyan translucent shading catching light)
    const facetMaterial = new THREE.MeshPhongMaterial({
      color: isDistress ? 0x660020 : 0x011b2b,
      emissive: isDistress ? 0x440011 : 0x00364f,
      specular: isDistress ? 0xff3366 : 0x00f0ff,
      shininess: 40,
      transparent: true,
      opacity: 0.72,
      flatShading: true
    });

    const facetMesh = new THREE.Mesh(geometry, facetMaterial);
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    scene.add(facetMesh);
    scene.add(wireframeMesh);

    // Web Audio data array
    const dataArray = analyserNode 
      ? new Uint8Array(analyserNode.frequencyBinCount) 
      : new Uint8Array(64);

    let animationFrameId;
    let clock = new THREE.Clock();

    // Mouse drag interaction
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

      facetMesh.rotation.y += deltaX * 0.005;
      facetMesh.rotation.x += deltaY * 0.005;
      wireframeMesh.rotation.y += deltaX * 0.005;
      wireframeMesh.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Render loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow smooth auto-rotation
      if (!isDragging) {
        const rotSpeed = isDistress ? 0.015 : 0.003;
        facetMesh.rotation.y += rotSpeed;
        facetMesh.rotation.x += rotSpeed * 0.4;
        wireframeMesh.rotation.y += rotSpeed;
        wireframeMesh.rotation.x += rotSpeed * 0.4;
      }

      // Audio analysis for vertex deformation
      let audioFactor = 0;
      if (analyserNode && isCallActive) {
        analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 32; i++) {
          sum += dataArray[i];
        }
        audioFactor = (sum / 32) / 255; // 0 to 1
      } else {
        // Subtle baseline idle breath
        audioFactor = (Math.sin(elapsedTime * 1.5) * 0.04 + 0.05);
      }

      const deformVal = Number((0.10 + audioFactor * (isDistress ? 0.6 : 0.25)).toFixed(2));
      setPolarDeform(deformVal);

      // Displace vertices along normals
      const pos = geometry.attributes.position;
      const vertexCount = pos.count;

      for (let i = 0; i < vertexCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        // Wave ripple calculation based on spherical harmonics
        const ripple = Math.sin(ox * 2.5 + elapsedTime * 3) * Math.cos(oy * 2.5 + elapsedTime * 2);
        const displacement = isDistress 
          ? (ripple * 0.35 + Math.sin(elapsedTime * 15 + i) * 0.15)
          : (ripple * 0.12 * (1 + audioFactor * 2.5));

        const scale = 1 + displacement / radius;
        pos.setXYZ(i, ox * scale, oy * scale, oz * scale);
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      // Dynamic color updates if distress state changes
      if (isDistress) {
        wireframeMaterial.color.setHex(0xff1a53);
        pointLight.color.setHex(0xff1a53);
        facetMaterial.color.setHex(0x55001a);
        facetMaterial.emissive.setHex(0x440011);
        facetMaterial.specular.setHex(0xff3366);
      } else {
        wireframeMaterial.color.setHex(0x00f0ff);
        pointLight.color.setHex(0x00f0ff);
        facetMaterial.color.setHex(0x011b2b);
        facetMaterial.emissive.setHex(0x00364f);
        facetMaterial.specular.setHex(0x00f0ff);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handling
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
      renderer.dispose();
    };
  }, [isDistress, isCallActive, analyserNode]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '440px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }}>
      {/* Top Metadata Overlay */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '12px 18px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#4ae3ff',
          lineHeight: '1.6',
          letterSpacing: '0.8px',
          opacity: 0.85
        }}>
          <div>// LATENCY: {latency}ms</div>
          <div>// GEO-SYNC: LAT 37.7749 / LON -122.4194</div>
          <div>// TOPOLOGY: ICOSAHEDRON_DEFORM_V4</div>
        </div>

        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          fontWeight: 700,
          color: '#00f0ff',
          letterSpacing: '1.5px',
          padding: '4px 10px',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '3px',
          backgroundColor: 'rgba(0, 240, 255, 0.08)',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
          pointerEvents: 'auto',
          cursor: 'pointer'
        }}>
          CORE AI ENGINE
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        style={{
          width: '100%',
          height: '420px',
          cursor: 'grab',
          position: 'relative'
        }}
      />

      {/* Bottom Telemetry & Guide Overlay */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 18px',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.8px',
        pointerEvents: 'none'
      }}>
        <div style={{ color: '#4ae3ff', opacity: 0.9 }}>
          VERTEX COUNT: <span style={{ color: '#00f0ff', fontWeight: 700 }}>2,562</span> | POLAR DEFORM: <span style={{ color: '#00f0ff', fontWeight: 700 }}>{polarDeform}</span>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ color: '#00f0ff', opacity: 0.85 }}>
            * Speak normally: Sphere breathes cyan
          </span>
          <span style={{ color: '#ff4d6d', fontWeight: 600 }}>
            ▲ Shout or say "check the oven" to trigger distress
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThreeSphere;
