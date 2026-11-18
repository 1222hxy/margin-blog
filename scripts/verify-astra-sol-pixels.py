from hashlib import sha256
import json
from pathlib import Path
import sys

from PIL import Image, ImageChops

root = Path(sys.argv[1] if len(sys.argv) > 1 else "artifacts/astra-sol-comparison")
mode = sys.argv[2] if len(sys.argv) > 2 else "default"
if mode not in ("default", "slide"):
    sys.exit(f"Unknown comparison mode: {mode}")
slide = mode == "slide"
rounds = 4
viewports = [(1600, 844)] if slide else [(1440, 1000), (390, 844)]
states = ("slide-image",) if slide else ("benchmark", "science-tabs", "carousel")


def diff(a, b):
    with Image.open(a) as x, Image.open(b) as y:
        if x.size != y.size:
            raise ValueError(f"Screenshot size mismatch: {a} vs {b}")
        red, green, blue = ImageChops.difference(x.convert("RGB"), y.convert("RGB")).split()
        return x.width * x.height - ImageChops.lighter(ImageChops.lighter(red, green), blue).histogram()[0]


rows = []
for width, _ in viewports:
    for state in states:
        shots = {
            side: [root / f"{width}-{state}-{side}-{i}.png" for i in range(rounds)]
            for side in ("reference", "blog")
        }
        row = {
            "width": width,
            "state": state,
            "cross": [diff(a, b) for a, b in zip(shots["blog"], shots["reference"])],
            "self": {side: [diff(files[0], shot) for shot in files[1:]] for side, files in shots.items()},
        }
        if slide:
            with Image.open(shots["reference"][0]) as frame:
                row["cropSize"] = frame.size
            row["pngSha256"] = {
                side: [sha256(shot.read_bytes()).hexdigest() for shot in files]
                for side, files in shots.items()
            }
        rows.append(row)

name = "astra-sol-slide-pixels.json" if slide else "astra-sol-pixels.json"
report = {"roundsPerSide": rounds, "viewports": viewports, "states": rows}
Path("docs/themes", name).write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")
print(json.dumps(rows))
sys.exit(int(any(any(r["cross"]) or any(any(v) for v in r["self"].values()) for r in rows)))
