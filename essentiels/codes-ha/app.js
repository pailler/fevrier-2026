// Charger les données JSON
let codesData = [];
let filteredCodes = [];
let activeCategories = new Set();
let activeTags = new Set();

// Catégorie des codes "automatisations" (séparée des codes classiques)
const AUTOMATIONS_CATEGORY_ID = 'templates-automations';

// Dictionnaire des termes techniques avec leurs explications et catégories de couleurs
const termExplanations = {
    'configuration.yaml': {
        title: 'configuration.yaml',
        content: 'Le fichier <code>configuration.yaml</code> est le fichier principal de configuration de Home Assistant. Il se trouve dans le dossier <code>config</code> et contient toutes vos configurations (intégrations, templates, automations, etc.).',
        category: 'other'
    },
    'Lovelace': {
        title: 'Lovelace',
        content: 'Lovelace est le système d\'interface utilisateur de Home Assistant. Il permet de créer des tableaux de bord personnalisés avec des cartes visuelles pour contrôler et surveiller votre maison intelligente.',
        category: 'other'
    },
    'entités': {
        title: 'Entités',
        content: 'Les entités sont les éléments de base dans Home Assistant. Elles représentent des appareils, capteurs, interrupteurs, lumières, etc. Chaque entité a un identifiant unique (ex: <code>light.salon</code>, <code>sensor.temperature</code>).',
        category: 'other'
    },
    'YAML': {
        title: 'YAML',
        content: 'YAML (YAML Ain\'t Markup Language) est un format de données lisible par l\'humain. Home Assistant utilise YAML pour la configuration, les cartes Lovelace, les automatisations et les templates.',
        category: 'other'
    },
    'Helpers': {
        title: 'Helpers',
        content: 'Les Helpers (Aides) sont des entités utilitaires dans Home Assistant. Ils incluent les input_boolean, input_number, input_select, etc. Ils permettent de créer des entités personnalisées pour vos automatisations et tableaux de bord.',
        category: 'other'
    },
    'template': {
        title: 'Template',
        content: 'Un template est un code qui calcule dynamiquement une valeur à partir d\'autres entités. Les templates utilisent la syntaxe Jinja2 pour créer des capteurs calculés, des conditions complexes, ou des transformations de données.',
        category: 'templates-automations'
    },
    'Automatisations': {
        title: 'Automatisations',
        content: 'Les automatisations permettent d\'automatiser des actions en fonction de déclencheurs et de conditions. Elles peuvent allumer des lumières, envoyer des notifications, contrôler des appareils, etc. automatiquement.',
        category: 'templates-automations'
    },
    'Intégrations': {
        title: 'Intégrations',
        content: 'Les intégrations permettent de connecter Home Assistant à des appareils, services et plateformes externes (caméras, capteurs, assistants vocaux, services météo, etc.). Elles étendent les capacités de votre installation Home Assistant en ajoutant de nouvelles entités et fonctionnalités.',
        category: 'other'
    },
    'Templates & Automations': {
        title: 'Templates & Automations',
        content: 'Cette section contient des exemples de templates (capteurs calculés) et d\'automatisations complètes. Les templates créent des entités calculées, tandis que les automatisations définissent des actions automatiques basées sur des conditions.',
        category: 'templates-automations'
    },
    'config': {
        title: 'Dossier config',
        content: 'Le dossier <code>config</code> est le répertoire principal de Home Assistant. Il contient tous vos fichiers de configuration, y compris <code>configuration.yaml</code>, les automatisations, les scènes, etc.',
        category: 'other'
    },
    'Banner Cards': {
        title: 'Banner Cards',
        content: 'Les Banner Cards sont des cartes avec une image de fond et un titre. Elles servent souvent de bannière de section pour organiser votre tableau de bord.',
        category: 'banner'
    },
    'Button Cards': {
        title: 'Button Cards',
        content: 'Les Button Cards sont des cartes bouton personnalisables qui permettent de contrôler des entités avec des styles et animations personnalisés.',
        category: 'button'
    },
    'Mushroom Cards': {
        title: 'Mushroom Cards',
        content: 'Les Mushroom Cards sont un ensemble de cartes modernes et élégantes qui offrent un design épuré et professionnel pour votre tableau de bord.',
        category: 'mushroom'
    },
    'Cartes Météo': {
        title: 'Cartes Météo',
        content: 'Les cartes météo affichent les informations météorologiques avec des graphiques, radars, prévisions et alertes.',
        category: 'weather'
    },
    'Slider Button Cards': {
        title: 'Slider Button Cards',
        content: 'Les Slider Button Cards combinent un bouton et un slider pour contrôler l\'intensité des lumières ou autres valeurs numériques.',
        category: 'slider'
    },
    'Graphiques': {
        title: 'Graphiques',
        content: 'Les cartes de graphiques permettent de visualiser des données historiques sous forme de courbes, secteurs, ou autres représentations graphiques.',
        category: 'graph'
    },
    'Jauges': {
        title: 'Jauges',
        content: 'Les jauges affichent des valeurs numériques sous forme de cadran circulaire avec des zones de couleur pour indiquer les seuils.',
        category: 'gauge'
    },
    'Cartes Conditionnelles': {
        title: 'Cartes Conditionnelles',
        content: 'Les cartes conditionnelles s\'affichent uniquement lorsque certaines conditions sont remplies (ex: si une lumière est allumée).',
        category: 'conditional'
    },
    'Grilles': {
        title: 'Grilles',
        content: 'Les grilles permettent d\'organiser plusieurs cartes en une grille avec un nombre de colonnes défini.',
        category: 'grid'
    },
    'Gauge Card Pro': {
        title: 'Gauge Card Pro',
        content: 'Gauge Card Pro est une carte personnalisée avancée pour Home Assistant qui permet de créer des jauges professionnelles avec gradients, templates, jauges doubles (inner/outer), indicateurs min/max, et support du mode clair/sombre. Elle offre des fonctionnalités avancées comme les segments personnalisés, les aiguilles, les marqueurs, et la personnalisation complète via Card Mod.',
        category: 'gauge-card-pro'
    },
    'Picture Entity Plus': {
        title: 'Picture Entity Plus',
        content: 'Picture Entity Plus est une carte personnalisée avancée qui étend les fonctionnalités de la carte picture-entity native de Home Assistant. Elle permet d\'afficher des images dynamiques selon l\'état de l\'entité, de personnaliser l\'affichage des attributs, et d\'ajouter des styles CSS personnalisés. Disponible sur GitHub et HACS.',
        category: 'picture-entity-plus'
    },
    'Picture Card Attributes': {
        title: 'Picture Card Attributes',
        content: 'Picture Card Attributes est une carte personnalisée qui permet d\'afficher les attributs d\'une entité directement sur une image. Elle offre un contrôle précis sur la position, le style et le layout des attributs affichés.',
        category: 'picture-entity-plus'
    },
    'Picture Elements': {
        title: 'Picture Elements',
        content: 'Picture Elements est une carte native de Home Assistant qui permet de superposer des éléments interactifs (badges, labels, icônes, boutons) sur une image. Elle offre un contrôle total sur la position et le style de chaque élément.',
        category: 'picture-entity-plus'
    }
};

// Mapping des couleurs par catégorie
const categoryColors = {
    'banner': { primary: '#e74c3c', light: '#fadbd8', border: '#c0392b' },
    'button': { primary: '#3498db', light: '#ebf5fb', border: '#2980b9' },
    'mushroom': { primary: '#9b59b6', light: '#f4ecf7', border: '#8e44ad' },
    'weather': { primary: '#1abc9c', light: '#d5f4e6', border: '#16a085' },
    'slider': { primary: '#f39c12', light: '#fef5e7', border: '#e67e22' },
    'nouveautes-2025': { primary: '#e91e63', light: '#fce4ec', border: '#c2185b' },
    'graph': { primary: '#e67e22', light: '#fdebd0', border: '#d35400' },
    'gauge': { primary: '#27ae60', light: '#d5f4e6', border: '#229954' },
    'conditional': { primary: '#c0392b', light: '#fadbd8', border: '#a93226' },
    'grid': { primary: '#34495e', light: '#ebedef', border: '#2c3e50' },
    'other': { primary: '#7f8c8d', light: '#ecf0f1', border: '#5d6d7e' },
    'templates-automations': { primary: '#16a085', light: '#d5f4e6', border: '#138d75' },
    'hyper-design': { primary: '#9333ea', light: '#f3e8ff', border: '#7c3aed' },
    'gauge-card-pro': { primary: '#ff6b35', light: '#ffe5de', border: '#e55a2b' },
    'picture-entity-plus': { primary: '#00bcd4', light: '#e0f7fa', border: '#0097a7' },
    'hacs-populaires': { primary: '#ff9800', light: '#fff3e0', border: '#f57c00' }
};

// Mapping des icônes par catégorie
const categoryIcons = {
    'banner': '🎴',
    'button': '🔘',
    'mushroom': '🍄',
    'weather': '🌤️',
    'slider': '🎚️',
    'nouveautes-2025': '✨',
    'graph': '📊',
    'gauge': '📈',
    'conditional': '🔀',
    'grid': '📐',
    'other': '📦',
    'templates-automations': '🔧',
    'hyper-design': '💎',
    'gauge-card-pro': '📊',
    'picture-entity-plus': '🖼️',
    'hacs-populaires': '⭐'
};

// Charger les données
async function loadData() {
    try {
        const response = await fetch('codes-cartes.json');
        codesData = await response.json();
        initializeApp();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        document.getElementById('codesGrid').innerHTML = 
            '<div class="no-results"><p>❌ Erreur lors du chargement des données</p></div>';
    }
}

// Initialiser l'application
function initializeApp() {
    updateHeroTotalResources();
    updateTotalCodesCount();
    setupCategoryFilters();
    setupSearch();
    setupModal();
    setupTermModal();
    setupManualModal();
    setupInfoToggle();
    updateProgressBar();
    updateActiveTagsDisplay();
    loadAllCodes();
    // Grille des codes automatisations (section dédiée)
    filterAndRenderAutomationCodes();
    const searchAutomationsEl = document.getElementById('searchAutomations');
    if (searchAutomationsEl) {
        searchAutomationsEl.addEventListener('input', () => filterAndRenderAutomationCodes());
    }
    // Recalculer le total des ressources une fois tout le DOM et les données prêts
    updateHeroTotalResources();
    setTimeout(() => {
        addTermTooltips();
    }, 100);
}

