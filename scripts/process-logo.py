#!/usr/bin/env python3
"""
Traite le logo NODE.47 fourni par l'utilisateur :
1. Extrait le symbole « 47 » (nœuds réseau) du fond bleu marine → PNG transparent
2. Génère le favicon 512×512 (fond marine arrondi + symbole)
3. Génère une variante claire du fond (header light) non nécessaire : le vert passe sur les deux thèmes
Sorties :
  /tmp/my-project/public/mark.png        (symbole transparent, hauteur 240)
  /tmp/my-project/src/app/icon.png       (favicon 512)
  /home/z/my-project/scripts/logo-out/   (miroir + aperçus)
"""
import os
import numpy as np
from PIL import Image, ImageDraw

SRC = "/home/z/my-project/upload/Logo réseau néon NODE.47.png"
OUT_DIR = "/home/z/my-project/scripts/logo-out"
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC).convert("RGB")
W, H = img.size
print(f"Image source : {W}x{H}")
a = np.asarray(img).astype(np.float32)

# ---- 1. Couleur de fond (médiane des 4 coins 24x24) ----
corners = np.concatenate([
    a[:24, :24].reshape(-1, 3), a[:24, -24:].reshape(-1, 3),
    a[-24:, :24].reshape(-1, 3), a[-24:, -24:].reshape(-1, 3),
])
bg = np.median(corners, axis=0)
print(f"Fond échantillonné : RGB({bg[0]:.0f},{bg[1]:.0f},{bg[2]:.0f}) = #{int(bg[0]):02X}{int(bg[1]):02X}{int(bg[2]):02X}")

# ---- 2. Couleur verte de référence (pixels les plus « verts ») ----
r, g, b = a[..., 0], a[..., 1], a[..., 2]
greenness = g - np.maximum(r, b)
green_sel = greenness > np.percentile(greenness, 99)
green = np.median(a[green_sel], axis=0)
print(f"Vert de marque     : RGB({green[0]:.0f},{green[1]:.0f},{green[2]:.0f}) = #{int(green[0]):02X}{int(green[1]):02X}{int(green[2]):02X}")

# ---- 3. Masque alpha par distance au fond ----
dist = np.linalg.norm(a - bg, axis=2)
d_max = np.linalg.norm(green - bg)
dn = dist / d_max
alpha = np.clip((dn - 0.16) / (0.42 - 0.16), 0.0, 1.0)
# douceur des bords (smoothstep)
alpha = alpha * alpha * (3 - 2 * alpha)

# ---- 4. Détection de la zone du symbole (au-dessus du texte) ----
rows = np.where(alpha.max(axis=1) > 0.5)[0]
# groupe de lignes contiguës
groups, start = [], rows[0]
for i in range(1, len(rows)):
    if rows[i] != rows[i - 1] + 1:
        groups.append((start, rows[i - 1]))
        start = rows[i]
groups.append((start, rows[-1]))
print("Groupes de lignes (alpha>0.5) :", groups)
# le symbole = groupe le plus haut significatif (évite le texte en bas)
mark_top, mark_bottom = None, None
for gtop, gbot in groups:
    if gbot - gtop > H * 0.15:  # groupe principal haut
        mark_top, mark_bottom = gtop, gbot
        break
if mark_top is None:
    mark_top, mark_bottom = groups[0]
# bornes horizontales dans cette bande
band = alpha[mark_top:mark_bottom + 1]
cols = np.where(band.max(axis=0) > 0.5)[0]
mark_left, mark_right = cols[0], cols[-1]
pad = 6
top, left = max(0, mark_top - pad), max(0, mark_left - pad)
bot, right = min(H, mark_bottom + pad + 1), min(W, mark_right + pad + 1)
print(f"Symbole détecté : x[{mark_left}:{mark_right}] y[{mark_top}:{mark_bottom}]")

# ---- 5. Découpe + aplatissement sur le vert de marque ----
mark_a = alpha[top:bot, left:right]
h, w = mark_a.shape
mark_rgb = np.zeros((h, w, 3), dtype=np.float32)
mark_rgb[..., 0], mark_rgb[..., 1], mark_rgb[..., 2] = green
out = np.dstack([mark_rgb, mark_a[..., None] * 255.0]).astype(np.uint8)
mark_img = Image.fromarray(out, "RGBA")

# recadrage carré centré (pour un rendu équilibré dans un conteneur rond/carré)
side = max(h, w) + 24
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(mark_img, ((side - w) // 2, (side - h) // 2), mark_img)

# ---- 6. Export : mark.png (transparent, hauteur 240) ----
scale = 240 / side
mark_small = sq.resize((int(side * scale), 240), Image.LANCZOS)
mark_small.save(os.path.join(OUT_DIR, "mark.png"))
mark_small.save("/tmp/my-project/public/mark.png")
print("→ public/mark.png (symbole transparent)")

# ---- 7. Favicon 512 : fond marine arrondi + symbole centré ----
FAV = 512
fav = Image.new("RGBA", (FAV, FAV), (0, 0, 0, 0))
d = ImageDraw.Draw(fav)
radius = 112
d.rounded_rectangle([0, 0, FAV - 1, FAV - 1], radius=radius,
                    fill=(int(bg[0]), int(bg[1]), int(bg[2]), 255))
# léger liseré vert (clin d'œil au glow)
d.rounded_rectangle([2, 2, FAV - 3, FAV - 3], radius=radius - 2,
                    outline=(int(green[0]), int(green[1]), int(green[2]), 90), width=4)
mark_big = sq.resize((FAV - 128, FAV - 128), Image.LANCZOS)
fav.paste(mark_big, (64, 64), mark_big)
fav.save(os.path.join(OUT_DIR, "icon-512.png"))
fav.save("/tmp/my-project/src/app/icon.png")
print("→ src/app/icon.png (favicon 512)")

# ---- 8. Aperçu de contrôle : symbole sur fond clair + sombre ----
for name, col in (("apercu-clair", (246, 248, 250)), ("apercu-sombre", (10, 14, 26))):
    prev = Image.new("RGBA", (300, 300), (*col, 255))
    p = mark_small.resize((240, 240), Image.LANCZOS)
    prev.paste(p, (30, 30), p)
    prev.convert("RGB").save(os.path.join(OUT_DIR, f"{name}.png"))
print("→ aperçus clair/sombre générés")
print("TERMINÉ")
