"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Decal,
  Float,
  OrbitControls,
  Preload,
  useTexture,
} from "@react-three/drei";

const Ball = (props: { icons: string[] }) => {
  // useTexture poate primi un array de URL-uri și va returna un array cu texturile încărcate
  const textures = useTexture(props.icons);

  // Definim pozițiile și rotațiile pentru a așeza cele 4 logouri în jurul bilei
  const decalSettings = [
    { position: [0, 0, 1], rotation: [0, 0, 0] },               // Față
    { position: [0, 0, -1], rotation: [0, Math.PI, 0] },        // Spate
    { position: [1, 0, 0], rotation: [0, Math.PI / 2, 0] },     // Dreapta
    { position: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0] },   // Stânga
  ];

  return (
    <Float speed={1.75} rotationIntensity={1} floatIntensity={0.1}>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.8} position={[2, 2, 5]} />
      
      <mesh castShadow receiveShadow scale={1.75}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color='#ffffff'
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading
          roughness={0.3}
        />
        
        {/* Mapăm texturile pe cele 4 fețe ale sferei */}
        {textures.map((texture, index) => {
          // Ne asigurăm că randăm maxim 4 decals pentru setările pe care le avem
          if (index >= 4) return null; 
          
          const { position, rotation } = decalSettings[index];
          
          return (
            <Decal
              key={`decal-${index}`}
              position={position as [number, number, number]}
              rotation={rotation as [number, number, number]}
              scale={1.2}
              map={texture}
              flatShading
            />
          );
        })}
      </mesh>
    </Float>
  );
};

// Modificăm componenta pentru a accepta prop-ul 'icons' ca array de string-uri
const BallCanvas = ({ icons }: { icons: string[] }) => {
  return (
    <Canvas
      frameloop='always'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Suspense fallback={null}>
        {/* Am adăugat autoRotate și autoRotateSpeed pentru ca bilele să se învârtă singure vizualizând toți sponsorii */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={2} 
        />
        <Ball icons={icons} />
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default BallCanvas;