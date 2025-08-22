# Script pour créer la table formation_articles et insérer des données de test

$sql = @"
-- Création de la table formation_articles
CREATE TABLE IF NOT EXISTS formation_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    author TEXT,
    read_time INTEGER DEFAULT 5,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url TEXT,
    difficulty TEXT DEFAULT 'Débutant',
    duration TEXT DEFAULT '2h',
    price DECIMAL(10,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"@

Write-Host "Création de la table formation_articles..."
docker-compose -f docker-compose.prod.yml exec iahome-app node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); supabase.rpc('exec_sql', { sql_query: '$sql' }).then(r => console.log('Table créée:', r.data || r.error)).catch(e => console.log('Erreur:', e.message));"

Write-Host "Insertion des données de test..."

$insertData = @"
INSERT INTO formation_articles (title, slug, content, excerpt, category, author, read_time, difficulty, duration, price, image_url) VALUES
(
    'Introduction à l''Intelligence Artificielle',
    'introduction-ia',
    '<h2>Qu''est-ce que l''Intelligence Artificielle ?</h2><p>L''intelligence artificielle (IA) est un domaine de l''informatique qui vise à créer des systèmes capables d''effectuer des tâches qui nécessitent normalement l''intelligence humaine.</p><h3>Les bases de l''IA</h3><p>L''IA comprend plusieurs sous-domaines :</p><ul><li>Machine Learning</li><li>Deep Learning</li><li>Computer Vision</li><li>Natural Language Processing</li></ul>',
    'Découvrez les fondamentaux de l''intelligence artificielle et ses applications dans le monde moderne.',
    'ia',
    'Expert IA',
    15,
    'Débutant',
    '3h',
    0,
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
),
(
    'Machine Learning avec Python',
    'machine-learning-python',
    '<h2>Apprendre le Machine Learning</h2><p>Le Machine Learning est une branche de l''IA qui permet aux ordinateurs d''apprendre sans être explicitement programmés.</p><h3>Outils et bibliothèques</h3><p>Nous utiliserons :</p><ul><li>Scikit-learn</li><li>Pandas</li><li>NumPy</li><li>Matplotlib</li></ul>',
    'Maîtrisez les concepts du Machine Learning et implémentez vos premiers modèles avec Python.',
    'ia',
    'Data Scientist',
    25,
    'Intermédiaire',
    '6h',
    49.99,
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800'
),
(
    'Développement Web avec React',
    'react-web-development',
    '<h2>Créer des applications web modernes</h2><p>React est une bibliothèque JavaScript pour créer des interfaces utilisateur interactives.</p><h3>Concepts abordés</h3><ul><li>Composants React</li><li>Hooks</li><li>State Management</li><li>Routing</li></ul>',
    'Apprenez à développer des applications web modernes et réactives avec React.',
    'web',
    'Développeur Full-Stack',
    20,
    'Débutant',
    '8h',
    29.99,
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'
),
(
    'Data Science Avancée',
    'data-science-avancee',
    '<h2>Analyser et visualiser les données</h2><p>La Data Science combine statistiques, programmation et expertise métier pour extraire des insights des données.</p><h3>Techniques avancées</h3><ul><li>Analyse prédictive</li><li>Visualisation interactive</li><li>Big Data</li><li>Deep Learning</li></ul>',
    'Plongez dans les techniques avancées de Data Science et de visualisation de données.',
    'data',
    'Data Scientist Senior',
    30,
    'Avancé',
    '12h',
    79.99,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
),
(
    'Développement Mobile avec React Native',
    'react-native-mobile',
    '<h2>Créer des applications mobiles cross-platform</h2><p>React Native permet de développer des applications mobiles pour iOS et Android avec un seul code base.</p><h3>Fonctionnalités</h3><ul><li>Navigation mobile</li><li>APIs natives</li><li>Performance</li><li>Déploiement</li></ul>',
    'Développez des applications mobiles performantes pour iOS et Android avec React Native.',
    'mobile',
    'Développeur Mobile',
    18,
    'Intermédiaire',
    '10h',
    59.99,
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800'
);
"@

docker-compose -f docker-compose.prod.yml exec iahome-app node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); supabase.rpc('exec_sql', { sql_query: '$insertData' }).then(r => console.log('Données insérées:', r.data || r.error)).catch(e => console.log('Erreur:', e.message));"

Write-Host "Script terminé !"
