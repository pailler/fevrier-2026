'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '../../../components/Breadcrumb';
import Header from '../../../components/Header';

interface ModuleImage {
  id: string;
  name: string;
  filename: string;
  category: string;
  icon: string;
  gradient: string;
  description: string;
  htmlFile: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export default function ImageGeneratorsPage() {
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ModuleImage | null>(null);
  const [moduleImages, setModuleImages] = useState<ModuleImage[]>([]);
  const [activeTab, setActiveTab] = useState<'generators' | 'management'>('generators');

  // Formulaire pour créer/modifier une image
  const [formData, setFormData] = useState({
    name: '',
    filename: '',
    category: '',
    icon: '',
    gradient: '',
    description: '',
    htmlFile: ''
  });

  const defaultGenerators = [
    {
      id: 'invoke',
      name: 'Invoke',
      description: 'Générateur d\'image pour le module Invoke',
      filename: 'invoke.jpg',
      category: 'AI TOOLS',
      icon: '🎨',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)',
      htmlFile: '/generators/create-invoke-module-image.html',
      createdAt: new Date().toISOString(),
      status: 'active' as const
    },
    {
      id: 'psitransfer',
      name: 'PSITransfer',
      description: 'Générateur d\'image pour le module PSITransfer',
      filename: 'psitransfer.jpg',
      category: 'BUILDING BLOCKS',
      icon: '📁',
      gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
      htmlFile: '/generators/create-psitransfer-module-image.html',
      createdAt: new Date().toISOString(),
      status: 'active' as const
    },
    {
      id: 'librespeed',
      name: 'Librespeed',
      description: 'Générateur d\'image pour le module Librespeed',
      filename: 'librespeed.jpg',
      category: 'WEB TOOLS',
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 50%, #8B5CF6 100%)',
      htmlFile: '/generators/create-librespeed-module-image.html',
      createdAt: new Date().toISOString(),
      status: 'active' as const
    },
    {
      id: 'metube',
      name: 'MeTube',
      description: 'Générateur d\'image pour le module MeTube',
      filename: 'metube.jpg',
      category: 'WEB TOOLS',
      icon: '📺',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)',
      htmlFile: '/generators/create-metube-module-image.html',
      createdAt: new Date().toISOString(),
      status: 'active' as const
    }
  ];

  useEffect(() => {
    // Charger les images depuis le localStorage ou utiliser les valeurs par défaut
    const savedImages = localStorage.getItem('moduleImages');
    if (savedImages) {
      setModuleImages(JSON.parse(savedImages));
    } else {
      setModuleImages(defaultGenerators);
      localStorage.setItem('moduleImages', JSON.stringify(defaultGenerators));
    }
  }, []);

  const openGenerator = (generatorId: string) => {
    const generator = moduleImages.find(g => g.id === generatorId);
    if (generator) {
      // Vérifier si le fichier HTML existe
      fetch(generator.htmlFile)
        .then(response => {
          if (response.ok) {
            window.open(generator.htmlFile, '_blank');
          } else {
            // Si le fichier n'existe pas, créer le générateur HTML
            alert(`Le fichier générateur n'existe pas encore.\n\nCréation automatique du fichier HTML...`);
            createGeneratorHTML(generator);
          }
        })
        .catch(() => {
          // En cas d'erreur, créer le générateur HTML
          alert(`Le fichier générateur n'existe pas encore.\n\nCréation automatique du fichier HTML...`);
          createGeneratorHTML(generator);
        });
    }
  };

  const handleCreateImage = () => {
    const newImage: ModuleImage = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    // Créer automatiquement le fichier HTML du générateur
    createGeneratorHTML(newImage);

    const updatedImages = [...moduleImages, newImage];
    setModuleImages(updatedImages);
    localStorage.setItem('moduleImages', JSON.stringify(updatedImages));
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditImage = () => {
    if (!selectedImage) return;

    const updatedImages = moduleImages.map(img => 
      img.id === selectedImage.id ? { ...img, ...formData } : img
    );
    setModuleImages(updatedImages);
    localStorage.setItem('moduleImages', JSON.stringify(updatedImages));
    setShowEditModal(false);
    setSelectedImage(null);
    resetForm();
  };

  const handleDeleteImage = (imageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      const updatedImages = moduleImages.filter(img => img.id !== imageId);
      setModuleImages(updatedImages);
      localStorage.setItem('moduleImages', JSON.stringify(updatedImages));
    }
  };

  const handleEdit = (image: ModuleImage) => {
    setSelectedImage(image);
    setFormData({
      name: image.name,
      filename: image.filename,
      category: image.category,
      icon: image.icon,
      gradient: image.gradient,
      description: image.description,
      htmlFile: image.htmlFile
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      filename: '',
      category: '',
      icon: '',
      gradient: '',
      description: '',
      htmlFile: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const createGeneratorHTML = (image: ModuleImage) => {
    // Créer le contenu HTML du générateur
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Générateur d'image ${image.name} - Format Module</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f0f8ff;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .module-image {
            width: 400px;
            height: 300px;
            background: ${image.gradient};
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
            margin: 20px auto;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
        }
        .module-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 16px;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
            z-index: 1;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 1;
        }
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            z-index: 1;
        }
        .badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(34, 197, 94, 0.9);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            backdrop-filter: blur(10px);
            z-index: 2;
        }
        .download-btn {
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
            transition: all 0.3s ease;
        }
        .download-btn:hover {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }
        .preview {
            display: flex;
            gap: 20px;
            margin: 20px 0;
            justify-content: center;
            flex-wrap: wrap;
        }
        .preview-item {
            text-align: center;
        }
        .preview-item h3 {
            margin-bottom: 10px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Générateur d'image ${image.name} - Format Module</h1>
        <p>Cette image est conçue pour correspondre exactement au format des cartes de modules (400x300px).</p>
        
        <div class="preview">
            <div class="preview-item">
                <h3>Format Module (400x300px)</h3>
                <div class="module-image" id="${image.name.toLowerCase()}ModuleImage">
                    <div class="badge">${image.category}</div>
                    <div class="icon">${image.icon}</div>
                    <div class="title">${image.name}</div>
                    <div class="subtitle">${image.description}</div>
                </div>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button class="download-btn" onclick="downloadModuleImage()">Télécharger l'image module</button>
            <button class="download-btn" onclick="downloadHighRes()">Télécharger haute résolution</button>
        </div>
        
        <div style="margin-top: 20px;">
            <h3>Instructions :</h3>
            <ol>
                <li>Cliquez sur "Télécharger l'image module" pour l'image au format exact</li>
                <li>Renommez l'image en "${image.filename}"</li>
                <li>Remplacez l'ancienne image dans "public/images/"</li>
                <li>L'image s'adaptera parfaitement au format des cartes de modules</li>
            </ol>
            
            <h3>Caractéristiques :</h3>
            <ul>
                <li><strong>Format :</strong> 400x300px (format exact des modules)</li>
                <li><strong>Design :</strong> Gradient personnalisé</li>
                <li><strong>Icône :</strong> ${image.icon}</li>
                <li><strong>Badge :</strong> "${image.category}" en haut à gauche</li>
                <li><strong>Fond :</strong> Coloré (pas de fond noir/transparent)</li>
            </ul>
        </div>
    </div>

    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <script>
        function downloadModuleImage() {
            html2canvas(document.getElementById('${image.name.toLowerCase()}ModuleImage'), {
                width: 400,
                height: 300,
                scale: 1,
                backgroundColor: null
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = '${image.filename}';
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
            });
        }
        
        function downloadHighRes() {
            html2canvas(document.getElementById('${image.name.toLowerCase()}ModuleImage'), {
                width: 400,
                height: 300,
                scale: 2,
                backgroundColor: null
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = '${image.filename.replace('.jpg', '-hd.jpg')}';
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
            });
        }
    </script>
</body>
</html>`;

    // Créer un blob avec le contenu HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement et le déclencher
    const link = document.createElement('a');
    link.href = url;
    link.download = `create-${image.name.toLowerCase()}-module-image.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Afficher une notification
    alert(`Fichier HTML généré : create-${image.name.toLowerCase()}-module-image.html\n\nVeuillez :\n1. Télécharger ce fichier\n2. Le placer dans le dossier "public/generators/"\n3. Puis cliquer sur "Ouvrir le générateur"`);
  };

  const predefinedGradients = [
    { name: 'Violet-Rose-Orange', value: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)' },
    { name: 'Bleu-Violet-Rose', value: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)' },
    { name: 'Vert-Bleu-Violet', value: 'linear-gradient(135deg, #10B981 0%, #3B82F6 50%, #8B5CF6 100%)' },
    { name: 'Rouge-Orange-Vert', value: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)' },
    { name: 'Bleu-Vert', value: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)' },
    { name: 'Rose-Violet', value: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }
  ];

  const predefinedIcons = ['🎨', '📁', '⚡', '📺', '🔧', '💻', '📱', '🌐', '🎯', '🚀', '💡', '⚙️'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Générateurs d\'images', href: '/admin/image-generators' }
          ]} 
        />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des images de modules</h1>
              <p className="text-gray-600 mt-1">Créez et gérez des images personnalisées pour vos modules</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={openCreateModal}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                + Nouvelle image
              </button>
              <Link
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Retour à l'admin
              </Link>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('generators')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'generators'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🎨 Générateurs
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ Gestion
            </button>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'generators' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moduleImages.map((generator) => (
                <div key={generator.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ background: generator.gradient }}
                      >
                        {generator.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{generator.name}</h3>
                        <span className="text-sm text-gray-500">{generator.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{generator.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Fichier:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{generator.filename}</code>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Format:</span>
                      <span>400x300px</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Statut:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        generator.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {generator.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openGenerator(generator.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Ouvrir le générateur
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'management' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fichier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {moduleImages.map((image) => (
                        <tr key={image.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                              style={{ background: image.gradient }}
                            >
                              {image.icon}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{image.name}</div>
                            <div className="text-sm text-gray-500">{image.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {image.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {image.filename}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              image.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {image.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(image)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => openGenerator(image.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Générer
                              </button>
                              <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions d'utilisation</h3>
            <ol className="text-blue-800 text-sm space-y-1">
              <li>1. Utilisez l'onglet "Gestion" pour créer, modifier ou supprimer des images</li>
              <li>2. Cliquez sur "Ouvrir le générateur" pour créer l'image</li>
              <li>3. Dans le générateur, cliquez sur "Télécharger l'image module"</li>
              <li>4. Renommez l'image téléchargée selon le nom indiqué</li>
              <li>5. Placez l'image dans le dossier <code className="bg-blue-100 px-1 rounded">public/images/</code></li>
              <li>6. L'image sera automatiquement utilisée par le module correspondant</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Créer une nouvelle image</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du module</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: MonModule"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fichier</label>
                  <input
                    type="text"
                    value={formData.filename}
                    onChange={(e) => setFormData({...formData, filename: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: monmodule.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="AI TOOLS">AI TOOLS</option>
                    <option value="WEB TOOLS">WEB TOOLS</option>
                    <option value="BUILDING BLOCKS">BUILDING BLOCKS</option>
                    <option value="UTILITIES">UTILITIES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    {predefinedIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({...formData, icon})}
                        className={`p-2 text-xl rounded border ${
                          formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: 🎨"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gradient</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {predefinedGradients.map((gradient) => (
                      <button
                        key={gradient.value}
                        type="button"
                        onClick={() => setFormData({...formData, gradient: gradient.value})}
                        className={`p-2 text-xs rounded border ${
                          formData.gradient === gradient.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                      >
                        {gradient.name}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.gradient}
                    onChange={(e) => setFormData({...formData, gradient: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Description du module..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fichier HTML du générateur</label>
                  <input
                    type="text"
                    value={formData.htmlFile}
                    onChange={(e) => setFormData({...formData, htmlFile: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: /generators/create-monmodule-image.html"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Créer l'image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Modifier l'image</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du module</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fichier</label>
                  <input
                    type="text"
                    value={formData.filename}
                    onChange={(e) => setFormData({...formData, filename: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AI TOOLS">AI TOOLS</option>
                    <option value="WEB TOOLS">WEB TOOLS</option>
                    <option value="BUILDING BLOCKS">BUILDING BLOCKS</option>
                    <option value="UTILITIES">UTILITIES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    {predefinedIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({...formData, icon})}
                        className={`p-2 text-xl rounded border ${
                          formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gradient</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {predefinedGradients.map((gradient) => (
                      <button
                        key={gradient.value}
                        type="button"
                        onClick={() => setFormData({...formData, gradient: gradient.value})}
                        className={`p-2 text-xs rounded border ${
                          formData.gradient === gradient.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                      >
                        {gradient.name}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.gradient}
                    onChange={(e) => setFormData({...formData, gradient: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fichier HTML du générateur</label>
                  <input
                    type="text"
                    value={formData.htmlFile}
                    onChange={(e) => setFormData({...formData, htmlFile: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
