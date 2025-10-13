import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation des champs obligatoires
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Vérification de la configuration Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY non configuré');
      return NextResponse.json(
        { error: 'Configuration email non disponible' },
        { status: 500 }
      );
    }

    // Préparation du contenu de l'email
    const emailSubject = subject ? `[Contact IA Home] ${subject}` : '[Contact IA Home] Nouveau message';
    
    const emailContent = `
Nouveau message reçu via le formulaire de contact IA Home

Informations du contact :
- Nom : ${name}
- Email : ${email}
- Sujet : ${subject || 'Non spécifié'}

Message :
${message}

---
Ce message a été envoyé automatiquement depuis le formulaire de contact de https://iahome.fr
    `.trim();

    console.log('📧 Tentative d\'envoi d\'email de contact...');
    console.log(`📧 De: ${email}`);
    console.log(`📧 Sujet: ${emailSubject}`);

    // Envoi de l'email
    const { data, error } = await resend.emails.send({
      from: 'IA Home <noreply@iahome.fr>',
      to: ['formateur_tic@hotmail.com'],
      subject: emailSubject,
      text: emailContent,
      replyTo: email,
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    console.log('✅ Email de contact envoyé avec succès:', data);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message envoyé avec succès',
        emailId: data?.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Erreur dans l\'API contact:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
