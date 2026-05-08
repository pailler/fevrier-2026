'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StripeButton2 from '../../components/StripeButton2';
import { isPhotoboothPersonalizedPromoActive } from '../../utils/prestationMarketingPromo';
import { useHydrated } from '../../hooks/useHydrated';

const PRICES = {
  monthly: 9.9,
  yearly: 99,
  pack: 19.8,
} as const;

function formatPrice(value: number) {
  return value.toFixed(2).replace('.', ',') + '€';
}

type PromoCodeBlockProps = {
  variant: 'hero' | 'photobooth';
  promoInput: string;
  setPromoInput: (v: string) => void;
  applyPromo: (codeOverride?: string) => Promise<void>;
  promoLoading: boolean;
  promoResult: {
    valid: true;
    promotion_code_id: string;
    percent_off: number;
    code: string;
  } | { valid: false; error?: string } | null;
};

function PromoCodeBlock({
  variant,
  promoInput,
  setPromoInput,
  applyPromo,
  promoLoading,
  promoResult,
}: PromoCodeBlockProps) {
  const inputId = variant === 'hero' ? 'promo-code' : 'promo-code-photobooth';
  const isHero = variant === 'hero';

  const boxClass = isHero
    ? 'bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center'
    : 'bg-white/95 backdrop-blur-sm border-2 border-pink-200 rounded-lg p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shadow-sm';

  const labelClass = isHero ? 'text-white font-medium shrink-0' : 'text-gray-800 font-medium shrink-0';

  const inputClass = isHero
    ? 'flex-1 px-3 py-2 rounded border border-white/30 bg-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white'
    : 'flex-1 px-3 py-2 rounded border border-pink-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400';

  const buttonClass = isHero
    ? 'px-4 py-2 bg-white text-green-700 font-semibold rounded hover:bg-green-100 transition-colors disabled:opacity-50'
    : 'px-4 py-2 bg-pink-600 text-white font-semibold rounded hover:bg-pink-700 transition-colors disabled:opacity-50';

  const okClass = isHero ? 'mt-2 text-center text-green-200 text-sm' : 'mt-2 text-center text-emerald-700 text-sm';
  const errClass = isHero ? 'mt-2 text-center text-red-200 text-sm' : 'mt-2 text-center text-red-600 text-sm';

  return (
    <div className={`${variant === 'photobooth' ? 'mb-6' : 'mb-8'} max-w-xl mx-auto`}>
      <div className={boxClass}>
        <label htmlFor={inputId} className={labelClass}>
          Code promo
        </label>
        <input
          id={inputId}
          type="text"
          value={promoInput}
          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && void applyPromo()}
          placeholder="ex. MARIAGE2026"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => void applyPromo()}
          disabled={promoLoading}
          className={buttonClass}
        >
          {promoLoading ? 'Vérification...' : 'Appliquer'}
        </button>
      </div>
      {promoResult?.valid === true && (
        <p className={okClass}>
          ✓ Code <strong>{promoResult.code}</strong> appliqué : -{promoResult.percent_off}% sur tous les tarifs.
        </p>
      )}
      {promoResult?.valid === false && <p className={errClass}>{promoResult.error}</p>}
    </div>
  );
}

