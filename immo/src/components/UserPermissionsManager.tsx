'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../utils/supabaseClient';

interface UserPermission {
  moduleId: string;
  moduleTitle: string;
  isActive: boolean;
  expiresAt: string | null;
  usageCount: number;
  maxUsage: number;
  accessType: string;
}

interface UserPermissionsManagerProps {
  onPermissionsChange?: (permissions: UserPermission[]) => void;
  showDetails?: boolean;
}

export default function UserPermissionsManager({ 
  onPermissionsChange, 
  showDetails = false 
}: UserPermissionsManagerProps) {
  const user = useUser();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserPermissions();
    }
  }, [user?.id]);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_applications')
        .select(`
          id,
          module_id,
          module_title,
          is_active,
          expires_at,
          usage_count,
          max_usage,
          access_type,
          created_at
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const userPermissions: UserPermission[] = data.map(app => ({
        moduleId: app.module_id,
        moduleTitle: app.module_title,
        isActive: app.is_active,
        expiresAt: app.expires_at,
        usageCount: app.usage_count || 0,
        maxUsage: app.max_usage || 0,
        accessType: app.access_type || 'standard'
      }));

      setPermissions(userPermissions);
      onPermissionsChange?.(userPermissions);

    } catch (err) {
      console.error('❌ Erreur lors du chargement des permissions:', err);
      setError('Erreur lors du chargement des permissions');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (moduleId: string): boolean => {
    const permission = permissions.find(p => p.moduleId === moduleId);
    return permission?.isActive === true;
  };

  const isExpired = (moduleId: string): boolean => {
    const permission = permissions.find(p => p.moduleId === moduleId);
    if (!permission?.expiresAt) return false;
    
    const now = new Date();
    const expiresAt = new Date(permission.expiresAt);
    return now > expiresAt;
  };

  const isQuotaExceeded = (moduleId: string): boolean => {
    const permission = permissions.find(p => p.moduleId === moduleId);
    if (!permission) return true;
    
    return permission.maxUsage > 0 && permission.usageCount >= permission.maxUsage;
  };

  const getQuotaInfo = (moduleId: string) => {
    const permission = permissions.find(p => p.moduleId === moduleId);
    if (!permission) return null;

    return {
      usageCount: permission.usageCount,
      maxUsage: permission.maxUsage,
      isUnlimited: permission.maxUsage === 0,
      percentage: permission.maxUsage > 0 ? (permission.usageCount / permission.maxUsage) * 100 : 0
    };
  };

  const getTimeRemaining = (moduleId: string): string | null => {
    const permission = permissions.find(p => p.moduleId === moduleId);
    if (!permission?.expiresAt) return null;

    const now = new Date();
    const expiresAt = new Date(permission.expiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expiré';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getAccessStatus = (moduleId: string): 'active' | 'expired' | 'quota_exceeded' | 'inactive' => {
    if (!hasPermission(moduleId)) return 'inactive';
    if (isExpired(moduleId)) return 'expired';
    if (isQuotaExceeded(moduleId)) return 'quota_exceeded';
    return 'active';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement des permissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-600 text-xl mr-2">⚠️</span>
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!showDetails) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Mes Permissions</h3>
      
      {permissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">🔒</span>
          <p>Aucune permission trouvée</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {permissions.map((permission) => {
            const status = getAccessStatus(permission.moduleId);
            const quotaInfo = getQuotaInfo(permission.moduleId);
            const timeRemaining = getTimeRemaining(permission.moduleId);

            return (
              <div
                key={permission.moduleId}
                className={`border rounded-lg p-4 ${
                  status === 'active' ? 'border-green-200 bg-green-50' :
                  status === 'expired' ? 'border-red-200 bg-red-50' :
                  status === 'quota_exceeded' ? 'border-yellow-200 bg-yellow-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {permission.moduleTitle}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Type: {permission.accessType}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'active' ? 'bg-green-100 text-green-800' :
                      status === 'expired' ? 'bg-red-100 text-red-800' :
                      status === 'quota_exceeded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status === 'active' ? 'Actif' :
                       status === 'expired' ? 'Expiré' :
                       status === 'quota_exceeded' ? 'Quota épuisé' :
                       'Inactif'}
                    </span>
                  </div>
                </div>

                {quotaInfo && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Utilisation</span>
                      <span>
                        {quotaInfo.usageCount} / {quotaInfo.isUnlimited ? '∞' : quotaInfo.maxUsage}
                      </span>
                    </div>
                    {!quotaInfo.isUnlimited && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            quotaInfo.percentage >= 100 ? 'bg-red-500' :
                            quotaInfo.percentage >= 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(quotaInfo.percentage, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {timeRemaining && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Temps restant:</span> {timeRemaining}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Hook personnalisé pour utiliser les permissions
export function useUserPermissions() {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  const hasPermission = (moduleId: string): boolean => {
    const permission = permissions.find(p => p.moduleId === moduleId);
    return permission?.isActive === true;
  };

  const isExpired = (moduleId: string): boolean => {
    const permission = permissions.find(p => p.moduleId === moduleId);
    if (!permission?.expiresAt) return false;
    
    const now = new Date();
    const expiresAt = new Date(permission.expiresAt);
    return now > expiresAt;
  };

  const isQuotaExceeded = (moduleId: string): boolean => {
    const permission = permissions.find(p => p.moduleId === moduleId);
    if (!permission) return true;
    
    return permission.maxUsage > 0 && permission.usageCount >= permission.maxUsage;
  };

  const getAccessStatus = (moduleId: string): 'active' | 'expired' | 'quota_exceeded' | 'inactive' => {
    if (!hasPermission(moduleId)) return 'inactive';
    if (isExpired(moduleId)) return 'expired';
    if (isQuotaExceeded(moduleId)) return 'quota_exceeded';
    return 'active';
  };

  return {
    permissions,
    loading,
    hasPermission,
    isExpired,
    isQuotaExceeded,
    getAccessStatus,
    setPermissions
  };
}
