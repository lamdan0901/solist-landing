# usage: python -I tools/fonts.py   (needs network)
import os, re, urllib.request
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "fonts")
URL = ("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700"
       "&family=Be+Vietnam+Pro:wght@400;600;700&display=swap")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA)).read()
os.makedirs(ROOT, exist_ok=True)
css = get(URL).decode()
out, done = [], {}
for subset, body in re.findall(r"/\* ([\w-]+) \*/\s*@font-face \{(.*?)\}", css, re.S):
    if subset not in ("vietnamese", "latin"):
        continue
    fam = re.search(r"font-family: '([^']+)'", body).group(1)
    wt = re.search(r"font-weight: ([\d ]+);", body).group(1).replace(" ", "-")
    u = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
    if u not in done:
        done[u] = f"{fam.replace(' ', '-').lower()}-{subset}-{wt}.woff2"
        open(os.path.join(ROOT, done[u]), "wb").write(get(u))
    out.append(re.sub(r"url\([^)]+\)", f"url({done[u]})", "@font-face {" + body + "}"))
open(os.path.join(ROOT, "fonts.css"), "w", encoding="utf-8").write("\n".join(out))
print(len(done), "files,", len(out), "faces")
