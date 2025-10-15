import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        // Créer un nouveau FormData avec le bon nom de champ
        const newFormData = new FormData();
        const file = formData.get('file') as File;
        if (file) {
            newFormData.append('image_file', file);
        }
        
        const response = await fetch('http://host.docker.internal:8094/ocr', {
            method: 'POST',
            body: newFormData,
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Service error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }
        
        const result = await response.text();
        return new NextResponse(result, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
        
    } catch (error) {
        console.error('Erreur API OCR:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la reconnaissance OCR' },
            { status: 500 }
        );
    }
}
