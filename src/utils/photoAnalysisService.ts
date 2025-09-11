import { OpenAI } from 'openai';
import { supabase } from './supabaseClient';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PhotoAnalysisResult {
  description: string;
  tags: string[];
  categories: string[];
  location?: string;
  cameraSettings?: {
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
  };
  mood?: string;
  colors?: string[];
  composition?: string;
  technicalQuality?: string;
}

export interface PhotoUploadData {
  file: File;
  userId: string;
  collectionId?: string;
  customDescription?: string;
  customTags?: string[];
}

export class PhotoAnalysisService {
  /**
   * Analyse une photo et génère une description détaillée avec des tags
   */
  static async analyzePhoto(imageUrl: string): Promise<PhotoAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyse cette photo de manière détaillée et professionnelle. Fournis une description complète en français qui inclut :
                
                1. Description générale de la scène
                2. Éléments visuels principaux (personnes, objets, paysages, etc.)
                3. Ambiance et atmosphère
                4. Qualité technique (éclairage, composition, netteté)
                5. Couleurs dominantes
                6. Type de photo (portrait, paysage, mariage, événement, etc.)
                7. Lieu possible si identifiable
                8. Paramètres techniques estimés si visibles
                
                Format de réponse en JSON :
                {
                  "description": "Description détaillée en français",
                  "tags": ["tag1", "tag2", "tag3"],
                  "categories": ["catégorie1", "catégorie2"],
                  "location": "Lieu si identifiable",
                  "cameraSettings": {
                    "aperture": "f/2.8",
                    "shutterSpeed": "1/125s",
                    "iso": "ISO 400",
                    "focalLength": "85mm"
                  },
                  "mood": "romantique, dramatique, joyeux, etc.",
                  "colors": ["bleu", "blanc", "doré"],
                  "composition": "règle des tiers, symétrie, etc.",
                  "technicalQuality": "excellente, bonne, moyenne"
                }`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Aucune réponse de l\'IA');
      }

      // Extraire le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      return analysis as PhotoAnalysisResult;

    } catch (error) {
      console.error('Erreur lors de l\'analyse de la photo:', error);
      throw new Error('Impossible d\'analyser la photo');
    }
  }

  /**
   * Génère un embedding vectoriel pour une description de photo
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'embedding:', error);
      throw new Error('Impossible de générer l\'embedding');
    }
  }

  /**
   * Sauvegarde une photo et ses métadonnées dans Supabase
   */
  static async savePhotoWithAnalysis(
    photoData: PhotoUploadData,
    analysis: PhotoAnalysisResult
  ): Promise<string> {
    try {
      // 1. Upload de la photo vers Supabase Storage
      const fileExt = photoData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `photos/${photoData.userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photo-portfolio')
        .upload(filePath, photoData.file);

      if (uploadError) {
        throw new Error(`Erreur upload: ${uploadError.message}`);
      }

      // 2. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('photo-portfolio')
        .getPublicUrl(filePath);

      // 3. Sauvegarder les métadonnées de la photo
      const { data: photoMetadata, error: metadataError } = await supabase
        .from('photo_metadata')
        .insert({
          user_id: photoData.userId,
          file_name: photoData.file.name,
          file_path: filePath,
          file_size: photoData.file.size,
          mime_type: photoData.file.type,
          width: 0, // À extraire avec une librairie d'image
          height: 0, // À extraire avec une librairie d'image
        })
        .select()
        .single();

      if (metadataError) {
        throw new Error(`Erreur métadonnées: ${metadataError.message}`);
      }

      // 4. Sauvegarder la description et les tags
      const { error: descriptionError } = await supabase
        .from('photo_descriptions')
        .insert({
          photo_id: photoMetadata.id,
          description: analysis.description,
          ai_generated: true,
          tags: analysis.tags,
          categories: analysis.categories,
          location: analysis.location,
          camera_settings: analysis.cameraSettings,
        });

      if (descriptionError) {
        throw new Error(`Erreur description: ${descriptionError.message}`);
      }

      // 5. Générer et sauvegarder l'embedding
      const embeddingText = `${analysis.description} ${analysis.tags.join(' ')} ${analysis.categories.join(' ')}`;
      const embedding = await this.generateEmbedding(embeddingText);

      const { error: embeddingError } = await supabase
        .from('photo_embeddings')
        .insert({
          photo_id: photoMetadata.id,
          embedding: embedding,
          model_name: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
        });

      if (embeddingError) {
        throw new Error(`Erreur embedding: ${embeddingError.message}`);
      }

      // 6. Créer l'entrée d'analytics
      const { error: analyticsError } = await supabase
        .from('photo_analytics')
        .insert({
          photo_id: photoMetadata.id,
          view_count: 0,
          download_count: 0,
          search_count: 0,
        });

      if (analyticsError) {
        console.warn('Erreur analytics (non critique):', analyticsError.message);
      }

      // 7. Ajouter à une collection si spécifiée
      if (photoData.collectionId) {
        const { error: collectionError } = await supabase
          .from('collection_photos')
          .insert({
            collection_id: photoData.collectionId,
            photo_id: photoMetadata.id,
          });

        if (collectionError) {
          console.warn('Erreur collection (non critique):', collectionError.message);
        }
      }

      return photoMetadata.id;

    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la photo:', error);
      throw error;
    }
  }

  /**
   * Recherche sémantique de photos
   */
  static async searchPhotos(
    query: string,
    userId: string,
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<any[]> {
    try {
      // Générer l'embedding de la requête
      const queryEmbedding = await this.generateEmbedding(query);

      // Rechercher les photos similaires
      const { data, error } = await supabase.rpc('search_photos_by_similarity', {
        query_embedding: queryEmbedding,
        user_id_param: userId,
        limit_param: limit,
        threshold_param: threshold
      });

      if (error) {
        throw new Error(`Erreur recherche: ${error.message}`);
      }

      // Mettre à jour les statistiques de recherche
      if (data && data.length > 0) {
        const photoIds = data.map((photo: any) => photo.photo_id);
        // Mettre à jour les statistiques de recherche pour chaque photo
        for (const photoId of photoIds) {
          // Récupérer le count actuel et l'incrémenter
          const { data: currentData } = await supabase
            .from('photo_analytics')
            .select('search_count')
            .eq('photo_id', photoId)
            .single();
          
          if (currentData) {
            await supabase
              .from('photo_analytics')
              .update({ 
                search_count: (currentData.search_count || 0) + 1,
                last_searched_at: new Date().toISOString()
              })
              .eq('photo_id', photoId);
          }
        }
      }

      return data || [];

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }

  /**
   * Obtient les statistiques d'un utilisateur
   */
  static async getUserStats(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_user_photo_stats', {
        user_id_param: userId
      });

      if (error) {
        throw new Error(`Erreur stats: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      throw error;
    }
  }

  /**
   * Obtient les photos d'un utilisateur avec pagination
   */
  static async getUserPhotos(
    userId: string,
    page: number = 1,
    limit: number = 20,
    collectionId?: string
  ): Promise<{ photos: any[], total: number }> {
    try {
      let query = supabase
        .from('photo_metadata')
        .select(`
          *,
          photo_descriptions(*),
          photo_analytics(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (collectionId) {
        // D'abord récupérer les IDs des photos de la collection
        const { data: collectionPhotos } = await supabase
          .from('collection_photos')
          .select('photo_id')
          .eq('collection_id', collectionId);
        
        if (collectionPhotos && collectionPhotos.length > 0) {
          const photoIds = collectionPhotos.map(cp => cp.photo_id);
          query = query.in('id', photoIds);
        } else {
          // Si aucune photo dans la collection, retourner un résultat vide
          return { photos: [], total: 0 };
        }
      }

      const { data: photos, error: photosError } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (photosError) {
        throw new Error(`Erreur photos: ${photosError.message}`);
      }

      // Compter le total
      let countQuery = supabase
        .from('photo_metadata')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (collectionId) {
        // Utiliser les mêmes IDs que pour la requête principale
        const { data: collectionPhotos } = await supabase
          .from('collection_photos')
          .select('photo_id')
          .eq('collection_id', collectionId);
        
        if (collectionPhotos && collectionPhotos.length > 0) {
          const photoIds = collectionPhotos.map(cp => cp.photo_id);
          countQuery = countQuery.in('id', photoIds);
        } else {
          return { photos: [], total: 0 };
        }
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(`Erreur count: ${countError.message}`);
      }

      return {
        photos: photos || [],
        total: count || 0
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error);
      throw error;
    }
  }
}
