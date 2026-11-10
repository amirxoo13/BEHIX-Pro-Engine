#!/usr/bin/env python3
"""Generate procedural Vox-style 2D/3D textures, SVG patterns, and color palettes.

Creates zero-dependency SVG assets (dot grid, cross-mark grid, diagonal hatch,
halftone/paper grain filter) and a JSON color palette tokens file ready for
Blender, DaVinci Resolve/Fusion, or Remotion + Three.js.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


VOX_PALETTES: dict[str, dict[str, str]] = {
    "editorial_light": {
        "name": "Vox Editorial Warm Paper (Default)",
        "background_primary": "#F4F1EA",
        "background_secondary": "#EAE5DC",
        "ink_primary": "#1A1A1A",
        "ink_muted": "#7A766E",
        "grid_subtle": "#D6D0C4",
        "accent_primary": "#FFF200",
        "accent_secondary": "#E63946",
        "accent_tertiary": "#2B59C3",
    },
    "dark_geopolitical": {
        "name": "Vox Dark Geopolitical & Intelligence Map",
        "background_primary": "#11161D",
        "background_secondary": "#1B222C",
        "ink_primary": "#F5F7FA",
        "ink_muted": "#5E6A78",
        "grid_subtle": "#26303D",
        "accent_primary": "#FFCC00",
        "accent_secondary": "#FF5A36",
        "accent_tertiary": "#00D4B2",
    },
    "archival_blueprint": {
        "name": "Vox Engineering & Historical Blueprint",
        "background_primary": "#1A365D",
        "background_secondary": "#152C4E",
        "ink_primary": "#EDF2F7",
        "ink_muted": "#90CDF4",
        "grid_subtle": "#2B4C7E",
        "accent_primary": "#F6E05E",
        "accent_secondary": "#FC8181",
        "accent_tertiary": "#63B3ED",
    },
    "high_contrast_ink": {
        "name": "Vox Charcoal & Highlighter Cutout",
        "background_primary": "#181818",
        "background_secondary": "#242424",
        "ink_primary": "#F2EFE9",
        "ink_muted": "#8C8881",
        "grid_subtle": "#333333",
        "accent_primary": "#FF5A1F",
        "accent_secondary": "#FFF200",
        "accent_tertiary": "#38BDF8",
    },
}


def build_dot_grid_svg(
    width: int = 1920,
    height: int = 1080,
    spacing: int = 40,
    dot_radius: float = 1.5,
    bg_color: str = "#F4F1EA",
    dot_color: str = "#7A766E",
    dot_opacity: float = 0.28,
) -> str:
    """Return an SVG string with a Vox-style background and repeating dot grid."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <pattern id="vox-dot-grid" width="{spacing}" height="{spacing}" patternUnits="userSpaceOnUse">
      <circle cx="{spacing / 2:.1f}" cy="{spacing / 2:.1f}" r="{dot_radius}" fill="{dot_color}" fill-opacity="{dot_opacity}" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="{bg_color}" />
  <rect width="100%" height="100%" fill="url(#vox-dot-grid)" />
</svg>
"""


def build_cross_grid_svg(
    width: int = 1920,
    height: int = 1080,
    spacing: int = 80,
    cross_size: int = 8,
    bg_color: str = "#11161D",
    stroke_color: str = "#5E6A78",
    stroke_opacity: float = 0.35,
) -> str:
    """Return an SVG string with a technical cross-hair reference grid."""
    half = spacing / 2.0
    arm = cross_size / 2.0
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <pattern id="vox-cross-grid" width="{spacing}" height="{spacing}" patternUnits="userSpaceOnUse">
      <path d="M {half - arm:.1f} {half:.1f} L {half + arm:.1f} {half:.1f} M {half:.1f} {half - arm:.1f} L {half:.1f} {half + arm:.1f}"
            stroke="{stroke_color}" stroke-width="1.2" stroke-opacity="{stroke_opacity}" stroke-linecap="square" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="{bg_color}" />
  <rect width="100%" height="100%" fill="url(#vox-cross-grid)" />
</svg>
"""


