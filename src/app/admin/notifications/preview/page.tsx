'use client';

import { useState, useEffect } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { supabase } from '@/utils/supabaseClient';

export default function EmailPreviewPage() {
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [emailHtml, setEmailHtml] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Jean Dupont');
  const [signupDate, setSignupDate] = useState(new Date().toLocaleDateString('fr-FR'));

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      window.location.href = '/login';
      return;
    }
    loadEmailTemplate();
  }, [authLoading, isAuthenticated, user, userName, signupDate]);

  const loadEmailTemplate = async () => {
    try {
      // Utiliser l'instance singleton pour éviter les instances multiples
      const { data: setting, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('event_type', 'user_no_module_activated')
        .single();

      if (error || !setting) {
        // Si le template n'existe pas, utiliser le template par défaut
        const defaultTemplate = getDefaultTemplate();
        setEmailSubject(defaultTemplate.subject);
        setEmailHtml(replaceVariables(defaultTemplate.html, userName, signupDate));
        setLoading(false);
        return;
      }

      // Remplacer les variables dans le template
      let subject = setting.email_template_subject || '';
      let html = setting.email_template_body || '';

      // Remplacer les variables
      subject = subject.replace(/\{\{user_name\}\}/g, userName);
      html = html.replace(/\{\{user_name\}\}/g, userName);
      html = html.replace(/\{\{signup_date\}\}/g, signupDate);

      setEmailSubject(subject);
      setEmailHtml(html);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement du template:', error);
      const defaultTemplate = getDefaultTemplate();
      setEmailSubject(defaultTemplate.subject);
      setEmailHtml(replaceVariables(defaultTemplate.html, userName, signupDate));
      setLoading(false);
    }
  };

  const getDefaultTemplate = () => {
    return {
      subject: 'Bienvenue sur IAHome ! Accédez à votre premier module et recevez 200 tokens bonus !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-top: 0; font-size: 28px;">Bienvenue sur IAHome, {{user_name}} ! 🎉</h1>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Nous avons remarqué que vous vous êtes inscrit(e) récemment mais que vous n'avez pas encore accessible de module.
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #92400e; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
                🎁 Offre spéciale : 200 tokens bonus !
              </p>
              <p style="color: #78350f; font-size: 14px; margin: 0;">
                Accédez à votre premier module dans les <strong>3 prochains jours</strong> et recevez automatiquement <strong>200 tokens supplémentaires</strong> sur votre compte !
              </p>
            </div>
            
            <h2 style="color: #1f2937; font-size: 20px; margin-top: 32px; margin-bottom: 16px;">
              📚 Comment accéder à votre premier module ? (4 étapes simples)
            </h2>
            
            <div style="margin: 24px 0;">
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                    1
                  </div>
                  <div>
                    <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                      Connectez-vous à votre compte
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                      Rendez-vous sur <a href="https://iahome.fr" style="color: #2563eb; text-decoration: none;">iahome.fr</a> et connectez-vous avec vos identifiants.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                    2
                  </div>
                  <div>
                    <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                      Parcourez nos modules
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                      Accédez à la page <a href="https://iahome.fr/modules" style="color: #2563eb; text-decoration: none;">Modules</a> ou <a href="https://iahome.fr/applications" style="color: #2563eb; text-decoration: none;">Applications</a> pour découvrir tous nos outils disponibles.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                    3
                  </div>
                  <div>
                    <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                      Cliquez sur "accéder à" ou "Accéder"
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                      Choisissez le module qui vous intéresse et cliquez sur le bouton d'accès. Les tokens nécessaires seront automatiquement débités de votre compte.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px;">
                    4
                  </div>
                  <div>
                    <p style="color: #1f2937; font-weight: 600; margin: 0 0 4px 0; font-size: 16px;">
                      Cliquez sur "Mes applis" dans la bannière
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">
                      Une fois le module accessible, cliquez sur "Mes applis" dans la bannière en haut de la page pour accéder à toutes vos applications accessibles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://iahome.fr/modules" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                Découvrir les modules →
              </a>
            </div>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #065f46; font-size: 14px; margin: 0;">
                <strong>💡 Astuce :</strong> Vous avez déjà reçu des tokens de bienvenue lors de votre inscription. Vous pouvez les utiliser pour accéder à votre premier module dès maintenant !
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; line-height: 1.6;">
              Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter. Nous sommes là pour vous accompagner !
            </p>
            
            <p style="color: #374151; font-size: 16px; margin-top: 24px;">
              À très bientôt sur IAHome !<br>
              <strong>L'équipe IAHome</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              Cet email a été envoyé automatiquement par IAHome.<br>
              Vous avez reçu cet email car vous êtes inscrit(e) sur IAHome mais n'avez pas encore accessible de module.
            </p>
          </div>
        </div>
      `
    };
  };

  const replaceVariables = (html: string, name: string, date: string) => {
    return html
      .replace(/\{\{user_name\}\}/g, name)
      .replace(/\{\{signup_date\}\}/g, date);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'aperçu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">📧</span>
                Aperçu du modèle d'email
              </h1>
              <p className="text-gray-600">
                Prévisualisation du mail "Sans module accessible"
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/admin/notifications"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Retour
              </a>
            </div>
          </div>

          {/* Paramètres de prévisualisation */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Variables de test :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'utilisateur
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label htmlFor="signup-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'inscription
                </label>
                <input
                  id="signup-date"
                  type="text"
                  value={signupDate}
                  onChange={(e) => setSignupDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="21/11/2025"
                />
              </div>
            </div>
          </div>

          {/* Sujet de l'email */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-1">Sujet de l'email :</p>
            <p className="text-base text-blue-800">{emailSubject}</p>
          </div>
        </div>

        {/* Aperçu de l'email */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Aperçu HTML</h2>
            <div className="text-sm text-gray-500">
              Taille approximative : {Math.round(emailHtml.length / 1024)} KB
            </div>
          </div>
          
          {/* Conteneur de prévisualisation */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <div 
              className="bg-white mx-auto"
              style={{ maxWidth: '600px' }}
              dangerouslySetInnerHTML={{ __html: emailHtml }}
            />
          </div>

          {/* Note */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Cet aperçu montre comment l'email apparaîtra dans la plupart des clients email. 
              Certains clients email peuvent afficher le contenu différemment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




