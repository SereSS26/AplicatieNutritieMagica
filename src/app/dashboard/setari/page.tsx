'use client';

import { useState, useEffect } from 'react';
import { Settings, Lock, User, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/src/lib/supabase'; // Asigură-te că această cale este corectă

export default function SettingsPage() {
  // Starea pentru datele utilizatorului (doar pentru afișare)
  const [userData, setUserData] = useState({
    name: 'Se încarcă...',
    email: 'Se încarcă...'
  });

  // Starea pentru parola nouă
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Încărcăm datele oficiale din Supabase când se deschide pagina
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserData({
          email: user.email || 'Email indisponibil',
          // Dacă ai setat numele la înregistrare în metadata, îl tragem de acolo
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Nume Setat'
        });
      }
    };

    fetchUserData();
  }, []);

  // Funcția de actualizare a inputurilor pentru parole
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Salvarea noii parole în Supabase
  const handleSavePassword = async () => {
    setStatusMessage({ type: '', text: '' });

    // Validări de bază
    if (!passwords.newPassword) {
      setStatusMessage({ type: 'error', text: 'Te rugăm să introduci o parolă nouă.' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Parola trebuie să aibă minim 6 caractere.' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Parolele noi nu coincid!' });
      return;
    }

    setIsSaving(true);

    try {
      // Aceasta este funcția Supabase care schimbă parola contului permanent!
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      // Succes!
      setStatusMessage({ type: 'success', text: 'Parola a fost actualizată! O poți folosi la următoarea logare.' });
      setPasswords({ newPassword: '', confirmPassword: '' }); // Golim câmpurile
      
    } catch (error: any) {
      console.error('Eroare la schimbarea parolei:', error);
      setStatusMessage({ type: 'error', text: 'A apărut o eroare. Parola nu a putut fi schimbată.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header-ul paginii */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="text-blue-500" size={32} />
            Setări Cont
          </h1>
          <p className="text-gray-400 mt-2">
            Aici poți vedea datele contului tău și poți actualiza parola de acces.
          </p>
        </div>

        {/* Mesaje de Succes sau Eroare */}
        {statusMessage.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            statusMessage.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* SECȚIUNEA 1: Informații Personale (BLOCATE / FIXE) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6 shadow-lg opacity-80">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white border-b border-gray-700 pb-4">
            <User size={20} className="text-blue-400" />
            Detalii Cont (Fixe)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nume Utilizator</label>
              <input 
                type="text" 
                value={userData.name} 
                disabled
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Adresă de Email</label>
              <input 
                type="email" 
                value={userData.email} 
                disabled
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECȚIUNEA 2: Securitate și Parolă */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6 shadow-lg">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white border-b border-gray-700 pb-4">
            <Lock size={20} className="text-red-400" />
            Schimbă Parola
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Parolă Nouă</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwords.newPassword} 
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                  placeholder="Minim 6 caractere"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Confirmă Parola Nouă</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwords.confirmPassword} 
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                  placeholder="Reintrodu noua parolă"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buton Salvare */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSavePassword}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg shadow-red-500/20"
          >
            <ShieldCheck size={24} />
            {isSaving ? 'Se actualizează...' : 'Actualizează Parola'}
          </button>
        </div>

      </div>
    </div>
  );
}