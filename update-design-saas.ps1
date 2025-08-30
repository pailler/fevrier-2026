# Script de mise à jour du design SAAS pour IAHome
# Compatible Windows PowerShell

Write-Host "🎨 Mise à jour du design SAAS pour IAHome..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "src/app/page.tsx")) {
    Write-Host "❌ Veuillez exécuter ce script depuis la racine du projet IAHome" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Répertoire de projet détecté" -ForegroundColor Green

# Créer un backup du design actuel
$backupDir = "backup-design-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "📦 Création d'un backup du design actuel..." -ForegroundColor Yellow
Copy-Item "src/app/globals.css" "$backupDir/globals.css.backup"
Copy-Item "src/components/Header.tsx" "$backupDir/Header.tsx.backup"
Copy-Item "src/app/page.tsx" "$backupDir/page.tsx.backup"

Write-Host "✅ Backup créé dans: $backupDir" -ForegroundColor Green

# Mettre à jour le CSS global avec le design SAAS
Write-Host "🎨 Mise à jour du CSS global..." -ForegroundColor Yellow

$newCSS = @"
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #1e293b;
  --primary: #3b82f6;
  --primary-dark: #1d4ed8;
  --secondary: #64748b;
  --accent: #10b981;
  --border: #e2e8f0;
  --muted: #f8fafc;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-dark: var(--primary-dark);
  --color-secondary: var(--secondary);
  --color-accent: var(--accent);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0f172a;
    --foreground: #f1f5f9;
    --primary: #3b82f6;
    --primary-dark: #1d4ed8;
    --secondary: #94a3b8;
    --accent: #10b981;
    --border: #334155;
    --muted: #1e293b;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* Design SAAS - Header */
.saas-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid var(--border);
}

.saas-hero {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  min-height: 80vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.saas-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

/* Cards de templates */
.template-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid var(--border);
  overflow: hidden;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-primary {
  background: var(--primary);
  color: white;
}

.badge-success {
  background: var(--accent);
  color: white;
}

.badge-secondary {
  background: var(--secondary);
  color: white;
}

/* Boutons */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--primary);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 2px solid var(--primary);
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

/* Barre de recherche */
.search-bar {
  background: white;
  border-radius: 50px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--foreground);
}

.search-input::placeholder {
  color: var(--secondary);
}

/* Filtres */
.filters-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filter-dropdown {
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--foreground);
  cursor: pointer;
}

/* Sidebar */
.sidebar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.category-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  background: var(--muted);
  color: var(--foreground);
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tag:hover,
.category-tag.active {
  background: var(--primary);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .saas-hero {
    min-height: 60vh;
    padding: 2rem 1rem;
  }
  
  .search-bar {
    margin: 0 1rem;
  }
  
  .filters-container {
    margin: 1rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Scroll to top button */
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--primary);
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  z-index: 1000;
}

.scroll-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}
"@

Set-Content -Path "src/app/globals.css" -Value $newCSS

Write-Host "✅ CSS global mis à jour" -ForegroundColor Green

# Créer un nouveau composant Header SAAS
Write-Host "🎨 Création du nouveau Header SAAS..." -ForegroundColor Yellow

