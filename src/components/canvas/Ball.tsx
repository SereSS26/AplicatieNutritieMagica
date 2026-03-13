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

const Ball = (props: { imgUrl: string }) => {
  const [decal] = useTexture([props.imgUrl]);

  return (
    // Am redus `floatIntensity` la 0.1 (va pluti foarte, foarte fin, doar cât să aibă viață, fără să iasă din cutie)
    <Float speed={1.75} rotationIntensity={1} floatIntensity={0.1}>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={0.8} position={[2, 2, 5]} />
      
      {/* Am redus scala 3D la 1.75 pentru a lăsa suficient loc "de respirat" în jurul bilei */}
      <mesh castShadow receiveShadow scale={1.75}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color='#ffffff'
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading
          roughness={0.3}
        />
        {/* Am mărit puțin logoul (scale={1.2}) ca să rămână extrem de vizibil */}
        <Decal
          position={[0, 0, 1]}
          rotation={[2 * Math.PI, 0, 6.25]}
          scale={1.2}
          map={decal}
          flatShading
        />
      </mesh>
    </Float>
  );
};

const BallCanvas = ({ icon }: { icon: string }) => {
  return (
    <Canvas
      frameloop='always'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Suspense fallback={null}>
        <OrbitControls enableZoom={false} enablePan={false} />
        <Ball imgUrl={icon} />
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default BallCanvas;