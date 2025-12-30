'use client';

import { AccessibilitySettings as AccessibilitySettingsType } from '../../utils/apprendre-autrement/accessibility';

interface AccessibilitySettingsProps {
  settings: AccessibilitySettingsType;
  onChange: (settings: AccessibilitySettingsType) => void;
  onClose: () => void;
}

export default function AccessibilitySettings({ settings, onChange, onClose }: AccessibilitySettingsProps) {
  const updateSetting = (key: keyof AccessibilitySettingsType, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Paramètres d'accessibilité</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold mb-2">Taille du texte</label>
          <div className="flex gap-2">
            {['small', 'medium', 'large', 'extra-large'].map((size) => (
              <button
                key={size}
                onClick={() => updateSetting('fontSize', size)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  settings.fontSize === size
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {size === 'small' && 'A'}
                {size === 'medium' && 'A'}
                {size === 'large' && 'A'}
                {size === 'extra-large' && 'A'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold mb-2">Style de police</label>
          <select
            value={settings.fontFamily}
            onChange={(e) => updateSetting('fontFamily', e.target.value as any)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="sans-serif">Standard</option>
            <option value="dyslexic">Dyslexique (Comic Sans)</option>
            <option value="mono">Monospace</option>
          </select>
        </div>

        <div>
          <label className="block text-lg font-semibold mb-2">Couleurs</label>
          <div className="grid grid-cols-3 gap-2">
            {['default', 'pastel', 'dark'].map((scheme) => (
              <button
                key={scheme}
                onClick={() => updateSetting('colorScheme', scheme as any)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  settings.colorScheme === scheme
                    ? 'ring-4 ring-blue-500'
                    : ''
                } ${
                  scheme === 'default' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' :
                  scheme === 'pastel' ? 'bg-gradient-to-r from-pink-300 to-purple-300 text-gray-800' :
                  'bg-gray-800 text-white'
                }`}
              >
                {scheme === 'default' && '🌈 Standard'}
                {scheme === 'pastel' && '🌸 Pastel'}
                {scheme === 'dark' && '🌙 Sombre'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSetting('highContrast', e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <span className="text-lg">Contraste élevé</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <span className="text-lg">Sons activés</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <span className="text-lg">Animations activées</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <span className="text-lg">Réduire les animations (mouvement réduit)</span>
          </label>
        </div>

        {settings.soundEnabled && (
          <>
            <div>
              <label className="block text-sm mb-2">Volume des messages vocaux</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.voiceVolume || 1}
                onChange={(e) => updateSetting('voiceVolume', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Vitesse de parole</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.voiceRate || 0.9}
                onChange={(e) => updateSetting('voiceRate', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}







