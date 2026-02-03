-- Mise à jour de l'article "Applications IA sur IAHome" (liens vers les applications)
-- Exécuter dans l'éditeur SQL du dashboard Supabase

UPDATE blog_articles
SET
  title = 'Applications IA sur IAHome : qualités, facilité d''utilisation et accès sans limite',
  excerpt = 'Découvrez les applications IA d''IAHome : transcription, génération d''images, PDF, prompts, détection… Toutes sur une même plateforme, sans limite d''usage une fois l''accès activé.',
  content = $content$
<article class="article-content">
  <h2>IAHome : toutes vos applications IA sur une seule plateforme</h2>
  <p>Sur <strong>IAHome</strong>, vous accédez à une quinzaine d'applications IA depuis un même compte. Une fois l'accès à une application effectué, son utilisation est <strong>sans limite</strong> : pas de quota journalier, pas de nombre de requêtes plafonné. Voici un tour d'horizon des applications IA disponibles, leurs qualités et leur facilité d'utilisation.</p>

  <h2>PDF et documents</h2>
  
  <h3><a href="/card/pdf">PDF + IA</a></h3>
  <p>Résumez vos PDF et posez des questions sur le contenu. Résumés automatiques et Q/R en langage naturel. Idéal pour rapports, contrats ou cours. Upload du fichier, quelques secondes, résultat en français.</p>

  <h2>Création visuelle et image</h2>
  
  <h3><a href="/card/stablediffusion">Stable Diffusion</a></h3>
  <p>Générez des images à partir de texte, jusqu'à 1024×1024. Qualité professionnelle pour créateurs et projets visuels. Interface accessible même sans expérience en IA.</p>

  <h3><a href="/card/ruinedfooocus">RuinedFooocus</a></h3>
  <p>Génération d'images IA avec une interface simple, style Midjourney/Stable Diffusion. Idéal pour démarrer sans se perdre dans les paramètres. Rapide et gratuit.</p>

  <h3><a href="/card/animagine-xl">Animagine XL</a></h3>
  <p>Créez des personnages et visuels anime/manga. Modèle SDXL, large base de personnages, pas besoin de LoRA. Parfait pour illustrateurs et amateurs d'anime.</p>

  <h3><a href="/card/photomaker">PhotoMaker</a></h3>
  <p>Portraits personnalisés à partir d'une photo. Fidélité au visage, sans configuration LoRA. Créateurs, photographes et réseaux sociaux : upload photo + prompt, résultat réaliste.</p>

  <h3><a href="/card/birefnet">BiRefNet – Suppression de fond</a></h3>
  <p>Retirez l'arrière-plan de vos images en un clic. Détourage précis, export PNG transparent. Graphistes, e-commerce et réseaux sociaux : glisser-déposer, résultat immédiat.</p>

  <h3><a href="/card/florence-2">Florence-2</a></h3>
  <p>Légendez, détectez et segmentez des images avec un seul modèle Microsoft. Captioning, détection d'objets, OCR. Analyse d'images sans multiplier les outils.</p>

  <h3><a href="/card/hunyuan3d">Hunyuan 3D</a></h3>
  <p>Transformez une image en modèle 3D (Tencent). Export OBJ/glTF, textures. Impression 3D, jeux, visuels : une image en entrée, un modèle 3D en sortie.</p>

  <h3><a href="/card/comfyui">ComfyUI</a></h3>
  <p>Workflows IA par nœuds pour utilisateurs avancés. Contrôle fin sur Stable Diffusion et pipelines. Pour ceux qui veulent enchaîner traitements et personnaliser chaque étape.</p>

  <h2>Audio et vidéo</h2>
  
  <h3><a href="/card/whisper">Whisper – Transcription</a></h3>
  <p>Transcrivez audio et vidéo en texte avec OpenAI Whisper. Multilingue, OCR sur images. Réunions, podcasts, sous-titres : upload du fichier, transcription prête en quelques minutes.</p>

  <h3><a href="/card/voice-isolation">Isolation vocale (Demucs v4)</a></h3>
  <p>Séparez la voix, la batterie et la basse d'un morceau. Qualité studio, karaoké et remix. Upload audio, choix des pistes à extraire, téléchargement des stems.</p>

  <h3><a href="/card/meeting-reports">Comptes rendus de réunion</a></h3>
  <p>Enregistrez, transcrivez et résumez vos réunions. Whisper + GPT, export PDF. Comptes rendus professionnels en quelques clics, sans prise de notes manuelle.</p>

  <h2>Prompts et détection</h2>
  
  <h3><a href="/card/prompt-generator">Générateur de prompts</a></h3>
  <p>Créez des prompts efficaces pour ChatGPT, Claude, Gemini. Zero-shot, Few-shot, Chain-of-Thought, ReAct. Basé sur les bonnes pratiques (Prompting Guide). Idéal pour améliorer vos conversations avec les LLM.</p>

  <h3><a href="/card/ai-detector">Détecteur de contenu IA</a></h3>
  <p>Estimez si un texte a été généré par l'IA. Utile pour vérification, éditeurs et enseignants. Coller le texte, résultat en quelques secondes.</p>

  <h2>Une plateforme, zéro limite d'usage</h2>
  <p>Sur IAHome, chaque application IA est accessible après activation (gratuite ou via tokens/abonnement selon l'outil). Une fois l'accès obtenu : <strong>aucune limite de requêtes</strong>, pas de plafond quotidien, pas de surcoût à l'usage. Vous utilisez l'outil autant que vous en avez besoin.</p>
  <p>Tout est centralisé : un seul compte, une seule interface, toutes les applications IA. Plus besoin d'alterner entre plusieurs sites ou de gérer des quotas. <strong>Une plateforme, toutes les applications IA, sans limite.</strong></p>
</article>
$content$,
  read_time = 4,
  image_url = '/images/applications-ia-iahome-hero.jpg'
WHERE slug = 'applications-ia-iahome-une-plateforme-sans-limite';
