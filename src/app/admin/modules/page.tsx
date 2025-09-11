'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { UnifiedModuleModal } from '../../../components/ModuleModals';

interface Module {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number;
  youtube_url?: string;
  url?: string; // Nouveau champ pour l'URL d'accès
  image_url?: string; // Nouveau champ pour l'URL de l'image
  created_at?: string;
  updated_at?: string; // Optionnel car peut ne pas exister dans la base
}

interface AccessToken {
  id: string;
  name: string;
  description: string;
  module_id: string;
  module_name: string;
  access_level: 'basic' | 'premium' | 'admin';
  permissions: string[];
  max_usage: number;
  current_usage: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at: string;
  jwt_token: string;
  last_used_at?: string;
  usage_log: any[];
}

interface TokenInfo {
  moduleName: string;
  baseUrl: string;
  accessUrl: string;
  permissions: string[];
  expiresIn: string;
  jwtSecret: string;
}

interface EditableTokenSettings {
  baseUrl: string;
  customUrl: string;
  permissions: string[];
  expiresIn: string;
  useCustomUrl: boolean;
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleTokens, setModuleTokens] = useState<{ [moduleId: string]: AccessToken[] }>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Récupérer la session utilisateur
    const getSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // Vérifier le statut administrateur
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        setIsAdmin(false);
      } else {
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }; 

  // Charger les données
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        } else {
        setModules(data || []);
        // Charger les tokens pour chaque module
        await fetchModuleTokens(data || []);
      }
    } catch (error) {
      }
  };

  // Charger les tokens associés à chaque module
  const fetchModuleTokens = async (modulesList: Module[]) => {
    try {
      const tokensMap: { [moduleId: string]: AccessToken[] } = {};
      
      for (const module of modulesList) {
        const { data: tokens, error } = await supabase
          .from('access_tokens')
          .select('*')
          .eq('module_id', module.id)
          .order('created_at', { ascending: false });

        if (error) {
          tokensMap[module.id] = [];
        } else {
          tokensMap[module.id] = tokens || [];
        }
      }

      setModuleTokens(tokensMap);
    } catch (error) {
      }
  };

  // Gérer la suppression d'un module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      return;
    }

      try {
         const { error } = await supabase
           .from('modules')
           .delete()
           .eq('id', moduleId);
        
        if (error) {
          alert('Erreur lors de la suppression du module');
        } else {
        setModules(modules.filter(m => m.id !== moduleId));
          alert('Module supprimé avec succès');
        }
      } catch (error) {
      alert('Erreur lors de la suppression du module');
    }
  };

  // Gérer l'ajout d'un module
  const handleAddModule = () => {
    setSelectedModule(null);
    setIsAdding(true);
    setShowModal(true);
  };

  // Gérer un module (mode gestion)
  const handleManageModule = (module: Module) => {
    setSelectedModule(module);
    setShowModal(true);
  };

  // Gérer la modification d'un token
  const handleEditToken = async (tokenId: string, updatedData: Partial<AccessToken>) => {
    try {
      const { error } = await supabase
        .from('access_tokens')
        .update(updatedData)
        .eq('id', tokenId);

      if (error) {
        alert('Erreur lors de la modification du token');
      } else {
        // Recharger les tokens pour le module
        await fetchModuleTokens(modules);
        alert('Token modifié avec succès');
      }
    } catch (error) {
      alert('Erreur lors de la modification du token');
    }
  };

  // Gérer la suppression d'un token
  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce token ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('access_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) {
        alert('Erreur lors de la suppression du token');
      } else {
        // Recharger les tokens pour le module
        await fetchModuleTokens(modules);
        alert('Token supprimé avec succès');
      }
    } catch (error) {
      alert('Erreur lors de la suppression du token');
    }
  }; 

  // Vérifier le statut du service
  const checkServiceStatus = async (moduleTitle: string) => {
    const moduleName = moduleTitle.toLowerCase().replace(/\s+/g, '');
    
    // Mapping des URLs des modules
    const moduleUrls: { [key: string]: string } = {
      'stablediffusion': 'https://stablediffusion.iahome.fr',
      'iaphoto': 'https://iaphoto.iahome.fr', 
      'iametube': '/api/proxy-metube',
      'chatgpt': 'https://chatgpt.iahome.fr',
      'librespeed': '/api/proxy-librespeed',
      'psitransfer': 'https://psitransfer.iahome.fr',
      'pdf+': 'https://pdfplus.iahome.fr',
      'aiassistant': 'https://aiassistant.iahome.fr',
      'cogstudio': 'https://cogstudio.iahome.fr',
              'ruinedfooocus': '/api/gradio-secure',
      'invoke': 'https://invoke.iahome.fr'
    };
    
    const baseUrl = moduleUrls[moduleName];
    
    if (!baseUrl) {
      alert('URL du service non trouvée pour ce module');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(`✅ Service ${moduleTitle} est opérationnel`);
      } else {
        alert(`❌ Service ${moduleTitle} n'est pas accessible (${response.status})`);
      }
    } catch (error) {
      alert(`❌ Erreur lors de la vérification du service ${moduleTitle}`);
    }
  };

  // Fonction de sauvegarde simplifiée (solution de secours)
  const handleSaveModuleSimple = async (moduleData: any) => {
    try {
      // Vérifier l'authentification d'abord
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Erreur: Vous devez être connecté pour modifier les modules');
        return;
      }
      
      // Données minimales
      const simpleData = {
        title: moduleData.title?.trim(),
        description: moduleData.description?.trim(),
        category: moduleData.category?.trim(),
        price: Number(moduleData.price) || 0
      };
      
      if (isAdding) {
        // Ajouter un nouveau module
        const { data, error } = await supabase
          .from('modules')
          .insert([simpleData])
          .select();
        
        if (error) {
          throw error;
        }
        
        setModules([data[0], ...modules]);
        setShowModal(false);
        setSelectedModule(null);
        setIsAdding(false);
        alert('Module ajouté avec succès');
        
      } else {
        // Modifier un module existant
        if (!selectedModule?.id) {
          alert('Erreur: ID du module manquant');
          return;
        }
        
        const { data, error } = await supabase
          .from('modules')
          .update(simpleData)
          .eq('id', selectedModule.id)
          .select();
        
        if (error) {
          throw error;
        }
        
        setModules(modules.map(m => 
          m.id === selectedModule.id ? { ...m, ...simpleData } : m
        ));
        setShowModal(false);
        setSelectedModule(null);
        alert('Module modifié avec succès');
      }
      
        } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur: ${errorMessage}`);
    }
  };

  // Diagnostic détaillé de la base de données
  const diagnoseDatabase = async () => {
    try {
      // 1. Test de connexion basique
      const { data: testData, error: testError } = await supabase
        .from('modules')
        .select('count')
        .limit(1);
      
      if (testError) {
        return { success: false, error: testError };
      }
      
      // 2. Vérifier la structure de la table
      const { data: structureData, error: structureError } = await supabase
        .from('modules')
        .select('*')
        .limit(1);
      
      if (structureError) {
        return { success: false, error: structureError };
      }
      
      const columns = Object.keys(structureData[0] || {});
      // Vérifier si updated_at existe
      const hasUpdatedAt = columns.includes('updated_at');
      if (!hasUpdatedAt) {
        }
      
      // 3. Test d'insertion simple
      const testModule = {
        title: 'Test Module',
        description: 'Module de test pour diagnostic',
        category: 'Test',
        price: 0.00
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('modules')
        .insert([testModule])
        .select()
        .single();
      
      if (insertError) {
        return { success: false, error: insertError };
      }
      
      // 4. Test de mise à jour
      const { data: updateData, error: updateError } = await supabase
        .from('modules')
        .update({ title: 'Test Module Updated' })
        .eq('id', insertData.id)
        .select()
        .single();
      
      if (updateError) {
        return { success: false, error: updateError };
      }
      
      // 5. Nettoyer le test
      const { error: deleteError } = await supabase
        .from('modules')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) {
        console.error('Erreur lors de la suppression:', deleteError);
      } else {
        console.log('Module supprimé avec succès');
      }
      
      return { success: true, columns };
      
    } catch (error) {
      return { success: false, error };
    }
  };

  // Gérer les erreurs de colonnes manquantes
  const handleMissingColumnError = (error: any) => {
    if (error.message && error.message.includes('Could not find the')) {
      const columnMatch = error.message.match(/Could not find the '([^']+)' column/);
      if (columnMatch) {
        const missingColumn = columnMatch[1];
        const solution = `
