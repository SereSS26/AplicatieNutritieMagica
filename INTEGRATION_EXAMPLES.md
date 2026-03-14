/**
 * Example: How to integrate SquatAnalyzer into your dashboard
 * Add this to your dashboard layout or create new pages
 */

// Example 1: Add to dashboard navigation
// File: src/app/dashboard/layout.tsx

import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigationItems = [
    { href: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/dashboard/antrenamente', label: '💪 Antrenamente', icon: '💪' },
    { href: '/dashboard/nutritie', label: '🥗 Nutriție', icon: '🥗' },
    // ADD THIS LINE:
    { href: '/dashboard/squat-analyzer', label: '🎯 Squat Analyzer', icon: '🎯' },
    { href: '/dashboard/progres', label: '📈 Progres', icon: '📈' },
    { href: '/dashboard/setari', label: '⚙️ Setări', icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6">
        <h1 className="text-2xl font-bold mb-8">Nutriție Magică</h1>
        <nav className="space-y-3">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

// ============================================

// Example 2: Standalone usage in a component
// File: src/app/dashboard/fitness/page.tsx

import SquatAnalyzer from '@/components/SquatAnalyzer';

export const metadata = {
  title: 'Fitness Analysis | Nutriție Magică',
};

export default function FitnessPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analiză Fitness</h1>
        <p className="text-gray-400">
          Analizează forma ta de squat și compară cu forma corectă
        </p>
      </div>

      {/* Squat Analyzer Component */}
      <SquatAnalyzer referenceVideoPath="/genuflexiuni_corecte.mp4" />
    </div>
  );
}

// ============================================

// Example 3: Advanced integration with multiple analyzers
// File: src/app/dashboard/movement-analysis/page.tsx

'use client';

import { useState } from 'react';
import SquatAnalyzer from '@/components/SquatAnalyzer';
import type { MovementAnalysis } from '@/utils/movementAnalyzer';

export default function MovementAnalysisPage() {
  const [selectedExercise, setSelectedExercise] = useState<'squats' | 'pushups'>('squats');
  const [analysisHistory, setAnalysisHistory] = useState<MovementAnalysis[]>([]);

  const exercises = [
    { id: 'squats', name: '🦵 Genunchi', video: '/genuflexiuni_corecte.mp4' },
    { id: 'pushups', name: '💪 Flotări', video: '/pushups_correct.mp4' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Analiza Mișcării</h1>
        <p className="text-gray-400">
          Selectează exercițiul și analizează forma ta cu AI
        </p>
      </div>

      {/* Exercise selector */}
      <div className="flex gap-4">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setSelectedExercise(ex.id as 'squats' | 'pushups')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedExercise === ex.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Analyzer for selected exercise */}
      <div className="bg-gray-800 rounded-lg p-6">
        <SquatAnalyzer
          referenceVideoPath={
            selectedExercise === 'squats'
              ? '/genuflexiuni_corecte.mp4'
              : '/pushups_correct.mp4'
          }
        />
      </div>

      {/* History section */}
      {analysisHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Istoric Analize</h2>
          <div className="space-y-2">
            {analysisHistory.map((analysis, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span>Analiza #{idx + 1}</span>
                <span className="text-green-400">
                  Calitate: {analysis.squat.quality.toFixed(0)}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================

// Example 4: Integration with workout tracking
// File: src/app/dashboard/antrenamente/[id]/page.tsx

import SquatAnalyzer from '@/components/SquatAnalyzer';

interface WorkoutPageProps {
  params: {
    id: string;
  };
}

export default function WorkoutDetailPage({ params }: WorkoutPageProps) {
  const workoutId = params.id;

  // Load workout details from database/API
  const workout = {
    id: workoutId,
    name: 'Full Body Workout',
    exercises: [
      { name: 'Squats', sets: 3, reps: 10 },
      { name: 'Bench Press', sets: 3, reps: 8 },
    ],
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">{workout.name}</h1>
        <p className="text-gray-400">Antrenament #{workoutId}</p>
      </div>

      {/* Workout exercises */}
      {workout.exercises.map((exercise, idx) => (
        <div key={idx} className="space-y-6">
          <h2 className="text-2xl font-bold">
            {exercise.name} - {exercise.sets} sets x {exercise.reps} reps
          </h2>

          {exercise.name === 'Squats' && (
            <SquatAnalyzer referenceVideoPath="/genuflexiuni_corecte.mp4" />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================

// Example 5: Custom component wrapper with data persistence
// File: src/components/SquatAnalyzerWithHistory.tsx

'use client';

import { useState, useEffect } from 'react';
import SquatAnalyzer from './SquatAnalyzer';
import type { MovementAnalysis } from '@/utils/movementAnalyzer';

export default function SquatAnalyzerWithHistory() {
  const [history, setHistory] = useState<MovementAnalysis[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('squat_analysis_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('squat_analysis_history', JSON.stringify(history));
  }, [history]);

  return (
    <div className="space-y-8">
      <SquatAnalyzer referenceVideoPath="/genuflexiuni_corecte.mp4" />

      {/* Display history */}
      {history.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Analiza Precedentă</h2>
          <div className="space-y-4">
            {history.slice(-5).map((analysis, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-700 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">Analiza #{history.length - idx}</p>
                  <p className="text-sm text-gray-400">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Calitate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {analysis.squat.quality.toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================

// Example 6: In your existing antrenamente page
// File: src/app/dashboard/antrenamente/page.tsx - ADD THIS SECTION:

'use client';

import SquatAnalyzer from '@/components/SquatAnalyzer';
import { useState } from 'react';

export default function AntrenamentePage() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Antrenamente</h1>

      {/* Your existing code here */}

      {/* Add squat analyzer section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Analiază Forma la Genunchi</h2>
          <button
            onClick={() => setShowAnalyzer(!showAnalyzer)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
          >
            {showAnalyzer ? 'Ascunde' : 'Arată'} Analiza
          </button>
        </div>

        {showAnalyzer && (
          <SquatAnalyzer referenceVideoPath="/genuflexiuni_corecte.mp4" />
        )}
      </div>
    </div>
  );
}
