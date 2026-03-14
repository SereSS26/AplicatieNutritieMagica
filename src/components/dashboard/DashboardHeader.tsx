"use client";

import React from 'react';

export default function DashboardHeader() {
  return (
    <div className="mb-10">
      <p className="text-fuchsia-600 font-mono text-sm tracking-widest uppercase mb-1">
        {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h1 className="text-4xl font-black italic tracking-tight text-white">Salut, Rege! ⚡</h1>
    </div>
  );
}