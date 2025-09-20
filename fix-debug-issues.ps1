# Script pour corriger les problèmes de debug identifiés

Write-Host "🔧 Correction des problèmes de debug iahome.fr" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host "`n1. Correction du service email..." -ForegroundColor Yellow

# Vérifier que les variables d'environnement sont bien définies
$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "RESEND_API_KEY") {
        Write-Host "   ✅ RESEND_API_KEY configuré" -ForegroundColor Green
    } else {
        Write-Host "   ❌ RESEND_API_KEY manquant" -ForegroundColor Red
    }
    
    if ($envContent -match "RESEND_FROM_EMAIL") {
        Write-Host "   ✅ RESEND_FROM_EMAIL configuré" -ForegroundColor Green
    } else {
        Write-Host "   ❌ RESEND_FROM_EMAIL manquant" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Fichier .env.local manquant" -ForegroundColor Red
}

Write-Host "`n2. Correction des warnings CSS preload..." -ForegroundColor Yellow

# Créer un composant pour gérer les preloads CSS
$cssPreloadFix = @"
'use client';

import { useEffect } from 'react';

export default function CSSPreloadManager() {
  useEffect(() => {
    // Gérer les preloads CSS pour éviter les warnings
    const manageCSSPreloads = () => {
      const cssLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
      
      cssLinks.forEach(link => {
        // Marquer comme utilisé après un court délai
        setTimeout(() => {
          if (!link.hasAttribute('data-used')) {
            link.setAttribute('data-used', 'true');
            // Convertir en stylesheet si pas encore fait
            if (link.getAttribute('as') === 'style') {
              link.setAttribute('rel', 'stylesheet');
            }
          }
        }, 100);
      });
    };

    // Exécuter immédiatement et après le chargement
    manageCSSPreloads();
    window.addEventListener('load', manageCSSPreloads);

    return () => {
      window.removeEventListener('load', manageCSSPreloads);
    };
  }, []);

  return null;
}
"@

$cssPreloadFix | Out-File -FilePath "src/components/CSSPreloadManager.tsx" -Encoding UTF8
Write-Host "   ✅ Composant CSSPreloadManager créé" -ForegroundColor Green

Write-Host "`n3. Optimisation du service email..." -ForegroundColor Yellow

# Améliorer le service email pour éviter les warnings
$emailServiceFix = @"
import { Resend } from 'resend';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeResend();
  }

  private initializeResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not configured - email service disabled');
      this.isConfigured = false;
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.resend) {
        console.warn('Email service not configured - skipping email send');
        return false;
      }

      const { to, subject, html, from = process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>' } = emailData;

      console.log('🔍 DEBUG: Appel de emailService.sendEmail...');
      
      const result = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (result.error) {
        console.error('Email send error:', result.error);
        return false;
      }

      console.log('📧 Résultat envoi email: true');
      console.log('Email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      console.log('📧 Résultat envoi email: false');
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Test Email from IAHome',
      html: '<h1>Test Email</h1><p>This is a test email from IAHome.</p>'
    });
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}
"@

$emailServiceFix | Out-File -FilePath "src/utils/emailService.ts" -Encoding UTF8
Write-Host "   ✅ Service email optimisé" -ForegroundColor Green

Write-Host "`n4. Création d'un composant de debug..." -ForegroundColor Yellow

$debugComponent = @"
'use client';

import { useEffect, useState } from 'react';

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Afficher le panneau de debug en mode développement
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    // Collecter les informations de debug
    const info = {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      performance: {
        navigation: performance.getEntriesByType('navigation')[0],
        paint: performance.getEntriesByType('paint')
      }
    };
    setDebugInfo(info);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Debug Panel</h4>
      <div>
        <strong>URL:</strong> {debugInfo.url}
      </div>
      <div>
        <strong>Time:</strong> {debugInfo.timestamp}
      </div>
      <div>
        <strong>Performance:</strong>
        <pre style={{fontSize: '10px', margin: '5px 0'}}>
          {JSON.stringify(debugInfo.performance, null, 2)}
        </pre>
      </div>
    </div>
  );
}
"@

$debugComponent | Out-File -FilePath "src/components/DebugPanel.tsx" -Encoding UTF8
Write-Host "   ✅ Composant DebugPanel créé" -ForegroundColor Green

Write-Host "`n5. Instructions de redémarrage..." -ForegroundColor Yellow
Write-Host "   - Redémarrez l'application pour appliquer les corrections" -ForegroundColor White
Write-Host "   - Les warnings CSS preload devraient être réduits" -ForegroundColor White
Write-Host "   - Le service email devrait fonctionner correctement" -ForegroundColor White

Write-Host "`n✅ Corrections appliquées!" -ForegroundColor Green
Write-Host "🔧 Redémarrez l'application avec: docker restart iahome-app" -ForegroundColor Cyan
