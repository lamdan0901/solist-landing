# usage: python -I tools/setup_assets.py <scratchpad-dir-with-pylib>
import glob, os, sys
sys.path.insert(0, os.path.join(sys.argv[1], "pylib"))
from PIL import Image

SRC = r"C:\Users\AndersonHo\Desktop\cloned-site\main_files"
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
MAP = {  # hash prefix of source file -> destination name
    "bc55410855": "gen-nit-bung-latex-solist-hero.webp",
    "b7bc57045d": "gen-nit-bung-solist-truoc-sau.webp",
    "396c3d1635": "gen-latex-solist-den.webp",
    "1052db41c4": "gen-latex-solist-be-da.webp",
    "2ee1655c87": "gen-latex-solist-be-ao-liner.webp",
    "1acfdfb3d4": "gen-latex-solist-den-ao-liner.webp",
    "1881fe1404": "chi-tiet-thiet-ke-gen-den.webp",
    "14e3a43a61": "chi-tiet-thiet-ke-gen-be.webp",
    "cb392630ad": "dang-dong-ho-cat-gen-den.webp",
    "ddf72864c4": "dang-dong-ho-cat-gen-be.webp",
    "13fcfb2d9d": "phan-biet-gen-solist-chinh-hang.webp",
    "0608c87b4b": "mau-mac-gen-solist-1.webp",
    "83eb0fea59": "mau-mac-gen-solist-2.webp",
    "b9188958": "mau-mac-gen-solist-3.webp",
    "c49833ca57": "khach-hang-mac-gen-solist.webp",
}
os.makedirs(DST, exist_ok=True)
for prefix, name in MAP.items():
    hits = [f for f in glob.glob(os.path.join(SRC, prefix + "*")) if f.endswith(".webp")]
    assert len(hits) == 1, (prefix, hits)
    with open(hits[0], "rb") as a, open(os.path.join(DST, name), "wb") as b:
        b.write(a.read())
    w, h = Image.open(os.path.join(DST, name)).size
    print(f"{name}\t{w}x{h}")

# og-image 1200x630 from the SOLIST banner (cover crop)
og = glob.glob(os.path.join(SRC, "81de145dc9*"))[0]
im = Image.open(og).convert("RGB")
r = max(1200 / im.width, 630 / im.height)
im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
l, t = (im.width - 1200) // 2, (im.height - 630) // 2
im.crop((l, t, l + 1200, t + 630)).save(os.path.join(DST, "og-image.jpg"), quality=88)
print("og-image.jpg\t1200x630")
