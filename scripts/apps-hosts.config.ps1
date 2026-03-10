# Configuration pour start-all-apps.ps1
# Definir les chemins apres avoir execute les scripts setup-*-local.ps1

# Cache des modeles Hugging Face (BiRefNet, Animagine XL, Florence-2) - evite les telechargements repetes
# Par defaut: iahome/models-cache. Decommentez pour un emplacement personnalise.
# $ModelsCachePath = "C:\chemin\vers\models-cache"

# Ignorer PhotoMaker/BiRefNet/Florence-2/Animagine XL (erreur torchvision _C.pyd)
# Commentez la ligne ci-dessous pour reactiver les apps Gradio apres avoir corrige PyTorch
$SkipGradioApps = $false

$PhotomakerPath   = "C:\\Users\\AAA\\Documents\\iahome\\gradio-apps\\photomaker"
$BirefnetPath     = "C:\\Users\\AAA\\Documents\\iahome\\gradio-apps\\birefnet"
$Florence2Path    = "C:\\Users\\AAA\\Documents\\iahome\\gradio-apps\\florence-2"
$AnimagineXLPath  = "C:\\Users\\AAA\\Documents\\iahome\\gradio-apps\\animagine-xl"