def build_diagonal_hatch_svg(
    width: int = 1920,
    height: int = 1080,
    spacing: int = 16,
    stroke_width: float = 2.0,
    stroke_color: str = "#E63946",
    stroke_opacity: float = 0.45,
) -> str:
    """Return a transparent SVG with a 45-degree diagonal hatch pattern for maps and bar charts."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <pattern id="vox-diagonal-hatch" width="{spacing}" height="{spacing}" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="{spacing}" stroke="{stroke_color}" stroke-width="{stroke_width}" stroke-opacity="{stroke_opacity}" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#vox-diagonal-hatch)" />
</svg>
"""


def build_paper_grain_svg(
    width: int = 1920,
    height: int = 1080,
    base_frequency: float = 0.75,
    octaves: int = 3,
    opacity: float = 0.08,
) -> str:
    """Return an SVG tactile paper-grain overlay using feTurbulence."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <defs>
    <filter id="vox-paper-grain" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="{base_frequency}" numOctaves="{octaves}" stitchTiles="stitch" result="noise" />
      <feColorMatrix type="saturate" values="0" in="noise" result="monoNoise" />
      <feComponentTransfer in="monoNoise" result="grain">
        <feFuncA type="linear" slope="{opacity}" />
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="100%" height="100%" filter="url(#vox-paper-grain)" />
</svg>
"""


def generate_vox_asset_pack(
    output_dir: Path,
    palette_id: str = "editorial_light",
    width: int = 1920,
    height: int = 1080,
) -> dict[str, Any]:
    """Generate a full Vox asset kit into output_dir and return metadata."""
    if palette_id not in VOX_PALETTES:
        raise ValueError(
            f"Unknown palette_id '{palette_id}'. Valid options: {sorted(VOX_PALETTES.keys())}"
        )

    palette = VOX_PALETTES[palette_id]
    output_dir.mkdir(parents=True, exist_ok=True)

    files_written: dict[str, str] = {}

    palette_path = output_dir / "vox_palettes.json"
    palette_path.write_text(
        json.dumps(
            {
                "active_palette": palette_id,
                "active_tokens": palette,
                "all_palettes": VOX_PALETTES,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    files_written["palette_json"] = str(palette_path)

    dot_grid_path = output_dir / "vox_dot_grid.svg"
    dot_grid_path.write_text(
        build_dot_grid_svg(
            width=width,
            height=height,
            bg_color=palette["background_primary"],
            dot_color=palette["ink_muted"],
        ),
        encoding="utf-8",
    )
    files_written["dot_grid_svg"] = str(dot_grid_path)

    cross_grid_path = output_dir / "vox_cross_grid.svg"
    cross_grid_path.write_text(
        build_cross_grid_svg(
            width=width,
            height=height,
            bg_color=palette["background_primary"],
            stroke_color=palette["ink_muted"],
        ),
        encoding="utf-8",
    )
    files_written["cross_grid_svg"] = str(cross_grid_path)

    hatch_path = output_dir / "vox_diagonal_hatch.svg"
    hatch_path.write_text(
        build_diagonal_hatch_svg(
            width=width,
            height=height,
            stroke_color=palette["accent_secondary"],
        ),
        encoding="utf-8",
    )
    files_written["diagonal_hatch_svg"] = str(hatch_path)

    grain_path = output_dir / "vox_paper_grain_overlay.svg"
    grain_path.write_text(
        build_paper_grain_svg(width=width, height=height),
        encoding="utf-8",
    )
    files_written["paper_grain_svg"] = str(grain_path)

    return {
        "palette_id": palette_id,
        "resolution": {"width": width, "height": height},
        "files": files_written,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate Vox-style SVG background grids, hatches, grain overlays, and color palettes."
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        required=True,
        help="Target directory for generated SVG and JSON assets.",
    )
    parser.add_argument(
        "--palette",
        default="editorial_light",
        choices=sorted(VOX_PALETTES.keys()),
        help="Color palette preset to use.",
    )
    parser.add_argument("--width", type=int, default=1920, help="Canvas width in pixels.")
    parser.add_argument("--height", type=int, default=1080, help="Canvas height in pixels.")
    args = parser.parse_args(argv)

    result = generate_vox_asset_pack(
        output_dir=args.output_dir,
        palette_id=args.palette,
        width=args.width,
        height=args.height,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
