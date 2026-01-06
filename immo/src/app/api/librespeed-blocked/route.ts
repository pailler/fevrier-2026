import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚫 LibreSpeed Blocked: Accès direct bloqué');
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès LibreSpeed Bloqué - iahome.fr</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            margin: 1rem;
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        h1 {
            color: #e74c3c;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        .btn {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #2980b9;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🚫</div>
        <h1>Accès Direct Bloqué</h1>
        <p>L'accès direct à LibreSpeed est interdit pour des raisons de sécurité.</p>
        
        <div class="warning">
            <strong>⚠️ Sécurité Renforcée</strong><br>
            LibreSpeed n'est accessible que via votre tableau de bord iahome.fr
        </div>
        
        <p>Pour accéder à LibreSpeed :</p>
        <ol style="text-align: left; color: #666;">
            <li>Connectez-vous à <strong>iahome.fr</strong></li>
            <li>Allez dans la section <strong>En cours</strong></li>
            <li>Cliquez sur le module <strong>LibreSpeed</strong></li>
        </ol>
        
        <a href="https://iahome.fr/encours" class="btn">
            🏠 Aller au Tableau de Bord
        </a>
    </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ LibreSpeed Blocked Error:', error);
    return new NextResponse('Access Denied', { status: 403 });
  }
}
