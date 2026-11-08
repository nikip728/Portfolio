"""Build the one-page CV from its Markdown source using Pandoc and XeLaTeX.

Run from any directory: python3 tmp/pdfs/build_cv.py
Requires pandoc and xelatex on PATH.
"""
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'output/pdf/Papp_Niki_UI_UX_CV.md'
OUTPUT = SOURCE.with_suffix('.pdf')

for command in ('pandoc', 'xelatex'):
    if shutil.which(command) is None:
        raise SystemExit(f'Required command not found: {command}')

subprocess.run([
    'pandoc', str(SOURCE),
    '--from=markdown-smart+autolink_bare_uris',
    '--pdf-engine=xelatex',
    '--variable=papersize:a4',
    '--variable=fontsize:10pt',
    '--variable=geometry:margin=13mm',
    '--variable=mainfont:Arial',
    '--variable=linestretch:1.0',
    '--include-in-header=' + str(Path(__file__).with_name('cv-header.tex')),
    '--output=' + str(OUTPUT),
], check=True, cwd=ROOT)
PUBLIC = ROOT / 'public/documents' / OUTPUT.name
PUBLIC.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(OUTPUT, PUBLIC)
print(OUTPUT)
