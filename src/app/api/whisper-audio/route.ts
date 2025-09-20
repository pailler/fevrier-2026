import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        const response = await fetch('http://localhost:8092/asr', {
            method: 'POST',
            body: formData,
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
        console.error('Erreur API audio:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la transcription audio' },
            { status: 500 }
        );
    }
}
