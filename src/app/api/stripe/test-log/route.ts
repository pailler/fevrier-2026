import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de test pour vérifier que les logs fonctionnent
 * GET /api/stripe/test-log
 */
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log('🧪 TEST LOG - Timestamp:', timestamp);
  console.log('🧪 TEST LOG - Ce log devrait apparaître dans les logs du serveur');
  console.log('🧪 TEST LOG - Si vous voyez ce log, les logs fonctionnent correctement');
  
  return NextResponse.json({
    status: 'ok',
    message: 'Log de test généré',
    timestamp: timestamp,
    instruction: 'Vérifiez les logs du serveur pour voir ce message avec 🧪 TEST LOG'
  });
}
