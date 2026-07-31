#!/bin/bash
# Genere des playlists .m3u pour Music Assistant (1 sous-dossier = 1 playlist).
# Mode simple : fichiers M3U sur le disque (import automatique par MA).
# Mode api   : via API MA (necessite MA_TOKEN, plus lent, souvent moins fiable).
#
# Usage (recommande, sans token) :
#   bash ma_generate_playlists.sh
#
# Usage API (optionnel) :
#   export MODE=api
#   export MA_TOKEN="votre_token"
#   bash ma_generate_playlists.sh

set -euo pipefail

NAS_BASE="${NAS_BASE:-/volume1/audio}"
PLAYLIST_DIR="${PLAYLIST_DIR:-/volume1/audio/playlists}"
MODE="${MODE:-m3u}"
MA_URL="${MA_URL:-http://192.168.1.51:8095}"
MA_URL="${MA_URL%/}"
MA_TOKEN="${MA_TOKEN:-}"
FS_PROVIDER="${FS_PROVIDER:-filesystem_smb--vzgeDh2B}"
SKIP_DIRS="${SKIP_DIRS:-playlists,#recycle,@eaDir,@tmp}"

should_skip_dir() {
  local name="$1"
  case "$name" in
    playlists|#recycle|@eaDir|@tmp) return 0 ;;
  esac
  [[ "$name" == @* || "$name" == #* ]] && return 0
  return 1
}

generate_m3u_playlists() {
  mkdir -p "$PLAYLIST_DIR"

  echo "Mode : M3U (sans API)"
  echo "Source : $NAS_BASE"
  echo "Sortie : $PLAYLIST_DIR"
  echo ""

  local count=0
  for folder in "$NAS_BASE"/*/ ; do
    [[ -d "$folder" ]] || continue
    local name
    name=$(basename "$folder")
    should_skip_dir "$name" && continue

    local m3u="$PLAYLIST_DIR/${name}.m3u"
    local tmp
    tmp=$(mktemp)
    local n=0

    echo "#EXTM3U" > "$tmp"

    while IFS= read -r -d '' file; do
      local rel="../${file#$NAS_BASE/}"
      rel="${rel//\\//}"
      echo "#EXTINF:-1,$(basename "${file%.*}")" >> "$tmp"
      echo "$rel" >> "$tmp"
      n=$((n + 1))
    done < <(find "$folder" -type f \( \
      -iname "*.flac" -o -iname "*.mp3" -o -iname "*.wav" -o \
      -iname "*.m4a" -o -iname "*.aac" -o -iname "*.ogg" -o -iname "*.opus" \
    \) -print0)

    if [[ "$n" -eq 0 ]]; then
      rm -f "$tmp"
      echo "Dossier : $name — aucun fichier audio, ignore."
      continue
    fi

    mv -f "$tmp" "$m3u"
    count=$((count + 1))
    echo "Dossier : $name — OK $m3u ($n pistes)"
  done

  echo ""
  echo "Termine : $count playlist(s) M3U creee(s)."
  echo "Dans Music Assistant : synchroniser la source Filesystem (SMB)"
  echo "  ou activer l'import des playlists M3U si ce n'est pas deja fait."
}

generate_api_playlists() {
  if [[ -z "$MA_TOKEN" ]]; then
    echo "Erreur : MODE=api necessite MA_TOKEN" >&2
    exit 1
  fi
  if ! command -v python3 >/dev/null 2>&1; then
    echo "Erreur : python3 requis pour MODE=api" >&2
    exit 1
  fi

  export NAS_BASE MA_URL MA_TOKEN FS_PROVIDER SKIP_DIRS PLAYLIST_DIR
  python3 <<'PY'
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

NAS_BASE = Path(os.environ["NAS_BASE"])
MA_URL = os.environ["MA_URL"]
MA_TOKEN = os.environ["MA_TOKEN"]
FS_PROVIDER = os.environ.get("FS_PROVIDER", "").strip()
SKIP_DIRS = {
    d.strip()
    for d in os.environ.get("SKIP_DIRS", "playlists").split(",")
    if d.strip()
}
AUDIO_EXT = {".flac", ".mp3", ".wav", ".m4a", ".aac", ".ogg", ".opus"}
MSG_ID = 0


def ma_call(command, args=None):
    global MSG_ID
    MSG_ID += 1
    payload = json.dumps(
        {"message_id": str(MSG_ID), "command": command, "args": args or {}}
    ).encode("utf-8")
    req = urllib.request.Request(
        MA_URL + "/api",
        data=payload,
        headers={
            "Authorization": "Bearer " + MA_TOKEN,
            "Content-Type": "application/json",
            "User-Agent": "ma_generate_playlists/1.0",
            "Accept": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    if isinstance(body, list):
        return body
    if isinstance(body, dict):
        if body.get("success") is False and body.get("error"):
            raise RuntimeError("API %s: %s" % (command, body["error"]))
        return body.get("result", body)
    return body


def as_track_list(data):
    if isinstance(data, list):
        return [t for t in data if isinstance(t, dict)]
    if isinstance(data, dict):
        for key in ("tracks", "items", "results"):
            val = data.get(key)
            if isinstance(val, list):
                return [t for t in val if isinstance(t, dict)]
    return []


def find_track_uri(file_path):
    stem = file_path.stem
    tracks = as_track_list(
        ma_call(
            "music/search",
            {
                "search_query": stem,
                "media_types": ["track"],
                "limit": 50,
                "library_only": True,
            },
        )
    )
    target = stem.lower()
    for track in tracks:
        uri = track.get("uri")
        if not uri:
            continue
        name = (track.get("name") or "").lower()
        if target in name or name in target:
            return uri
    for track in as_track_list(
        ma_call(
            "music/tracks/library_items",
            {"search": file_path.name, "limit": 20, "provider": FS_PROVIDER},
        )
    ):
        uri = track.get("uri")
        if uri:
            return uri
    return None


def main():
    print("Mode : API")
    print("Music Assistant : %s" % MA_URL)
    for folder in sorted(p for p in NAS_BASE.iterdir() if p.is_dir()):
        name = folder.name
        if name in SKIP_DIRS or name.startswith("@") or name.startswith("#"):
            continue
        files = [
            f for f in folder.rglob("*")
            if f.is_file() and f.suffix.lower() in AUDIO_EXT
        ]
        if not files:
            continue
        uris = []
        for f in files:
            uri = find_track_uri(f)
            if uri:
                uris.append(uri)
            else:
                print("  Non trouve : %s" % f.relative_to(NAS_BASE))
        if not uris:
            print("Dossier %s : aucune piste MA" % name)
            continue
        pl = ma_call(
            "music/playlists/create_playlist",
            {"name": name, "provider_instance_or_domain": FS_PROVIDER},
        )
        if not isinstance(pl, dict):
            raise RuntimeError("create_playlist invalide : %r" % (pl,))
        db_id = pl.get("item_id") or pl.get("id")
        ma_call(
            "music/playlists/add_playlist_tracks",
            {"db_playlist_id": str(db_id), "uris": uris},
        )
        print("OK %s (%d pistes)" % (name, len(uris)))


if __name__ == "__main__":
    main()
PY
}

if [[ ! -d "$NAS_BASE" ]]; then
  echo "Erreur : NAS_BASE introuvable : $NAS_BASE" >&2
  exit 1
fi

case "$MODE" in
  m3u|"") generate_m3u_playlists ;;
  api) generate_api_playlists ;;
  *)
    echo "Erreur : MODE inconnu '$MODE' (m3u ou api)" >&2
    exit 1
    ;;
esac