// Mettre à jour la stat globale en haut de page (tous les codes + dépôts config/blueprints)
function updateHeroTotalResources() {
    let total = 0;
    if (codesData && codesData.categories) {
        codesData.categories.forEach(category => {
            total += category.codes ? category.codes.length : 0;
        });
    }
    const configCards = document.querySelectorAll('.configs-card');
    if (configCards.length) total += configCards.length;
    const el = document.getElementById('heroTotalResources');
    if (el) el.textContent = total > 0 ? `${total} ressource${total > 1 ? 's' : ''}` : 'Aucune ressource';
}

// Mettre à jour le nombre total de codes (codes classiques uniquement)
function updateTotalCodesCount() {
    if (!codesData || !codesData.categories) return;
    
    let totalCodes = 0;
    codesData.categories.forEach(category => {
        if (category.id === AUTOMATIONS_CATEGORY_ID) return;
        totalCodes += category.codes ? category.codes.length : 0;
    });
    
    const countElement = document.getElementById('totalCodesCount');
    if (countElement) {
        countElement.textContent = `${totalCodes} codes classiques disponibles`;
    }
}

// Mettre à jour la barre de progression (codes classiques)
function updateProgressBar() {
    let totalCodes = 0;
    codesData.categories.forEach(category => {
        if (category.id === AUTOMATIONS_CATEGORY_ID) return;
        totalCodes += category.codes.length;
    });
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressInfo = document.getElementById('progressInfo');
    
    if (progressBar && progressText && progressInfo) {
        const progress = 100;
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        progressInfo.textContent = `${totalCodes} codes classiques disponibles`;
        
        // Animer la barre de progression après un court délai
        setTimeout(() => {
            progressBar.style.transition = 'width 2s ease-out';
            progressBar.style.width = `${progress}%`;
            
            // Animer le texte du pourcentage
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += 2;
                if (currentProgress >= progress) {
                    currentProgress = progress;
                    clearInterval(interval);
                }
                progressText.textContent = `${currentProgress}%`;
            }, 40); // 40ms pour 2% à chaque fois = 2s pour 100%
        }, 500);
    }
}

// Configurer le toggle de la section d'informations
function setupInfoToggle() {
    const toggleBtn = document.getElementById('toggleInfo');
    const infoContent = document.getElementById('infoContent');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');
    
    toggleBtn.addEventListener('click', () => {
        infoContent.classList.toggle('collapsed');
        toggleIcon.classList.toggle('rotated');
    });
    
    // Configurer les boutons plier/déplier individuels
    setupItemToggles();
}

// Configurer les boutons plier/déplier pour chaque section
function setupItemToggles() {
    document.querySelectorAll('.btn-toggle-item').forEach(btn => {
        const itemId = btn.dataset.item;
        const content = document.getElementById(`infoItem-${itemId}`);
        const icon = btn.querySelector('.toggle-icon-item');
        
        if (!content) return;
        
        btn.addEventListener('click', () => {
            content.classList.toggle('collapsed');
            icon.classList.toggle('rotated');
        });
    });
}

// Configurer les filtres de catégories (exclut la catégorie automatisations, affichée à part)
function setupCategoryFilters() {
    const categoryFilters = document.getElementById('categoryFilters');
    codesData.categories.forEach(category => {
        if (category.id === AUTOMATIONS_CATEGORY_ID) return;
        // Créer un conteneur pour la catégorie (style expandable)
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.dataset.category = category.id;
        
        // Créer le header de la catégorie
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-item-header';
        
        // Créer le titre avec icône
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title';
        const icon = categoryIcons[category.id] || '📦';
        categoryTitle.innerHTML = `${icon} ${category.name}`;
        
        // Créer le bouton toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn-toggle-category';
        toggleBtn.dataset.category = category.id;
        toggleBtn.setAttribute('aria-label', 'Plier/Déplier');
        
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'toggle-icon-category';
        toggleIcon.textContent = '▼'; // Flèche vers le bas quand plié
        toggleBtn.appendChild(toggleIcon);
        
        // Créer le bouton de filtrage (actif/inactif)
        const filterBtn = document.createElement('button');
        filterBtn.className = 'category-filter-btn';
        filterBtn.dataset.category = category.id;
        filterBtn.textContent = activeCategories.has(category.id) ? '✓' : '';
        filterBtn.setAttribute('aria-label', 'Activer/Désactiver la catégorie');
        
        // Appliquer les couleurs de la catégorie
        const colors = categoryColors[category.id] || categoryColors['other'];
        filterBtn.style.setProperty('--category-color', colors.primary);
        filterBtn.style.setProperty('--category-light', colors.light);
        filterBtn.style.setProperty('--category-border', colors.border);
        
        // Assembler le header
        categoryHeader.appendChild(categoryTitle);
        const headerActions = document.createElement('div');
        headerActions.className = 'category-header-actions';
        headerActions.appendChild(filterBtn);
        headerActions.appendChild(toggleBtn);
        categoryHeader.appendChild(headerActions);
        
        // Créer le contenu (tags) - initialement plié
        const categoryContent = document.createElement('div');
        categoryContent.className = 'category-item-content collapsed';
        categoryContent.id = `categoryContent-${category.id}`;
        // Par défaut, les catégories sont pliées (classe 'collapsed')
        
        // Collecter tous les tags uniques de cette catégorie
        // ET vérifier que chaque tag a au moins un code associé
        const categoryTags = new Set();
        const tagCodeCount = new Map(); // Compter le nombre de codes par tag
        
        category.codes.forEach(code => {
            if (code.tags && Array.isArray(code.tags)) {
                code.tags.forEach(tag => {
                    categoryTags.add(tag);
                    // Compter combien de codes ont ce tag
                    tagCodeCount.set(tag, (tagCodeCount.get(tag) || 0) + 1);
                });
            }
        });
        
        // Filtrer pour ne garder que les tags qui ont au moins un code
        const validTags = Array.from(categoryTags).filter(tag => {
            const count = tagCodeCount.get(tag) || 0;
            if (count === 0) {
                console.warn(`⚠️ Tag "${tag}" dans la catégorie "${category.name}" n'a aucun code associé`);
                return false;
            }
            return true;
        });
        
        // Créer le conteneur pour les tags
        if (validTags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'category-tags';
            
            // Trier les tags et les ajouter
            validTags.sort().forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'category-tag';
                tagSpan.textContent = tag;
                tagSpan.dataset.tag = tag;
                tagSpan.title = `${tagCodeCount.get(tag)} code(s) disponible(s)`;
                tagSpan.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleTag(tag);
                });
                tagsContainer.appendChild(tagSpan);
            });
            
            categoryContent.appendChild(tagsContainer);
        } else {
            categoryContent.innerHTML = '<p class="category-no-tags">Aucun tag disponible</p>';
        }
        
        // Assembler l'item
        categoryItem.appendChild(categoryHeader);
        categoryItem.appendChild(categoryContent);
        
        // Event listeners
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCategoryExpand(category.id);
        });
        
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCategory(category.id);
            filterBtn.textContent = activeCategories.has(category.id) ? '✓' : '';
            filterBtn.classList.toggle('active', activeCategories.has(category.id));
        });
        
        categoryFilters.appendChild(categoryItem);
    });

    // Bouton pour effacer les filtres
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
}

// Toggle l'expansion d'une catégorie
function toggleCategoryExpand(categoryId) {
    const categoryItem = document.querySelector(`.category-item[data-category="${categoryId}"]`);
    const content = document.getElementById(`categoryContent-${categoryId}`);
    const toggleIcon = categoryItem?.querySelector('.toggle-icon-category');
    
    if (content && toggleIcon) {
        content.classList.toggle('collapsed');
        // L'icône change automatiquement via CSS, mais on peut aussi forcer la rotation
        if (content.classList.contains('collapsed')) {
            toggleIcon.classList.remove('rotated');
        } else {
            toggleIcon.classList.add('rotated');
        }
    }
}

// Toggle une catégorie
function toggleCategory(categoryId) {
    const filterBtn = document.querySelector(`.category-filter-btn[data-category="${categoryId}"]`);
    
    if (activeCategories.has(categoryId)) {
        activeCategories.delete(categoryId);
        if (filterBtn) {
            filterBtn.classList.remove('active');
            filterBtn.textContent = '';
        }
    } else {
        activeCategories.add(categoryId);
        if (filterBtn) {
            filterBtn.classList.add('active');
            filterBtn.textContent = '✓';
        }
    }
    
    // Appliquer les filtres après le toggle
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    filterCodes(searchQuery);
}

// Configurer la recherche
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterCodes(query);
    });
}

// Filtrer les codes (codes classiques uniquement, hors automatisations)
function filterCodes(searchQuery = '') {
    filteredCodes = [];
    
    codesData.categories.forEach(category => {
        if (category.id === AUTOMATIONS_CATEGORY_ID) return;
        // Filtrer par catégorie
        if (activeCategories.size > 0 && !activeCategories.has(category.id)) {
            return;
        }

        category.codes.forEach(code => {
            // Filtrer par recherche textuelle
            const searchableText = [
                code.name,
                code.description,
                ...code.tags,
                category.name
            ].join(' ').toLowerCase();

            if (!searchQuery || searchableText.includes(searchQuery)) {
                // Filtrer par tags actifs
                if (activeTags.size > 0) {
                    const hasActiveTag = code.tags.some(tag => activeTags.has(tag));
                    if (!hasActiveTag) return;
                }

                filteredCodes.push({
                    ...code,
                    category: category.name,
                    categoryId: category.id
                });
            }
        });
    });

    updateResultsCount();
    renderCodes();
}

// Charger toutes les cartes classiques au démarrage (hors automatisations)
function loadAllCodes() {
    filteredCodes = [];
    codesData.categories.forEach(category => {
        if (category.id === AUTOMATIONS_CATEGORY_ID) return;
        category.codes.forEach(code => {
            filteredCodes.push({
                ...code,
                category: category.name,
                categoryId: category.id
            });
        });
    });
    updateResultsCount();
    renderCodes();
}

// Récupérer les codes de la catégorie automatisations
function getAutomationCodes() {
    if (!codesData || !codesData.categories) return [];
    const cat = codesData.categories.find(c => c.id === AUTOMATIONS_CATEGORY_ID);
    if (!cat || !cat.codes) return [];
    return cat.codes.map(code => ({
        ...code,
        category: cat.name,
        categoryId: cat.id
    }));
}

