import { NextRequest, NextResponse } from 'next/server';
import { issueModuleAccessJwtWithDebit } from '@/utils/moduleAccessJwtIssue';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const cleanBody = body.replace(/\\"/g, '"');
    const { userId, userEmail, moduleId } = JSON.parse(cleanBody);

    const issued = await issueModuleAccessJwtWithDebit({ userId, userEmail, moduleId });

    if (issued.ok === false) {
      const fail = issued;
      if (fail.code === 'BAD_INPUT') {
        return NextResponse.json({ error: fail.error }, { status: 400 });
      }
      if (fail.code === 'TOKENS_NOT_FOUND') {
        return NextResponse.json(
          { error: fail.error, code: fail.code },
          { status: 400 }
        );
      }
      if (fail.code === 'INSUFFICIENT_TOKENS') {
        return NextResponse.json(
          {
            error: fail.error,
            code: fail.code,
            tokensRemaining: fail.tokensRemaining,
            tokensRequired: fail.tokensRequired,
            pricingUrl: 'https://iahome.fr/pricing2',
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: fail.error, code: fail.code },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const secureProxyUrl = `${baseUrl}/api/secure-proxy?token=${issued.token}&module=${issued.normalizedModuleId}`;

    return NextResponse.json({
      success: true,
      token: issued.token,
      moduleId: issued.normalizedModuleId,
      moduleTitle:
        issued.normalizedModuleId.charAt(0).toUpperCase() +
        issued.normalizedModuleId.slice(1),
      cost: issued.moduleCost,
      tokensConsumed: issued.moduleCost,
      tokensRemaining: issued.tokensRemaining,
      url: secureProxyUrl,
      expiresAt: 4102444800000,
    });
  } catch (error) {
    console.error('Erreur génération token:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
