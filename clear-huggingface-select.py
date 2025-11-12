#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour supprimer sélectivement des modèles du cache Hugging Face
"""

import sys
from pathlib import Path

try:
    from huggingface_hub import scan_cache_dir
except ImportError:
    print("[ERREUR] Le package 'huggingface_hub' n'est pas installe.")
    print("[INFO] Installation en cours...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "huggingface_hub", "-q"])
    from huggingface_hub import scan_cache_dir

def format_size(size_bytes):
    """Convertit les octets en format lisible"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"

def main():
    print("=" * 60)
    print("SUPPRESSION SELECTIVE DU CACHE HUGGING FACE")
    print("=" * 60)
    print()
    
    # Scanner le cache
    print("Scan du cache en cours...")
    try:
        cache_info = scan_cache_dir()
    except Exception as e:
        print(f"[ERREUR] Erreur lors du scan du cache: {e}")
        return
    
    print(f"Taille totale du cache: {cache_info.size_on_disk_str}")
    print()
    
    # Afficher les repos avec leurs tailles
    repos_list = []
    for idx, repo in enumerate(cache_info.repos, 1):
        repo_size = sum(rev.size_on_disk for rev in repo.revisions)
        repos_list.append((idx, repo, repo_size))
        print(f"{idx}. {repo.repo_id} ({repo.repo_type})")
        print(f"   Taille: {format_size(repo_size)}")
        print()
    
    print("=" * 60)
    print("Options:")
    print("  - Entrez les numeros des repos a supprimer (separes par des virgules)")
    print("  - Entrez 'all' pour tout supprimer")
    print("  - Entrez 'q' pour quitter")
    print("=" * 60)
    print()
    
    choice = input("Votre choix: ").strip().lower()
    
    if choice == 'q':
        print("[ANNULATION] Operation annulee.")
        return
    
    repos_to_delete = []
    total_size = 0
    
    if choice == 'all':
        repos_to_delete = [repo for _, repo, _ in repos_list]
        total_size = sum(size for _, _, size in repos_list)
    else:
        try:
            indices = [int(x.strip()) for x in choice.split(',')]
            for idx in indices:
                if 1 <= idx <= len(repos_list):
                    _, repo, size = repos_list[idx - 1]
                    repos_to_delete.append(repo)
                    total_size += size
                else:
                    print(f"[ERREUR] Numero invalide: {idx}")
                    return
        except ValueError:
            print("[ERREUR] Format invalide. Utilisez des numeros separes par des virgules.")
            return
    
    if not repos_to_delete:
        print("[ANNULATION] Aucun repo selectionne.")
        return
    
    print()
    print("Repos qui seront supprimes:")
    for repo in repos_to_delete:
        repo_size = sum(rev.size_on_disk for rev in repo.revisions)
        print(f"  - {repo.repo_id}: {format_size(repo_size)}")
    
    print()
    print(f"Espace total qui sera libere: {format_size(total_size)}")
    print()
    
    response = input("Confirmer la suppression ? (o/N): ")
    if response.lower() not in ['o', 'oui', 'y', 'yes']:
        print("[ANNULATION] Operation annulee.")
        return
    
    print()
    print("Suppression en cours...")
    
    try:
        # Supprimer les révisions de chaque repo sélectionné
        for repo in repos_to_delete:
            print(f"  Suppression de {repo.repo_id}...")
            for rev in repo.revisions:
                # Supprimer le dossier de la révision
                rev_path = Path(rev.snapshot_path)
                if rev_path.exists():
                    import shutil
                    shutil.rmtree(rev_path, ignore_errors=True)
        
        print()
        print("=" * 60)
        print(f"[SUCCES] Suppression terminee !")
        print(f"Espace libere: {format_size(total_size)}")
        print("=" * 60)
        
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la suppression: {e}")
        import traceback
        traceback.print_exc()
        print()
        print("[INFO] Alternative: Suppression manuelle")
        cache_path = Path.home() / ".cache" / "huggingface"
        print(f"   Dossier: {cache_path}")

if __name__ == "__main__":
    main()

