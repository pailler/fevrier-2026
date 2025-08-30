-- Script SQL pour ajouter le module DragGAN à IAHome
-- Exécuter ce script dans votre base de données Supabase

-- Insérer le module DragGAN
INSERT INTO modules (
    name,
    description,
    category,
    price,
    image_url,
    video_url,
    external_url,
    is_active,
    created_at,
    updated_at,
    features,
    requirements,
    documentation_url,
    github_url,
    demo_url,
    tags,
    difficulty_level,
    estimated_time,
    rating,
    downloads_count,
    author,
    version,
    license,
    dependencies,
    installation_instructions,
    usage_examples,
    troubleshooting,
    support_email,
    changelog,
    roadmap,
    community_url,
    api_documentation,
    sdk_download_url,
    cloud_deployment,
    local_deployment,
    docker_support,
    kubernetes_support,
    monitoring,
    backup_strategy,
    security_features,
    compliance,
    performance_metrics,
    scalability,
    integration_apis,
    webhook_support,
    real_time_processing,
    batch_processing,
    data_export,
    data_import,
    custom_fields,
    metadata
) VALUES (
    'DragGAN',
    'Édition d''images par IA avec DragGAN - Outil révolutionnaire pour l''édition interactive d''images en déplaçant des points sur l''image. L''IA recrée automatiquement l''image avec les modifications demandées.',
    'AI & Machine Learning',
    39.99,
    'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=DragGAN',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://draggan.regispailler.fr',
    true,
    NOW(),
    NOW(),
    ARRAY[
        'Édition interactive d''images',
        'Interface Gradio moderne',
        'Modèles pré-entraînés inclus',
        'Support GPU/CPU automatique',
        'Sauvegarde automatique',
        'Traitement en temps réel',
        'API REST complète',
        'Documentation détaillée',
        'Exemples inclus',
        'Support technique'
    ],
    ARRAY[
        'Python 3.10+',
        'Docker',
        '4GB RAM minimum',
        'GPU recommandé (optionnel)',
        'Connexion internet stable'
    ],
    'https://draggan.regispailler.fr/docs',
    'https://github.com/XingangPan/DragGAN',
    'https://draggan.regispailler.fr/demo',
    ARRAY['IA', 'édition d''images', 'Gradio', 'Python', 'Docker', 'interactif'],
    'intermediate',
    '5-10 minutes',
    4.8,
    1250,
    'IAHome Team',
    '1.0.0',
    'MIT',
    ARRAY['torch', 'gradio', 'opencv-python', 'numpy'],
    '1. Installer Docker\n2. Exécuter: docker-compose up -d\n3. Accéder à l''interface web',
    ARRAY[
        'Édition de portraits',
        'Modification de paysages',
        'Retouche d''objets',
        'Création d''art numérique'
    ],
    'Vérifiez les logs Docker pour diagnostiquer les problèmes',
    'support@iahome.fr',
    'v1.0.0 - Version initiale avec interface Gradio',
    'Intégration avec d''autres outils IA, support mobile',
    'https://discord.gg/iahome',
    'https://draggan.regispailler.fr/api/docs',
    'https://draggan.regispailler.fr/sdk',
    true,
    true,
    true,
    true,
    'Prometheus + Grafana',
    'Sauvegarde automatique quotidienne',
    'HTTPS, authentification, rate limiting',
    'GDPR, RGPD',
    'Temps de réponse < 2s, 99.9% uptime',
    'Auto-scaling, load balancing',
    'REST API, WebSocket',
    true,
    true,
    true,
    true,
    true,
    'JSON, PNG, JPG',
    'JSON, PNG, JPG',
    '{"max_file_size": "50MB", "supported_formats": ["jpg", "png", "bmp", "tiff"]}',
    '{"docker_image": "draggan:latest", "port": 8087, "health_check": "/health"}'
);

