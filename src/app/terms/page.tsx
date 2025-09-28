'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Breadcrumb from '../../components/Breadcrumb';
import Link from 'next/link';

export default function TermsPage() {
  const [lastUpdated] = useState('24 août 2025');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Fil d'ariane avec espacement correct */}
      <div className="pt-20">
        <Breadcrumb />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">📋</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conditions d'utilisation
          </h1>
          <p className="text-lg text-gray-600">
            Dernière mise à jour : {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Introduction
          </h2>
          <p className="text-gray-700 mb-4">
            Les présentes conditions d'utilisation régissent l'utilisation de la plateforme IAhome 
            accessible à l'adresse <strong>https://iahome.fr</strong>. En utilisant nos services, 
            vous acceptez d'être lié par ces conditions.
          </p>
          <p className="text-gray-700">
            IAhome est une plateforme spécialisée dans l'accès aux outils d'intelligence artificielle 
            et la formation aux technologies IA, proposant des services gratuits et payants.
          </p>
        </div>

        {/* Définitions */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Définitions
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <strong>Plateforme IAhome :</strong> Le site web et les services proposés par IAhome, 
              incluant l'accès aux applications IA et les formations.
            </div>
            <div>
              <strong>Utilisateur :</strong> Toute personne utilisant la plateforme IAhome, 
              qu'elle soit inscrite ou non.
            </div>
            <div>
              <strong>Compte utilisateur :</strong> L'espace personnel créé par l'utilisateur 
              pour accéder aux services payants et personnalisés.
            </div>
            <div>
              <strong>Applications IA :</strong> Les outils et services d'intelligence artificielle 
              proposés sur la plateforme.
            </div>
            <div>
              <strong>Formations :</strong> Les contenus éducatifs et tutoriels proposés 
              pour apprendre à utiliser les technologies IA.
            </div>
          </div>
        </div>

        {/* Services proposés */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Services proposés
          </h2>
          
          <div className="space-y-6">
            {/* Accès gratuits */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                🆓 Accès gratuits
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Consultation des informations générales sur les applications IA</li>
                <li>• Accès aux articles de blog et ressources éducatives</li>
                <li>• Consultation des formations disponibles</li>
                <li>• Création d'un compte utilisateur</li>
                <li>• Accès limité à certaines fonctionnalités de démonstration</li>
                <li>• Support communautaire via les forums et discussions</li>
              </ul>
            </div>

            {/* Accès payants */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                💳 Accès payants et privilégiés
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Accès privilégiés aux serveurs IA
                  </h4>
                  <p className="text-gray-700 mb-3">
                    L'utilisateur dispose d'accès privilégiés lui permettant de disposer de la puissance 
                    des serveurs IAHome pour exécuter des tâches d'intelligence artificielle avancées.
                  </p>
                  <ul className="space-y-1 text-gray-700 ml-4">
                    <li>• Accès aux modèles IA haute performance</li>
                    <li>• Traitement de données en temps réel</li>
                    <li>• Génération d'images, de textes et de contenus</li>
                    <li>• Utilisation des API spécialisées</li>
                    <li>• Support technique prioritaire</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Formations spécialisées
                  </h4>
                  <p className="text-gray-700 mb-3">
                    L'utilisateur peut bénéficier de formations liées aux applications présentées 
                    et proposées sur la plateforme.
                  </p>
                  <ul className="space-y-1 text-gray-700 ml-4">
                    <li>• Cours complets sur les technologies IA</li>
                    <li>• Tutoriels pratiques et cas d'usage</li>
                    <li>• Accès aux ressources premium</li>
                    <li>• Certifications et attestations</li>
                    <li>• Accompagnement personnalisé</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Services premium
                  </h4>
                  <ul className="space-y-1 text-gray-700 ml-4">
                    <li>• Accès illimité aux applications IA</li>
                    <li>• Stockage cloud pour les projets</li>
                    <li>• Collaboration en équipe</li>
                    <li>• Statistiques d'utilisation détaillées</li>
                    <li>• Intégrations avec d'autres outils</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditions d'utilisation */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Conditions d'utilisation générales
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Acceptation des conditions
              </h3>
              <p className="text-gray-700">
                En utilisant la plateforme IAhome, vous confirmez avoir lu, compris et accepté 
                les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, 
                veuillez ne pas utiliser nos services.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Âge minimum
              </h3>
              <p className="text-gray-700">
                Vous devez avoir au moins 13 ans pour utiliser nos services. Si vous avez moins de 18 ans, 
                vous devez avoir l'autorisation de vos parents ou tuteurs légaux.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Compte utilisateur
              </h3>
              <p className="text-gray-700 mb-3">
                Pour accéder aux services payants, vous devez créer un compte utilisateur en fournissant 
                des informations exactes et à jour.
              </p>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>• Vous êtes responsable de la confidentialité de vos identifiants</li>
                <li>• Vous ne devez pas partager votre compte avec d'autres personnes</li>
                <li>• Vous devez nous informer immédiatement de toute utilisation non autorisée</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Utilisation acceptable
              </h3>
              <p className="text-gray-700 mb-3">
                Vous vous engagez à utiliser nos services de manière légale et éthique.
              </p>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>• Respecter les droits de propriété intellectuelle</li>
                <li>• Ne pas utiliser les services à des fins malveillantes</li>
                <li>• Ne pas tenter de contourner les mesures de sécurité</li>
                <li>• Respecter les autres utilisateurs et la communauté</li>
                <li>• Ne pas générer de contenu illégal, offensant ou inapproprié</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Paiements et abonnements */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Paiements et abonnements
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Tarification
              </h3>
              <p className="text-gray-700 mb-3">
                Les prix de nos services sont affichés en euros (€) et incluent toutes les taxes applicables. 
                Nous nous réservons le droit de modifier nos tarifs en vous informant au préalable.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Paiement
              </h3>
              <p className="text-gray-700 mb-3">
                Les paiements sont traités de manière sécurisée via notre partenaire Stripe. 
                Nous acceptons les cartes de crédit et de débit principales.
              </p>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>• Les paiements sont prélevés automatiquement selon votre abonnement</li>
                <li>• Vous pouvez annuler votre abonnement à tout moment</li>
                <li>• Aucun remboursement n'est effectué pour les périodes déjà payées</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Remboursements
              </h3>
              <p className="text-gray-700">
                En cas de problème technique de notre part, nous nous engageons à résoudre le problème 
                ou à vous rembourser. Les demandes de remboursement doivent être formulées dans les 14 jours 
                suivant l'achat.
              </p>
            </div>
          </div>
        </div>

        {/* Propriété intellectuelle */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Propriété intellectuelle
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              La plateforme IAhome, son contenu, ses logos, ses designs et ses technologies 
              sont protégés par les droits de propriété intellectuelle d'IAhome.
            </p>
            <p>
              Les contenus générés par les utilisateurs via nos outils IA appartiennent à l'utilisateur, 
              sous réserve du respect des conditions d'utilisation.
            </p>
            <p>
              Vous vous engagez à ne pas reproduire, distribuer ou modifier nos contenus 
              sans autorisation écrite.
            </p>
          </div>
        </div>

        {/* Limitation de responsabilité */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Limitation de responsabilité
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              IAhome s'efforce de fournir des services de qualité, mais ne peut garantir 
              une disponibilité continue ou l'absence d'erreurs.
            </p>
            <p>
              Nous ne sommes pas responsables des contenus générés par les utilisateurs 
              via nos outils IA, ni de leur utilisation.
            </p>
            <p>
              Dans toute la mesure permise par la loi, notre responsabilité est limitée 
              au montant payé pour les services concernés.
            </p>
          </div>
        </div>

        {/* Protection des données */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Protection des données
          </h2>
          <p className="text-gray-700 mb-4">
            La collecte et le traitement de vos données personnelles sont régis par notre 
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline ml-1">
              politique de confidentialité
            </Link>.
          </p>
          <p className="text-gray-700">
            Nous nous engageons à protéger vos données et à respecter le Règlement Général 
            sur la Protection des Données (RGPD).
          </p>
        </div>

        {/* Résiliation */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Résiliation
          </h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              Vous pouvez résilier votre compte à tout moment en nous contactant ou via 
              les paramètres de votre compte.
            </p>
            <p>
              Nous nous réservons le droit de suspendre ou résilier votre compte en cas 
              de violation des présentes conditions.
            </p>
            <p>
              En cas de résiliation, vous perdrez l'accès à vos données et aux services payants, 
              sauf disposition contraire prévue par la loi.
            </p>
          </div>
        </div>

        {/* Modifications */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Modifications des conditions
          </h2>
          <p className="text-gray-700 mb-4">
            Nous pouvons modifier ces conditions d'utilisation de temps à autre. 
            Les modifications importantes seront notifiées par e-mail ou via la plateforme.
          </p>
          <p className="text-gray-700">
            Votre utilisation continue de nos services après modification des conditions 
            constitue votre acceptation des nouvelles conditions.
          </p>
        </div>

        {/* Droit applicable */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Droit applicable et juridiction
          </h2>
          <p className="text-gray-700 mb-4">
            Les présentes conditions sont régies par le droit français. 
            Tout litige sera soumis à la compétence des tribunaux français.
          </p>
          <p className="text-gray-700">
            En cas de litige, nous nous engageons à rechercher une solution amiable 
            avant toute action en justice.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Nous contacter
          </h2>
          <p className="text-gray-700 mb-4">
            Pour toute question concernant ces conditions d'utilisation, 
            n'hésitez pas à nous contacter via notre page dédiée.
          </p>
          <div className="text-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Accéder à la page contact
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