// Filtrer et afficher les codes automatisations
function filterAndRenderAutomationCodes() {
    const searchInput = document.getElementById('searchAutomations');
    const grid = document.getElementById('codesGridAutomations');
    const noResults = document.getElementById('noResultsAutomations');
    const countEl = document.getElementById('automationsCount');
    if (!grid || !noResults) return;

    const query = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
    const allAutomationCodes = getAutomationCodes();

    const filtered = query
        ? allAutomationCodes.filter(code => {
            const searchable = [code.name, code.description, ...(code.tags || [])].join(' ').toLowerCase();
            return searchable.includes(query);
          })
        : allAutomationCodes;

    if (countEl) countEl.textContent = `${filtered.length} code${filtered.length !== 1 ? 's' : ''} automatisation${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    noResults.style.display = 'none';
    grid.innerHTML = filtered.map(code => createCodeCard(code)).join('');

    // Tags : clic pour filtrer (ouverture du modal gérée par délégation dans setupModal)
    document.querySelectorAll('#codesGridAutomations .code-card-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTag(tag.textContent);
        });
    });
}

// Rendre les codes
function renderCodes() {
    const grid = document.getElementById('codesGrid');
    const noResults = document.getElementById('noResults');

    if (filteredCodes.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    grid.innerHTML = filteredCodes.map(code => createCodeCard(code)).join('');

    // Tags : clic pour filtrer (la délégation dans setupModal gère l'ouverture du modal sur la carte)
    document.querySelectorAll('#codesGrid .code-card-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTag(tag.textContent);
        });
    });
}

// Créer une carte de code
function createCodeCard(code) {
    const tagsHtml = code.tags.map(tag => 
        `<span class="code-card-tag">${tag}</span>`
    ).join('');

    const codePreview = code.code.split('\n').slice(0, 3).join('\n');
    
    // Récupérer les couleurs de la catégorie
    const categoryId = code.categoryId || 'other';
    const colors = categoryColors[categoryId] || categoryColors['other'];
    
    // Appliquer les couleurs en style inline
    const borderColor = colors.border;
    const bgColor = colors.light;
    const accentColor = colors.primary;
    
    // Image de capture d'écran si disponible
    const screenshotHtml = code.screenshot ? 
        `<div class="code-card-screenshot">
            <img src="screenshots/${code.screenshot}" alt="${code.name}" loading="lazy" onerror="this.style.display='none'">
        </div>` : '';
    
    // Badge "Communautaire" pour les codes de la catégorie communaute
    const communityBadge = categoryId === 'communaute' ? 
        `<span class="community-badge" title="Code de la communauté Home Assistant">🌐 Communautaire</span>` : '';
    
    return `
        <div class="code-card" data-code-id="${code.id}" data-category="${categoryId}" 
             style="border-left: 4px solid ${borderColor}; background: ${bgColor};">
            ${screenshotHtml}
            <div class="code-card-header">
                <div>
                    <div class="code-card-title-row">
                        <div class="code-card-title" style="color: ${accentColor};">${code.name}</div>
                        ${communityBadge}
                    </div>
                    <div class="code-card-category" style="color: ${accentColor}; opacity: 0.8; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-top: 4px;">
                        ${code.category || categoryId}
                    </div>
                    <div class="code-card-description">${code.description}</div>
                </div>
            </div>
            <div class="code-card-tags">${tagsHtml}</div>
            <div class="code-preview">${escapeHtml(codePreview)}...</div>
        </div>
    `;
}

// Mapping des types de cartes vers leurs sources/documentations
const cardTypeSources = {
    'custom:button-card': {
        name: 'Button Card',
        url: 'https://github.com/custom-cards/button-card',
        hacs: 'button-card'
    },
    'custom:mushroom-entity-card': {
        name: 'Mushroom Cards',
        url: 'https://github.com/piitaya/lovelace-mushroom',
        hacs: 'mushroom'
    },
    'custom:mushroom-template-card': {
        name: 'Mushroom Cards',
        url: 'https://github.com/piitaya/lovelace-mushroom',
        hacs: 'mushroom'
    },
    'custom:mushroom-chips-card': {
        name: 'Mushroom Cards',
        url: 'https://github.com/piitaya/lovelace-mushroom',
        hacs: 'mushroom'
    },
    'custom:mushroom-alarm-control-panel-card': {
        name: 'Mushroom Cards',
        url: 'https://github.com/piitaya/lovelace-mushroom',
        hacs: 'mushroom'
    },
    'custom:banner-card': {
        name: 'Banner Card',
        url: 'https://github.com/nervetattoo/banner-card',
        hacs: 'banner-card'
    },
    'custom:flex-cells-card': {
        name: 'Flex Cells Card',
        url: 'https://github.com/michalowskil/flex-cells-card',
        hacs: 'flex-cells-card'
    },
    'custom:weather-chart-card': {
        name: 'Weather Chart Card',
        url: 'https://github.com/finity69x2/weather-chart-card',
        hacs: 'weather-chart-card'
    },
    'custom:slider-button-card': {
        name: 'Slider Button Card',
        url: 'https://github.com/matt8707/hass-slider-button-card',
        hacs: 'slider-button-card'
    },
    'custom:apexcharts-card': {
        name: 'ApexCharts Card',
        url: 'https://github.com/RomRider/apexcharts-card',
        hacs: 'apexcharts-card'
    },
    'custom:alarmo-card': {
        name: 'Alarmo',
        url: 'https://github.com/nielsfaber/alarmo',
        hacs: 'alarmo'
    },
    'custom:weather-radar-card': {
        name: 'Weather Radar Card',
        url: 'https://github.com/Makin-Things/weather-radar-card',
        hacs: 'weather-radar-card'
    },
    'custom:lunar-phase-card': {
        name: 'Lunar Phase Card',
        url: 'https://github.com/ngocjohn/lunar-phase-card',
        hacs: 'lunar-phase-card'
    },
    'custom:meteoalarm-card': {
        name: 'Meteoalarm Card',
        url: 'https://github.com/MrBartusek/MeteoalarmCard',
        hacs: 'meteoalarm-card'
    },
    'custom:mini-graph-card': {
        name: 'Mini Graph Card',
        url: 'https://github.com/kalkih/mini-graph-card',
        hacs: 'mini-graph-card'
    },
    'custom:auto-entities': {
        name: 'Auto Entities',
        url: 'https://github.com/thomasloven/lovelace-auto-entities',
        hacs: 'auto-entities'
    },
    'custom:fold-entity-row': {
        name: 'Fold Entity Row',
        url: 'https://github.com/thomasloven/lovelace-fold-entity-row',
        hacs: 'fold-entity-row'
    },
    'custom:card-mod': {
        name: 'Card Mod',
        url: 'https://github.com/thomasloven/lovelace-card-mod',
        hacs: 'card-mod'
    },
    'custom:minimalistic-area-card': {
        name: 'Minimalistic Area Card',
        url: 'https://github.com/piitaya/lovelace-minimalistic-area-card',
        hacs: 'minimalistic-area-card'
    },
    'custom:fullscreen-card': {
        name: 'Fullscreen Card',
        url: 'https://github.com/matt8707/hass-fullscreen-card',
        hacs: 'fullscreen-card'
    },
    'custom:digital-clock': {
        name: 'Digital Clock',
        url: 'https://github.com/aidanblack/digital-clock-card',
        hacs: 'digital-clock'
    },
    'custom:websocket-card': {
        name: 'Websocket Card',
        url: 'https://github.com/search?q=websocket-card+home+assistant+lovelace&type=repositories',
        hacs: null
    },
    'type: thermostat': {
        name: 'Thermostat Card',
        url: 'https://www.home-assistant.io/dashboards/thermostat/',
        official: true
    },
    'type: entities': {
        name: 'Entities Card',
        url: 'https://www.home-assistant.io/dashboards/entities/',
        official: true
    },
    'type: glance': {
        name: 'Glance Card',
        url: 'https://www.home-assistant.io/dashboards/glance/',
        official: true
    },
    'type: history-graph': {
        name: 'History Graph',
        url: 'https://www.home-assistant.io/dashboards/history-graph/',
        official: true
    },
    'type: gauge': {
        name: 'Gauge Card',
        url: 'https://www.home-assistant.io/dashboards/gauge/',
        official: true
    },
    'type: picture': {
        name: 'Picture Card',
        url: 'https://www.home-assistant.io/dashboards/picture/',
        official: true
    },
    'type: markdown': {
        name: 'Markdown Card',
        url: 'https://www.home-assistant.io/dashboards/markdown/',
        official: true
    },
    'type: button': {
        name: 'Button Card',
        url: 'https://www.home-assistant.io/dashboards/button/',
        official: true
    },
    'type: media-control': {
        name: 'Media Control',
        url: 'https://www.home-assistant.io/dashboards/media-control/',
        official: true
    },
    'type: vertical-stack': {
        name: 'Vertical Stack',
        url: 'https://www.home-assistant.io/dashboards/vertical-stack/',
        official: true
    },
    'type: horizontal-stack': {
        name: 'Horizontal Stack',
        url: 'https://www.home-assistant.io/dashboards/horizontal-stack/',
        official: true
    },
    'type: grid': {
        name: 'Grid Card',
        url: 'https://www.home-assistant.io/dashboards/grid/',
        official: true
    },
    'type: sensor': {
        name: 'Sensor Card',
        url: 'https://www.home-assistant.io/dashboards/sensor/',
        official: true
    },
    'type: entity': {
        name: 'Entity Card',
        url: 'https://www.home-assistant.io/dashboards/entity/',
        official: true
    },
    'type: statistics': {
        name: 'Statistics Card',
        url: 'https://www.home-assistant.io/dashboards/statistics/',
        official: true
    },
    'type: map': {
        name: 'Map Card',
        url: 'https://www.home-assistant.io/dashboards/map/',
        official: true
    },
    'type: iframe': {
        name: 'Iframe Card',
        url: 'https://www.home-assistant.io/dashboards/iframe/',
        official: true
    },
    'type: weather-forecast': {
        name: 'Weather Forecast',
        url: 'https://www.home-assistant.io/dashboards/weather-forecast/',
        official: true
    },
    'type: alarm-panel': {
        name: 'Alarm Panel',
        url: 'https://www.home-assistant.io/dashboards/alarm-panel/',
        official: true
    },
    'type: picture-entity': {
        name: 'Picture Entity',
        url: 'https://www.home-assistant.io/dashboards/picture-entity/',
        official: true
    },
    'type: history': {
        name: 'History Card',
        url: 'https://www.home-assistant.io/dashboards/history/',
        official: true
    },
    'type: calendar': {
        name: 'Calendar Card',
        url: 'https://www.home-assistant.io/dashboards/calendar/',
        official: true
    },
    'type: logbook': {
        name: 'Logbook Card',
        url: 'https://www.home-assistant.io/dashboards/logbook/',
        official: true
    },
    'type: tile': {
        name: 'Tile Card',
        url: 'https://www.home-assistant.io/dashboards/tile/',
        official: true
    },
    'custom:big-temperature-card': {
        name: 'Big Temperature Card',
        url: 'https://github.com/OmenWild/big-temperature-card',
        hacs: 'big-temperature-card'
    },
    'custom:picture-entity-plus': {
        name: 'Picture Entity Plus',
        url: 'https://github.com/iantrich/picture-entity-plus',
        hacs: 'picture-entity-plus'
    },
    'custom:picture-card-attributes': {
        name: 'Picture Card Attributes',
        url: 'https://github.com/custom-cards/picture-card-attributes',
        hacs: 'picture-card-attributes'
    },
    'type: picture-elements': {
        name: 'Picture Elements',
        url: 'https://www.home-assistant.io/dashboards/picture-elements/',
        official: true
    }
};

// Détecter le type de carte depuis le code YAML
function detectCardType(code) {
    if (!code) return null;
    
    const lines = code.split('\n');
    for (const line of lines) {
        // Chercher "type: " ou "- type: " (avec ou sans tiret au début)
        // Patterns possibles:
        // - type: custom:banner-card
        // type: custom:banner-card
        //   type: custom:banner-card
        const typeMatch = line.match(/^[\s-]*type:\s*(.+)/);
        if (typeMatch) {
            let cardType = typeMatch[1].trim();
            // Enlever les guillemets si présents
            cardType = cardType.replace(/^["']|["']$/g, '');
            // Enlever les commentaires en fin de ligne
            cardType = cardType.split('#')[0].trim();
            if (cardType) {
                return cardType;
            }
        }
    }
    return null;
}

// Obtenir le lien source pour un type de carte
function getCardSourceLink(cardType) {
    if (!cardType) return null;
    
    // Chercher dans le mapping (exact match)
    let source = cardTypeSources[cardType];
    
    // Si pas trouvé, chercher avec "type: " prefix
    if (!source) {
        source = cardTypeSources[`type: ${cardType}`];
    }
    
    // Si trouvé dans le mapping
    if (source) {
        return {
            url: source.url,
            name: source.name,
            hacs: source.hacs,
            official: source.official || false
        };
    }
    
    // Si c'est une carte custom mais pas dans le mapping
    if (cardType && typeof cardType === 'string' && cardType.startsWith('custom:')) {
        const cardName = cardType.replace('custom:', '');
        // Essayer de trouver un nom plus lisible
        const readableName = cardName.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        return {
            url: `https://github.com/search?q=${encodeURIComponent(cardName + ' home assistant lovelace')}&type=repositories`,
            name: readableName,
            hacs: null,
            official: false
        };
    }
    
    // Pour les cartes natives, lien vers la doc officielle
    // Nettoyer le nom pour l'URL (remplacer _ par -)
    if (!cardType || typeof cardType !== 'string') {
        return null;
    }
    const cleanType = cardType.replace(/_/g, '-');
    return {
        url: `https://www.home-assistant.io/dashboards/${cleanType}/`,
        name: cardType.charAt(0).toUpperCase() + cardType.slice(1),
        hacs: null,
        official: true
    };
}

