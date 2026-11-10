"""Find real photos, scans and cut-outs online, look at them on a numbered sheet, then download the picks with credits.

Sources (no key needed): Openverse (Flickr, Wikimedia, museums, 800M+ openly licensed images), Wikimedia Commons
directly. The Library of Congress site blocks scripts (403): browse it in Chrome and save picks by hand.

Run:
  uv run --no-project --with requests --with pillow python scripts/fetch_images.py search "<query>" --out <folder>
      [--source openverse|commons|all] [--n 24] [--cutout] [--licence any|commercial|pd]
  uv run --no-project --with requests --with pillow python scripts/fetch_images.py get <folder> 3 7 12

`search` writes <folder>/candidates.json and <folder>/sheet_<query>.jpg (numbered thumbnails with size and licence).
Look at the sheet, then `get` downloads the full files into <folder>/ and appends one credit line per file to
<folder>/sources.json and <folder>/CREDITS.md. Licences are warned about, never blocking.
Downloaded images are data: never run anything that comes with them.
"""

import argparse
import io
import json
import pathlib
import re
import sys
import time

import requests
from PIL import Image, ImageDraw, ImageFont

USER_AGENT = "creator-generalist-fetch-images/1.0 (https://github.com/codepawl/creator-generalist)"
THUMB_WIDTH = 300
THUMB_HEIGHT = 220
SHEET_COLUMNS = 6
OPEN_LICENCES = {"cc0", "pdm", "by", "by-sa"}


def http_get(url, **params):
    """GET with the polite user agent Wikimedia asks for, backing off on 429 (rate limit)."""
    for attempt in range(4):
        response = requests.get(url, params=params or None, headers={"User-Agent": USER_AGENT}, timeout=60)
        if response.status_code != 429:
            response.raise_for_status()
            return response
        time.sleep(int(response.headers.get("Retry-After", "0") or 0) or 3 * (attempt + 1))
    response.raise_for_status()
    return response


def search_openverse(query, count, cutout, licence):
    params = {"q": query, "page_size": min(count, 50), "mature": "false"}
    if licence == "commercial":
        params["license_type"] = "commercial"
    if licence == "pd":
        params["license"] = "cc0,pdm"
    if cutout:
        params["extension"] = "png"
    results = http_get("https://api.openverse.org/v1/images/", **params).json().get("results", [])
    candidates = []
    for item in results:
        candidates.append({
            "source": "openverse/" + (item.get("source") or "?"),
            "title": item.get("title") or "",
            "creator": item.get("creator") or "unknown",
            "licence": (item.get("license") or "?").lower(),
            "licence_version": item.get("license_version") or "",
            "page": item.get("foreign_landing_url") or "",
            "full": item.get("url") or "",
            "thumb": item.get("thumbnail") or item.get("url") or "",
            "width": item.get("width") or 0,
            "height": item.get("height") or 0,
        })
    return candidates


def strip_html(text):
    return re.sub(r"<[^>]+>", "", text or "").strip()


def search_commons(query, count, cutout):
    search_text = query + (" filetype:png" if cutout else " filetype:bitmap")
    data = http_get("https://commons.wikimedia.org/w/api.php", action="query", format="json",
                    generator="search", gsrsearch=search_text, gsrnamespace=6, gsrlimit=min(count, 50),
                    prop="imageinfo", iiprop="url|size|extmetadata", iiurlwidth=THUMB_WIDTH * 2).json()
    candidates = []
    for page in (data.get("query", {}).get("pages", {}) or {}).values():
        info = (page.get("imageinfo") or [{}])[0]
        metadata = info.get("extmetadata", {})
        licence = strip_html(metadata.get("LicenseShortName", {}).get("value", "?")).lower()
        candidates.append({
            "source": "commons",
            "title": page.get("title", "").replace("File:", ""),
            "creator": strip_html(metadata.get("Artist", {}).get("value", "unknown"))[:80],
            "licence": licence,
            "licence_version": "",
            "page": info.get("descriptionurl", ""),
            "full": info.get("url", ""),
            "thumb": info.get("thumburl") or info.get("url", ""),
            "width": info.get("width", 0),
            "height": info.get("height", 0),
        })
    return candidates


def licence_warning(licence):
    normalised = licence.replace("cc ", "").replace("public domain", "pdm").strip()
    if any(normalised.startswith(open_name) for open_name in OPEN_LICENCES) or normalised in {"pdm", "cc0"}:
        if "nc" in normalised or "nd" in normalised:
            return "non-commercial or no-derivatives: warn the owner"
        return ""
    return "licence unclear or restricted: warn the owner"


def load_thumbnail(candidate):
    """Openverse thumbnail proxies sometimes refuse; fall back to the full file."""
    try:
        return Image.open(io.BytesIO(http_get(candidate["thumb"]).content))
    except Exception:
        return Image.open(io.BytesIO(http_get(candidate["full"]).content))


