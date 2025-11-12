import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Valeurs par défaut pour éviter les erreurs si les variables d'environnement ne sont pas disponibles
const DEFAULT_SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

// Fonction helper pour obtenir une variable d'environnement avec fallback
function getEnvVar(key: string, defaultValue: string): string {
  try {
    const value = process.env[key];
    if (!value || value === 'undefined' || value === 'null' || value.trim() === '') {
      return defaultValue;
    }
    return value;
  } catch (error) {
    return defaultValue;
  }
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', DEFAULT_SUPABASE_URL);
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { moduleId, userEmail } = await request.json();

    if (!moduleId || !userEmail) {
      return NextResponse.json(
        { error: 'moduleId et userEmail requis' },
        { status: 400 }
      );
    }

    // Vérifier les paiements dans la table payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_email', userEmail)
      .eq('status', 'succeeded')
      .eq('module_id', moduleId);

    if (paymentsError) {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des paiements' },
        { status: 500 }
      );
    }

    // Vérifier les abonnements dans la table subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_email', userEmail)
      .eq('module_id', moduleId)
      .eq('status', 'active');

    if (subscriptionsError) {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des abonnements' },
        { status: 500 }
      );
    }

    // Vérifier si l'utilisateur a un accès spécial (pour les tests)
    const hasSpecialAccess = userEmail === 'regispailler@gmail.com';
    
    const hasPayment = payments && payments.length > 0;
    const hasSubscription = subscriptions && subscriptions.length > 0;
    const hasAccess = hasPayment || hasSubscription || hasSpecialAccess;

    return NextResponse.json({
      hasAccess,
      hasPayment,
      hasSubscription,
      hasSpecialAccess,
      payments: payments || [],
      subscriptions: subscriptions || []
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 