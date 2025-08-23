-- Script pour vérifier et créer l'article "assistant-ia"
-- Exécuté le: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- 1. Vérifier si l'article existe
SELECT 
    id,
    title,
    slug,
    is_published,
    image_url,
    content,
    excerpt
FROM formation_articles 
WHERE slug = 'assistant-ia';

-- 2. Si l'article n'existe pas, le créer
INSERT INTO formation_articles (
    title,
    slug,
    content,
    excerpt,
    category,
    author,
    read_time,
    published_at,
    image_url,
    difficulty,
    duration,
    price,
    is_published
) 
SELECT 
    'Assistant IA : Guide Complet',
    'assistant-ia',
    '<h2>Introduction à l''Assistant IA</h2>
    <p>L''intelligence artificielle s''invite désormais au cœur de notre quotidien. Les assistants IA comme ChatGPT, Claude, et bien d''autres, révolutionnent la façon dont nous travaillons, créons et interagissons avec la technologie.</p>
    
    <h2>Qu''est-ce qu''un Assistant IA ?</h2>
    <p>Un assistant IA est un programme informatique capable de comprendre le langage naturel et de générer des réponses pertinentes. Ces outils utilisent des modèles de langage avancés pour :</p>
    <ul>
        <li>Répondre à des questions</li>
        <li>Générer du contenu créatif</li>
        <li>Aider à la résolution de problèmes</li>
        <li>Assister dans la programmation</li>
        <li>Analyser et résumer des documents</li>
    </ul>
    
    <h2>Les Avantages des Assistants IA</h2>
    <p>L''utilisation d''assistants IA présente de nombreux avantages :</p>
    <ul>
        <li><strong>Productivité accrue :</strong> Automatisation de tâches répétitives</li>
        <li><strong>Créativité boostée :</strong> Génération d''idées et de concepts</li>
        <li><strong>Apprentissage facilité :</strong> Explications personnalisées</li>
        <li><strong>Accessibilité :</strong> Interface en langage naturel</li>
    </ul>
    
    <h2>Comment Utiliser Efficacement un Assistant IA</h2>
    <p>Pour tirer le meilleur parti de ces outils, voici quelques bonnes pratiques :</p>
    <ol>
        <li><strong>Soyez précis :</strong> Plus votre question est claire, meilleure sera la réponse</li>
        <li><strong>Itérez :</strong> N''hésitez pas à reformuler ou préciser vos demandes</li>
        <li><strong>Vérifiez :</strong> Toujours vérifier les informations importantes</li>
        <li><strong>Expérimentez :</strong> Testez différents prompts pour optimiser vos résultats</li>
    </ol>
    
    <h2>Applications Pratiques</h2>
    <p>Les assistants IA trouvent des applications dans de nombreux domaines :</p>
    <ul>
        <li><strong>Éducation :</strong> Soutien scolaire, explications personnalisées</li>
        <li><strong>Business :</strong> Rédaction de contenu, analyse de données</li>
        <li><strong>Développement :</strong> Aide au codage, débogage</li>
        <li><strong>Créativité :</strong> Écriture, design, brainstorming</li>
    </ul>
    
    <h2>Conclusion</h2>
    <p>Les assistants IA représentent une révolution technologique majeure. En apprenant à les utiliser efficacement, vous pouvez considérablement améliorer votre productivité et votre créativité. L''avenir appartient à ceux qui sauront collaborer intelligemment avec ces outils.</p>',
    'Maîtrisez l''utilisation des assistants IA pour optimiser votre workflow et augmenter votre productivité. Découvrez les bonnes pratiques et applications pratiques.',
    'ia',
    'Équipe IAHome',
    15,
    NOW(),
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center',
    'Débutant',
    '2 heures',
    0,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM formation_articles WHERE slug = 'assistant-ia'
);

-- 3. Vérification finale
SELECT 
    id,
    title,
    slug,
    is_published,
    image_url,
    LENGTH(content) as content_length,
    LENGTH(excerpt) as excerpt_length
FROM formation_articles 
WHERE slug = 'assistant-ia';

-- 4. Afficher tous les articles de formation pour vérification
SELECT 
    id,
    title,
    slug,
    is_published,
    category,
    author,
    read_time,
    published_at
FROM formation_articles 
ORDER BY published_at DESC;
