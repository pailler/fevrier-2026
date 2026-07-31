# -*- coding: utf-8 -*-
"""Regénère MANUEL-PHOTOBOOTH-lecture.html depuis le .md via Pandoc + enrobage CSS."""
import re
import subprocess
from pathlib import Path

DIR = Path(__file__).parent
MD = DIR / "MANUEL-PHOTOBOOTH-VIDEOBOOTH.md"
HTML = DIR / "MANUEL-PHOTOBOOTH-lecture.html"
TEMP = DIR / "MANUEL-PHOTOBOOTH-lecture-temp.html"
PANDOC = Path(
    r"C:\Users\AAA\AppData\Local\Microsoft\WinGet\Packages"
    r"\JohnMacFarlane.Pandoc_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\pandoc-3.10\pandoc.exe"
)


def main():
    subprocess.run(
        [
            str(PANDOC),
            str(MD),
            "-o",
            str(TEMP),
            "--standalone",
            f"--css=manuel-typography.css",
            "-V",
            "lang=fr",
        ],
        check=True,
    )
    orig = HTML.read_text(encoding="utf-8")
    temp = TEMP.read_text(encoding="utf-8")
    body = re.search(r"<body>(.*)</body>", temp, re.DOTALL).group(1).strip()
    body = re.sub(r"^<h1[^>]*>.*?</h1>\s*", "", body, count=1, flags=re.DOTALL)
    body = re.sub(
        r"^<p><strong>Document réservé.*?</strong>.*?</p>\s*<hr />\s*",
        "",
        body,
        count=1,
        flags=re.DOTALL,
    )
    body = body.replace("<table>", '<div class="doc-table-wrap"><table>')
    body = body.replace("</table>", "</table></div>")

    head_end = orig.find("</head>") + 7
    head = orig[:head_end]
    header = """
    <div class="doc-wrap">
      <article class="doc-surface">
        <header>
          <h1>Manuel utilisateur — Photobooth / Videobooth IAHome</h1>
          <div class="doc-meta">
            <p>
              <strong>Document réservé aux clients</strong> ayant acquis l'offre Photobooth / Videobooth.
              Ne pas diffuser publiquement.
            </p>
            <p>
              <em>Version provisoire — chapitre matériel et détails à compléter ultérieurement.</em><br />
              <strong>Révision : juin 2026.</strong>
            </p>
          </div>
        </header>

        <p class="doc-callout">
          Pour enregistrer en PDF : dans le navigateur, utilisez <strong>Fichier → Imprimer → Enregistrer au format PDF</strong>
          (Chrome, Edge, Safari).
        </p>
"""
    footer = """
        <p class="doc-footer-note">Fin du document — usage, logiciel, matériel, annexe modules IAHome.</p>
      </article>
    </div>
  </body>
</html>
"""
    HTML.write_text(head + "\n  <body>\n" + header + body + footer, encoding="utf-8")
    TEMP.unlink(missing_ok=True)
    print(f"Wrote {HTML}")


if __name__ == "__main__":
    main()
