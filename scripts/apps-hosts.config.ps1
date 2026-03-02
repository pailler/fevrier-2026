# Configuration pour start-all-apps.ps1
# Definir les chemins apres avoir execute les scripts setup-*-local.ps1

# Ignorer PhotoMaker/BiRefNet/Florence-2/Animagine XL (erreur torchvision _C.pyd)
# Commentez la ligne ci-dessous pour reactiver les apps Gradio apres avoir corrige PyTorch
$SkipGradioApps = $true

$PhotomakerPath   = "C:\\Users\\AAA\\Documents\\iahome\\gradio-apps\\photomaker"
$BirefnetPath     = "C:\\Users\\AAA\\Documents\\iahome\\gradio-apps\\birefnet"
$Florence2Path    = "C:\\Users\\AAA\\Documents\\iahome\\gradio-apps\\florence-2"
$AnimagineXLPath  = "C:\\Users\\AAA\\Documents\\iahome\\gradio-apps\\animagine-xl"


