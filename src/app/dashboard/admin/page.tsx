'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, RefreshCw, AlertTriangle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  // Check if admin is authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const adminAuth = localStorage.getItem('adminAuth');
      const response = await fetch('/api/admin/users', {
        headers: {
          'x-admin-auth': adminAuth || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setDeletingId(userId);

      const adminAuth = localStorage.getItem('adminAuth');
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-auth': adminAuth || '',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || 'Error deleting user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Se încarcă utilizatorii...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">🔐 Admin Panel</h1>
            <p className="text-gray-400">Gestionează utilizatorii</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200 flex items-start gap-3"
          >
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total Utilizatori</p>
            <p className="text-3xl font-bold text-fuchsia-400">{users.length}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Status</p>
            <p className="text-green-400 font-semibold">✓ Online</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <RefreshCw size={18} />
              Reîncarcă
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Data Înregistrării</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Ultimul Login</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      Nu sunt utilizatori înregistrați
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-mono">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('ro-RO')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString('ro-RO')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold transition disabled:opacity-50"
                            >
                              {deletingId === user.id ? 'Se șterge...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs font-semibold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-600 text-red-300 rounded text-xs font-semibold transition"
                          >
                            <Trash2 size={14} />
                            Șterge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg text-blue-200 text-sm">
          <p className="font-semibold mb-1">💡 Informații:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Fiecare utilizator poate fi șters izolat</li>
            <li>Ștergerea este permanentă și nu poate fi anulată</li>
            <li>Confirmă înainte de a șterge</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
