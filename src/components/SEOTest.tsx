'use client';
import { useEffect, useState } from 'react';

interface SEOTestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
}

export default function SEOTest() {
  const [results, setResults] = useState<SEOTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSEOTests = () => {
    setIsRunning(true);
    const testResults: SEOTestResult[] = [];

    // Test 1: Vérifier la présence du titre
    const title = document.querySelector('title')?.textContent;
    if (title) {
      if (title.length >= 30 && title.length <= 60) {
        testResults.push({
          test: 'Titre de la page',
          status: 'pass',
          message: `Titre présent et de bonne longueur (${title.length} caractères)`
        });
      } else {
        testResults.push({
          test: 'Titre de la page',
          status: 'warning',
          message: `Titre de longueur non optimale (${title.length} caractères)`,
          suggestion: 'Recommandé: 30-60 caractères'
        });
      }
    } else {
      testResults.push({
        test: 'Titre de la page',
        status: 'fail',
        message: 'Aucun titre trouvé',
        suggestion: 'Ajouter une balise <title>'
      });
    }

    // Test 2: Vérifier la meta description
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    if (description) {
      if (description.length >= 120 && description.length <= 160) {
        testResults.push({
          test: 'Meta description',
          status: 'pass',
          message: `Description présente et de bonne longueur (${description.length} caractères)`
        });
      } else {
        testResults.push({
          test: 'Meta description',
          status: 'warning',
          message: `Description de longueur non optimale (${description.length} caractères)`,
          suggestion: 'Recommandé: 120-160 caractères'
        });
      }
    } else {
      testResults.push({
        test: 'Meta description',
        status: 'fail',
        message: 'Aucune meta description trouvée',
        suggestion: 'Ajouter une balise <meta name="description">'
      });
    }

    // Test 3: Vérifier les balises h1
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length === 1) {
      testResults.push({
        test: 'Balise H1',
        status: 'pass',
        message: 'Une seule balise H1 trouvée'
      });
    } else if (h1Elements.length === 0) {
      testResults.push({
        test: 'Balise H1',
        status: 'fail',
        message: 'Aucune balise H1 trouvée',
        suggestion: 'Ajouter une balise H1 principale'
      });
    } else {
      testResults.push({
        test: 'Balise H1',
        status: 'warning',
        message: `${h1Elements.length} balises H1 trouvées`,
        suggestion: 'Recommandé: une seule balise H1 par page'
      });
    }

    // Test 4: Vérifier les images alt
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    images.forEach(img => {
      if (!img.alt || img.alt.trim() === '') {
        imagesWithoutAlt++;
      }
    });

    if (imagesWithoutAlt === 0) {
      testResults.push({
        test: 'Attributs alt des images',
        status: 'pass',
        message: 'Toutes les images ont un attribut alt'
      });
    } else {
      testResults.push({
        test: 'Attributs alt des images',
        status: 'warning',
        message: `${imagesWithoutAlt} images sans attribut alt`,
        suggestion: 'Ajouter des attributs alt descriptifs'
      });
    }

    // Test 5: Vérifier les données structurées
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    if (structuredData.length > 0) {
      testResults.push({
        test: 'Données structurées',
        status: 'pass',
        message: `${structuredData.length} script(s) de données structurées trouvé(s)`
      });
    } else {
      testResults.push({
        test: 'Données structurées',
        status: 'warning',
        message: 'Aucune donnée structurée trouvée',
        suggestion: 'Ajouter des données structurées JSON-LD'
      });
    }

    // Test 6: Vérifier les liens internes
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="https://iahome.fr"]');
    if (internalLinks.length > 0) {
      testResults.push({
        test: 'Liens internes',
        status: 'pass',
        message: `${internalLinks.length} lien(s) interne(s) trouvé(s)`
      });
    } else {
      testResults.push({
        test: 'Liens internes',
        status: 'warning',
        message: 'Aucun lien interne trouvé',
        suggestion: 'Ajouter des liens vers d\'autres pages du site'
      });
    }

    // Test 7: Vérifier la présence du viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      testResults.push({
        test: 'Meta viewport',
        status: 'pass',
        message: 'Meta viewport présent'
      });
    } else {
      testResults.push({
        test: 'Meta viewport',
        status: 'fail',
        message: 'Meta viewport manquant',
        suggestion: 'Ajouter <meta name="viewport" content="width=device-width, initial-scale=1">'
      });
    }

    // Test 8: Vérifier les balises Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (ogTitle && ogDescription && ogImage) {
      testResults.push({
        test: 'Balises Open Graph',
        status: 'pass',
        message: 'Balises Open Graph complètes'
      });
    } else {
      testResults.push({
        test: 'Balises Open Graph',
        status: 'warning',
        message: 'Balises Open Graph incomplètes',
        suggestion: 'Ajouter og:title, og:description et og:image'
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50';
      case 'fail':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Test SEO de la page</h2>
          <button
            onClick={runSEOTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isRunning ? 'Test en cours...' : 'Lancer le test'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.status === 'pass' ? 'border-green-500' :
                  result.status === 'fail' ? 'border-red-500' :
                  'border-yellow-500'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{getStatusIcon(result.status)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{result.test}</h3>
                    <p className="text-gray-600 mt-1">{result.message}</p>
                    {result.suggestion && (
                      <p className="text-sm text-blue-600 mt-2 font-medium">
                        💡 {result.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Résumé</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.status === 'pass').length}
                  </div>
                  <div className="text-gray-600">Tests réussis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-gray-600">Avertissements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => r.status === 'fail').length}
                  </div>
                  <div className="text-gray-600">Échecs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8">
            <p className="text-gray-600">Cliquez sur "Lancer le test" pour analyser la page actuelle</p>
          </div>
        )}
      </div>
    </div>
  );
}



