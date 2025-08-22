'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { NotificationServiceClient } from '../../utils/notificationServiceClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const router = useRouter();

  // Récupérer l'URL de redirection depuis les paramètres de l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, []);

  // Gérer la session et l'utilisateur
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    
    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        setMessage(`Erreur lors de l'inscription: ${error.message}`);
      } else {
        setMessage("✅ Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.");
        // Le trigger handle_new_user va automatiquement créer le profil
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Messages d'erreur plus clairs
        if (error.message.includes('Invalid login credentials')) {
          setMessage('❌ Email ou mot de passe incorrect. Vérifiez vos identifiants.');
        } else if (error.message.includes('Email not confirmed')) {
          setMessage('⚠️ Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.');
        } else {
          setMessage(`❌ Erreur de connexion: ${error.message}`);
        }
      } else {
        // Vérifier le rôle depuis les métadonnées utilisateur
        const userRole = data.user?.user_metadata?.role || 'user';
        setMessage(`✅ Connexion réussie ! Rôle: ${userRole}`);
        
        // Envoyer une notification de connexion
        try {
          console.log('🔍 DEBUG: Tentative d\'envoi de notification de connexion...');
          console.log('🔍 DEBUG: Email:', email);
          console.log('🔍 DEBUG: UserName:', email.split('@')[0]);
          
          const notificationService = NotificationServiceClient.getInstance();
          console.log('🔍 DEBUG: Service de notification chargé');
          
          const result = await notificationService.notifyUserLogin(email, email.split('@')[0]);
          console.log('🔍 DEBUG: Résultat notification:', result);
          
          if (result) {
            console.log('✅ Notification de connexion envoyée avec succès');
          } else {
            console.log('❌ Échec de l\'envoi de la notification de connexion');
          }
        } catch (notificationError) {
          console.error('❌ Erreur lors de l\'envoi de la notification de connexion:', notificationError);
        }
        
        // Rediriger vers l'URL spécifiée ou la page d'accueil
        setTimeout(() => {
          if (redirectUrl) {
            // Si c'est une URL externe, rediriger directement
            if (redirectUrl.startsWith('http')) {
              window.location.href = redirectUrl;
            } else {
              // Si c'est un chemin relatif, utiliser le router
              router.push(redirectUrl);
            }
          } else {
            router.push('/');
          }
        }, 1000);
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded shadow flex flex-col gap-4 w-full max-w-sm">
          <div className="text-blue-900 mb-2">Connecté en tant que <b>{user?.email}</b></div>
          <button className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 pt-16">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col gap-6 w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            {isRegister ? "Créer un compte" : "Connexion"}
          </h1>
          <p className="text-gray-600">
            {isRegister ? "Rejoignez IAHome pour accéder aux outils IA" : "Connectez-vous à votre compte IAHome"}
            {redirectUrl && (
              <span className="block text-sm text-blue-600 mt-1">
                Vous serez redirigé vers {redirectUrl} après connexion
              </span>
            )}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              type="email" 
              placeholder="votre@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              type="password" 
              placeholder="Votre mot de passe" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button 
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
            type="submit"
          >
            {isRegister ? "Créer un compte" : "Se connecter"}
          </button>
        </form>
        
        <div className="text-center">
          <button 
            type="button" 
            className="text-blue-600 hover:text-blue-800 underline text-sm" 
            onClick={() => setIsRegister(r => !r)}
          >
            {isRegister ? "Déjà inscrit ? Se connecter" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : message.includes('⚠️')
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
        
        <div className="text-center text-xs text-gray-500">
          <p>IAHome - Plateforme d'outils IA</p>
        </div>
      </div>
    </div>
  );
} 