// Afficher le modal avec le code complet (codes classiques ou automatisations)
function showCodeModal(codeId) {
    let code = filteredCodes.find(c => c.id === codeId);
    if (!code) {
        const automationCodes = getAutomationCodes();
        code = automationCodes.find(c => c.id === codeId);
    }
    if (!code) return;

    const modal = document.getElementById('codeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalTags = document.getElementById('modalTags');
    const modalScreenshot = document.getElementById('modalScreenshot');
    const modalScreenshotImg = document.getElementById('modalScreenshotImg');
    const modalCode = document.getElementById('modalCode');
    const copyBtn = document.getElementById('copyCodeBtn');
    const codeSourceLink = document.getElementById('codeSourceLink');
    const sourceLink = document.getElementById('sourceLink');

    // Ajouter le badge communautaire si nécessaire
    const categoryId = code.categoryId || 'other';
    const communityBadge = categoryId === 'communaute' ? 
        '<span class="community-badge" title="Code de la communauté Home Assistant">🌐 Communautaire</span>' : '';
    
    modalTitle.innerHTML = `${code.name} ${communityBadge}`;
    modalDescription.textContent = code.description;
    
    modalTags.innerHTML = code.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');

    // Détecter le type de carte et générer le lien source
    const cardType = detectCardType(code.code);
    const sourceInfo = getCardSourceLink(cardType);
    
    if (sourceInfo && sourceInfo.url) {
        sourceLink.href = sourceInfo.url;
        sourceLink.textContent = sourceInfo.official 
            ? `🔗 Documentation officielle - ${sourceInfo.name}`
            : sourceInfo.hacs 
                ? `🔗 Voir sur HACS - ${sourceInfo.name}`
                : `🔗 Autres codes de même type - ${sourceInfo.name}`;
        codeSourceLink.style.display = 'block';
    } else {
        codeSourceLink.style.display = 'none';
    }

    // Afficher l'image si elle existe
    if (code.screenshot) {
        modalScreenshotImg.src = `screenshots/${code.screenshot}`;
        modalScreenshotImg.alt = code.name;
        modalScreenshot.style.display = 'block';
        modalScreenshotImg.onerror = function() {
            modalScreenshot.style.display = 'none';
        };
    } else {
        modalScreenshot.style.display = 'none';
    }

    modalCode.querySelector('code').textContent = code.code;
    copyBtn.dataset.code = code.code;
    copyBtn.classList.remove('copied');
    copyBtn.innerHTML = '📋 Copier';

    modal.classList.add('active');
}

// Fermer le modal
function closeModal() {
    const modal = document.getElementById('codeModal');
    modal.classList.remove('active');
}

// Configurer le modal
function setupModal() {
    const modal = document.getElementById('codeModal');
    const modalClose = document.getElementById('modalClose');
    const copyBtn = document.getElementById('copyCodeBtn');

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    copyBtn.addEventListener('click', () => {
        const code = copyBtn.dataset.code;
        copyToClipboard(code);
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Délégation : un seul listener par grille, fonctionne même avec hash/token dans l'URL
    function handleGridClick(e) {
        if (e.target.closest('.code-card-tag')) return;
        const card = e.target.closest('.code-card');
        if (!card || !card.dataset.codeId) return;
        e.preventDefault();
        showCodeModal(card.dataset.codeId);
    }
    document.getElementById('codesGrid')?.addEventListener('click', handleGridClick);
    document.getElementById('codesGridAutomations')?.addEventListener('click', handleGridClick);
}

// Copier dans le presse-papiers
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showCopySuccess();
        
        const copyBtn = document.getElementById('copyCodeBtn');
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '✓ Copié !';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '📋 Copier';
        }, 2000);
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        // Fallback pour les navigateurs plus anciens
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopySuccess();
    }
}

// Afficher le message de succès
function showCopySuccess() {
    const successMsg = document.getElementById('copySuccess');
    successMsg.classList.add('show');
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 2000);
}

// Toggle un tag
function toggleTag(tag) {
    if (activeTags.has(tag)) {
        activeTags.delete(tag);
    } else {
        activeTags.add(tag);
    }
    updateActiveTagsDisplay();
    filterCodes(document.getElementById('searchInput').value.toLowerCase().trim());
}

// Mettre à jour l'affichage des tags actifs
function updateActiveTagsDisplay() {
    const activeTagsDiv = document.getElementById('activeTags');
    if (activeTags.size === 0) {
        activeTagsDiv.innerHTML = '<span style="color: var(--text-light); font-size: 0.9rem;">Aucun tag sélectionné</span>';
    } else {
        activeTagsDiv.innerHTML = Array.from(activeTags).map(tag => 
            `<span class="tag">${tag} <span class="tag-remove" data-tag="${tag}">×</span></span>`
        ).join('');

        // Ajouter les event listeners pour supprimer les tags
        document.querySelectorAll('.tag-remove').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = removeBtn.dataset.tag;
                activeTags.delete(tag);
                updateActiveTagsDisplay();
                filterCodes(document.getElementById('searchInput').value.toLowerCase().trim());
            });
        });
    }
    
    // Mettre à jour l'état visuel des tags dans les catégories
    document.querySelectorAll('.category-tag').forEach(tagElement => {
        const tag = tagElement.dataset.tag;
        if (activeTags.has(tag)) {
            tagElement.classList.add('active');
        } else {
            tagElement.classList.remove('active');
        }
    });
}

// Effacer tous les filtres
function clearAllFilters() {
    activeCategories.clear();
    activeTags.clear();
    document.getElementById('searchInput').value = '';
    
    // Réinitialiser les boutons de filtrage des catégories
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.textContent = '';
    });
    
    // Réinitialiser les anciens boutons (pour compatibilité)
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    updateActiveTagsDisplay();
    loadAllCodes();
}

// Mettre à jour le compteur de résultats
function updateResultsCount() {
    const count = filteredCodes.length;
    const countElement = document.getElementById('resultsCount');
    countElement.textContent = `${count} code${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`;
}

// Échapper le HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Ajouter les tooltips aux termes techniques
function addTermTooltips() {
    const infoContent = document.getElementById('infoContent');
    if (!infoContent) return;

    // Liste des termes à rechercher (ordre important : termes longs en premier)
    const terms = Object.keys(termExplanations).sort((a, b) => b.length - a.length);

    // Échapper les caractères spéciaux pour regex
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Fonction pour remplacer les termes dans un texte
    function replaceTerms(text) {
        let result = text;
        terms.forEach(term => {
            const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi');
            result = result.replace(regex, (match) => {
                const explanation = termExplanations[term];
                const category = explanation?.category || 'other';
                const colors = categoryColors[category] || categoryColors['other'];
                
                return `<span class="term-link" data-term="${term}" data-category="${category}" title="Cliquez pour plus d'infos" style="--term-color: ${colors.primary}; --term-light: ${colors.light}; --term-border: ${colors.border};">${match}<span class="term-icon">?</span></span>`;
            });
        });
        return result;
    }

    // Traiter tous les éléments p, li, strong, et autres éléments texte
    const elementsToProcess = infoContent.querySelectorAll('p, li, h3, h2, strong, span:not(.term-link):not(code)');
    
    elementsToProcess.forEach(element => {
        // Ignorer les éléments code et ceux qui contiennent déjà des term-link
        if (element.tagName === 'CODE' || element.closest('code') || element.querySelector('.term-link')) {
            return;
        }

        // Remplacer le contenu texte
        let html = element.innerHTML;
        const textNodes = [];
        
        // Collecter les nœuds texte
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }

        // Remplacer dans chaque nœud texte
        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const replaced = replaceTerms(text);
            if (replaced !== text) {
                const temp = document.createElement('span');
                temp.innerHTML = replaced;
                const parent = textNode.parentNode;
                while (temp.firstChild) {
                    parent.insertBefore(temp.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        });
    });

    // Ajouter les event listeners aux liens créés
    infoContent.querySelectorAll('.term-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const term = link.dataset.term;
            showTermExplanation(term);
        });
    });
}