export default function Pricing2Client() {
  const hydrated = useHydrated();

  const [promoInput, setPromoInput] = useState('');
  const [promoResult, setPromoResult] = useState<{
    valid: true;
    promotion_code_id: string;
    percent_off: number;
    code: string;
  } | { valid: false; error?: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromo = async (codeOverride?: string) => {
    let code = (codeOverride !== undefined ? String(codeOverride) : promoInput)
      .trim()
      .replace(/\s/g, '')
      .toUpperCase();
    if (code === 'BIENVENUE2026') code = 'BIENVENUE10';
    if (!code) {
      setPromoResult(null);
      return;
    }
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const res = await fetch(`/api/stripe/validate-promo?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.valid && data.promotion_code_id) {
        const applied = (data.code || code).trim().toUpperCase();
        setPromoResult({
          valid: true,
          promotion_code_id: data.promotion_code_id,
          percent_off: applied === 'BIENVENUE10' ? 20 : (data.percent_off ?? 20),
          code: data.code || code,
        });
      } else {
        setPromoResult({ valid: false, error: data.error || 'Code invalide ou expiré' });
      }
    } catch {
      setPromoResult({ valid: false, error: 'Erreur de vérification' });
    } finally {
      setPromoLoading(false);
    }
  };

  /** Applique automatiquement le code promo depuis ?promo= ou ?code= (ex. BIENVENUE10) */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('promo') || params.get('code');
    if (!fromUrl) return;
    const raw = fromUrl.trim().replace(/\s/g, '').toUpperCase();
    const code = raw === 'BIENVENUE2026' ? 'BIENVENUE10' : raw;
    if (!/^[A-Z0-9_-]+$/i.test(code)) return;
    setPromoInput(code);
    void applyPromo(code);
    // Intentionnel : une seule fois au montage avec le code dans l’URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasPromo = promoResult?.valid === true && promoResult.percent_off > 0;
  const discountFactor = hasPromo ? 1 - (promoResult.percent_off / 100) : 1;
  const priceMonthly = PRICES.monthly * discountFactor;
  const priceYearly = PRICES.yearly * discountFactor;
  const pricePack = PRICES.pack * discountFactor;
  const promotionCodeId = hasPromo ? promoResult.promotion_code_id : undefined;
  /** Évite les écarts SSR / client sur le bloc tarif Photobooth (code promo %). */
  const showPhotoboothPromoPrice = hydrated && hasPromo;
  /** Ristourne fixe 199 € TTC (catalogue 399 €), même fenêtre que la prestation marketing. */
  const PHOTOBOOTH_CATALOG_EUR = 399;
  const showPhotobooth199Offer = hydrated && isPhotoboothPersonalizedPromoActive();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* Hero Section avec bannière animée */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-500 to-blue-600 text-white py-20 pt-24">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          {/* Particules flottantes avec animations variées */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400/40 rounded-full pricing2-animate-float-slow"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-green-400/35 rounded-full pricing2-animate-float-fast"></div>
          <div className="absolute bottom-10 left-1/4 w-2.5 h-2.5 bg-blue-500/30 rounded-full pricing2-animate-float-medium"></div>
          <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-emerald-500/40 rounded-full pricing2-animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-yellow-600/25 rounded-full pricing2-animate-float-fast"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-600/30 rounded-full pricing2-animate-float-medium"></div>
          <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-green-700/20 rounded-full pricing2-animate-float-slow"></div>
          <div className="absolute top-3/4 right-1/5 w-2 h-2 bg-emerald-700/25 rounded-full pricing2-animate-float-fast"></div>
          
          {/* Formes géométriques flottantes */}
          <div className="absolute top-16 left-1/2 w-4 h-4 bg-yellow-300/20 transform rotate-45 pricing2-animate-rotate-slow"></div>
          <div className="absolute bottom-16 right-1/2 w-3 h-3 bg-green-300/25 transform rotate-12 pricing2-animate-rotate-fast"></div>
          <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-blue-400/30 transform rotate-45 pricing2-animate-rotate-medium"></div>
          
          {/* Ondes de fond */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl pricing2-animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl pricing2-animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12 pricing2-animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight pricing2-animate-text-glow">
              Nos Offres IA Home
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-6 pricing2-animate-fade-in-up-delayed">
              Tous nos outils sont accessibles directement depuis votre navigateur, sans téléchargement.
            </p>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg p-6 max-w-4xl mx-auto pricing2-animate-fade-in-up-delayed">
              <h2 className="text-2xl font-bold text-white mb-3">
                💡 Pourquoi Choisir IA Home ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="flex items-start">
                  <span className="text-yellow-300 mr-2 text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-white">12+ Outils IA</div>
                    <div className="text-sm text-green-100">Une plateforme complète, sans téléchargement</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-300 mr-2 text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-white">Accès Complet</div>
                    <div className="text-sm text-green-100">Toutes les applications incluses</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-300 mr-2 text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-white">Support Inclus</div>
                    <div className="text-sm text-green-100">Assistance client dédiée</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <PromoCodeBlock
            variant="hero"
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            applyPromo={applyPromo}
            promoLoading={promoLoading}
            promoResult={promoResult}
          />

          {/* Section Abonnement */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 Abonnement (Recommandé)
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Accès complet à toutes les applications avec crédits mensuels récurrents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-5xl mx-auto">
              {/* Abonnement Mensuel */}
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-600 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap">
                    🔥 Le plus populaire
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Starter Mensuel</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(priceMonthly)}
                    {hasPromo && (
                      <span className="block text-sm font-normal text-gray-500 line-through mt-0.5">9,90€</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">par mois</div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">≈ <strong>30 utilisations d'IA complètes</strong></span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">🔹 ≈ <strong>300 actions simples</strong> (résumés, reformulations, PDF, qrcodes dynamiques, téléchargements videos youtube etc.)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Accès à <strong>TOUTES</strong> les applications</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Support <strong>standard</strong> inclus</span>
                  </li>
                </ul>
                <StripeButton2 
                  packageType="subscription_monthly"
                  promotionCodeId={promotionCodeId}
                  promoCodeToValidate={promoInput}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  S'abonner
                </StripeButton2>
              </div>

              {/* Abonnement Annuel */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border-2 border-green-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap">
                    💰 Meilleur rapport
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Starter Annuel</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatPrice(priceYearly)}
                    {hasPromo && (
                      <span className="block text-sm font-normal text-gray-500 line-through mt-0.5">99,00€</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">par an</div>
                  <div className="mt-2 bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Économisez 19,80€ (2 mois gratuits)
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">≈ <strong>30 utilisations d'IA complètes/mois</strong> × 12 mois</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">🔹 ≈ <strong>300 actions simples/mois</strong> (résumés, reformulations, PDF, qrcodes dynamiques, téléchargements videos youtube etc.)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Accès à <strong>TOUTES</strong> les applications</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Support <strong>standard</strong> inclus</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600"><strong>2 mois gratuits</strong> = 10 mois payés</span>
                  </li>
                </ul>
                <StripeButton2 
                  packageType="subscription_yearly"
                  promotionCodeId={promotionCodeId}
                  promoCodeToValidate={promoInput}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  S'abonner
                </StripeButton2>
              </div>
            </div>
          </div>

          {/* Section Achat Unique */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🪙 Achat Unique (Sans engagement)
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Pour ceux qui préfèrent l'achat ponctuel sans abonnement.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              {/* Pack Standard */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="inline-block bg-gray-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white whitespace-nowrap">
                    💡 Achat unique
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pack Standard</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(pricePack)}
                    {hasPromo && (
                      <span className="block text-sm font-normal text-gray-500 line-through mt-0.5">19,80€</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">Idéal pour tester toutes les applications sans engagement</div>
                  <div className="mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                    💡 Économisez 50% avec l'abonnement
                  </div>
                </div>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">≈ <strong>30 utilisations d'IA complètes</strong></span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">🔹 ≈ <strong>300 actions simples</strong> (résumés, reformulations, PDF, qrcodes dynamiques, téléchargements videos youtube etc.)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600">Accès à <strong>TOUTES</strong> les applications</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-600"><strong>Sans engagement</strong></span>
                  </li>
                </ul>
                <StripeButton2 
                  packageType="pack_standard"
                  promotionCodeId={promotionCodeId}
                  promoCodeToValidate={promoInput}
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Acheter
                </StripeButton2>
              </div>
            </div>
          </div>

          {/* Photobooth physique personnalisé */}
          <section
            id="photobooth-personnalise"
            className="mb-16 scroll-mt-24 rounded-2xl border-2 border-pink-300/80 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 p-8 shadow-xl"
          >
            <div className="text-center mb-6">
              <span className="inline-block rounded-full bg-pink-600 text-white text-xs font-bold px-3 py-1 mb-3">
                Événements & mariages
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                📸 Photobooth personnalisé
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-base leading-relaxed">
                Une borne photo pensée pour vos invités : ambiance chaleureuse, galerie consultable en direct sur
                téléphone, possibilité de fonctionner sans Wi‑Fi selon le déploiement. Habillage et message au choix
                pour coller à votre événement.
              </p>
              <PromoCodeBlock
                variant="photobooth"
                promoInput={promoInput}
                setPromoInput={setPromoInput}
                applyPromo={applyPromo}
                promoLoading={promoLoading}
                promoResult={promoResult}
              />
              <div className="mt-2 mb-2 rounded-2xl bg-white/90 border border-pink-200 px-6 py-5 shadow-inner max-w-md mx-auto">
                <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-1">Tarif indicatif</p>
                <p className="text-4xl sm:text-5xl font-extrabold text-pink-700 tabular-nums">
                  {showPhotoboothPromoPrice ? (
                    <>
                      <span className="text-2xl sm:text-3xl text-gray-400 line-through mr-2">
                        {PHOTOBOOTH_CATALOG_EUR}€
                      </span>
                      {(PHOTOBOOTH_CATALOG_EUR * discountFactor).toFixed(2).replace('.', ',')}€
                    </>
                  ) : showPhotobooth199Offer ? (
                    <>
                      <span className="text-2xl sm:text-3xl text-gray-400 line-through mr-2">
                        {PHOTOBOOTH_CATALOG_EUR}€
                      </span>
                      199€
                    </>
                  ) : (
                    <>{PHOTOBOOTH_CATALOG_EUR}€</>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">TTC — paiement sécurisé par carte (Stripe)</p>
                {showPhotobooth199Offer && !showPhotoboothPromoPrice && (
                  <p className="text-xs text-pink-700 font-semibold mt-1">
                    Offre limitée jusqu&apos;au 5 avril 2026 inclus (puis {PHOTOBOOTH_CATALOG_EUR}&nbsp;€ TTC).
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Connectez-vous pour régler en ligne ; nous vous recontactons pour finaliser la personnalisation.
                </p>
              </div>
            </div>
            <ul className="max-w-xl mx-auto space-y-2.5 text-sm text-gray-700 mb-8">
              <li className="flex gap-2">
                <span className="text-pink-600 font-bold shrink-0">✓</span>
                <span>
                  <strong>Personnalisation</strong> : en-tête, QR code galerie, options lumineuses et ambiance sur demande.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-600 font-bold shrink-0">✓</span>
                <span>
                  <strong>Logiciel IA Home</strong> : accès à l’application Photobooth avec vos jetons ou votre abonnement
                  (activation depuis votre compte).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-pink-600 font-bold shrink-0">✓</span>
                <span>
                  <strong>Accompagnement</strong> : nous vous guidons sur la formule adaptée (location, mise en service,
                  précisions techniques).
                </span>
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-stretch sm:items-center">
              <Link
                href="/photobooth-decouverte.html"
                className="inline-flex justify-center px-5 py-3 rounded-xl bg-white border-2 border-pink-200 text-pink-800 font-semibold text-sm hover:bg-pink-50 transition-colors shadow-sm"
              >
                Détails, avantages et conditions d&apos;utilisation
              </Link>
              <StripeButton2
                packageType="photobooth_personalized"
                promotionCodeId={promotionCodeId}
                promoCodeToValidate={promoInput}
                className="inline-flex justify-center px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors shadow-md min-h-[52px] w-full sm:w-auto sm:min-w-[280px]"
              >
                {showPhotoboothPromoPrice
                  ? `Payer en ligne — Photobooth personnalisé (${(PHOTOBOOTH_CATALOG_EUR * discountFactor).toFixed(2).replace('.', ',')}€)`
                  : showPhotobooth199Offer
                    ? 'Payer en ligne — Photobooth personnalisé (199 € TTC, offre limitée)'
                    : `Payer en ligne — Photobooth personnalisé (${PHOTOBOOTH_CATALOG_EUR}€)`}
              </StripeButton2>
            </div>
          </section>

          {/* Exemples d'utilisation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              💡 Exemples d'utilisation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-blue-600 mb-2">Applications IA complètes</div>
                <div className="text-gray-600 space-y-1">
                  <div>• Génération d'images (StableDiffusion, ComfyUI)</div>
                  <div>• Transcription audio/vidéo (Whisper)</div>
                  <div>• Génération 3D (Hunyuan3D)</div>
                  <div>• Isolation vocale</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-lg font-bold text-blue-600 mb-2">Actions simples</div>
                <div className="text-gray-600 space-y-1">
                  <div>• Résumés et reformulations</div>
                  <div>• Traitement PDF</div>
                  <div>• QR codes dynamiques</div>
                  <div>• Téléchargements YouTube (MeTube)</div>
                  <div>• Partage de fichiers (PsiTransfer)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations importantes */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ℹ️ Informations importantes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Sécurité</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Paiements sécurisés par Stripe</li>
                  <li>• Aucune donnée bancaire stockée</li>
                  <li>• Conformité PCI DSS</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ Utilisation</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Tokens crédités instantanément</li>
                  <li>• Support client inclus</li>
                  <li>• Résiliation possible à tout moment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