$newHeader = @"
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';
import { Search, Menu, X, ChevronDown } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="saas-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Bubble */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">b</span>
            </div>
            <span className="text-white font-bold text-xl">bubble</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/product" className="text-white hover:text-blue-200 transition-colors font-medium">
              Product
            </Link>
            <Link href="/resources" className="text-white hover:text-blue-200 transition-colors font-medium">
              Resources
            </Link>
            <Link href="/community" className="text-white hover:text-blue-200 transition-colors font-medium">
              Community
            </Link>
            <Link href="/examples" className="text-white hover:text-blue-200 transition-colors font-medium">
              Examples
            </Link>
            <Link href="/pricing" className="text-white hover:text-blue-200 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/enterprise" className="text-white hover:text-blue-200 transition-colors font-medium">
              Enterprise
            </Link>
          </nav>

          {/* Boutons à droite */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-white hover:text-blue-200 transition-colors font-medium">
              Contact sales
            </button>
            <button className="text-white hover:text-blue-200 transition-colors font-medium">
              Log in
            </button>
            <button className="btn-primary">
              Get started
            </button>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-200 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-500">
            <nav className="flex flex-col space-y-4">
              <Link href="/product" className="text-white hover:text-blue-200 transition-colors">
                Product
              </Link>
              <Link href="/resources" className="text-white hover:text-blue-200 transition-colors">
                Resources
              </Link>
              <Link href="/community" className="text-white hover:text-blue-200 transition-colors">
                Community
              </Link>
              <Link href="/examples" className="text-white hover:text-blue-200 transition-colors">
                Examples
              </Link>
              <Link href="/pricing" className="text-white hover:text-blue-200 transition-colors">
                Pricing
              </Link>
              <Link href="/enterprise" className="text-white hover:text-blue-200 transition-colors">
                Enterprise
              </Link>
              <div className="pt-4 border-t border-blue-500">
                <button className="text-white hover:text-blue-200 transition-colors block w-full text-left mb-2">
                  Contact sales
                </button>
                <button className="text-white hover:text-blue-200 transition-colors block w-full text-left mb-2">
                  Log in
                </button>
                <button className="btn-primary w-full">
                  Get started
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
"@

Set-Content -Path "src/components/Header.tsx" -Value $newHeader

Write-Host "✅ Header SAAS créé" -ForegroundColor Green

# Créer un nouveau composant Hero SAAS
Write-Host "🎨 Création du composant Hero SAAS..." -ForegroundColor Yellow

$heroComponent = @"
'use client';

import { Search } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="saas-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 fade-in-up">
            Accès direct à la puissance et aux outils IA
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 fade-in-up" style="animation-delay: 0.2s;">
            Build with ready-made apps and templates created by the Bubble community.
          </p>
          
          {/* Barre de recherche */}
          <div className="search-bar fade-in-up" style="animation-delay: 0.4s;">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for a template"
              className="search-input"
            />
          </div>
          
          {/* Illustration colorée */}
          <div className="mt-12 fade-in-up" style="animation-delay: 0.6s;">
            <div className="flex justify-center space-x-4">
              <div className="w-16 h-16 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
              <div className="w-16 h-16 bg-yellow-500 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
"@

Set-Content -Path "src/components/HeroSection.tsx" -Value $heroComponent

Write-Host "✅ Composant Hero SAAS créé" -ForegroundColor Green

# Créer un composant de filtres SAAS
Write-Host "🎨 Création du composant de filtres SAAS..." -ForegroundColor Yellow

$filtersComponent = @"
'use client';

import { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

export default function FiltersSection() {
  const [priceFilter, setPriceFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('most_installed');

  return (
    <div className="filters-container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Filter className="text-gray-600" size={20} />
          <span className="text-gray-700 font-medium">Filtres:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Filtre de prix */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="all">Free and paid</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </select>

          {/* Filtre de niveau */}
          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="filter-dropdown"
          >
            <option value="all">All experience levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-dropdown"
          >
            <option value="most_installed">Sort by: Most installed</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest rated</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}
"@

Set-Content -Path "src/components/FiltersSection.tsx" -Value $filtersComponent

Write-Host "✅ Composant de filtres SAAS créé" -ForegroundColor Green

# Créer un composant de sidebar SAAS
Write-Host "🎨 Création du composant sidebar SAAS..." -ForegroundColor Yellow

$sidebarComponent = @"
'use client';

import { useState } from 'react';

export default function Sidebar() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'All',
    'Building Blocks',
    'E-commerce',
    'Social Media',
    'Analytics',
    'Authentication',
    'Payment',
    'Communication',
    'File Management',
    'AI & Machine Learning'
  ];

  return (
    <div className="sidebar">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category.toLowerCase())}
            className={`category-tag w-full text-left ${
              selectedCategory === category.toLowerCase() ? 'active' : ''
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
"@

Set-Content -Path "src/components/Sidebar.tsx" -Value $sidebarComponent

Write-Host "✅ Composant sidebar SAAS créé" -ForegroundColor Green

# Créer un composant de carte de template SAAS
Write-Host "🎨 Création du composant de carte de template SAAS..." -ForegroundColor Yellow

$templateCardComponent = @"
'use client';

import { Play, Star, Download } from 'lucide-react';

interface TemplateCardProps {
  title: string;
  description: string;
  category: string;
  price: string;
  rating: number;
  downloads: number;
  videoUrl: string;
}

export default function TemplateCard({
  title,
  description,
  category,
  price,
  rating,
  downloads,
  videoUrl
}: TemplateCardProps) {
  return (
    <div className="template-card">
      {/* Vidéo YouTube embed */}
      <div className="relative aspect-video bg-gray-100">
        <iframe
          src={videoUrl}
          title={title}
          className="w-full h-full rounded-t-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="text-blue-600 ml-1" size={24} />
          </div>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
          <span className="text-lg font-bold text-blue-600">
            {price}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="badge badge-primary">
            {category}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="text-yellow-400" size={16} fill="currentColor" />
            <span className="text-sm text-gray-600">{rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Download size={16} />
            <span>{downloads.toLocaleString()} installs</span>
          </div>
          <button className="btn-primary text-sm px-4 py-2">
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
"@

Set-Content -Path "src/components/TemplateCard.tsx" -Value $templateCardComponent

Write-Host "✅ Composant de carte de template SAAS créé" -ForegroundColor Green

# Mettre à jour la page principale
Write-Host "🎨 Mise à jour de la page principale..." -ForegroundColor Yellow

$newPageContent = @"
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import HeroSection from '../components/HeroSection';
import FiltersSection from '../components/FiltersSection';
import Sidebar from '../components/Sidebar';
import TemplateCard from '../components/TemplateCard';
import { ChevronUp } from 'lucide-react';

export default function Home() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setModules(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Données de démonstration pour les templates
  const demoTemplates = [
    {
      id: 1,
      title: 'Canvas Building Framework',
      description: 'A comprehensive framework for building interactive applications with drag-and-drop functionality and real-time collaboration.',
      category: 'BUILDING BLOCKS',
      price: '€29',
      rating: 4.8,
      downloads: 15420,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 2,
      title: 'E-commerce Starter Kit',
      description: 'Complete e-commerce solution with payment processing, inventory management, and customer analytics.',
      category: 'E-COMMERCE',
      price: '€49',
      rating: 4.9,
      downloads: 8920,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 3,
      title: 'Social Media Dashboard',
      description: 'Real-time social media monitoring and analytics dashboard with multi-platform integration.',
      category: 'ANALYTICS',
      price: '€39',
      rating: 4.7,
      downloads: 12340,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 4,
      title: 'AI Chat Assistant',
      description: 'Intelligent chat assistant powered by machine learning with natural language processing capabilities.',
      category: 'AI & MACHINE LEARNING',
      price: '€59',
      rating: 4.6,
      downloads: 6780,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 5,
      title: 'File Management System',
      description: 'Advanced file management system with cloud storage integration and collaborative editing features.',
      category: 'FILE MANAGEMENT',
      price: '€34',
      rating: 4.5,
      downloads: 9450,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 6,
      title: 'Authentication Hub',
      description: 'Secure authentication system with multi-factor authentication and social login integration.',
      category: 'AUTHENTICATION',
      price: '€24',
      rating: 4.8,
      downloads: 11230,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section Hero */}
      <HeroSection />

      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtres */}
        <FiltersSection />

        {/* Contenu principal */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Sidebar />
          </div>

          {/* Grille de templates */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="template-card animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demoTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    title={template.title}
                    description={template.description}
                    category={template.category}
                    price={template.price}
                    rating={template.rating}
                    downloads={template.downloads}
                    videoUrl={template.videoUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton scroll to top */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}
"@

Set-Content -Path "src/app/page.tsx" -Value $newPageContent

Write-Host "✅ Page principale mise à jour" -ForegroundColor Green

# Mettre à jour le layout pour inclure les nouveaux composants
Write-Host "🎨 Mise à jour du layout..." -ForegroundColor Yellow

$newLayout = @"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bubble - Build with ready-made apps and templates",
  description: "Accès direct à la puissance et aux outils IA. Build with ready-made apps and templates created by the Bubble community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
"@

Set-Content -Path "src/app/layout.tsx" -Value $newLayout

Write-Host "✅ Layout mis à jour" -ForegroundColor Green

Write-Host "`n🎉 Design SAAS mis à jour avec succès !" -ForegroundColor Green
Write-Host "📁 Backup créé dans: $backupDir" -ForegroundColor Cyan
Write-Host "🚀 Pour voir les changements, redémarrez l'application:" -ForegroundColor Yellow
Write-Host "   .\start-production.ps1" -ForegroundColor White
Write-Host "`n✨ Nouvelles fonctionnalités ajoutées:" -ForegroundColor Cyan
Write-Host "   • Header avec logo 'bubble' et navigation SAAS" -ForegroundColor White
Write-Host "   • Section Hero avec titre principal et barre de recherche" -ForegroundColor White
Write-Host "   • Filtres avec dropdowns et tri" -ForegroundColor White
Write-Host "   • Sidebar avec catégories" -ForegroundColor White
Write-Host "   • Cartes de templates avec vidéos YouTube embed" -ForegroundColor White
Write-Host "   • Design moderne avec animations et effets hover" -ForegroundColor White
