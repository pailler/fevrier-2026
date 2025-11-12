#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour supprimer les révisions inutilisées du cache Hugging Face
"""

import os
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
    print("ANALYSE DU CACHE HUGGING FACE")
    print("=" * 60)
    print()
    
    # Scanner le cache
    print("Scan du cache en cours...")
    try:
        cache_info = scan_cache_dir()
    except Exception as e:
        print(f"[ERREUR] Erreur lors du scan du cache: {e}")
        return
    
    # Afficher les informations du cache
    print(f"Taille totale du cache: {cache_info.size_on_disk_str}")
    total_revisions = sum(len(repo.revisions) for repo in cache_info.repos)
    print(f"Nombre de revisions: {total_revisions}")
    print(f"Nombre de repos: {len(cache_info.repos)}")
    print()
    
    if total_revisions == 0:
        print("[OK] Le cache est deja vide.")
        return
    
    # Afficher les repos et révisions
    print("Repos trouves dans le cache:")
    print("-" * 60)
    
    for repo in cache_info.repos:
        repo_id = repo.repo_id
        repo_type = repo.repo_type
        repo_size = sum(rev.size_on_disk for rev in repo.revisions)
        
        print(f"\n[REPO] {repo_id} ({repo_type})")
        print(f"   Taille: {format_size(repo_size)}")
        print(f"   Revisions: {len(repo.revisions)}")
        
        for rev in repo.revisions:
            rev_size = rev.size_on_disk
            print(f"   - {rev.commit_hash[:8]}... ({format_size(rev_size)})")
    
    print()
    print("=" * 60)
    
    # Identifier les révisions inutilisées
    print("Identification des revisions inutilisees...")
    delete_strategy = cache_info.delete_revisions()
    
    print(f"Espace qui sera libere: {delete_strategy.expected_freed_size_str}")
    print("=" * 60)
    print()
    
    # Vérifier s'il y a des révisions à supprimer
    try:
        # Essayer d'accéder aux révisions pour vérifier
        num_revisions = len(delete_strategy.revisions) if hasattr(delete_strategy, 'revisions') else 0
    except:
        num_revisions = 0
    
    if num_revisions == 0 and delete_strategy.expected_freed_size == 0:
        print("[OK] Aucune revision inutilisee a supprimer.")
        return
    
    # Demander confirmation
    response = input(f"Supprimer les revisions inutilisees et liberer {delete_strategy.expected_freed_size_str} ? (o/N): ")
    if response.lower() not in ['o', 'oui', 'y', 'yes']:
        print("[ANNULATION] Operation annulee.")
        return
    
    print()
    print("Suppression en cours...")
    
    try:
        # Exécuter la suppression
        delete_strategy.execute()
        
        print()
        print("=" * 60)
        print(f"[SUCCES] Suppression terminee avec succes !")
        print(f"Espace libere: {delete_strategy.expected_freed_size_str}")
        print("=" * 60)
        
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la suppression: {e}")
        import traceback
        traceback.print_exc()
        print()
        print("[INFO] Alternative: Suppression manuelle du cache")
        cache_path = Path.home() / ".cache" / "huggingface"
        print(f"   Dossier: {cache_path}")
        print(f"   Commande PowerShell: Remove-Item -Path '{cache_path}' -Recurse -Force")

if __name__ == "__main__":
    main()