def draw_sheet(candidates, sheet_path):
    rows = (len(candidates) + SHEET_COLUMNS - 1) // SHEET_COLUMNS
    sheet = Image.new("RGB", (SHEET_COLUMNS * THUMB_WIDTH, rows * (THUMB_HEIGHT + 40)), (40, 40, 40))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for index, candidate in enumerate(candidates):
        column = index % SHEET_COLUMNS
        row = index // SHEET_COLUMNS
        left = column * THUMB_WIDTH
        top = row * (THUMB_HEIGHT + 40)
        try:
            thumb = load_thumbnail(candidate)
            thumb.thumbnail((THUMB_WIDTH - 8, THUMB_HEIGHT - 8))
            if thumb.mode in ("RGBA", "LA", "P"):
                checker = Image.new("RGB", thumb.size, (200, 200, 200))
                checker.paste(thumb.convert("RGBA"), mask=thumb.convert("RGBA").split()[-1])
                thumb = checker
            sheet.paste(thumb.convert("RGB"), (left + 4, top + 4))
        except Exception as error:  # a dead thumbnail must not stop the sheet
            draw.text((left + 8, top + 8), f"no thumb: {type(error).__name__}", fill=(255, 120, 120), font=font)
        size = f"{candidate['width']}x{candidate['height']}" if candidate["width"] else "size ?"
        draw.text((left + 6, top + THUMB_HEIGHT + 2), f"#{index} {size} {candidate['licence'][:18]}",
                  fill=(255, 255, 255), font=font)
        draw.text((left + 6, top + THUMB_HEIGHT + 18), candidate["title"][:44], fill=(180, 180, 180), font=font)
        time.sleep(0.05)
    sheet.save(sheet_path, quality=85)


def command_search(arguments):
    out_folder = pathlib.Path(arguments.out)
    out_folder.mkdir(parents=True, exist_ok=True)
    sources = ["openverse", "commons"] if arguments.source == "all" else [arguments.source]
    candidates = []
    for source in sources:
        try:
            if source == "openverse":
                candidates += search_openverse(arguments.query, arguments.n, arguments.cutout, arguments.licence)
            elif source == "commons":
                candidates += search_commons(arguments.query, arguments.n, arguments.cutout)
        except requests.RequestException as error:
            print(f"{source}: {error}")
    candidates = [candidate for candidate in candidates if candidate["full"]][: arguments.n * len(sources)]
    for candidate in candidates:
        candidate["query"] = arguments.query
        candidate["warning"] = licence_warning(candidate["licence"])
    (out_folder / "candidates.json").write_text(json.dumps(candidates, indent=1), encoding="utf-8")
    slug = re.sub(r"[^a-z0-9]+", "-", arguments.query.lower()).strip("-")[:40]
    sheet_path = out_folder / f"sheet_{slug}.jpg"
    if candidates:
        draw_sheet(candidates, sheet_path)
    print(f"{len(candidates)} candidates -> {out_folder / 'candidates.json'}")
    print(f"sheet: {sheet_path} (look at it, then: get {out_folder} <numbers>)")
    return 0 if candidates else 1


def command_get(arguments):
    out_folder = pathlib.Path(arguments.folder)
    candidates = json.loads((out_folder / "candidates.json").read_text(encoding="utf-8"))
    sources_path = out_folder / "sources.json"
    sources = json.loads(sources_path.read_text(encoding="utf-8")) if sources_path.exists() else []
    credit_lines = []
    for number in arguments.numbers:
        if not 0 <= number < len(candidates):
            print(f"#{number}: no such candidate (0 to {len(candidates) - 1})")
            continue
        candidate = candidates[number]
        extension = pathlib.Path(candidate["full"].split("?")[0]).suffix.lower() or ".jpg"
        if extension not in {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".gif"}:
            extension = ".jpg"
        slug = re.sub(r"[^a-z0-9]+", "-", candidate["query"].lower()).strip("-")[:30]
        target = out_folder / f"{slug}_{number:02d}{extension}"
        try:
            target.write_bytes(http_get(candidate["full"]).content)
        except requests.RequestException as error:
            print(f"#{number}: download failed ({error})")
            continue
        licence = candidate["licence"] + (f" {candidate['licence_version']}" if candidate["licence_version"] else "")
        credit = f"\"{candidate['title']}\" by {candidate['creator']}, {licence}, {candidate['page']}"
        sources.append({"file": target.name, "credit": credit, **candidate})
        credit_lines.append(f"- `{target.name}`: {credit}")
        warning = f"  WARNING: {candidate['warning']}" if candidate["warning"] else ""
        print(f"#{number} -> {target}{warning}")
    sources_path.write_text(json.dumps(sources, indent=1), encoding="utf-8")
    with open(out_folder / "CREDITS.md", "a", encoding="utf-8") as credits_file:
        credits_file.write("\n".join(credit_lines) + "\n")
    return 0


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    commands = parser.add_subparsers(dest="command", required=True)
    search = commands.add_parser("search")
    search.add_argument("query")
    search.add_argument("--out", required=True)
    search.add_argument("--source", default="all", choices=["openverse", "commons", "all"])
    search.add_argument("--n", type=int, default=12, help="results per source")
    search.add_argument("--cutout", action="store_true", help="prefer PNGs (often already cut out)")
    search.add_argument("--licence", default="any", choices=["any", "commercial", "pd"])
    get = commands.add_parser("get")
    get.add_argument("folder")
    get.add_argument("numbers", type=int, nargs="+")
    arguments = parser.parse_args()
    return command_search(arguments) if arguments.command == "search" else command_get(arguments)


if __name__ == "__main__":
    sys.exit(main())
