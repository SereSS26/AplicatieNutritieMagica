"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Formele corpului (Manechin Anatomic Articulat & Holografic Premium)
function BodyModel({ height, weight, gender }: { height: number, weight: number, gender: 'masculin' | 'feminin' }) {
  const groupRef = useRef<THREE.Group>(null);

  // Calculăm BMI (Body Mass Index)
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Presupunem un BMI "atletic/normal" în jur de 22 pentru bărbați și 21 pentru femei
  const idealBmi = gender === 'masculin' ? 22 : 21;
  
  // Factori anatomici dinamici, calculați fin
  const diff = bmi - idealBmi;
  const widthF = Math.max(0.7, Math.min(2, 1 + diff * 0.025)); 
  const bellyF = Math.max(0.7, Math.min(2.5, 1 + Math.max(-0.1, diff * 0.05))); 
  const limbF = Math.max(0.7, Math.min(1.8, 1 + diff * 0.015));
  
  // Scalarea pe înălțime (axa Y). Luăm 175cm ca referință de bază (scara 1.0)
  const heightF = height / 175; 

  const color = gender === 'feminin' ? '#f472b6' : '#38bdf8'; 
  const emissiveColor = gender === 'feminin' ? '#be185d' : '#0ea5e9';

  // Material de sticlă de înaltă fidelitate cu refracție
  const bodyMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0.1,
    roughness: 0.15,
    transmission: 0.95, // Transparență de sticlă 
    thickness: 1.5,     // Grosimea volumului pentru refracție
    ior: 1.5,           // Index of Refraction (realist pentru sticlă)
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    emissive: new THREE.Color(emissiveColor),
    emissiveIntensity: 0.3,
  }), [color, emissiveColor]);

  // Animație ușoară de "respirație" și plutire
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 2) * 0.03 - 0.9; 
    }
  });

  return (
    <group ref={groupRef} scale={[1, heightF, 1]} position={[0, -0.9, 0]}>
      
      {/* MIEZ ENERGIE (Strălucește prin "sticlă") */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={3} toneMapped={false} />
      </mesh>

      {/* CAP / HEAD */}
      <mesh position={[0, 1.75, 0]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.1, 0.06, 32, 32]} />
      </mesh>

      {/* GÂT / NECK */}
      <mesh position={[0, 1.62, 0]} material={bodyMaterial} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.1, 32]} />
      </mesh>

      {/* PIEPT / CHEST */}
      <mesh position={[0, 1.4, 0]} scale={[widthF, 1, 1 + diff * 0.01]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.15, 0.2, 32, 32]} />
      </mesh>

      {/* ABDOMEN / BELLY (Mutat fin in fata proportional cu cresterea de grasime) */}
      <mesh position={[0, 1.1, (bellyF - 1) * 0.06]} scale={[widthF * 0.95, 1, bellyF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.14, 0.2, 32, 32]} />
      </mesh>

      {/* BAZIN / HIPS */}
      <mesh position={[0, 0.88, 0]} scale={[widthF, 1, bellyF * 0.9]} material={bodyMaterial} castShadow>
         <capsuleGeometry args={[0.15, 0.05, 32, 32]} />
      </mesh>

      {/* --- BRAȚE --- */}
      <mesh position={[-0.2 * widthF, 1.52, 0]} scale={[limbF, limbF, limbF]} material={bodyMaterial} castShadow>
        <sphereGeometry args={[0.07, 32, 32]} />
      </mesh>
      <mesh position={[0.2 * widthF, 1.52, 0]} scale={[limbF, limbF, limbF]} material={bodyMaterial} castShadow>
        <sphereGeometry args={[0.07, 32, 32]} />
      </mesh>
      <mesh position={[-0.24 * widthF, 1.25, 0]} rotation={[0, 0, 0.15]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.05, 0.25, 32, 32]} />
      </mesh>
      <mesh position={[0.24 * widthF, 1.25, 0]} rotation={[0, 0, -0.15]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.05, 0.25, 32, 32]} />
      </mesh>
      <mesh position={[-0.28 * widthF, 1.05, 0]} scale={[limbF, limbF, limbF]} material={bodyMaterial} castShadow>
        <sphereGeometry args={[0.05, 32, 32]} />
      </mesh>
      <mesh position={[0.28 * widthF, 1.05, 0]} scale={[limbF, limbF, limbF]} material={bodyMaterial} castShadow>
        <sphereGeometry args={[0.05, 32, 32]} />
      </mesh>
      <mesh position={[-0.28 * widthF, 0.8, 0]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.04, 0.3, 32, 32]} />
      </mesh>
      <mesh position={[0.28 * widthF, 0.8, 0]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.04, 0.3, 32, 32]} />
      </mesh>

      {/* --- PICIOARE --- */}
      <mesh position={[-0.12 * widthF, 0.6, 0]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.07, 0.35, 32, 32]} />
      </mesh>
      <mesh position={[0.12 * widthF, 0.6, 0]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.07, 0.35, 32, 32]} />
      </mesh>
      <mesh position={[-0.12 * widthF, 0.35, 0]} scale={[limbF, limbF, limbF]} material={bodyMaterial} castShadow>
        <sphereGeometry args={[0.065, 32, 32]} />
      </mesh>
      <mesh position={[0.12 * widthF, 0.35, 0]} scale={[limbF, limbF, limbF]} material={bodyMaterial} castShadow>
        <sphereGeometry args={[0.065, 32, 32]} />
      </mesh>
      <mesh position={[-0.12 * widthF, 0.15, 0]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.05, 0.3, 32, 32]} />
      </mesh>
      <mesh position={[0.12 * widthF, 0.15, 0]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.05, 0.3, 32, 32]} />
      </mesh>
      <mesh position={[-0.12 * widthF, -0.05, 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.04, 0.15, 32, 32]} />
      </mesh>
      <mesh position={[0.12 * widthF, -0.05, 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[limbF, 1, limbF]} material={bodyMaterial} castShadow>
        <capsuleGeometry args={[0.04, 0.15, 32, 32]} />
      </mesh>

    </group>
  );
}

export default function DynamicAvatar({ height, weight, gender }: { height: number, weight: number, gender: 'masculin' | 'feminin' }) {
  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[500px] bg-gradient-to-b from-[#111] to-[#030303] rounded-[32px] overflow-hidden border border-white/5 relative shadow-2xl">
      
      <Canvas shadows camera={{ position: [0, 1.2, 4], fov: 50 }}>
        {/* Iluminare ambientală și direcțională */}
        <ambientLight intensity={0.6} />
        <Environment preset="studio" />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        
        <pointLight position={[-5, 5, -5]} intensity={1} color="#d946ef" />
        <pointLight position={[5, -5, 5]} intensity={1} color="#22d3ee" />

        {/* Modelul 3D Generat Procedural */}
        <BodyModel height={height} weight={weight} gender={gender} />

        {/* Podeaua magică (Contact Shadows) pentru realism */}
        <ContactShadows position={[0, -0.9, 0]} opacity={0.8} scale={5} blur={2.5} far={2} />

        {/* Control cu mouse-ul (rotire 360) */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.6} 
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>

      {/* UI Overlay Informații (sus în stânga) */}
      <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 z-10">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status Avatar</p>
        <p className="text-white text-lg font-black leading-none">{height} cm <span className="text-gray-600 font-normal mx-1">/</span> {weight} kg</p>
      </div>
      
    </div>
  );
}
