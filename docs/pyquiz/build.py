"""Build pyQuiz/index.html from template.html + verified cards. Run from repo root:
python3 -I docs/pyquiz/build.py"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

with tempfile.TemporaryDirectory() as tmp:
    out = os.path.join(tmp, "cards.json")
    r = subprocess.run([sys.executable, "-I", os.path.join(HERE, "cards.py"), out], capture_output=True, text=True)
    sys.stdout.write(r.stdout); sys.stderr.write(r.stderr)
    if r.returncode != 0:
        sys.exit("cards.py failed: not building")
    data = json.load(open(out, encoding="utf-8"))

tpl = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
for ph, key in (("/*TOPICS*/[]", "topics"), ("/*CARDS*/[]", "cards")):
    assert tpl.count(ph) == 1, f"placeholder {ph} must occur exactly once"
    js = json.dumps(data[key], ensure_ascii=False, separators=(",", ":"))
    assert "</" not in js, f"{key} JSON contains '</'"
    tpl = tpl.replace(ph, js)

dest = os.path.join(ROOT, "pyQuiz", "index.html")
open(dest, "w", encoding="utf-8").write(tpl)
print(f"wrote {dest} ({len(tpl)} bytes)")