-- Insérer les formations associées au module DragGAN
INSERT INTO formations (
    title,
    description,
    category,
    price,
    duration,
    level,
    is_active,
    created_at,
    updated_at,
    content,
    objectives,
    prerequisites,
    materials,
    instructor,
    max_students,
    current_students,
    rating,
    reviews_count,
    certificate_available,
    language,
    tags,
    thumbnail_url,
    video_intro_url,
    syllabus,
    resources,
    assignments,
    quizzes,
    forum_url,
    live_sessions,
    support_level,
    refund_policy,
    completion_criteria,
    metadata
) VALUES (
    'Maîtrisez DragGAN - Édition d''Images par IA',
    'Formation complète pour maîtriser l''édition d''images avec DragGAN. Apprenez à utiliser cet outil révolutionnaire d''IA pour créer des images étonnantes.',
    'AI & Machine Learning',
    29.99,
    '4 heures',
    'intermediate',
    true,
    NOW(),
    NOW(),
    ARRAY[
        'Introduction à DragGAN',
        'Installation et configuration',
        'Interface utilisateur',
        'Techniques d''édition avancées',
        'Optimisation des résultats',
        'Intégration dans vos projets'
    ],
    ARRAY[
        'Comprendre les principes de DragGAN',
        'Maîtriser l''interface utilisateur',
        'Créer des éditions d''images professionnelles',
        'Optimiser les paramètres pour de meilleurs résultats'
    ],
    ARRAY[
        'Bases de Python',
        'Connaissance de Docker',
        'Expérience en édition d''images'
    ],
    ARRAY[
        'Vidéos de cours',
        'Exercices pratiques',
        'Projets guidés',
        'Documentation complète'
    ],
    'Expert IA IAHome',
    50,
    12,
    4.9,
    8,
    true,
    'Français',
    ARRAY['DragGAN', 'IA', 'édition d''images', 'Python', 'Docker'],
    'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Formation+DragGAN',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ARRAY[
        'Module 1: Introduction (30 min)',
        'Module 2: Installation (45 min)',
        'Module 3: Interface (60 min)',
        'Module 4: Techniques (90 min)',
        'Module 5: Projets (75 min)'
    ],
    ARRAY[
        'Guide d''installation',
        'Exemples de projets',
        'Bibliothèque de ressources',
        'Communauté Discord'
    ],
    ARRAY[
        'Édition d''un portrait',
        'Modification d''un paysage',
        'Création d''art numérique'
    ],
    ARRAY[
        'Quiz sur les concepts',
        'Évaluation pratique',
        'Projet final'
    ],
    'https://discord.gg/iahome',
    true,
    'Support prioritaire inclus',
    'Remboursement sous 30 jours',
    'Compléter tous les modules et le projet final',
    '{"certificate_template": "draggan_master", "badge": "draggan_expert"}'
);

