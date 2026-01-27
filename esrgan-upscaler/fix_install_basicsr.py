"""
Script pour corriger et installer basicsr malgré le bug dans setup.py
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import tempfile

def fix_basicsr_setup():
    """Corrige le setup.py de basicsr et l'installe"""
    
    print("="*60)
    print("Installation de basicsr (avec correction du bug)")
    print("="*60)
    
    # Cloner basicsr
    temp_dir = Path(tempfile.gettempdir()) / "basicsr_install"
    if temp_dir.exists():
        # Essayer de supprimer, ignorer les erreurs
        try:
            import time
            time.sleep(0.5)
            shutil.rmtree(temp_dir, ignore_errors=True)
            # Si ça existe encore, utiliser un nom différent
            if temp_dir.exists():
                import random
                temp_dir = Path(tempfile.gettempdir()) / f"basicsr_install_{random.randint(1000, 9999)}"
        except:
            import random
            temp_dir = Path(tempfile.gettempdir()) / f"basicsr_install_{random.randint(1000, 9999)}"
    
    print("\n1. Clonage de BasicSR depuis GitHub...")
    try:
        subprocess.run(["git", "clone", "https://github.com/xinntao/BasicSR.git", str(temp_dir)], 
                      check=True, capture_output=True)
        print("   [OK] BasicSR clone")
    except subprocess.CalledProcessError as e:
        print(f"   [ERREUR] Erreur lors du clonage: {e}")
        return False
    except FileNotFoundError:
        print("   [ERREUR] Git n'est pas installe")
        print("   Installez Git depuis: https://git-scm.com/download/win")
        return False
    
    # Créer le fichier VERSION et version.py si nécessaire
    version_file_path = temp_dir / "VERSION"
    basicsr_version_py = temp_dir / "basicsr" / "version.py"
    
    print("\n2. Creation des fichiers de version...")
    try:
        # Créer le dossier basicsr si nécessaire
        (temp_dir / "basicsr").mkdir(exist_ok=True)
        
        # Créer le fichier VERSION
        if not version_file_path.exists():
            version_file_path.write_text("1.4.2\n", encoding='utf-8')
            print("   [OK] Fichier VERSION cree")
        
        # Créer le fichier version.py
        if not basicsr_version_py.exists():
            version_content = """# GENERATED VERSION FILE
__version__ = '1.4.2'
__gitsha__ = 'unknown'
version_info = (1, 4, 2)
"""
            basicsr_version_py.write_text(version_content, encoding='utf-8')
            print("   [OK] Fichier basicsr/version.py cree")
    except Exception as e:
        print(f"   [AVERTISSEMENT] Erreur lors de la creation des fichiers: {e}")
    
    # Corriger setup.py
    setup_py = temp_dir / "setup.py"
    if not setup_py.exists():
        print(f"   [ERREUR] setup.py non trouve dans {temp_dir}")
        return False
    
    print("\n3. Correction du setup.py...")
    try:
        content = setup_py.read_text(encoding='utf-8')
        
        # Corriger la fonction get_version pour gérer le cas où __version__ n'existe pas
        old_line = "    return locals()['__version__']"
        new_line = "    return locals().get('__version__', '1.4.2')"
        
        if old_line in content:
            content = content.replace(old_line, new_line)
            setup_py.write_text(content, encoding='utf-8')
            print("   [OK] setup.py corrige")
        else:
            print("   [INFO] La ligne problematique n'a pas ete trouvee (peut-etre deja corrigee)")
    except Exception as e:
        print(f"   [ERREUR] Erreur lors de la correction: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Installer basicsr
    print("\n4. Installation de basicsr...")
    try:
        result = subprocess.run([sys.executable, "-m", "pip", "install", str(temp_dir)], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("   [OK] basicsr installe avec succes")
            return True
        else:
            print(f"   [ERREUR] Installation echouee:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"   [ERREUR] Erreur lors de l'installation: {e}")
        return False
    finally:
        # Nettoyer
        if temp_dir.exists():
            try:
                shutil.rmtree(temp_dir)
            except:
                pass


def install_realesrgan_dependencies():
    """Installe les dépendances de Real-ESRGAN"""
    
    print("\n" + "="*60)
    print("Installation des dependances Real-ESRGAN")
    print("="*60)
    
    dependencies = [
        "opencv-python",
        "pillow",
        "numpy",
        "scipy",
        "tqdm",
        "lmdb",
        "pyyaml",
        "tb-nightly",
        "yapf",
        "isort"
    ]
    
    for dep in dependencies:
        print(f"\nInstallation de {dep}...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
            print(f"   [OK] {dep} installe")
        except subprocess.CalledProcessError:
            print(f"   [AVERTISSEMENT] {dep} peut deja etre installe")
    
    # Essayer d'installer facexlib et gfpgan (optionnels)
    optional = ["facexlib", "gfpgan"]
    for dep in optional:
        print(f"\nInstallation optionnelle de {dep}...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
            print(f"   [OK] {dep} installe")
        except:
            print(f"   [INFO] {dep} non installe (optionnel)")


def install_realesrgan():
    """Installe Real-ESRGAN"""
    
    print("\n" + "="*60)
    print("Installation de Real-ESRGAN")
    print("="*60)
    
    # Cloner Real-ESRGAN
    temp_dir = Path(tempfile.gettempdir()) / "realesrgan_install"
    if temp_dir.exists():
        try:
            import time
            time.sleep(0.5)
            shutil.rmtree(temp_dir, ignore_errors=True)
            if temp_dir.exists():
                import random
                temp_dir = Path(tempfile.gettempdir()) / f"realesrgan_install_{random.randint(1000, 9999)}"
        except:
            import random
            temp_dir = Path(tempfile.gettempdir()) / f"realesrgan_install_{random.randint(1000, 9999)}"
    
    print("\n1. Clonage de Real-ESRGAN depuis GitHub...")
    try:
        subprocess.run(["git", "clone", "https://github.com/xinntao/Real-ESRGAN.git", str(temp_dir)], 
                      check=True, capture_output=True)
        print("   [OK] Real-ESRGAN clone")
    except subprocess.CalledProcessError as e:
        print(f"   [ERREUR] Erreur lors du clonage: {e}")
        return False
    
    # Corriger setup.py de Real-ESRGAN aussi
    setup_py = temp_dir / "setup.py"
    if setup_py.exists():
        print("\n2. Correction du setup.py de Real-ESRGAN...")
        try:
            content = setup_py.read_text(encoding='utf-8')
            # Corriger la même ligne problématique
            content = content.replace(
                "    return locals()['__version__']",
                "    return locals().get('__version__', '0.3.0')"
            )
            setup_py.write_text(content, encoding='utf-8')
            print("   [OK] setup.py de Real-ESRGAN corrige")
        except Exception as e:
            print(f"   [AVERTISSEMENT] Erreur lors de la correction: {e}")
    
    # Créer les fichiers de version si nécessaire
    version_file = temp_dir / "VERSION"
    if not version_file.exists():
        version_file.write_text("0.3.0\n", encoding='utf-8')
    
    realesrgan_version_py = temp_dir / "realesrgan" / "version.py"
    if not realesrgan_version_py.exists():
        (temp_dir / "realesrgan").mkdir(exist_ok=True)
        version_content = """# GENERATED VERSION FILE
__version__ = '0.3.0'
__gitsha__ = 'unknown'
version_info = (0, 3, 0)
"""
        realesrgan_version_py.write_text(version_content, encoding='utf-8')
    
    # Installer en mode développement
    print("\n3. Installation de Real-ESRGAN...")
    try:
        result = subprocess.run([sys.executable, "-m", "pip", "install", "-e", str(temp_dir)], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("   [OK] Real-ESRGAN installe avec succes")
            return True
        else:
            print(f"   [ERREUR] Installation echouee (mode developpement):")
            print(result.stderr[-500:] if len(result.stderr) > 500 else result.stderr)
            # Essayer installation normale
            print("\n   Tentative d'installation normale...")
            result2 = subprocess.run([sys.executable, "-m", "pip", "install", str(temp_dir)], 
                                   capture_output=True, text=True)
            if result2.returncode == 0:
                print("   [OK] Real-ESRGAN installe (mode normal)")
                return True
            return False
    except Exception as e:
        print(f"   [ERREUR] Erreur lors de l'installation: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # Nettoyer (ignorer les erreurs)
        if temp_dir.exists():
            try:
                import time
                time.sleep(1)
                shutil.rmtree(temp_dir, ignore_errors=True)
            except:
                pass


def main():
    """Fonction principale"""
    print("\n" + "="*60)
    print("Installation Complete de Real-ESRGAN")
    print("="*60)
    print("\nCette installation peut prendre 10-30 minutes...")
    print("")
    
    # 1. Installer les dépendances
    install_realesrgan_dependencies()
    
    # 2. Corriger et installer basicsr
    if not fix_basicsr_setup():
        print("\n[ERREUR] Echec de l'installation de basicsr")
        print("L'installation de Real-ESRGAN ne peut pas continuer.")
        return False
    
    # 3. Installer Real-ESRGAN
    if install_realesrgan():
        print("\n" + "="*60)
        print("[SUCCES] Real-ESRGAN installe avec succes!")
        print("="*60)
        print("\nVous pouvez maintenant redemarrer l'application.")
        print("Elle utilisera automatiquement Real-ESRGAN.")
        return True
    else:
        print("\n" + "="*60)
        print("[ECHEC] L'installation de Real-ESRGAN a echoue")
        print("="*60)
        print("\nL'application continuera d'utiliser l'implementation personnalisee.")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