Erreur: Colonne '${missingColumn}' manquante dans la table modules.

Solutions:
1. Exécuter le script SQL dans Supabase:
   - Aller dans l'interface SQL de Supabase
   - Copier et exécuter le contenu de fix-database.sql

2. Ou exécuter cette commande SQL:
   ALTER TABLE public.modules ADD COLUMN ${missingColumn} TEXT;

3. Vérifier la structure de la table:
   SELECT column_name FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = 'modules';
        `;
        
        alert(solution);
        return true;
      }
    }
    
    return false;
  };

  // Tester la connexion à Supabase et la structure de la table
  const testSupabaseConnection = async () => {
    try {
      // Test de connexion basique
      const { data: testData, error: testError } = await supabase
        .from('modules')
        .select('count')
        .limit(1);
      
      if (testError) {
        alert(`Erreur de connexion à Supabase: ${testError.message}`);
        return false;
      }
      
      // Vérifier la structure de la table
      const { data: structureData, error: structureError } = await supabase
        .from('modules')
        .select('*')
        .limit(1);
      
      if (structureError) {
        alert(`Erreur de structure de table: ${structureError.message}`);
        return false;
      }
      
      const availableColumns = Object.keys(structureData[0] || {});
      // Vérifier les colonnes requises
      const requiredColumns = ['id', 'title', 'description', 'category', 'price'];
      const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
      
      if (missingColumns.length > 0) {
        alert(`Colonnes manquantes dans la table modules: ${missingColumns.join(', ')}\nVeuillez exécuter le script fix-database.sql`);
        return false;
      }
      
      // Vérifier les colonnes optionnelles
      const optionalColumns = ['url', 'image_url'];
      const missingOptionalColumns = optionalColumns.filter(col => !availableColumns.includes(col));
      
      if (missingOptionalColumns.length > 0) {
        }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors du test de connexion: ${errorMessage}`);
      return false;
    }
  };

  // Validation des données du module
  const validateModuleData = (moduleData: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validation des champs obligatoires
    if (!moduleData.title || moduleData.title.trim().length === 0) {
      errors.push('Le titre est obligatoire');
    }
    
    if (!moduleData.description || moduleData.description.trim().length === 0) {
      errors.push('La description est obligatoire');
    }
    
    if (!moduleData.category || moduleData.category.trim().length === 0) {
      errors.push('La catégorie est obligatoire');
    }
    
    // Validation du prix
    if (moduleData.price === undefined || moduleData.price === null) {
      errors.push('Le prix est obligatoire');
    } else if (isNaN(Number(moduleData.price)) || Number(moduleData.price) < 0) {
      errors.push('Le prix doit être un nombre positif');
    }
    
    // Validation des URLs (optionnelles mais si présentes, doivent être valides)
    if (moduleData.youtube_url && moduleData.youtube_url.trim().length > 0) {
      try {
        new URL(moduleData.youtube_url);
      } catch {
        errors.push('L\'URL YouTube n\'est pas valide');
      }
    }
    
    if (moduleData.url && moduleData.url.trim().length > 0) {
      try {
        new URL(moduleData.url);
      } catch {
        errors.push('L\'URL du module n\'est pas valide');
      }
    }
    
    if (moduleData.image_url && moduleData.image_url.trim().length > 0) {
      try {
        new URL(moduleData.image_url);
      } catch {
        errors.push('L\'URL de l\'image n\'est pas valide');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Sauvegarder un module
  const handleSaveModule = async (moduleData: any) => {
    try {
      // Diagnostic complet de la base de données
      const diagnosis = await diagnoseDatabase();
      
      if (!diagnosis.success) {
        await handleSaveModuleSimple(moduleData);
        return;
      }
      
      // Vérifier si updated_at existe dans la base
      const hasUpdatedAt = diagnosis.columns?.includes('updated_at') || false;
      // Validation des données
      const validation = validateModuleData(moduleData);
      if (!validation.isValid) {
        alert(`Erreurs de validation:\n${validation.errors.join('\n')}`);
        return;
      }

      // Nettoyer les données avant sauvegarde
      const cleanData: any = {
        title: moduleData.title.trim(),
        description: moduleData.description.trim(),
        subtitle: moduleData.subtitle?.trim() || null,
        category: moduleData.category.trim(),
        price: Number(moduleData.price),
        youtube_url: moduleData.youtube_url?.trim() || null
      };
      
      // Ajouter les colonnes optionnelles seulement si elles existent dans les données
      if (moduleData.url !== undefined) {
        cleanData.url = moduleData.url?.trim() || null;
      }
      
      if (moduleData.image_url !== undefined) {
        cleanData.image_url = moduleData.image_url?.trim() || null;
      }
      
      // Ne pas inclure updated_at si la colonne n'existe pas
      if (!hasUpdatedAt && cleanData.updated_at !== undefined) {
        delete cleanData.updated_at;
        }
      
      // Supprimer les propriétés undefined ou null qui peuvent causer des erreurs
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined || cleanData[key] === null || cleanData[key] === '') {
          delete cleanData[key];
        }
      });
      
      if (isAdding) {
        // Ajouter un nouveau module
        const { data, error } = await supabase
          .from('modules')
          .insert([cleanData])
          .select()
          .single();
        
        if (error) {
          console.error('Erreur lors de l\'ajout:', error);
          
          // Essayer de gérer les erreurs de colonnes manquantes
          if (!handleMissingColumnError(error)) {
            const errorMessage = error.message || error.details || error.hint || 'Erreur inconnue';
            alert(`Erreur lors de l'ajout du module:\n${errorMessage}`);
          }
        } else {
          setModules([data, ...modules]);
          setShowModal(false);
          setSelectedModule(null);
          setIsAdding(false);
          alert('Module ajouté avec succès');
        }
      } else {
        // Vérifier que l'ID du module existe
        if (!selectedModule) {
          alert('Erreur: Module en édition manquant');
          return;
        }
        
        if (!selectedModule.id) {
          alert('Erreur: ID du module manquant');
          return;
        }
        
        // Modifier un module existant
        const { data, error } = await supabase
          .from('modules')
          .update(cleanData)
          .eq('id', selectedModule.id)
          .select()
          .single();

        if (error) {
          console.error('Erreur lors de la modification:', error);
          // Essayer de gérer les erreurs de colonnes manquantes
          if (!handleMissingColumnError(error)) {
            const errorMessage = error.message || error.details || error.hint || 'Erreur inconnue';
            alert(`Erreur lors de la modification du module:\n${errorMessage}`);
          }
        } else {
          setModules(modules.map(m => 
            m.id === selectedModule.id ? { ...m, ...cleanData } : m
          ));
          setShowModal(false);
          setSelectedModule(null);
          alert('Module modifié avec succès');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      const errorStack = error instanceof Error ? error.stack : 'Pas de stack trace';
      console.error('Erreur complète:', { errorMessage, errorStack });
      
      // Afficher l'erreur dans une alerte plus détaillée
      alert(`Erreur lors de la sauvegarde du module:\n\n${errorMessage}\n\nVérifiez la console pour plus de détails.`);
    }
  };

    // Obtenir les informations du token
  const getTokenInfo = (module: Module): TokenInfo => {
    const moduleName = module.title.toLowerCase().replace(/\s+/g, '');
    
    // Utiliser l'URL du module depuis la base de données, sinon URL par défaut
    const baseUrl = module.url || 'https://stablediffusion.iahome.fr';
    const accessUrl = `${baseUrl}?token={JWT_TOKEN}`;
    
    return {
      moduleName,
      baseUrl,
      accessUrl,
      permissions: ['read', 'access', 'write', 'advanced_features'],
      expiresIn: '72h',
      jwtSecret: process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production'
    };
  };

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Rendu principal du composant
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  } 

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des modules</h1>
          <p className="mt-2 text-gray-600">Gérez les modules disponibles sur la plateforme</p>
        </div>

        {/* Bouton d'ajout */}
        <div className="mb-6">
            <button
            onClick={handleAddModule}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            Ajouter un module
            </button>
          </div>

        {/* Tableau des modules */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modules.map((module) => {
                  const moduleTokensList = moduleTokens[module.id] || [];
                  const activeTokens = moduleTokensList.filter(token => token.is_active);
                  const expiredTokens = moduleTokensList.filter(token => new Date(token.expires_at) < new Date());
                  
                  return (
                                         <tr key={module.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center space-x-3">
                           {module.image_url && (
                             <div className="flex-shrink-0">
                               <img
                                 src={module.image_url}
                                 alt={module.title}
                                 className="h-12 w-12 rounded-lg object-cover"
                                 onError={(e) => {
                                   e.currentTarget.style.display = 'none';
                                 }}
                               />
                             </div>
                           )}
                           <div>
                             <div className="text-sm font-medium text-gray-900">{module.title}</div>
                             {module.subtitle && (
                               <div className="text-sm text-gray-500">{module.subtitle}</div>
                             )}
                           </div>
                         </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {module.category}
                          </span>
                          
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {module.price > 0 ? `${module.price}€` : 'Gratuit'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">
                              {moduleTokensList.length} total
                            </span>
                            {activeTokens.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {activeTokens.length} actifs
                              </span>
                            )}
                            {expiredTokens.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {expiredTokens.length} expirés
                              </span>
                            )}
                     </div>
                          {moduleTokensList.length > 0 && (
                            <button
                              onClick={() => handleManageModule(module)}
                              className="text-xs text-blue-600 hover:text-blue-900 underline"
                            >
                              Gérer les tokens
                            </button>
                   )}
                </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <div className="flex space-x-2">
                           <button
                             onClick={() => handleManageModule(module)}
                             className="text-blue-600 hover:text-blue-900"
                           >
                             Gérer
                           </button>
                           <button
                             onClick={() => handleDeleteModule(module.id)}
                             className="text-red-600 hover:text-red-900"
                           >
                             Supprimer
                           </button>
                         </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
                          {/* Modal unifié pour ajouter/modifier/gérer un module */}
         {showModal && (
           <UnifiedModuleModal
             module={selectedModule}
             isAdding={isAdding}
             onSave={handleSaveModule}
             onClose={() => {
               setShowModal(false);
               setSelectedModule(null);
               setIsAdding(false);
             }}
             onCheckStatus={!isAdding ? checkServiceStatus : undefined}
             tokenInfo={!isAdding && selectedModule ? getTokenInfo(selectedModule) : undefined}
             moduleTokens={!isAdding && selectedModule ? moduleTokens[selectedModule.id] || [] : undefined}
             onEditToken={!isAdding ? handleEditToken : undefined}
             onDeleteToken={!isAdding ? handleDeleteToken : undefined}
           />
         )}
                </div>
               </div>
  );
} 