"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Trash2, Search, User, Calendar, Loader2, AlertTriangle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Verificăm dacă ești admin
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/dashboard'); 
    } else {
      fetchUsers();
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      // Trimitem un header fictiv pentru a trece de verificarea din API (dacă există)
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-auth': 'true' }
      });
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Eroare la încărcarea userilor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`⚠️ Ești sigur că vrei să ștergi utilizatorul ${email}?\n\nAceastă acțiune este permanentă și nu poate fi anulată!`)) return;

    setDeletingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        // Reîmprospătăm lista local
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert("Eroare la ștergere via API.");
      }
    } catch (error) {
      console.error(error);
      alert("A apărut o eroare de rețea.");
    } finally {
      setDeletingId(null);
    }
  };

  // Funcția de ieșire din contul de admin
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/');
  };

  // Filtrare useri
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.email?.toLowerCase() || '').includes(searchLower) ||
      (user.id?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] bg-[#030303] text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto mt-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic flex items-center gap-3">
              <ShieldAlert className="text-red-500" size={36} />
              PANOU <span className="text-red-600">ADMIN</span>
            </h1>
            <p className="text-gray-400 mt-2">Gestionează toți utilizatorii înregistrați în platformă.</p>
          </div>

          {/* Dreapta: Search Bar + Logout */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                placeholder="Caută după email sau ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors placeholder-gray-600"
              />
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 border border-red-500/30 font-bold whitespace-nowrap"
            >
              <LogOut size={18} />
              <span>Deconectare</span>
            </button>
          </div>
        </motion.div>

        {/* Tabel Useri */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.1)]">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin mb-4 text-red-500" size={32} />
              <p>Scanăm baza de date...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest">
                    <th className="p-6 font-medium">Utilizator</th>
                    <th className="p-6 font-medium">Data Înregistrării</th>
                    <th className="p-6 font-medium text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">Nu am găsit utilizatori.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <motion.tr 
                        key={user.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-gray-400 font-bold border border-white/10">
                              <User size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-gray-400 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(user.created_at).toLocaleDateString('ro-RO')}
                            <span className="text-gray-600 text-xs ml-1">
                               ({new Date(user.created_at).toLocaleTimeString('ro-RO')})
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <button 
                            onClick={() => handleDelete(user.id, user.email)}
                            disabled={deletingId === user.id}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-200 border border-red-500/30 flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === user.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            <span className="font-bold text-sm">Elimină</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
          <AlertTriangle size={14} className="text-red-500" />
          <span>Atenție: Ștergerea unui utilizator îi va revoca accesul imediat și ireversibil.</span>
        </div>

      </div>
    </div>
  );
}