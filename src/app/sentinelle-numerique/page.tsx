'use client';

import { useState } from 'react';
import Link from 'next/link';

type ProcedureSection = 'audit' | 'transmission' | 'post-event' | null;

export default function SentinelleNumeriqueAppPage() {
  const [expandedSection, setExpandedSection] = useState<ProcedureSection>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-4xl mb-6 shadow-lg">
            🛡️
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Sentinelle Numérique
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-2">
            Cybersécurité personnelle et processus de fin de vie numérique
          </p>
          <p className="text-gray-600 max-w-xl mx-auto">
            Audit sécurité, plan de transmission et actions post-événement. Idéal pour sécuriser votre patrimoine numérique et organiser sa transmission.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
            <span>10 crédits</span>
            <span className="text-gray-400">•</span>
            <span>par accès</span>
          </div>
        </header>

        {/* Fonctionnalités principales */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Que puis-je faire avec Sentinelle Numérique ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => setExpandedSection(expandedSection === 'audit' ? null : 'audit')}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <span className="text-4xl mb-4 block">🛡️</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-700">Audit sécurité</h3>
              <p className="text-gray-600 text-sm">
                Évaluez et renforcez votre cybersécurité personnelle
              </p>
            </button>
            <button
              onClick={() => setExpandedSection(expandedSection === 'transmission' ? null : 'transmission')}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <span className="text-4xl mb-4 block">📋</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-700">Plan de transmission</h3>
              <p className="text-gray-600 text-sm">
                Organisez la transmission de votre patrimoine numérique
              </p>
            </button>
            <button
              onClick={() => setExpandedSection(expandedSection === 'post-event' ? null : 'post-event')}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <span className="text-4xl mb-4 block">⚡</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-700">Actions post-événement</h3>
              <p className="text-gray-600 text-sm">
                Procédures et accompagnement pour vos proches
              </p>
            </button>
          </div>
        </section>

        {/* Procédures détaillées (accordéon) */}
        <section className="space-y-6 mb-16">
          {expandedSection === 'audit' && (
            <article className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-teal-500 transition-all duration-300">
              <h3 className="text-2xl font-bold text-teal-800 mb-6 flex items-center gap-2">
                🛡️ Audit de sécurité personnelle
              </h3>
              <p className="text-gray-600 mb-6">
                Évaluez les points forts et les faiblesses de votre posture numérique pour mieux protéger vos comptes, données et appareils.
              </p>
              <h4 className="font-semibold text-gray-800 mb-3">Procédures à suivre</h4>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Inventaire des comptes</strong> — Listez vos comptes en ligne (réseaux sociaux, banques, e-commerce, messageries).</li>
                <li><strong>Analyse des mots de passe</strong> — Vérifiez que vous utilisez des mots de passe uniques et forts, idéalement avec un gestionnaire.</li>
                <li><strong>Authentification à deux facteurs</strong> — Activez la 2FA partout où c&apos;est possible.</li>
                <li><strong>Audit des appareils</strong> — Mises à jour, antivirus, sauvegardes sur tous vos appareils.</li>
                <li><strong>Protection des données sensibles</strong> — Documents d&apos;identité, contrats, informations familiales : où sont-ils stockés et sont-ils sécurisés ?</li>
              </ol>
              <button
                onClick={() => setExpandedSection(null)}
                className="mt-6 text-teal-600 hover:text-teal-800 font-medium text-sm"
              >
                ↑ Réduire
              </button>
            </article>
          )}

          {expandedSection === 'transmission' && (
            <article className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-cyan-500 transition-all duration-300">
              <h3 className="text-2xl font-bold text-cyan-800 mb-6 flex items-center gap-2">
                📋 Plan de transmission numérique
              </h3>
              <p className="text-gray-600 mb-6">
                Documentez ce que vous possédez en ligne pour que vos proches puissent accéder, récupérer ou fermer vos comptes et données.
              </p>
              <h4 className="font-semibold text-gray-800 mb-3">Procédures à suivre</h4>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Répertoire des accès</strong> — Créez une liste (stockée en lieu sûr) des services avec vos identifiants ou instructions d&apos;accès.</li>
                <li><strong>Données importantes</strong> — Photos, documents administratifs, correspondances : où les retrouver et comment les récupérer.</li>
                <li><strong>Souhaits spécifiques</strong> — Que faire de votre compte Facebook, messageries, blogs, etc. (suppression, archivage, message posthume).</li>
                <li><strong>Mandataire désigné</strong> — Indiquez une personne de confiance pour exécuter ces instructions.</li>
                <li><strong>Révision régulière</strong> — Mettez à jour ce plan au moins une fois par an ou lors de changements importants.</li>
              </ol>
              <button
                onClick={() => setExpandedSection(null)}
                className="mt-6 text-cyan-600 hover:text-cyan-800 font-medium text-sm"
              >
                ↑ Réduire
              </button>
            </article>
          )}

          {expandedSection === 'post-event' && (
            <article className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-amber-500 transition-all duration-300">
              <h3 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
                ⚡ Actions post-événement
              </h3>
              <p className="text-gray-600 mb-6">
                Guidez vos proches dans les démarches à effectuer après un décès ou une incapacité : fermeture de comptes, récupération de données, communication.
              </p>
              <h4 className="font-semibold text-gray-800 mb-3">Procédures à suivre</h4>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li><strong>Consultation du plan</strong> — Ouvrir le document de transmission (coffre-fort, notaire, enveloppe scellée) selon les instructions laissées.</li>
                <li><strong>Identité numérique</strong> — Informer ou désactiver les réseaux sociaux (Facebook Mémorialisation, LinkedIn, etc.).</li>
                <li><strong>Fermeture des comptes</strong> — Suivre les procédures de chaque service (banque en ligne, e-commerce, abonnements).</li>
                <li><strong>Récupération des données</strong> — Sauvegarder photos, courriels, documents avant suppression des comptes.</li>
                <li><strong>Accompagnement</strong> — Sentinelle Numérique vous accompagne pas à pas dans ces démarches sensibles.</li>
              </ol>
              <button
                onClick={() => setExpandedSection(null)}
                className="mt-6 text-amber-600 hover:text-amber-800 font-medium text-sm"
              >
                ↑ Réduire
              </button>
            </article>
          )}
        </section>

        {/* Accompagnement personnalisé */}
        <section className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-teal-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🤝</span> Accompagnement personnalisé
          </h3>
          <p className="text-gray-700 mb-4">
            Chaque situation est unique. Sentinelle Numérique propose un accompagnement adapté à votre contexte : nombre de comptes, données sensibles, situation familiale.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              Bilan initial pour évaluer votre patrimoine numérique
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              Rédaction assistée de votre plan de transmission
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              Conseils pour vos proches en cas d&apos;événement
            </li>
          </ul>
        </section>

        {/* Liens utiles */}
        <section className="mb-16">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>🔗</span> Liens utiles
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-teal-100">
              <h4 className="font-semibold text-teal-800 mb-3">Réseaux sociaux — comptes décédés</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.facebook.com/help/contact/651319028315841" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    Facebook — Mémorialisation ou suppression du compte
                  </a>
                </li>
                <li>
                  <a href="https://help.instagram.com/264154560391256" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    Instagram — Signaler un compte de personne décédée
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/help/linkedin/answer/a1336663" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    LinkedIn — Compte de commémoration ou fermeture
                  </a>
                </li>
                <li>
                  <a href="https://support.google.com/accounts/troubleshooter/6357590" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    Google — Récupération des données d&apos;un compte décédé
                  </a>
                </li>
                <li>
                  <a href="https://support.google.com/accounts/answer/3036546" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    Google — Gestionnaire de compte inactif (prévention)
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/fr-fr/102431" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    Apple — Accès au compte d&apos;un proche décédé
                  </a>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-teal-100">
              <h4 className="font-semibold text-teal-800 mb-3">Sécurité et bonnes pratiques</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://bitwarden.com/fr-fr/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    Bitwarden — Gestionnaire de mots de passe (gratuit, open source)
                  </a>
                </li>
                <li>
                  <a href="https://www.cnil.fr/fr/definition/authentification-deux-facteurs-2fa" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    CNIL — Authentification à deux facteurs (2FA)
                  </a>
                </li>
                <li>
                  <a href="https://www.cybermalveillance.gouv.fr/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    Cybermalveillance.gouv.fr — Signalement et prévention
                  </a>
                </li>
                <li>
                  <a href="https://www.service-public.fr/particuliers/vosdroits/F33566" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 hover:underline">
                    Service-public — Héritage numérique
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ rapide */}
        <section className="mb-16">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Questions fréquentes</h3>
          <div className="space-y-4">
            <details className="bg-white rounded-xl p-4 shadow-md group">
              <summary className="font-medium text-gray-800 cursor-pointer list-none flex items-center justify-between">
                Par où commencer ?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                Commencez par l&apos;<strong>audit de sécurité</strong> : il vous donne une vue d&apos;ensemble de votre situation. Ensuite, rédigez votre <strong>plan de transmission</strong>. Les actions post-événement concernent surtout vos proches.
              </p>
            </details>
            <details className="bg-white rounded-xl p-4 shadow-md group">
              <summary className="font-medium text-gray-800 cursor-pointer list-none flex items-center justify-between">
                Où stocker mon plan de transmission ?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                Dans un lieu sûr connu de votre mandataire : coffre-fort, notaire, enveloppe scellée. Ne le stockez pas uniquement en ligne ou sur un seul appareil. Une copie papier peut être utile.
              </p>
            </details>
            <details className="bg-white rounded-xl p-4 shadow-md group">
              <summary className="font-medium text-gray-800 cursor-pointer list-none flex items-center justify-between">
                Combien coûte un accès ?
                <span className="text-teal-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                Chaque accès à Sentinelle Numérique consomme <strong>10 crédits</strong>. Consultez votre solde de crédits sur votre espace utilisateur.
              </p>
            </details>
          </div>
        </section>

        {/* Navigation */}
        <footer className="flex flex-wrap gap-4 justify-center pt-8 border-t border-gray-200">
          <Link
            href="/card/sentinelle-numerique"
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-cyan-700 shadow-lg transition-all"
          >
            Retour à la page Sentinelle Numérique
          </Link>
          <Link
            href="/applications"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Voir toutes les applications
          </Link>
        </footer>
      </div>
    </div>
  );
}
