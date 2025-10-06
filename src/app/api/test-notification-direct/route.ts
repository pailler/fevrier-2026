'use client';

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../utils/notificationService';
import { EmailService } from '../../../utils/emailService';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Début du test direct de notification');
    
    // Vérifier le contenu de la requête
    const contentType = request.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);
    
    // Lire le body brut
    const bodyText = await request.text();
    console.log('📦 Body brut reçu (longueur):', bodyText.length);
    
    // Si le body est vide, retourner une erreur informative
    if (!bodyText || bodyText.trim() === '') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Body vide',
          details: 'La requête ne contient aucun body'
        },
        { status: 400 }
      );
    }
    
    // Essayer de parser le JSON
    let body: any;
    try {
      body = JSON.parse(bodyText);
      console.log('📦 Body parsé:', JSON.stringify(body));
    } catch (jsonError) {
      console.error('❌ Erreur parsing JSON:', jsonError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erreur parsing JSON',
          details: jsonError instanceof Error ? jsonError.message : 'Erreur inconnue',
          debug: {
            receivedContent: bodyText,
            contentType,
            bodyLength: bodyText.length
          }
        },
        { status: 400 }
      );
    }
    
    // Vérifier l'email
    const email = body.email;
    if (!email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email requis',
          details: 'Le champ email est manquant dans le body de la requête'
        },
        { status: 400 }
      );
    }

    console.log('🧪 Test direct de notification pour:', email);

    // Test 1: Service de notification
    const notificationService = NotificationService.getInstance();
    console.log('✅ Service de notification initialisé');

    // Test 2: Envoi via NotificationService
    const result = await notificationService.sendModuleActivatedNotification(
      email,
      'Utilisateur Test',
      'Test Application'
    );

    console.log('📧 Résultat NotificationService:', result);

    // Test 3: Envoi direct via EmailService
    const emailService = EmailService.getInstance();
    const directResult = await emailService.sendEmail({
      to: email,
      subject: 'Test Direct EmailService - IAHome',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Direct EmailService</h2>
          <p>Ceci est un test direct via EmailService.</p>
          <p>Timestamp: ${new Date().toLocaleString('fr-FR')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Test direct pour diagnostiquer le problème d'envoi d'emails.
          </p>
        </div>
      `
    });

    console.log('📧 Résultat EmailService direct:', directResult);

    const response = {
      success: true,
      results: {
        notificationService: result,
        emailServiceDirect: directResult,
        timestamp: new Date().toISOString()
      }
    };

    console.log('✅ Réponse finale:', JSON.stringify(response));
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erreur lors du test direct:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors du test direct',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