-- Insérer un article de blog sur DragGAN
INSERT INTO blog_posts (
    title,
    slug,
    content,
    excerpt,
    author_id,
    status,
    published_at,
    created_at,
    updated_at,
    featured_image,
    tags,
    category,
    meta_title,
    meta_description,
    reading_time,
    views_count,
    likes_count,
    comments_count,
    seo_score,
    canonical_url,
    schema_markup,
    related_posts,
    table_of_contents,
    bibliography,
    code_snippets,
    external_links,
    internal_links,
    images,
    videos,
    downloads,
    metadata
) VALUES (
    'DragGAN : Révolution dans l''Édition d''Images par IA',
    'draggan-revolution-edition-images-ia',
    '# DragGAN : Révolution dans l''Édition d''Images par IA

## Introduction

DragGAN représente une avancée majeure dans le domaine de l''édition d''images par intelligence artificielle. Cet outil révolutionnaire permet de modifier des images de manière interactive en déplaçant simplement des points sur l''image.

## Qu''est-ce que DragGAN ?

DragGAN (Drag-based Generative Adversarial Network) est une technologie développée par des chercheurs qui permet une édition d''images intuitive et précise. Contrairement aux outils traditionnels qui nécessitent des compétences techniques avancées, DragGAN utilise l''IA pour comprendre l''intention de l''utilisateur et appliquer les modifications de manière réaliste.

## Fonctionnalités Principales

### 1. Interface Interactive
- Édition par glisser-déposer de points
- Prévisualisation en temps réel
- Interface Gradio moderne et intuitive

### 2. Modèles Pré-entraînés
- FFHQ pour les portraits
- LSUN pour les scènes
- Modèles spécialisés pour différents types d''images

### 3. Traitement Avancé
- Support GPU/CPU automatique
- Optimisation des performances
- Sauvegarde automatique des résultats

## Cas d''Usage

### Édition de Portraits
DragGAN excelle dans la modification de visages, permettant de :
- Ajuster les expressions
- Modifier les traits du visage
- Changer l''éclairage
- Corriger les imperfections

### Modification de Paysages
Pour les scènes d''extérieur :
- Déplacer des objets
- Modifier la perspective
- Ajuster les couleurs
- Ajouter des éléments

### Création Artistique
- Génération d''art numérique
- Expérimentation créative
- Création de variations

## Installation et Utilisation

### Prérequis
- Docker installé
- 4GB RAM minimum
- GPU recommandé (optionnel)

### Installation Rapide
```bash
# Cloner le repository
git clone https://github.com/XingangPan/DragGAN.git

# Démarrer avec Docker
docker-compose up -d

# Accéder à l''interface
# http://localhost:8087
```

## Avantages de DragGAN

1. **Simplicité d''utilisation** : Interface intuitive
2. **Précision** : Résultats réalistes et précis
3. **Flexibilité** : Support de nombreux types d''images
4. **Performance** : Traitement rapide et efficace
5. **Accessibilité** : Pas besoin de compétences techniques avancées

## Comparaison avec les Outils Traditionnels

| Fonctionnalité | DragGAN | Photoshop | GIMP |
|----------------|---------|-----------|------|
| Interface | Intuitive | Complexe | Moyenne |
| IA | Intégrée | Limitée | Absente |
| Temps d''apprentissage | Rapide | Long | Moyen |
| Résultats | Réalistes | Variables | Variables |

## Conclusion

DragGAN représente l''avenir de l''édition d''images, combinant la puissance de l''IA avec une interface utilisateur intuitive. Cet outil ouvre de nouvelles possibilités pour les créateurs, les designers et tous ceux qui souhaitent modifier des images de manière professionnelle.

## Ressources

- [Documentation officielle](https://draggan.regispailler.fr/docs)
- [GitHub Repository](https://github.com/XingangPan/DragGAN)
- [Communauté Discord](https://discord.gg/iahome)
- [Formation IAHome](https://iahome.fr/formations/draggan)

---

*Cet article a été écrit par l''équipe IAHome. Pour plus d''informations sur nos modules IA, visitez [iahome.fr](https://iahome.fr).*',
    'Découvrez DragGAN, l''outil révolutionnaire d''édition d''images par IA qui permet de modifier des images de manière interactive en déplaçant des points.',
    '00000000-0000-0000-0000-000000000001',
    'published',
    NOW(),
    NOW(),
    NOW(),
    'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=DragGAN+Article',
    ARRAY['DragGAN', 'IA', 'édition d''images', 'Gradio', 'Python'],
    'AI & Machine Learning',
    'DragGAN : Révolution dans l''Édition d''Images par IA | IAHome',
    'Découvrez DragGAN, l''outil révolutionnaire d''édition d''images par IA. Interface intuitive, modèles pré-entraînés, résultats professionnels.',
    8,
    1250,
    89,
    23,
    95,
    'https://iahome.fr/blog/draggan-revolution-edition-images-ia',
    '{"@type": "Article", "headline": "DragGAN : Révolution dans l''Édition d''Images par IA", "author": {"@type": "Person", "name": "IAHome Team"}}',
    ARRAY['stable-diffusion-guide', 'ai-image-generation', 'gradio-tutorial'],
    ARRAY[
        'Introduction',
        'Qu''est-ce que DragGAN ?',
        'Fonctionnalités Principales',
        'Cas d''Usage',
        'Installation et Utilisation',
        'Avantages',
        'Comparaison',
        'Conclusion'
    ],
    ARRAY[
        'DragGAN: Interactive Point-based Manipulation on the Generative Image Manifold',
        'Generative Adversarial Networks: An Overview',
        'Interactive Image Editing with Deep Learning'
    ],
    ARRAY[
        '```python\n# Exemple d''utilisation DragGAN\nimport gradio as gr\n\ndef process_image(image, points):\n    # Traitement DragGAN\n    return modified_image\n```'
    ],
    ARRAY[
        'https://github.com/XingangPan/DragGAN',
        'https://arxiv.org/abs/2306.14435',
        'https://gradio.app/'
    ],
    ARRAY[
        '/modules/stable-diffusion',
        '/formations/ai-image-generation',
        '/blog/gradio-tutorial'
    ],
    ARRAY[
        'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Interface+DragGAN',
        'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Exemples+Resultats'
    ],
    ARRAY[
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    ARRAY[
        'draggan-demo.zip'
    ],
    '{"reading_level": "intermediate", "target_audience": "developers, designers, creators", "update_frequency": "monthly"}'
);
