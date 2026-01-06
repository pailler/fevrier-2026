'use client';

import { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb';

export default function PrivacyPage() {
  const [lastUpdated] = useState('23 août 2025');

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Fil d'ariane avec espacement correct */}
      <div className="pt-20">
        <Breadcrumb />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
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
            Chez IAhome, nous nous engageons à protéger votre vie privée et vos données personnelles. 
            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons 
            vos informations lorsque vous utilisez nos services de formations en intelligence artificielle 
            et d'applications numériques.
          </p>
          <p className="text-gray-700">
            En utilisant nos services, vous acceptez les pratiques décrites dans cette politique de confidentialité.
          </p>
        </div>

        {/* Informations collectées */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Informations que nous collectons
          </h2>
          
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            Informations que vous nous fournissez
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li><strong>Informations de compte :</strong> nom, prénom, adresse e-mail, mot de passe lors de l'inscription</li>
            <li><strong>Informations de profil :</strong> photo de profil, biographie, préférences de formation</li>
            <li><strong>Données de formation :</strong> progression dans les cours, résultats d'évaluations, certificats obtenus</li>
            <li><strong>Données de paiement :</strong> informations de facturation, historique des transactions (traitées par Stripe)</li>
            <li><strong>Communications :</strong> messages, commentaires, questions posées via nos services</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-900 mb-3">
            Informations collectées automatiquement
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li><strong>Données de navigation :</strong> pages visitées, temps passé sur chaque page, liens cliqués</li>
            <li><strong>Informations techniques :</strong> adresse IP, type de navigateur, système d'exploitation, appareil utilisé</li>
            <li><strong>Cookies et technologies similaires :</strong> pour améliorer votre expérience et analyser l'utilisation</li>
            <li><strong>Données d'utilisation des applications :</strong> fonctionnalités utilisées, erreurs rencontrées, performances</li>
          </ul>
        </div>

        {/* Utilisation des informations */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Comment nous utilisons vos informations
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Fournir nos services :</strong> accès aux formations, applications et fonctionnalités</li>
            <li><strong>Personnaliser votre expérience :</strong> recommandations de formations, contenu adapté à vos intérêts</li>
            <li><strong>Améliorer nos services :</strong> analyser l'utilisation pour optimiser nos plateformes</li>
            <li><strong>Communication :</strong> vous informer des nouvelles formations, mises à jour et offres</li>
            <li><strong>Sécurité :</strong> détecter et prévenir la fraude, protéger nos utilisateurs</li>
            <li><strong>Support client :</strong> répondre à vos questions et résoudre les problèmes</li>
            <li><strong>Conformité légale :</strong> respecter nos obligations légales et réglementaires</li>
          </ul>
        </div>

        {/* Partage des informations */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Partage de vos informations
          </h2>
          <p className="text-gray-700 mb-4">
            Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. 
            Nous pouvons partager vos informations dans les cas suivants :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Prestataires de services :</strong> Stripe (paiements), Supabase (base de données), services d'hébergement</li>
            <li><strong>Partenaires de formation :</strong> avec votre consentement, pour des formations spécialisées</li>
            <li><strong>Obligations légales :</strong> si requis par la loi ou pour protéger nos droits</li>
            <li><strong>Protection de la sécurité :</strong> pour prévenir la fraude ou les activités illégales</li>
            <li><strong>Avec votre consentement :</strong> dans tous les autres cas, uniquement avec votre autorisation explicite</li>
          </ul>
        </div>

        {/* Sécurité des données */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Sécurité de vos données
          </h2>
          <p className="text-gray-700 mb-4">
            Nous mettons en place des mesures de sécurité appropriées pour protéger vos informations :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Chiffrement :</strong> toutes les données sensibles sont chiffrées en transit et au repos</li>
            <li><strong>Accès restreint :</strong> seuls les employés autorisés ont accès aux données personnelles</li>
            <li><strong>Surveillance continue :</strong> monitoring 24/7 pour détecter les menaces de sécurité</li>
            <li><strong>Sauvegardes sécurisées :</strong> sauvegardes régulières et chiffrées de vos données</li>
            <li><strong>Formation du personnel :</strong> nos équipes sont formées aux bonnes pratiques de sécurité</li>
          </ul>
        </div>

        {/* Vos droits */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Vos droits
          </h2>
          <p className="text-gray-700 mb-4">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Droit d'accès :</strong> demander une copie de vos données personnelles</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données (droit à l'oubli)</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
            <li><strong>Droit de limitation :</strong> demander la limitation du traitement</li>
            <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@iahome.fr" className="text-blue-600 hover:text-blue-800">privacy@iahome.fr</a>
          </p>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Cookies et technologies similaires
          </h2>
          <p className="text-gray-700 mb-4">
            Nous utilisons des cookies et des technologies similaires pour :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (authentification, sécurité)</li>
            <li><strong>Cookies de performance :</strong> analyser l'utilisation et améliorer nos services</li>
            <li><strong>Cookies de fonctionnalité :</strong> mémoriser vos préférences et personnaliser votre expérience</li>
            <li><strong>Cookies de ciblage :</strong> afficher des contenus pertinents (avec votre consentement)</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
          </p>
        </div>

        {/* Conservation des données */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Conservation de vos données
          </h2>
          <p className="text-gray-700 mb-4">
            Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités pour lesquelles 
            elles ont été collectées :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Données de compte :</strong> tant que votre compte est actif, puis 3 ans après la dernière activité</li>
            <li><strong>Données de formation :</strong> 5 ans pour les certificats et diplômes, 2 ans pour les données de progression</li>
            <li><strong>Données de paiement :</strong> 7 ans pour les obligations comptables et fiscales</li>
            <li><strong>Logs de sécurité :</strong> 1 an pour la détection et la prévention des fraudes</li>
            <li><strong>Cookies :</strong> selon la durée définie pour chaque type de cookie</li>
          </ul>
        </div>

        {/* Transferts internationaux */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Transferts internationaux
          </h2>
          <p className="text-gray-700 mb-4">
            Vos données peuvent être transférées et traitées dans des pays autres que votre pays de résidence. 
            Nous nous assurons que ces transferts respectent les exigences du RGPD :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Garanties contractuelles :</strong> clauses contractuelles types approuvées par la Commission européenne</li>
            <li><strong>Certifications :</strong> nos prestataires sont certifiés selon des standards internationaux</li>
            <li><strong>Surveillance :</strong> nous surveillons régulièrement la conformité de nos prestataires</li>
          </ul>
        </div>

        {/* Modifications */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Modifications de cette politique
          </h2>
          <p className="text-gray-700 mb-4">
            Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
            Les modifications importantes seront notifiées par :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Notification par e-mail à tous les utilisateurs</li>
            <li>Bannière de notification sur notre site web</li>
            <li>Mise à jour de la date "Dernière mise à jour" en haut de cette page</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Nous contacter
          </h2>
          <p className="text-gray-700 mb-4">
            Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques, 
            n'hésitez pas à nous contacter :
          </p>
          <div className="space-y-2 text-gray-700">
            <p><strong>E-mail :</strong> <a href="mailto:privacy@iahome.fr" className="text-blue-600 hover:text-blue-800">privacy@iahome.fr</a></p>
            <p><strong>Adresse :</strong> IAhome, [Adresse complète]</p>
            <p><strong>Délégué à la protection des données :</strong> <a href="mailto:dpo@iahome.fr" className="text-blue-600 hover:text-blue-800">dpo@iahome.fr</a></p>
          </div>
          <p className="text-gray-700 mt-4">
            Vous avez également le droit de déposer une plainte auprès de la CNIL si vous estimez que 
            vos droits ne sont pas respectés.
          </p>
        </div>

      </div>
    </div>
  );
}
