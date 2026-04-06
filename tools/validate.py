#!/usr/bin/env python3
"""
Validates artworks.json against i18n.json.

Checks:
  - JSON is valid
  - technique, support, and tag values have a matching key in i18n.json
  - required fields (id) are present

Run manually:  python3 tools/validate.py
Pre-commit:    installed automatically by tools/install-hooks.sh
"""

import json, sys
from pathlib import Path

ROOT      = Path(__file__).parent.parent
ARTWORKS  = ROOT / "data" / "artworks.json"
I18N      = ROOT / "data" / "i18n.json"

errors   = []
warnings = []

def err(msg):  errors.append(f"  ✗ {msg}")
def warn(msg): warnings.append(f"  ⚠ {msg}")

# ---------- Load files ----------
try:
    artworks = json.loads(ARTWORKS.read_text(encoding="utf-8"))
except json.JSONDecodeError as e:
    print(f"\n❌ artworks.json — invalid JSON: {e}\n")
    sys.exit(1)

try:
    i18n = json.loads(I18N.read_text(encoding="utf-8"))
except json.JSONDecodeError as e:
    print(f"\n❌ i18n.json — invalid JSON: {e}\n")
    sys.exit(1)

# Collect all keys across all languages
all_keys = set()
for lang_strings in i18n.values():
    all_keys.update(lang_strings.keys())

# ---------- Validate each artwork ----------
for artwork in artworks:
    id_ = artwork.get("id", "?")
    prefix = f"[{id_}] \"{artwork.get('title') or artwork.get('title_hu', '')}\""

    if not artwork.get("id"):
        err(f"{prefix}: missing 'id' field")

    technique = artwork.get("technique")
    if technique:
        key = f"technique_{technique}"
        if key not in all_keys:
            warn(f"{prefix}: technique \"{technique}\" has no i18n key \"{key}\"")

    support = artwork.get("support")
    if support:
        key = f"support_{support}"
        if key not in all_keys:
            warn(f"{prefix}: support \"{support}\" has no i18n key \"{key}\"")

    for tag in (artwork.get("tags") or []):
        key = f"tag_{tag}"
        if key not in all_keys:
            warn(f"{prefix}: tag \"{tag}\" has no i18n key \"{key}\"")

# ---------- Report ----------
print()
if warnings:
    print(f"⚠  {len(warnings)} warning(s) — values not found in i18n.json:")
    print("\n".join(warnings))
    print()

if errors:
    print(f"❌ {len(errors)} error(s):")
    print("\n".join(errors))
    print()
    sys.exit(1)

if not warnings:
    print("✓  artworks.json looks good — all values found in i18n.json")
else:
    print("Add missing keys to data/i18n.json to remove warnings.")
    # Warnings don't block the commit — only errors do

print()
sys.exit(0)
