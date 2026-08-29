#!/usr/bin/env python3
"""Génère script-short.txt et script-short.doc (téléprompteur oral) par appli."""

from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "videos"
MASTER = OUT / "scripts-shorts-30-apps.txt"
MASTER_DOC = OUT / "scripts-shorts-30-apps.doc"


def oralize(text: str) -> str:
    """Adapte le texte pour une lecture orale fluide."""
    text = text.replace("…", ", ")
    text = text.replace(" — ", ", ")
    text = text.replace("–", ", ")
    text = re.sub(r"\s+", " ", text).strip()
    replacements = {
        "2 Go": "deux gigas",
        "15 Mo": "quinze méga",
        "10 crédits": "dix crédits",
        "100 crédits": "cent crédits",
        "200 crédits": "deux cents crédits",
        "6–14 ans": "six à quatorze ans",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = re.sub(r"\s+\.", ".", text)
    if not text.endswith((".", "!", "?")):
        text += "."
    return text


def build_access(app: dict) -> str:
    name = app["name"]
    return (
        f"Pour accéder à l'appli {name}, rendez-vous sur iahome.fr, "
        f"cherchez l'appli {name} parmi les applications visibles ou aidez-vous du moteur de recherche, "
        f"cliquez sur le bouton d'accès à l'application, et c'est tout, "
        f"vous pouvez l'utiliser autant de fois que vous voulez."
    )


def build_spoken(app: dict) -> list[str]:
    """Texte intégral à lire à voix haute : pitch, corps, exemple, accès."""
    pitch = oralize(app["pitch"])
    if app.get("num"):
        pitch = f"Application numéro {app['num']}. {pitch}"
    return [
        pitch,
        oralize(app["main"]),
        oralize(app["exemple"]),
        oralize(build_access(app)),
    ]


def format_teleprompter(app: dict) -> str:
    return "\n\n".join(build_spoken(app)) + "\n"


def write_doc(path: Path, paragraphs: list[str]) -> None:
    chunks: list[str] = []
    for para in paragraphs:
        if not para.strip():
            continue
        chunks.append(
            f"<p style='margin:0 0 18pt 0;line-height:160%;'>{html.escape(para.strip())}</p>"
        )
    body = "\n".join(chunks)
    content = f"""<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="IAHome script generator">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body {{ font-family: Arial, sans-serif; font-size: 22pt; }}
p {{ font-size: 22pt; }}
</style>
</head>
<body>{body}</body>
</html>
"""
    path.write_text(content, encoding="utf-8")


def write_master_doc(apps: list[dict]) -> None:
    chunks: list[str] = []
    for i, app in enumerate(apps):
        if i:
            chunks.append(
                "<br clear=all style='mso-special-character:line-break;page-break-before:always'>"
            )
        for para in build_spoken(app):
            if not para.strip():
                continue
            chunks.append(
                f"<p style='margin:0 0 18pt 0;line-height:160%;'>{html.escape(para.strip())}</p>"
            )
    body = "\n".join(chunks)
    content = f"""<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="IAHome script generator">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
body {{ font-family: Arial, sans-serif; font-size: 22pt; }}
p {{ font-size: 22pt; }}
</style>
</head>
<body>{body}</body>
</html>
"""
    MASTER_DOC.write_text(content, encoding="utf-8")


APPS: list[dict] = [
    {
        "slug": "photobooth",
        "name": "Photo-Videobooth",
        "pitch": "Sur iahome.fr, l'appli Photo-Videobooth change la donne pour vos événements.",
        "main": "Les bornes photo professionnelles comme Snappic ou Breeze coûtent souvent plusieurs centaines d'euros par événement, ou imposent un abonnement mensuel. Moi, j'ai retrouvé la même idée en ligne avec l'appli Photo-Videobooth sur iahome.fr. Quand j'organise un mariage, une soirée ou un salon professionnel, j'utilise l'appli Photo-Videobooth pour que mes invités repartent avec un vrai souvenir. Les invités se filment ou se prennent en photo, et tout atterrit dans une galerie en ligne. J'envoie un QR code ou un code PIN, et c'est réglé. L'accès coûte cent crédits, avec un accompagnement personnalisé si besoin, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous organisez la fête des quarante ans de votre sœur, vous affichez un QR code à l'entrée, vos invités filment leurs messages, et le soir même chacun récupère la galerie et peut ajouter ses propres photos ou vidéos.",
    },
    {
        "slug": "librespeed",
        "name": "LibreSpeed",
        "pitch": "Sur iahome.fr, l'appli LibreSpeed teste votre débit sans publicité.",
        "main": "L'appli Speedtest d'Ookla, tout le monde la connaît, mais elle affiche de la pub à chaque test et propose parfois des offres box qui s'incrustent. Moi, j'utilise l'appli LibreSpeed sur iahome.fr pour tester mon débit sans publicité. Quand ma visio freeze ou que ma vidéo coupe, je me demande toujours si le problème vient de la box ou du Wi-Fi. Avant de paniquer, je lance l'appli LibreSpeed, et en quelques secondes je vois mon débit montant, mon débit descendant et ma latence. L'accès est gratuit, sans pub, et je peux retester autant que je veux. Vous recevez aussi deux cents crédits offerts à l'inscription pour explorer le reste de la plateforme.",
        "exemple": "Si vous travaillez en télétravail et que votre visio lag, vous testez votre connexion avant la réunion avec l'appli LibreSpeed, vous voyez que votre upload est faible, et vous passez en Ethernet au lieu de culpabiliser votre collègue.",
    },
    {
        "slug": "metube",
        "name": "MeTube",
        "pitch": "Sur iahome.fr, l'appli MeTube télécharge vos vidéos pour dix crédits par accès.",
        "main": "Les applis comme 4K Video Downloader ou les convertisseurs YouTube premium sont payantes ou remplies de publicité. Moi, j'utilise l'appli MeTube sur iahome.fr pour faire la même chose proprement. J'ai trouvé une super conférence ou un tuto sur YouTube, et je voulais l'écouter en MP3 dans le train. Avec l'appli MeTube, je colle le lien, je choisis le format, je télécharge, et tout se fait dans le navigateur. L'accès coûte seulement dix crédits, sur deux cents crédits gratuits offerts à l'inscription.",
        "exemple": "Si vous suivez un cycle de conférences en ligne, vous téléchargez les leçons en MP3 avec l'appli MeTube pour les réécouter dans le train, même sans réseau.",
    },
    {
        "slug": "psitransfer",
        "name": "PsiTransfer",
        "pitch": "Sur iahome.fr, l'appli PsiTransfer envoie vos gros fichiers sans abonnement WeTransfer.",
        "main": "L'appli WeTransfer, vous la connaissez, mais au-delà de deux gigas c'est payant, avec de la pub, et les fichiers expirent vite. Moi, j'utilise l'appli PsiTransfer sur iahome.fr, qui reprend le même principe avec un lien sécurisé et des gros fichiers, sans abonnement WeTransfer Pro. Quand je dois envoyer plusieurs gigas, j'ouvre l'appli PsiTransfer, j'uploade mes fichiers, je récupère un lien sécurisé, et je l'envoie. Il n'y a pas de pub, un clic ou un QR code suffit de l'autre côté, et le fichier est téléchargé. L'accès coûte dix crédits seulement, sur deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous êtes graphiste, vous envoyez vos fichiers HD à votre client avec l'appli PsiTransfer, il récupère le lien en quelques secondes, et une fois le téléchargement terminé le fichier est supprimé.",
    },
    {
        "slug": "pdf",
        "name": "PDF+",
        "pitch": "Sur iahome.fr, l'appli PDF plus gère vos PDF gratuitement et sans pub.",
        "main": "L'appli Adobe Acrobat reste l'outil PDF par excellence, mais elle est chère. Les applis iLovePDF et Smallpdf sont gratuites, mais avec de la pub et des limites. Moi, j'utilise l'appli PDF plus sur iahome.fr pour fusionner, signer et compresser mes documents sans publicité. J'ai trois PDF à fusionner, un contrat à signer, ou un fichier de quinze méga qui refuse de partir par mail. Avec l'appli PDF plus, je fais la fusion, la découpe, la compression, la conversion et la signature directement dans le navigateur. L'accès est gratuit, sans crédits, et vous recevez deux cents crédits offerts pour explorer le reste de la plateforme.",
        "exemple": "Si vous candidatez pour un emploi, vous fusionnez votre CV, votre lettre et vos diplômes en un seul PDF propre avec l'appli PDF plus avant l'envoi.",
    },
    {
        "slug": "qrcodes",
        "name": "QR Codes dynamiques",
        "pitch": "Sur iahome.fr, l'appli QR Codes dynamiques modifie vos liens sans réimprimer.",
        "main": "Les applis Bitly ou QR Code Generator Pro proposent des QR dynamiques et des statistiques, mais imposent un abonnement mensuel. Moi, j'utilise l'appli QR Codes dynamiques sur iahome.fr pour modifier mes liens sans réimprimer et suivre les scans. J'avais imprimé un QR code sur un flyer, et le lien n'était plus le bon. Maintenant, avec l'appli QR Codes dynamiques, je change la destination quand je veux, sans réimprimer. En bonus, je vois qui scanne, d'où il scanne, et quand il scanne. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous faites un flyer pour votre association, le QR code pointe d'abord vers l'événement de mars, puis vous le basculez vers celui de juin avec l'appli QR Codes dynamiques, le même flyer, un nouveau lien.",
    },
    {
        "slug": "code-learning",
        "name": "Apprendre à coder",
        "pitch": "Sur iahome.fr, l'appli Apprendre à coder initie vos enfants gratuitement.",
        "main": "Les applis Codecademy ou CodeMonkey pour les enfants passent souvent en payant après la période d'essai. Moi, j'utilise l'appli Apprendre à coder sur iahome.fr, qui est gratuite et illimitée pour les six à quatorze ans. Mon enfant m'a demandé ce que signifiait coder, et je voulais lui montrer du concret, pas juste une vidéo. Avec l'appli Apprendre à coder, il suit des exercices interactifs, avance à son rythme, et l'accès reste gratuit sans limite. Vous recevez aussi deux cents crédits offerts pour le reste de la plateforme.",
        "exemple": "Si votre fils de dix ans s'y met, il peut créer un petit jeu attrape le chat en une semaine de quinze minutes par jour avec l'appli Apprendre à coder, et il sera fier de vous montrer son score.",
    },
    {
        "slug": "apprendre-autrement",
        "name": "Apprendre autrement",
        "pitch": "Sur iahome.fr, l'appli Apprendre autrement rend l'école plus motivante.",
        "main": "Les applis éducatives comme Homer ou Khan Academy Kids passent vite en abonnement. Moi, j'utilise l'appli Apprendre autrement sur iahome.fr pour proposer des activités adaptées, des badges et des encouragements vocaux. Ma fille galérait avec la méthode classique, les fiches et les répétitions. Avec l'appli Apprendre autrement, elle progresse avec des activités adaptées, débloque des badges, et reçoit des encouragements vocaux. L'accès coûte dix crédits, sur deux cents crédits gratuits offerts à l'inscription, et l'apprentissage devient une expérience positive, pas une corvée.",
        "exemple": "Si votre fille déteste les maths, elle débloque un badge championne des additions après trois sessions courtes avec l'appli Apprendre autrement, et le lendemain elle redemande à jouer.",
    },
    {
        "slug": "home-assistant",
        "name": "Domotisez votre habitat",
        "pitch": "Sur iahome.fr, l'appli Domotisez votre habitat configure votre maison connectée.",
        "main": "L'appli Apple HomeKit ou les installateurs domotiques représentent un vrai budget. Home Assistant en open source est puissant, mais complexe à configurer. Moi, j'utilise l'appli Domotisez votre habitat sur iahome.fr pour récupérer des configurations prêtes à l'emploi. Je rêvais de lumières qui s'éteignent toutes seules et de volets qui se ferment la nuit. L'appli Domotisez votre habitat m'a fourni des configs prêtes pour Home Assistant. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous installez un scénario je sors de chez moi, les lumières s'éteignent, les volets se ferment, le chauffage passe en éco avec l'appli Domotisez votre habitat, un bouton et c'est réglé.",
    },
    {
        "slug": "administration",
        "name": "Services de l'Administration",
        "pitch": "Sur iahome.fr, l'appli Services de l'Administration regroupe les liens officiels.",
        "main": "J'ai testé des assistants administratifs payants et des sites démarches simplifiées remplis de publicité. Moi, j'utilise l'appli Services de l'Administration sur iahome.fr pour accéder aux vrais liens officiels, gratuitement et sans pub. Entre la carte grise, les impôts et Pôle emploi, je ne savais jamais par où commencer. L'appli Services de l'Administration regroupe les vrais liens officiels en un seul endroit. L'accès est gratuit sur iahome.fr, et vous recevez deux cents crédits offerts pour le reste de la plateforme.",
        "exemple": "Si vous déménagez, vous retrouvez en un clic les liens pour changer d'adresse à la CAF, à la Sécu et aux impôts avec l'appli Services de l'Administration.",
    },
    {
        "slug": "vote",
        "name": "Vote en ligne",
        "pitch": "Sur iahome.fr, l'appli Vote en ligne organise vos scrutins en direct.",
        "main": "Les applis Mentimeter ou Doodle Premium pour voter en live deviennent payantes en réunion professionnelle. Moi, j'utilise l'appli Vote en ligne sur iahome.fr pour créer un scrutin, partager un QR code ou un code PIN, et afficher les résultats en direct. En assemblée générale, en classe ou en comité, j'en avais marre des feuilles volantes. Avec l'appli Vote en ligne, je crée le scrutin, je partage un QR code ou un code PIN, et les résultats s'affichent en direct. L'accès coûte dix crédits, sur deux cents crédits offerts à l'inscription.",
        "exemple": "Si votre copropriété choisit la couleur de la façade, quarante-deux votants scannent le QR code en assemblée générale avec l'appli Vote en ligne, et le résultat s'affiche en direct sur l'écran.",
    },
    {
        "slug": "sentinelle-numerique",
        "name": "Sentinelle Numérique",
        "pitch": "Sur iahome.fr, l'appli Sentinelle Numérique prépare votre héritage numérique.",
        "main": "Les applis 1Password ou LastPass gèrent les mots de passe, mais la fin de vie numérique se traite ailleurs, souvent avec des outils payants. Moi, j'utilise l'appli Sentinelle Numérique sur iahome.fr pour réfléchir à ma cybersécurité et à mon héritage numérique. J'ai des dizaines de comptes, des photos et des mails, et je me demande ce qui se passerait si demain je n'étais plus là. L'appli Sentinelle Numérique m'a aidé à organiser ma cybersécurité, ma fin de vie numérique, et ce que mes proches pourraient récupérer. L'accès coûte dix crédits, sur deux cents crédits gratuits offerts à l'inscription.",
        "exemple": "Si vous souhaitez anticiper, vous préparez un dossier pour votre conjointe avec l'appli Sentinelle Numérique, la liste des comptes importants, les mots de passe d'urgence, et les consignes pour fermer Facebook et Gmail proprement.",
    },
    {
        "slug": "reveil-intelligent",
        "name": "Réveil Intelligent",
        "pitch": "Sur iahome.fr, l'appli Réveil Intelligent connaît les jours fériés et les vacances.",
        "main": "Les applis Sleep Cycle ou Alarmy imposent un abonnement ou des publicités à répétition. Moi, j'utilise l'appli Réveil Intelligent sur iahome.fr, qui connaît les jours fériés, la météo et les vacances scolaires, gratuitement et sans pub. Je me suis déjà fait réveiller un jour férié, ou j'ai réveillé les gamins un samedi de vacances scolaires. L'appli Réveil Intelligent connaît les fériés, la météo, et les vacances des zones A, B et C. L'accès est gratuit sur iahome.fr, et vous recevez deux cents crédits offerts pour le reste de la plateforme.",
        "exemple": "Si vous programmez une alarme école du lundi au vendredi, l'appli Réveil Intelligent ne sonne pas le onze novembre ni pendant les vacances de toussaint.",
    },
    {
        "slug": "resas-system",
        "name": "Réservation matériel",
        "pitch": "Sur iahome.fr, l'appli Réservation matériel partage votre calendrier d'équipement.",
        "main": "Les applis Skedda ou Google Workspace Resource Booking sont pensées pour l'entreprise, et elles sont payantes. Moi, j'utilise l'appli Réservation matériel sur iahome.fr pour partager un calendrier d'équipement entre associations, écoles et fablabs. Dans mon association, tout le monde voulait le vidéoprojecteur en même temps, et personne ne savait qui l'avait. Avec l'appli Réservation matériel, je consulte le calendrier partagé, je réserve le matériel, et je reçois des rappels. L'accès coûte dix crédits, sur deux cents crédits offerts à l'inscription.",
        "exemple": "Si votre club de jeux réserve le plateau Catan pour vendredi soir avec l'appli Réservation matériel, tout le monde voit qu'il est pris, et personne ne le ramène deux fois par erreur.",
    },
    {
        "slug": "whisper",
        "name": "Whisper IA",
        "pitch": "Sur iahome.fr, l'appli Whisper IA transcrit vos audios en quelques minutes.",
        "main": "Les applis Otter.ai ou Rev.com facturent la transcription de réunion à la minute. Moi, j'utilise l'appli Whisper IA sur iahome.fr pour transcrire mon audio ou ma vidéo en plusieurs langues, en quelques minutes. J'avais enregistré une réunion ou une interview, et je n'avais aucune envie de tout retaper. L'appli Whisper IA transcrit mon enregistrement, gère plusieurs langues, et livre le résultat en quelques minutes. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous enregistrez un podcast de quarante-cinq minutes, l'appli Whisper IA vous sort la transcription complète, et vous corrigez en dix minutes au lieu de trois heures.",
    },
    {
        "slug": "stablediffusion",
        "name": "Stable Diffusion",
        "pitch": "Sur iahome.fr, l'appli Stable Diffusion génère vos images sans abonnement Midjourney.",
        "main": "Les applis Midjourney ou DALL-E imposent un abonnement ou des crédits à racheter en permanence. Moi, j'utilise l'appli Stable Diffusion sur iahome.fr pour transformer du texte en image avec des réglages professionnels. J'avais une affiche en tête ou un concept art, mais je ne sais pas dessiner. Avec l'appli Stable Diffusion, je décris mon idée en texte, l'intelligence artificielle génère l'image, et je peaufine le résultat. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous lancez votre petit café, vous générez trois visuels de logo ambiance chaleureuse, tons marron et vert avec l'appli Stable Diffusion, et vous faites voter vos amis sur Instagram.",
    },
    {
        "slug": "ruinedfooocus",
        "name": "RuinedFooocus",
        "pitch": "Sur iahome.fr, l'appli RuinedFooocus crée une image en une phrase.",
        "main": "L'appli Midjourney est géniale, mais elle passe par Discord, impose un abonnement, et demande une vraie courbe d'apprentissage. Moi, j'utilise l'appli RuinedFooocus sur iahome.fr pour obtenir la simplicité de Fooocus en une phrase et un clic. Je voulais des images d'intelligence artificielle propres, sans me battre avec une interface d'ingénieur. Avec l'appli RuinedFooocus, j'écris une phrase, je clique, et l'image arrive. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous préparez une invitation d'anniversaire sur le thème space party, vous générez une fusée colorée en trente secondes chrono avec l'appli RuinedFooocus.",
    },
    {
        "slug": "comfyui",
        "name": "ComfyUI",
        "pitch": "Sur iahome.fr, l'appli ComfyUI construit vos pipelines image sur mesure.",
        "main": "Les services RunComfy ou les clouds ComfyUI payants facturent à l'heure de processeur graphique. Moi, j'utilise l'appli ComfyUI sur iahome.fr pour créer des workflows par nœuds et des pipelines sur mesure, sans louer un serveur. Je maîtrisais déjà un peu l'image par intelligence artificielle, et l'appli ComfyUI m'a permis d'aller plus loin. Je construis des pipelines par nœuds, j'enchaîne les étapes, et j'optimise mes rendus. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous créez un workflow photo produit e-commerce, vous enchaînez détourage automatique, fond blanc et upscale avec l'appli ComfyUI, et vous réutilisez le même workflow sur cinquante articles.",
    },
    {
        "slug": "photomaker",
        "name": "PhotoMaker",
        "pitch": "Sur iahome.fr, l'appli PhotoMaker transforme vos selfies en portraits pro.",
        "main": "Les applis ProfilePicture.ai ou Remini en abonnement deviennent payantes pour un portrait professionnel. Moi, j'utilise l'appli PhotoMaker sur iahome.fr pour transformer quelques selfies en portraits réalistes. J'avais besoin d'un portrait pro pour LinkedIn, ou simplement de me voir en avatar fantasy. Avec l'appli PhotoMaker, j'uploade quelques photos de référence, l'intelligence artificielle sort des portraits réalistes, et je choisis le meilleur. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous refaites votre profil LinkedIn, vous uploadez cinq selfies avec l'appli PhotoMaker, vous récupérez un portrait pro avec veste et fond neutre, sans passer chez le photographe.",
    },
    {
        "slug": "birefnet",
        "name": "BiRefNet",
        "pitch": "Sur iahome.fr, l'appli BiRefNet détourre vos photos en un clic.",
        "main": "Les applis Remove.bg ou Canva Pro facturent les crédits de détourage ou imposent un abonnement. Moi, j'utilise l'appli BiRefNet sur iahome.fr pour un détourage précis en un clic. J'ai une super photo, mais le fond est pourri, un mur jaune, un bureau bordélique, ou un passant qui photobombe. L'appli BiRefNet détourre mon sujet en un clic et exporte un PNG transparent. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous vendez des bijoux sur Etsy, vous photographiez chaque pièce sur votre table, l'appli BiRefNet enlève le fond, et vous obtenez un visuel pro en deux minutes.",
    },
    {
        "slug": "animagine-xl",
        "name": "Animagine XL",
        "pitch": "Sur iahome.fr, l'appli Animagine XL dessine vos scènes manga et anime.",
        "main": "L'appli Midjourney gère le style anime, mais elle impose un abonnement et demande des prompts à tâtonner. Moi, j'utilise l'appli Animagine XL sur iahome.fr pour créer du manga et de l'anime en SDXL. Je suis fan de manga et d'anime, et je voulais créer mes propres personnages. Avec l'appli Animagine XL, je décris la scène en texte, et l'intelligence artificielle dessine en SDXL. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous écrivez une histoire fantasy, vous générez votre héros chevalier aux cheveux blancs, cape bleue, style manga épique avec l'appli Animagine XL pour la couverture.",
    },
    {
        "slug": "florence-2",
        "name": "Florence-2",
        "pitch": "Sur iahome.fr, l'appli Florence deux analyse vos images sans compte cloud.",
        "main": "Les services Google Cloud Vision ou AWS Rekognition facturent chaque appel à l'API. Moi, j'utilise l'appli Florence deux sur iahome.fr pour décrire une image, extraire du texte et poser des questions, sans compte cloud. J'ai une photo ou un scan, et je veux savoir ce qu'il y a dedans, extraire le texte, ou poser des questions. L'appli Florence deux génère une description automatique, fait de l'OCR, et répond à mes questions sur l'image. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous photographiez une vieille facture papier, l'appli Florence deux extrait le montant, la date et le nom du fournisseur, sans retaper une seule ligne.",
    },
    {
        "slug": "hi3dgen",
        "name": "Hi3DGen",
        "pitch": "Sur iahome.fr, l'appli Hi3DGen transforme vos photos en modèles trois D.",
        "main": "Les applis Luma AI Genie ou Meshy imposent un abonnement pour passer de la photo au trois D. Moi, j'utilise l'appli Hi3DGen sur iahome.fr pour transformer une image en modèle trois D exploitable. J'ai une photo d'objet, une chaise, une figurine ou un produit, et je voulais un vrai modèle trois D. L'appli Hi3DGen transforme mon image en mesh exploitable pour la modélisation ou l'impression. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous êtes maker, vous photographiez une figurine artisanale, l'appli Hi3DGen génère le modèle trois D, et vous l'imprimez en double pour offrir à un ami.",
    },
    {
        "slug": "hunyuan3d",
        "name": "Hi3DGen (Hunyuan3D)",
        "pitch": "Sur iahome.fr, l'appli Hi3DGen convertit vos photos en modèles trois D.",
        "main": "Les applis Luma AI Genie ou Meshy imposent un abonnement pour passer de la photo au trois D. Moi, j'utilise l'appli Hi3DGen sur iahome.fr, avec le moteur Hunyuan3D, pour transformer une image en modèle trois D exploitable. J'ai une photo d'objet, une chaise, une figurine ou un produit, et je voulais un vrai modèle trois D. L'appli Hi3DGen transforme mon image en mesh exploitable pour la modélisation ou l'impression. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous êtes maker, vous photographiez une figurine artisanale, l'appli Hi3DGen génère le modèle trois D, et vous l'imprimez en double pour offrir à un ami.",
    },
    {
        "slug": "musetalk",
        "name": "MuseTalk",
        "pitch": "Sur iahome.fr, l'appli MuseTalk synchronise une photo avec votre audio.",
        "main": "Les applis D-ID ou HeyGen pour faire parler une photo imposent un abonnement professionnel cher. Moi, j'utilise l'appli MuseTalk sur iahome.fr pour obtenir un lip-sync réaliste entre un visage et un fichier audio. Je voulais qu'une photo parle avec une synchronisation labiale crédible, pour un avatar, une blague ou un contenu créatif. L'appli MuseTalk combine le visage et l'audio, et la bouche bouge en synchronisation. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous voulez faire chanter votre chat, vous mettez sa photo dans l'appli MuseTalk, vous uploadez un extrait de chanson, et vous postez la vidéo sur TikTok.",
    },
    {
        "slug": "photo-vivante",
        "name": "Photo Vivante",
        "pitch": "Sur iahome.fr, l'appli Photo Vivante donne vie à vos portraits.",
        "main": "Les applis MyHeritage Deep Nostalgia ou Remini animent vos photos, mais en abonnement. Moi, j'utilise l'appli Photo Vivante sur iahome.fr pour ajouter un mouvement subtil et réaliste à un portrait. J'avais le portrait de mon grand-père ou une vieille photo de mariage, et je voulais lui donner vie. L'appli Photo Vivante anime la photo en quelques clics avec un mouvement subtil et crédible. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous animez la photo de mariage de vos parents avec l'appli Photo Vivante, un léger mouvement du sourire et des cheveux suffit, et vous l'envoyez pour leurs noces d'or.",
    },
    {
        "slug": "voice-isolation",
        "name": "Isolation vocale",
        "pitch": "Sur iahome.fr, l'appli Isolation vocale sépare la voix et la musique.",
        "main": "Les applis Lalal.ai ou Moises facturent chaque morceau ou imposent un abonnement pour séparer voix et instruments. Moi, j'utilise l'appli Isolation vocale sur iahome.fr, avec Demucs, pour isoler la voix, la batterie, la basse et les instruments. Ma voix est noyée dans la musique, ou je veux juste récupérer la piste chant. L'appli Isolation vocale sépare chaque piste proprement. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous enregistrez un cover dans votre chambre avec un beat en fond, l'appli Isolation vocale isole votre voix, vous la remettez sur une instru propre, et le rendu est dix fois meilleur.",
    },
    {
        "slug": "meeting-reports",
        "name": "Meeting Reports",
        "pitch": "Sur iahome.fr, l'appli Meeting Reports résume vos réunions automatiquement.",
        "main": "Les applis Fireflies.ai, Otter ou le résumé Zoom AI imposent un abonnement professionnel. Moi, j'utilise l'appli Meeting Reports sur iahome.fr pour transcrire, résumer et extraire les actions d'une réunion. J'ai une réunion d'une heure, j'ai presque rien noté, et il me faut un compte rendu pour demain. L'appli Meeting Reports transcrit l'enregistrement, résume les points clés, et sort la liste des actions à mener. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Après une réunion projet du lundi, vous uploadez l'enregistrement dans l'appli Meeting Reports, vous récupérez la décision budget validée et l'action Paul envoie le devis avant vendredi.",
    },
    {
        "slug": "prompt-generator",
        "name": "Générateur de prompts",
        "pitch": "Sur iahome.fr, l'appli Générateur de prompts structure vos idées pour l'IA.",
        "main": "L'appli ChatGPT Plus coûte vingt euros par mois pour peaufiner ses prompts. Moi, j'utilise l'appli Générateur de prompts sur iahome.fr pour transformer une idée en prompt structuré pour les modèles de langage et l'image IA. Mes prompts ressemblaient à fais-moi un truc cool, et les résultats étaient décevants. L'appli Générateur de prompts transforme mon idée en prompt structuré et détaillé. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous voulez une image startup tech moderne, l'appli Générateur de prompts vous sort un prompt détaillé, puis l'appli Stable Diffusion vous sort enfin un rendu professionnel.",
    },
    {
        "slug": "ai-detector",
        "name": "Détecteur de Contenu IA",
        "pitch": "Sur iahome.fr, l'appli Détecteur de Contenu IA repère le texte généré par l'IA.",
        "main": "Les applis GPTZero ou Turnitin facturent la détection de contenu IA, surtout Turnitin en établissement scolaire. Moi, j'utilise l'appli Détecteur de Contenu IA sur iahome.fr pour obtenir un score de confiance en quelques secondes. J'ai un devoir, un mail ou un article, et je me demande s'il a été écrit par un humain ou par une intelligence artificielle. L'appli Détecteur de Contenu IA analyse le texte en secondes et affiche un score de confiance. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si un élève rend une dissertation suspecte, vous passez le texte dans l'appli Détecteur de Contenu IA, vous obtenez un score probablement IA, et vous ouvrez la discussion avec lui.",
    },
    {
        "slug": "cogstudio",
        "name": "Cog Studio",
        "pitch": "Sur iahome.fr, l'appli Cog Studio génère vos clips vidéo IA pour dix crédits.",
        "main": "Les applis Runway Gen-3 ou Pika pour la vidéo IA facturent des crédits très chers. Moi, j'utilise l'appli Cog Studio sur iahome.fr pour décrire une scène et obtenir un clip vidéo généré par intelligence artificielle. J'en avais marre des images statiques, et je voulais tester la vidéo IA. Avec l'appli Cog Studio, je décris une scène, j'obtiens un clip, et je teste mon idée rapidement. L'accès coûte seulement dix crédits, sur deux cents crédits gratuits offerts à l'inscription.",
        "exemple": "Si vous préparez une pub pour votre food truck, vous générez un clip de cinq secondes burger fumant, gros plan, lumière dorée avec l'appli Cog Studio pour tester l'accroche sur Reels.",
    },
    {
        "slug": "tts",
        "name": "Synthèse vocale (TTS)",
        "pitch": "Sur iahome.fr, l'appli Synthèse vocale lit vos textes avec cinquante-huit voix.",
        "main": "Les applis ElevenLabs ou Murf.ai imposent un abonnement et des crédits voix pour la voix off. Moi, j'utilise l'appli Synthèse vocale sur iahome.fr pour transformer un texte en voix naturelle avec cinquante-huit voix, dix-sept langues et le clonage vocal. J'avais un texte, un article, un script ou une notice, et je ne voulais pas m'enregistrer moi-même. L'appli Synthèse vocale génère une voix off naturelle en quelques clics. L'accès coûte cent crédits, avec un accompagnement personnalisé, et vous recevez deux cents crédits offerts à l'inscription.",
        "exemple": "Si vous faites une vidéo tuto sans montrer votre visage, vous écrivez le script, l'appli Synthèse vocale génère la voix off en français naturel, et vous montez votre vidéo en une heure.",
    },
]


def assign_numbers(apps: list[dict]) -> list[dict]:
    """Numérote 30 applis : 14 essentielles + 16 IA (hors Hunyuan3D et TTS)."""
    ia_apps = [a for a in apps[14:] if a["slug"] not in ("hunyuan3d", "tts")]
    ordered = apps[:14] + ia_apps[:16]
    slug_to_num = {a["slug"]: i + 1 for i, a in enumerate(ordered)}
    numbered: list[dict] = []
    for app in apps:
        enriched = {**app}
        if app["slug"] in slug_to_num:
            enriched["num"] = slug_to_num[app["slug"]]
        numbered.append(enriched)
    return numbered


def main() -> None:
    apps_ready = assign_numbers(APPS)

    for app in apps_ready:
        slug = app["slug"]
        folder = OUT / slug
        folder.mkdir(parents=True, exist_ok=True)
        spoken = build_spoken(app)
        prefix = f"{app['num']:02d}-" if app.get("num") else ""
        txt_path = folder / f"{prefix}script-short.txt"
        doc_path = folder / f"{prefix}script-short.doc"
        txt_path.write_text(format_teleprompter(app), encoding="utf-8")
        write_doc(doc_path, spoken)
        if app.get("num"):
            for old in (folder / "script-short.txt", folder / "script-short.doc"):
                if old.exists():
                    old.unlink()
        old_pdf = folder / "script-short.pdf"
        if old_pdf.exists():
            old_pdf.unlink()
        if app.get("num"):
            for stale in folder.glob("[0-9][0-9]-script-short.*"):
                if stale.name != f"{prefix}script-short{stale.suffix}":
                    stale.unlink()

    master_parts: list[str] = []
    ia_apps = [a for a in apps_ready[14:] if a["slug"] != "hunyuan3d"]
    for app in apps_ready[:14] + ia_apps:
        master_parts.append(format_teleprompter(app))
        master_parts.append("\n\f\n")
    hunyuan = next(a for a in apps_ready if a["slug"] == "hunyuan3d")
    master_parts.append(format_teleprompter(hunyuan))

    MASTER.write_text("".join(master_parts), encoding="utf-8")
    write_master_doc(apps_ready[:14] + ia_apps + [hunyuan])

    old_master_pdf = OUT / "scripts-shorts-30-apps.pdf"
    if old_master_pdf.exists():
        old_master_pdf.unlink()

    print(f"Généré : {len(APPS)} applis ({sum(1 for a in apps_ready if a.get('num'))} numérotées 1-30)")
    print(f"Master : {MASTER.name} + {MASTER_DOC.name}")


if __name__ == "__main__":
    main()
