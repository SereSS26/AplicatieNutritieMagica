// src/components/canvas/StarsWrapper.tsx
"use client"; // Acum Next.js ne dă voie să folosim ssr: false!

import React from 'react';
import dynamic from 'next/dynamic';

// Încărcăm stelele 3D doar în browser (fără Server-Side Rendering)
const StarsCanvas = dynamic(() => import('./Stars'), { 
  ssr: false, 
});

export default function StarsWrapper() {
  return <StarsCanvas />;
}