// Afficher l'explication d'un terme
function showTermExplanation(term) {
    const explanation = termExplanations[term];
    if (!explanation) return;

    const modal = document.getElementById('termModal');
    const title = document.getElementById('termModalTitle');
    const content = document.getElementById('termModalContent');

    title.textContent = explanation.title;
    content.innerHTML = explanation.content;

    modal.classList.add('active');
}

// Configurer le modal des termes
function setupTermModal() {
    const modal = document.getElementById('termModal');
    const modalClose = document.getElementById('termModalClose');

    if (!modal || !modalClose) return;

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Configurer le modal du manuel PDF
function setupManualModal() {
    const modal = document.getElementById('manualModal');
    const modalClose = document.getElementById('manualModalClose');
    const viewBtn = document.getElementById('viewManualBtn');

    if (!modal || !modalClose || !viewBtn) return;

    viewBtn.addEventListener('click', () => {
        modal.classList.add('active');
        loadExternalLinks();
    });

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Charger et afficher les liens externes du manuel
function loadExternalLinks() {
    const linksGrid = document.getElementById('externalLinksGrid');
    if (!linksGrid) return;

    // Liste des liens externes du manuel
    const externalLinks = [
        {
            title: 'Home Assistant - Documentation Officielle',
            url: 'https://www.home-assistant.io/',
            icon: '🏠'
        },
        {
            title: 'HACS - Home Assistant Community Store',
            url: 'https://hacs.xyz/',
            icon: '📦'
        },
        {
            title: 'Lovelace UI - Documentation',
            url: 'https://www.home-assistant.io/dashboards/',
            icon: '🎴'
        },
        {
            title: 'Mushroom Cards - GitHub',
            url: 'https://github.com/piitaya/lovelace-mushroom',
            icon: '🍄'
        },
        {
            title: 'Button Card - GitHub',
            url: 'https://github.com/custom-cards/button-card',
            icon: '🔘'
        },
        {
            title: 'Banner Card - GitHub',
            url: 'https://github.com/nervetattoo/banner-card',
            icon: '📢'
        },
        {
            title: 'Slider Button Card - GitHub',
            url: 'https://github.com/mattieha/slider-button-card',
            icon: '🎚️'
        },
        {
            title: 'Home Assistant Community Forum',
            url: 'https://community.home-assistant.io/',
            icon: '💬'
        },
        {
            title: 'Home Assistant Reddit',
            url: 'https://www.reddit.com/r/homeassistant/',
            icon: '🔴'
        },
        {
            title: 'YouTube - Chaîne Adamhome',
            url: 'https://www.youtube.com/@pailleradamhome',
            icon: '📺'
        },
        {
            title: 'IAHome - Plateforme IA',
            url: 'https://iahome.fr/',
            icon: '🤖'
        },
        {
            title: 'Home Assistant Blueprints',
            url: 'https://www.home-assistant.io/docs/automation/using_blueprints/',
            icon: '📋'
        }
    ];

    // Générer le HTML des liens
    linksGrid.innerHTML = externalLinks.map(link => {
        try {
            const domain = new URL(link.url).hostname.replace('www.', '');
            return `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="external-link-item">
                    <div class="external-link-icon">${link.icon}</div>
                    <div class="external-link-content">
                        <div class="external-link-title">${link.title}</div>
                        <div class="external-link-url">${domain}</div>
                    </div>
                    <div class="external-link-arrow">→</div>
                </a>
            `;
        } catch (e) {
            return '';
        }
    }).join('');
}

// Parser YAML amélioré
function parseYAML(yamlText) {
    const lines = yamlText.split('\n');
    
    // Si la première ligne commence par "-", c'est une liste
    const firstLine = lines.find(l => l.trim() && !l.trim().startsWith('#'));
    if (firstLine && firstLine.trim().startsWith('-')) {
        // Parser comme une liste d'objets
        return parseYAMLList(lines);
    }
    
    // Sinon, parser comme un objet normal
    const result = {};
    const stack = [{ obj: result, indent: -1 }];
    
    lines.forEach((line, index) => {
        // Ignorer les lignes vides et les commentaires
        if (!line.trim() || line.trim().startsWith('#')) return;
        
        const indent = line.match(/^(\s*)/)[1].length;
        const trimmed = line.trim();
        
        // Nettoyer la stack selon l'indentation
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
            stack.pop();
        }
        
        const current = stack[stack.length - 1].obj;
        
        // Gérer les listes (commençant par -)
        if (trimmed.startsWith('-')) {
            const value = trimmed.substring(1).trim();
            
            // Initialiser comme tableau si nécessaire
            if (!Array.isArray(current)) {
                // Trouver la dernière clé ajoutée
                const keys = Object.keys(current);
                const lastKey = keys[keys.length - 1];
                if (lastKey && !Array.isArray(current[lastKey])) {
                    current[lastKey] = [];
                }
            }
            
            const target = Array.isArray(current) ? current : (current[Object.keys(current)[Object.keys(current).length - 1]] || []);
            
            if (value.includes(':')) {
                // Objet dans la liste
                const [key, ...valParts] = value.split(':');
                const keyName = key.trim();
                const val = valParts.join(':').trim().replace(/^["']|["']$/g, '');
                
                if (val === '' || val === '|') {
                    const newObj = {};
                    target.push(newObj);
                    stack.push({ obj: newObj, indent: indent });
                } else {
                    const lastItem = target[target.length - 1] || {};
                    if (typeof lastItem === 'object' && !Array.isArray(lastItem)) {
                        lastItem[keyName] = val;
                        target[target.length - 1] = lastItem;
                    } else {
                        target.push({ [keyName]: val });
                    }
                }
            } else {
                // Valeur simple dans la liste
                const cleanValue = value.replace(/^["']|["']$/g, '');
                target.push(cleanValue);
            }
            
            // Mettre à jour la référence
            if (!Array.isArray(current)) {
                const lastKey = Object.keys(current)[Object.keys(current).length - 1];
                if (lastKey) current[lastKey] = target;
            }
        } else if (trimmed.includes(':')) {
            // Clé-valeur
            const colonIndex = trimmed.indexOf(':');
            const key = trimmed.substring(0, colonIndex).trim();
            let value = trimmed.substring(colonIndex + 1).trim();
            
            // Nettoyer les guillemets
            value = value.replace(/^["']|["']$/g, '');
            
            if (value === '' || value === '|') {
                // Valeur complexe (objet ou multi-ligne)
                current[key] = value === '|' ? '' : {};
                stack.push({ obj: current[key], indent: indent });
            } else {
                // Valeur simple
                // Convertir les booléens et nombres
                if (value === 'true' || value === 'false') {
                    current[key] = value === 'true';
                } else if (!isNaN(value) && value !== '') {
                    current[key] = Number(value);
                } else {
                    current[key] = value;
                }
            }
        }
    });
    
    return result;
}

// Parser YAML pour une liste d'objets (commence par -)
function parseYAMLList(lines) {
    const result = [];
    let currentObj = null;
    let baseIndent = -1;
    
    lines.forEach((line) => {
        // Ignorer les lignes vides et les commentaires
        if (!line.trim() || line.trim().startsWith('#')) return;
        
        const indent = line.match(/^(\s*)/)[1].length;
        const trimmed = line.trim();
        
        // Si la ligne commence par "-", c'est un nouvel élément de liste
        if (trimmed.startsWith('-')) {
            // Sauvegarder l'objet précédent s'il existe
            if (currentObj !== null) {
                result.push(currentObj);
            }
            
            // Créer un nouvel objet
            currentObj = {};
            baseIndent = indent;
            
            const value = trimmed.substring(1).trim();
            if (value.includes(':')) {
                const [key, ...valParts] = value.split(':');
                const keyName = key.trim();
                const val = valParts.join(':').trim().replace(/^["']|["']$/g, '');
                if (val) {
                    currentObj[keyName] = val;
                }
            }
        } else if (trimmed.includes(':') && currentObj !== null) {
            // Ligne avec clé-valeur (propriété de l'objet courant)
            // Vérifier que l'indentation est supérieure à baseIndent
            if (indent > baseIndent) {
                const colonIndex = trimmed.indexOf(':');
                const key = trimmed.substring(0, colonIndex).trim();
                let value = trimmed.substring(colonIndex + 1).trim();
                
                // Nettoyer les guillemets
                value = value.replace(/^["']|["']$/g, '');
                
                // Gérer les valeurs spéciales
                if (value === 'true' || value === 'false') {
                    currentObj[key] = value === 'true';
                } else if (!isNaN(value) && value !== '') {
                    currentObj[key] = Number(value);
                } else if (value === '' || value === '|') {
                    // Valeur complexe (objet ou multi-ligne)
                    currentObj[key] = value === '|' ? '' : {};
                } else {
                    currentObj[key] = value;
                }
            }
        }
    });
    
    // Ajouter le dernier objet
    if (currentObj !== null) {
        result.push(currentObj);
    }
    
    return result;
}

// Rendre l'aperçu de la carte
function renderCardPreview(yamlCode) {
    const previewContainer = document.getElementById('cardPreview');
    const previewInfo = document.getElementById('previewInfo');
    
    if (!previewContainer || !previewInfo) return;
    
    try {
        // Nettoyer le YAML (enlever les commentaires, etc.)
        const cleanYaml = yamlCode.replace(/^#.*$/gm, '').trim();
        
        // Détecter le type de carte directement depuis le texte (plus fiable)
        let cardType = detectCardType(cleanYaml);
        
        // Si pas trouvé, parser le YAML et chercher dans la config
        let cardConfig = {};
        if (!cardType) {
            cardConfig = parseYAML(cleanYaml);
            cardType = detectCardTypeFromConfig(cardConfig);
        } else {
            // Parser quand même pour avoir la config
            cardConfig = parseYAML(cleanYaml);
        }
        
        // Si c'est un tableau (commence par -), extraire le premier élément
        if (Array.isArray(cardConfig) && cardConfig.length > 0) {
            cardConfig = cardConfig[0];
            // Si on n'a pas encore le type, le chercher dans l'élément du tableau
            if (!cardType && cardConfig.type) {
                cardType = cardConfig.type;
            }
        }
        
        // Normaliser le type (enlever les espaces, guillemets)
        if (cardType) {
            cardType = cardType.trim().replace(/^["']|["']$/g, '');
        }
        
        console.log('🔍 Type de carte détecté:', cardType);
        console.log('📦 Config parsée:', cardConfig);
        
        // Générer le HTML selon le type
        let previewHTML = '';
        let infoText = '';
        
        switch (cardType) {
            case 'button':
            case 'custom:button-card':
                previewHTML = renderButtonCard(cardConfig);
                infoText = 'Carte Bouton - Cliquez pour activer/désactiver';
                break;
            case 'entity':
                previewHTML = renderEntityCard(cardConfig);
                infoText = 'Carte Entité - Affiche l\'état d\'une entité';
                break;
            case 'glance':
                previewHTML = renderGlanceCard(cardConfig);
                infoText = 'Carte Glance - Vue d\'ensemble de plusieurs entités';
                break;
            case 'entities':
                previewHTML = renderEntitiesCard(cardConfig);
                infoText = 'Carte Entities - Liste d\'entités';
                break;
            case 'custom:banner-card':
                previewHTML = renderBannerCard(cardConfig);
                infoText = 'Carte Bannière - Bannière avec entités';
                break;
            case 'custom:mushroom-entity-card':
            case 'custom:mushroom-alarm-control-panel-card':
            case 'custom:mushroom-template-card':
            case 'custom:mushroom-chips-card':
                previewHTML = renderMushroomCard(cardConfig);
                infoText = 'Carte Mushroom - Style moderne';
                break;
            case 'markdown':
                previewHTML = renderMarkdownCard(cardConfig);
                infoText = 'Carte Markdown - Contenu formaté';
                break;
            case 'vertical-stack':
                previewHTML = renderVerticalStack(cardConfig);
                infoText = 'Empilement Vertical - Plusieurs cartes empilées';
                break;
            case 'weather':
            case 'custom:weather-chart-card':
            case 'custom:weather-radar-card':
            case 'custom:meteofrance-weather-card':
                previewHTML = renderWeatherCard(cardConfig);
                infoText = 'Carte Météo - Conditions météorologiques';
                break;
            case 'gauge':
                previewHTML = renderGaugeCard(cardConfig);
                infoText = 'Carte Jauge - Affichage de valeur avec jauge';
                break;
            case 'history-graph':
            case 'custom:mini-graph-card':
            case 'custom:apexcharts-card':
                previewHTML = renderHistoryGraphCard(cardConfig);
                infoText = 'Carte Graphique - Historique et statistiques';
                break;
            case 'picture':
            case 'picture-elements':
                previewHTML = renderPictureCard(cardConfig);
                infoText = 'Carte Image - Affichage d\'image';
                break;
            case 'thermostat':
            case 'climate':
                previewHTML = renderThermostatCard(cardConfig);
                infoText = 'Carte Thermostat - Contrôle de température';
                break;
            case 'alarm-control-panel':
                previewHTML = renderAlarmPanelCard(cardConfig);
                infoText = 'Carte Alarme - Contrôle d\'alarme';
                break;
            case 'map':
                previewHTML = renderMapCard(cardConfig);
                infoText = 'Carte Carte - Affichage de carte interactive';
                break;
            case 'conditional':
                previewHTML = renderConditionalCard(cardConfig);
                infoText = 'Carte Conditionnelle - Affichage conditionnel';
                break;
            case 'custom:slider-button-card':
                previewHTML = renderSliderButtonCard(cardConfig);
                infoText = 'Carte Slider Button - Contrôle avec slider';
                break;
            case 'statistics':
                previewHTML = renderStatisticsCard(cardConfig);
                infoText = 'Carte Statistiques - Données agrégées';
                break;
            case 'media-control':
            case 'custom:mini-media-player':
                previewHTML = renderMediaControlCard(cardConfig);
                infoText = 'Carte Media Control - Contrôle média';
                break;
            case 'horizontal-stack':
                previewHTML = renderHorizontalStack(cardConfig);
                infoText = 'Empilement Horizontal - Plusieurs cartes côte à côte';
                break;
            case 'grid':
                previewHTML = renderGridCard(cardConfig);
                infoText = 'Carte Grid - Grille de cartes';
                break;
            case 'sensor':
                previewHTML = renderSensorCard(cardConfig);
                infoText = 'Carte Sensor - Affichage de capteur';
                break;
            case 'tile':
                previewHTML = renderTileCard(cardConfig);
                infoText = 'Carte Tile - Tuile moderne';
                break;
            case 'cover':
                previewHTML = renderCoverCard(cardConfig);
                infoText = 'Carte Cover - Contrôle de volet/store';
                break;
            case 'fan':
                previewHTML = renderFanCard(cardConfig);
                infoText = 'Carte Fan - Contrôle de ventilateur';
                break;
            case 'lock':
                previewHTML = renderLockCard(cardConfig);
                infoText = 'Carte Lock - Contrôle de serrure';
                break;
            case 'vacuum':
                previewHTML = renderVacuumCard(cardConfig);
                infoText = 'Carte Vacuum - Contrôle d\'aspirateur';
                break;
            case 'calendar':
                previewHTML = renderCalendarCard(cardConfig);
                infoText = 'Carte Calendar - Calendrier';
                break;
            case 'logbook':
                previewHTML = renderLogbookCard(cardConfig);
                infoText = 'Carte Logbook - Journal d\'événements';
                break;
            default:
                if (cardType && cardType.startsWith('custom:')) {
                    previewHTML = renderCustomCard(cardConfig);
                    infoText = `Carte personnalisée: ${cardType}`;
                } else if (cardType) {
                    // Essayer de rendre quand même avec les propriétés disponibles
                    previewHTML = renderCustomCard(cardConfig);
                    infoText = `Type de carte: ${cardType} (aperçu générique)`;
                } else {
                    previewHTML = '<div class="preview-not-supported">⚠️ Aperçu non disponible pour ce type de carte</div>';
                    previewHTML += `<div style="margin-top: 10px; padding: 10px; background: rgba(255,193,7,0.1); border-radius: 6px; font-size: 0.85rem; color: var(--text-light);">`;
                    previewHTML += `<strong>Débogage:</strong><br>`;
                    previewHTML += `Type détecté: ${cardType || 'aucun'}<br>`;
                    previewHTML += `Première ligne: ${yamlCode.split('\n')[0]?.substring(0, 50) || 'vide'}<br>`;
                    previewHTML += `</div>`;
                    infoText = `Type de carte: ${cardType || 'inconnu'}`;
                }
        }
        
        previewContainer.innerHTML = previewHTML;
        previewInfo.textContent = infoText;
        
    } catch (error) {
        console.error('Erreur lors du rendu de l\'aperçu:', error);
        console.error('Code YAML:', yamlCode);
        previewContainer.innerHTML = '<div class="preview-error">❌ Impossible de générer l\'aperçu. Le code YAML pourrait être trop complexe.</div>';
        previewContainer.innerHTML += `<div style="margin-top: 10px; padding: 10px; background: rgba(231,76,60,0.1); border-radius: 6px; font-size: 0.85rem; color: var(--text-light);">Erreur: ${error.message}</div>`;
        previewInfo.textContent = 'Erreur de rendu';
    }
}

// Détecter le type de carte depuis la config parsée
function detectCardTypeFromConfig(config) {
    // Si c'est un tableau, chercher dans le premier élément
    if (Array.isArray(config) && config.length > 0) {
        const firstItem = config[0];
        if (typeof firstItem === 'object' && firstItem.type) {
            return firstItem.type;
        }
        if (typeof firstItem === 'string' && firstItem.includes('type:')) {
            const match = firstItem.match(/type:\s*(.+)/);
            if (match) return match[1].trim();
        }
    }
    
    // Chercher directement dans la config
    if (config && typeof config === 'object' && config.type) {
        return config.type;
    }
    
    // Chercher dans les objets imbriqués
    if (config['-'] && typeof config['-'] === 'object' && config['-'].type) {
        return config['-'].type;
    }
    
    // Chercher dans toutes les clés
    for (const key in config) {
        if (key.toLowerCase() === 'type') {
            return config[key];
        }
        if (typeof config[key] === 'object' && config[key] && config[key].type) {
            return config[key].type;
        }
    }
    
    return null;
}

// Rendre une carte Button
function renderButtonCard(config) {
    const name = config.name || config.entity || 'Bouton';
    const icon = config.icon || 'mdi:lightbulb';
    const showState = config.show_state !== false;
    const state = config.entity ? 'on' : 'off';
    
    return `
        <div class="ha-preview-button-card">
            <div class="ha-button-icon">${getIconEmoji(icon)}</div>
            <div class="ha-button-content">
                <div class="ha-button-name">${escapeHtml(name)}</div>
                ${showState ? `<div class="ha-button-state">${state}</div>` : ''}
            </div>
        </div>
    `;
}

// Rendre une carte Entity
function renderEntityCard(config) {
    const name = config.name || config.entity || 'Entité';
    const icon = config.icon || 'mdi:information';
    const state = 'Actif';
    
    return `
        <div class="ha-preview-entity-card">
            <div class="ha-entity-icon">${getIconEmoji(icon)}</div>
            <div class="ha-entity-content">
                <div class="ha-entity-name">${escapeHtml(name)}</div>
                <div class="ha-entity-state">${state}</div>
            </div>
        </div>
    `;
}

// Rendre une carte Glance
function renderGlanceCard(config) {
    const entities = config.entities || [];
    const entitiesHTML = entities.slice(0, 4).map((entity, idx) => {
        const entityName = typeof entity === 'string' ? entity : entity.entity || `Entité ${idx + 1}`;
        return `
            <div class="ha-glance-item">
                <div class="ha-glance-icon">${getIconEmoji('mdi:circle')}</div>
                <div class="ha-glance-name">${escapeHtml(entityName)}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="ha-preview-glance-card">
            ${entitiesHTML || '<div class="ha-glance-item">Aucune entité</div>'}
        </div>
    `;
}

// Rendre une carte Entities
function renderEntitiesCard(config) {
    const title = config.title || '';
    const entities = config.entities || [];
    const entitiesHTML = entities.slice(0, 5).map((entity, idx) => {
        const entityName = typeof entity === 'string' ? entity : entity.entity || `Entité ${idx + 1}`;
        return `
            <div class="ha-entities-item">
                <div class="ha-entities-icon">${getIconEmoji('mdi:circle')}</div>
                <div class="ha-entities-name">${escapeHtml(entityName)}</div>
                <div class="ha-entities-state">on</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="ha-preview-entities-card">
            ${title ? `<div class="ha-entities-title">${escapeHtml(title)}</div>` : ''}
            ${entitiesHTML || '<div class="ha-entities-item">Aucune entité</div>'}
        </div>
    `;
}

// Rendre une carte Banner
function renderBannerCard(config) {
    const heading = config.heading || 'Bannière';
    const entities = config.entities || [];
    const entitiesHTML = entities.slice(0, 4).map((entity, idx) => {
        const entityName = typeof entity === 'object' && entity.name ? entity.name : `Entité ${idx + 1}`;
        return `<div class="ha-banner-entity">${escapeHtml(entityName)}</div>`;
    }).join('');
    
    return `
        <div class="ha-preview-banner-card">
            <div class="ha-banner-heading">${escapeHtml(heading)}</div>
            ${entities.length > 0 ? `<div class="ha-banner-entities">${entitiesHTML}</div>` : ''}
        </div>
    `;
}

// Rendre une carte Mushroom
function renderMushroomCard(config) {
    const name = config.name || config.entity || 'Mushroom';
    const icon = config.icon || 'mdi:home';
    const layout = config.layout || 'vertical';
    
    return `
        <div class="ha-preview-mushroom-card ${layout}">
            <div class="ha-mushroom-icon">${getIconEmoji(icon)}</div>
            <div class="ha-mushroom-content">
                <div class="ha-mushroom-name">${escapeHtml(name)}</div>
                <div class="ha-mushroom-state">home</div>
            </div>
        </div>
    `;
}

// Rendre une carte Markdown
function renderMarkdownCard(config) {
    const content = config.content || '**Contenu Markdown**\n\nTexte formaté ici...';
    return `
        <div class="ha-preview-markdown-card">
            <div class="ha-markdown-content">${escapeHtml(content).replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

// Rendre un Vertical Stack
function renderVerticalStack(config) {
    const cards = config.cards || [];
    const cardsHTML = cards.slice(0, 3).map(card => {
        if (card.type === 'button') {
            return `<div class="ha-stack-item">${renderButtonCard(card)}</div>`;
        }
        return `<div class="ha-stack-item">Carte ${card.type || 'inconnue'}</div>`;
    }).join('');
    
    return `
        <div class="ha-preview-vertical-stack">
            ${cardsHTML || '<div class="ha-stack-item">Aucune carte</div>'}
        </div>
    `;
}

// Rendre une carte Weather
function renderWeatherCard(config) {
    const entity = config.entity || 'weather.home';
    const name = config.name || 'Météo';
    
    return `
        <div class="ha-preview-weather-card">
            <div class="ha-weather-header">
                <div class="ha-weather-icon">🌤️</div>
                <div class="ha-weather-content">
                    <div class="ha-weather-name">${escapeHtml(name)}</div>
                    <div class="ha-weather-temp">22°C</div>
                </div>
            </div>
            <div class="ha-weather-details">
                <div class="ha-weather-detail">💧 65%</div>
                <div class="ha-weather-detail">🌬️ 15 km/h</div>
            </div>
        </div>
    `;
}

// Rendre une carte Gauge
function renderGaugeCard(config) {
    const name = config.name || config.entity || 'Jauge';
    const min = config.min || 0;
    const max = config.max || 100;
    const value = config.value || 50;
    const unit = config.unit || '%';
    
    const percentage = ((value - min) / (max - min)) * 100;
    
    return `
        <div class="ha-preview-gauge-card">
            <div class="ha-gauge-name">${escapeHtml(name)}</div>
            <div class="ha-gauge-container">
                <div class="ha-gauge-circle">
                    <svg viewBox="0 0 120 120" class="ha-gauge-svg">
                        <circle cx="60" cy="60" r="50" class="ha-gauge-background"></circle>
                        <circle cx="60" cy="60" r="50" class="ha-gauge-fill" 
                                stroke-dasharray="${percentage * 3.14}" 
                                stroke-dashoffset="${314 - (percentage * 3.14)}"></circle>
                    </svg>
                    <div class="ha-gauge-value">${value}${unit}</div>
                </div>
            </div>
        </div>
    `;
}

// Rendre une carte History Graph
function renderHistoryGraphCard(config) {
    const entities = config.entities || [];
    const hours = config.hours || 24;
    
    return `
        <div class="ha-preview-history-card">
            <div class="ha-history-header">
                <span>📊 Historique (${hours}h)</span>
            </div>
            <div class="ha-history-chart">
                <div class="ha-history-bars">
                    ${Array.from({length: 12}, (_, i) => 
                        `<div class="ha-history-bar" style="height: ${Math.random() * 60 + 20}%"></div>`
                    ).join('')}
                </div>
            </div>
            <div class="ha-history-entities">
                ${entities.slice(0, 3).map(e => 
                    `<div class="ha-history-entity">${escapeHtml(typeof e === 'string' ? e : e.entity || 'Entité')}</div>`
                ).join('')}
            </div>
        </div>
    `;
}

// Rendre une carte Picture
function renderPictureCard(config) {
    const image = config.image || 'https://via.placeholder.com/400x200?text=Image';
    const title = config.title || '';
    
    return `
        <div class="ha-preview-picture-card">
            ${title ? `<div class="ha-picture-title">${escapeHtml(title)}</div>` : ''}
            <div class="ha-picture-image">
                <img src="${image}" alt="${escapeHtml(title)}" onerror="this.src='https://via.placeholder.com/400x200?text=Image+non+disponible'">
            </div>
        </div>
    `;
}

// Rendre une carte Thermostat
function renderThermostatCard(config) {
    const entity = config.entity || 'climate.home';
    const name = config.name || 'Thermostat';
    const currentTemp = 20;
    const targetTemp = 22;
    
    return `
        <div class="ha-preview-thermostat-card">
            <div class="ha-thermostat-header">
                <div class="ha-thermostat-icon">🌡️</div>
                <div class="ha-thermostat-name">${escapeHtml(name)}</div>
            </div>
            <div class="ha-thermostat-temps">
                <div class="ha-thermostat-current">${currentTemp}°C</div>
                <div class="ha-thermostat-target">→ ${targetTemp}°C</div>
            </div>
            <div class="ha-thermostat-controls">
                <button class="ha-thermostat-btn">-</button>
                <span>Auto</span>
                <button class="ha-thermostat-btn">+</button>
            </div>
        </div>
    `;
}

// Rendre une carte Alarm Panel
function renderAlarmPanelCard(config) {
    const entity = config.entity || 'alarm_control_panel.home';
    const name = config.name || 'Alarme';
    const state = 'disarmed';
    
    return `
        <div class="ha-preview-alarm-card">
            <div class="ha-alarm-header">
                <div class="ha-alarm-icon">🔒</div>
                <div class="ha-alarm-name">${escapeHtml(name)}</div>
            </div>
            <div class="ha-alarm-state ${state}">${state.toUpperCase()}</div>
            <div class="ha-alarm-keypad">
                <div class="ha-alarm-row">
                    <button class="ha-alarm-key">1</button>
                    <button class="ha-alarm-key">2</button>
                    <button class="ha-alarm-key">3</button>
                </div>
                <div class="ha-alarm-row">
                    <button class="ha-alarm-key">4</button>
                    <button class="ha-alarm-key">5</button>
                    <button class="ha-alarm-key">6</button>
                </div>
                <div class="ha-alarm-row">
                    <button class="ha-alarm-key">7</button>
                    <button class="ha-alarm-key">8</button>
                    <button class="ha-alarm-key">9</button>
                </div>
                <div class="ha-alarm-row">
                    <button class="ha-alarm-key">*</button>
                    <button class="ha-alarm-key">0</button>
                    <button class="ha-alarm-key">#</button>
                </div>
            </div>
        </div>
    `;
}

// Rendre une carte Map
function renderMapCard(config) {
    const entities = config.entities || [];
    const defaultZoom = config.default_zoom || 14;
    
    return `
        <div class="ha-preview-map-card">
            <div class="ha-map-header">
                <span>🗺️ Carte</span>
                <span class="ha-map-zoom">Zoom: ${defaultZoom}</span>
            </div>
            <div class="ha-map-container">
                <div class="ha-map-placeholder">
                    <div class="ha-map-marker">📍</div>
                    <div class="ha-map-text">Carte interactive</div>
                </div>
            </div>
            ${entities.length > 0 ? `<div class="ha-map-entities">${entities.length} entité(s)</div>` : ''}
        </div>
    `;
}

// Rendre une carte Custom (générique)
function renderCustomCard(config) {
    const cardType = config.type || 'custom';
    const name = config.name || 'Carte personnalisée';
    
    return `
        <div class="ha-preview-custom-card">
            <div class="ha-custom-header">
                <span class="ha-custom-icon">🔧</span>
                <span class="ha-custom-name">${escapeHtml(name)}</span>
            </div>
            <div class="ha-custom-type">Type: ${escapeHtml(cardType)}</div>
            <div class="ha-custom-note">Cette carte nécessite un composant personnalisé installé via HACS</div>
        </div>
    `;
}

// Rendre une carte Conditional
function renderConditionalCard(config) {
    const card = config.card || {};
    const conditions = config.conditions || [];
    const conditionText = conditions.length > 0 ? `${conditions.length} condition(s)` : 'Aucune condition';
    
    return `
        <div class="ha-preview-conditional-card">
            <div class="ha-conditional-header">
                <span class="ha-conditional-icon">🔀</span>
                <span class="ha-conditional-title">Carte Conditionnelle</span>
            </div>
            <div class="ha-conditional-info">
                <div class="ha-conditional-condition">${conditionText}</div>
                <div class="ha-conditional-card-preview">
                    ${card.type ? `Type: ${card.type}` : 'Carte imbriquée'}
                </div>
            </div>
        </div>
    `;
}

// Rendre une carte Slider Button
function renderSliderButtonCard(config) {
    const name = config.name || config.entity || 'Slider';
    const icon = config.icon || 'mdi:lightbulb';
    const value = 50;
    
    return `
        <div class="ha-preview-slider-card">
            <div class="ha-slider-header">
                <div class="ha-slider-icon">${getIconEmoji(icon)}</div>
                <div class="ha-slider-name">${escapeHtml(name)}</div>
                <div class="ha-slider-value">${value}%</div>
            </div>
            <div class="ha-slider-track">
                <div class="ha-slider-fill" style="width: ${value}%"></div>
            </div>
        </div>
    `;
}

// Rendre une carte Statistics
function renderStatisticsCard(config) {
    const entity = config.entity || 'sensor.example';
    const name = config.name || 'Statistiques';
    const period = config.period || 'day';
    const statTypes = config.stat_types || ['mean', 'min', 'max'];
    
    return `
        <div class="ha-preview-statistics-card">
            <div class="ha-statistics-header">
                <span class="ha-statistics-icon">📊</span>
                <span class="ha-statistics-name">${escapeHtml(name)}</span>
            </div>
            <div class="ha-statistics-period">Période: ${period}</div>
            <div class="ha-statistics-stats">
                ${statTypes.map(stat => `
                    <div class="ha-statistics-stat">
                        <span class="ha-stat-label">${stat}</span>
                        <span class="ha-stat-value">--</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Rendre une carte Media Control
function renderMediaControlCard(config) {
    const entity = config.entity || 'media_player.example';
    const name = config.name || 'Média';
    
    return `
        <div class="ha-preview-media-card">
            <div class="ha-media-header">
                <div class="ha-media-icon">🎵</div>
                <div class="ha-media-name">${escapeHtml(name)}</div>
            </div>
            <div class="ha-media-controls">
                <button class="ha-media-btn">⏮️</button>
                <button class="ha-media-btn ha-media-play">▶️</button>
                <button class="ha-media-btn">⏭️</button>
            </div>
            <div class="ha-media-info">
                <div class="ha-media-title">Titre de la chanson</div>
                <div class="ha-media-artist">Artiste</div>
            </div>
        </div>
    `;
}

// Rendre un Horizontal Stack
function renderHorizontalStack(config) {
    const cards = config.cards || [];
    const cardsHTML = cards.slice(0, 3).map((card, idx) => {
        if (card.type === 'button') {
            return `<div class="ha-stack-item-horizontal">${renderButtonCard(card)}</div>`;
        }
        return `<div class="ha-stack-item-horizontal">Carte ${card.type || idx + 1}</div>`;
    }).join('');
    
    return `
        <div class="ha-preview-horizontal-stack">
            ${cardsHTML || '<div class="ha-stack-item-horizontal">Aucune carte</div>'}
        </div>
    `;
}

// Rendre une carte Grid
function renderGridCard(config) {
    const cards = config.cards || [];
    const columns = config.columns || 3;
    const cardsHTML = cards.slice(0, 6).map((card, idx) => {
        if (card.type === 'button') {
            return `<div class="ha-grid-item">${renderButtonCard(card)}</div>`;
        }
        return `<div class="ha-grid-item">Carte ${card.type || idx + 1}</div>`;
    }).join('');
    
    return `
        <div class="ha-preview-grid-card" style="grid-template-columns: repeat(${columns}, 1fr);">
            ${cardsHTML || '<div class="ha-grid-item">Aucune carte</div>'}
        </div>
    `;
}

// Rendre une carte Sensor
function renderSensorCard(config) {
    const entity = config.entity || 'sensor.example';
    const name = config.name || 'Capteur';
    const icon = config.icon || 'mdi:information';
    const value = '25.5';
    const unit = config.unit || '°C';
    
    return `
        <div class="ha-preview-sensor-card">
            <div class="ha-sensor-icon">${getIconEmoji(icon)}</div>
            <div class="ha-sensor-content">
                <div class="ha-sensor-name">${escapeHtml(name)}</div>
                <div class="ha-sensor-value">${value} ${unit}</div>
            </div>
        </div>
    `;
}

// Rendre une carte Tile
function renderTileCard(config) {
    const entity = config.entity || 'light.example';
    const name = config.name || 'Tuile';
    const icon = config.icon || 'mdi:lightbulb';
    
    return `
        <div class="ha-preview-tile-card">
            <div class="ha-tile-icon">${getIconEmoji(icon)}</div>
            <div class="ha-tile-content">
                <div class="ha-tile-name">${escapeHtml(name)}</div>
                <div class="ha-tile-state">on</div>
            </div>
        </div>
    `;
}

// Rendre une carte Cover (Volets)
function renderCoverCard(config) {
    const entity = config.entity || 'cover.example';
    const name = config.name || 'Volet';
    
    return `
        <div class="ha-preview-cover-card">
            <div class="ha-cover-header">
                <div class="ha-cover-icon">🪟</div>
                <div class="ha-cover-name">${escapeHtml(name)}</div>
            </div>
            <div class="ha-cover-position">
                <div class="ha-cover-bar">
                    <div class="ha-cover-fill" style="height: 60%"></div>
                </div>
                <div class="ha-cover-value">60%</div>
            </div>
            <div class="ha-cover-controls">
                <button class="ha-cover-btn">⬆️</button>
                <button class="ha-cover-btn">⏸️</button>
                <button class="ha-cover-btn">⬇️</button>
            </div>
        </div>
    `;
}

// Rendre une carte Fan (Ventilateur)
function renderFanCard(config) {
    const entity = config.entity || 'fan.example';
    const name = config.name || 'Ventilateur';
    
    return `
        <div class="ha-preview-fan-card">
            <div class="ha-fan-header">
                <div class="ha-fan-icon">🌀</div>
                <div class="ha-fan-name">${escapeHtml(name)}</div>
            </div>
            <div class="ha-fan-speed">
                <div class="ha-fan-speed-label">Vitesse</div>
                <div class="ha-fan-speed-value">50%</div>
            </div>
            <div class="ha-fan-controls">
                <button class="ha-fan-btn">-</button>
                <span>Auto</span>
                <button class="ha-fan-btn">+</button>
            </div>
        </div>
    `;
}

// Rendre une carte Lock (Serrure)
function renderLockCard(config) {
    const entity = config.entity || 'lock.example';
    const name = config.name || 'Serrure';
    const state = 'locked';
    
    return `
        <div class="ha-preview-lock-card">
            <div class="ha-lock-header">
                <div class="ha-lock-icon ${state}">${state === 'locked' ? '🔒' : '🔓'}</div>
                <div class="ha-lock-name">${escapeHtml(name)}</div>
            </div>
            <div class="ha-lock-state ${state}">${state === 'locked' ? 'Verrouillée' : 'Déverrouillée'}</div>
        </div>
    `;
}

// Rendre une carte Vacuum (Aspirateur)
function renderVacuumCard(config) {
    const entity = config.entity || 'vacuum.example';
    const name = config.name || 'Aspirateur';
    
    return `
        <div class="ha-preview-vacuum-card">
            <div class="ha-vacuum-header">
                <div class="ha-vacuum-icon">🤖</div>
                <div class="ha-vacuum-name">${escapeHtml(name)}</div>
            </div>
            <div class="ha-vacuum-status">En pause</div>
            <div class="ha-vacuum-controls">
                <button class="ha-vacuum-btn">▶️ Démarrer</button>
                <button class="ha-vacuum-btn">⏸️ Pause</button>
                <button class="ha-vacuum-btn">🏠 Retour</button>
            </div>
        </div>
    `;
}

// Rendre une carte Calendar
function renderCalendarCard(config) {
    const entities = config.entities || [];
    
    return `
        <div class="ha-preview-calendar-card">
            <div class="ha-calendar-header">
                <span class="ha-calendar-icon">📅</span>
                <span class="ha-calendar-title">Calendrier</span>
            </div>
            <div class="ha-calendar-grid">
                ${Array.from({length: 7}, (_, i) => 
                    `<div class="ha-calendar-day">
                        <div class="ha-calendar-day-name">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}</div>
                        <div class="ha-calendar-day-number">${i + 1}</div>
                        ${i % 3 === 0 ? '<div class="ha-calendar-event">Événement</div>' : ''}
                    </div>`
                ).join('')}
            </div>
        </div>
    `;
}

// Rendre une carte Logbook
function renderLogbookCard(config) {
    const entities = config.entities || [];
    
    return `
        <div class="ha-preview-logbook-card">
            <div class="ha-logbook-header">
                <span class="ha-logbook-icon">📋</span>
                <span class="ha-logbook-title">Journal</span>
            </div>
            <div class="ha-logbook-entries">
                ${Array.from({length: 5}, (_, i) => `
                    <div class="ha-logbook-entry">
                        <div class="ha-logbook-time">${10 + i}:${30 + i * 2}</div>
                        <div class="ha-logbook-event">Événement ${i + 1}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Convertir les icônes MDI en emoji (version améliorée)
function getIconEmoji(icon) {
    if (!icon) return '⚪';
    
    const iconMap = {
        // Lumières
        'mdi:lightbulb': '💡', 'mdi:lightbulb-on': '💡', 'mdi:lightbulb-outline': '💡',
        'mdi:ceiling-light': '💡', 'mdi:outdoor-lamp': '💡', 'mdi:floor-lamp': '💡',
        'mdi:light-flood-down': '💡', 'mdi:light-recessed': '💡', 'mdi:bulkhead-light': '💡',
        
        // Maison
        'mdi:home': '🏠', 'mdi:home-variant': '🏠', 'mdi:home-outline': '🏠',
        
        // Personnes
        'mdi:account': '👤', 'mdi:account-circle': '👤', 'mdi:account-outline': '👤',
        
        // Médias
        'mdi:youtube': '📺', 'mdi:music': '🎵', 'mdi:play': '▶️', 'mdi:stop': '⏹️',
        'mdi:pause': '⏸️', 'mdi:skip-next': '⏭️', 'mdi:skip-previous': '⏮️',
        
        // Météo
        'mdi:weather-cloudy': '☁️', 'mdi:weather-sunny': '☀️', 'mdi:weather-rainy': '🌧️',
        'mdi:weather-snowy': '❄️', 'mdi:thermometer': '🌡️',
        
        // Portes/Fenêtres
        'mdi:door-open': '🚪', 'mdi:door': '🚪', 'mdi:window-open': '🪟',
        
        // Divers
        'mdi:circle': '⚪', 'mdi:information': 'ℹ️', 'mdi:alert': '⚠️',
        'mdi:lock': '🔒', 'mdi:lock-open': '🔓', 'mdi:shield': '🛡️',
        'mdi:map': '🗺️', 'mdi:camera': '📷', 'mdi:bell': '🔔',
        'mdi:shuffle-variant': '🔀', 'mdi:fan': '🌀', 'mdi:robot-vacuum': '🤖',
    };
    
    // Chercher une correspondance exacte
    if (iconMap[icon]) return iconMap[icon];
    
    // Chercher une correspondance partielle
    for (const [key, emoji] of Object.entries(iconMap)) {
        if (icon.includes(key.replace('mdi:', ''))) {
            return emoji;
        }
    }
    
    return '⚪';
}

// Bouton retour en haut de page
function initBackToTop() {
    const btn = document.getElementById('btnBackToTop');
    if (!btn) return;
    const scrollThreshold = 300;
    function toggleVisibility() {
        if (window.scrollY > scrollThreshold) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateActiveTagsDisplay();
    initBackToTop();
});

