import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const chunkIndex = parseInt(formData.get('chunkIndex') as string);
        const totalChunks = parseInt(formData.get('totalChunks') as string);
        const fileName = formData.get('fileName') as string;
        const fileSize = parseInt(formData.get('fileSize') as string);
        
        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
        }
        
        // Créer le dossier temporaire pour les chunks
        const tempDir = join(process.cwd(), 'temp', 'chunks', fileName);
        await mkdir(tempDir, { recursive: true });
        
        // Sauvegarder le chunk
        const chunkPath = join(tempDir, `chunk-${chunkIndex}`);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(chunkPath, buffer);
        
        return NextResponse.json({ 
            success: true, 
            chunkIndex, 
            message: 'Chunk uploadé avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur upload chunk:', error);
        return NextResponse.json({ error: 'Erreur lors de l\'upload du chunk' }, { status: 500 });
    }
}
