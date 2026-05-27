"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  count?: number;
}

function ParticleSystem({ count = 120 }: ParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const colors = useMemo(() => {
    const palette = [
      new THREE.Color("#6B8EAD"), // Air
      new THREE.Color("#5B8C85"), // Water
      new THREE.Color("#BC6C4D"), // Fire
      new THREE.Color("#6B8A6B"), // Earth
      new THREE.Color("#C5A880"), // Gold Branding Accent
    ];

    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      array[i * 3] = color.r;
      array[i * 3 + 1] = color.g;
      array[i * 3 + 2] = color.b;
    }
    return array;
  }, [count]);

  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const init = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 3;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      init[i * 3] = x;
      init[i * 3 + 1] = y;
      init[i * 3 + 2] = z;
    }
    return [pos, init];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const geo = meshRef.current.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;

    if (!posAttr) return;

    const targetX = mouseRef.current.x * 1.5;
    const targetY = mouseRef.current.y * 1.5;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      const ox = initialPositions[idx];
      const oy = initialPositions[idx + 1];
      const oz = initialPositions[idx + 2];

      const xAngle = time + ox;
      const yAngle = time + oy;

      const dx = targetX - posAttr.array[idx];
      const dy = targetY - posAttr.array[idx + 1];

      posAttr.array[idx] = ox + Math.sin(xAngle) * 0.15 + dx * 0.04;
      posAttr.array[idx + 1] = oy + Math.cos(yAngle) * 0.15 + dy * 0.04;
      posAttr.array[idx + 2] = oz + Math.sin(time * 0.5 + oz) * 0.1;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ElementCanvas() {
  return (
    <div className="h-full w-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.08)_0%,transparent_70%)]" />
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParticleSystem count={150} />
      </Canvas>
    </div>
  );
}
