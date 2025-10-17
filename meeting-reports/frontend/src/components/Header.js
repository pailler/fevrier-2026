import React from 'react';
import { Mic, Shield, Github } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Mic className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Générateur de Rapports de Réunion
                <span className="text-xl font-normal text-blue-200 ml-2">
                  proposé par IAHome
                </span>
              </h1>
              <p className="text-blue-100 text-lg">
                Générez un résumé du compte rendu de votre dernière réunion
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Vos Données, Votre Contrôle</span>
            </div>
            
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-6 text-sm text-blue-100">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Whisper IA Prêt</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Traitement Local</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Open Source</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;