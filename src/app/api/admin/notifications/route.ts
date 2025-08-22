import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';
import { NotificationService } from '../../../../utils/notificationService';

export async function GET(request: NextRequest) {
  try {
    const notificationService = NotificationService.getInstance();
    const settings = await notificationService.getNotificationSettings();
    const logs = await notificationService.getNotificationLogs(20);

    return NextResponse.json({
      success: true,
      data: {
        settings,
        logs
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, updates } = body;

    if (!eventType || !updates) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const notificationService = NotificationService.getInstance();
    const success = await notificationService.updateNotificationSetting(eventType, updates);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Paramètre mis à jour avec succès'
      });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, userEmail, eventData } = body;

    if (!eventType || !userEmail) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const notificationService = NotificationService.getInstance();
    const success = await notificationService.sendNotification(eventType, userEmail, eventData);

    return NextResponse.json({
      success,
      message: success ? 'Notification envoyée avec succès' : 'Erreur lors de l\'envoi'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
