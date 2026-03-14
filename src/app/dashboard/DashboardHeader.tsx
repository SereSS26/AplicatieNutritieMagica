"use client";

import React from 'react';
import UserProfile from '@/src/components/landing/UserProfile';

export default function DashboardHeader() {
  return (
    <div className="flex justify-between items-end mb-10">
      <div>
        <p className="text-fuchsia-600 font-mono text-sm tracking-widest uppercase mb-1">
          {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-4xl font-black italic tracking-tight text-white">Salut, Rege! ⚡</h1>
      </div>

      <UserProfile />
    </div>
  );
}