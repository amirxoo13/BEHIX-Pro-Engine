#!/usr/bin/env python3
"""Validate or scaffold a 2D/3D Vox-style motion graphics scene recipe.

Enforces the 6 core Vox production rules distilled from the 66-video
Flat Pack FX Vox playlist and Vox explainer references:
1. 3-Color Rule (neutral background, muted structural ink, 1 primary accent)
2. Mixed Frame-Rate Contract (24/30fps camera + 8-12fps stepped boil/cutout)
3. Non-Linear Speed/Value Graph Easing (no raw linear keyframes on hero motion)
4. Null-Rigged 2D/3D Camera Hierarchy (Position Null + Orbit/Rotation Null)
5. Tactile Texture Layering (paper grain, dot/cross grid, or halftone)
6. Tactile SFX Sync (mechanical clicks, paper rustles, marker swipes, bass thuds)
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


DEFAULT_RECIPE_TEMPLATE: dict[str, Any] = {
    "scene_name": "vox_explainer_scene_01",
    "dimension_mode": "2.5d_hybrid",
    "target_stack": "remotion_three_or_blender_or_fusion",
    "timeline": {
        "camera_fps": 24,
        "cutout_posterize_fps": 12,
        "duration_seconds": 12.0,
    },
    "palette": {
        "background_hex": "#F4F1EA",
        "structural_ink_hex": "#1A1A1A",
        "accent_colors_hex": ["#FFF200"],
    },
    "camera_rig": {
        "use_null_controller": True,
        "separate_position_and_rotation_nulls": True,
        "easing_curve": "cubic-bezier(0.16, 1.0, 0.3, 1.0)",
        "depth_of_field_enabled": True,
    },
    "tactile_treatment": {
        "background_grid": "dot_grid",
        "paper_grain_overlay": True,
        "halftone_or_roughen_edges": True,
    },
    "audio_cues": [
        {"time_sec": 0.2, "type": "paper_unfold", "target": "background_map_reveal"},
        {"time_sec": 1.4, "type": "marker_swipe", "target": "yellow_highlight_bar"},
        {"time_sec": 3.0, "type": "camera_whoosh_soft", "target": "camera_zoom_to_region"},
    ],
}


def validate_recipe(recipe: dict[str, Any]) -> dict[str, Any]:
    """Validate a scene recipe dictionary against the 6 Vox production rules."""
    errors: list[str] = []
    warnings: list[str] = []
    checks: dict[str, bool] = {}

    # 1. Dimension mode check
    dim_mode = recipe.get("dimension_mode", "")
    valid_modes = {"2d", "2.5d_hybrid", "3d"}
    if dim_mode not in valid_modes:
        errors.append(
            f"dimension_mode must be one of {sorted(valid_modes)}, got '{dim_mode}'."
        )

    # 2. Color discipline (3-Color Rule)
    palette = recipe.get("palette", {})
    bg_hex = palette.get("background_hex")
    ink_hex = palette.get("structural_ink_hex")
    accents = palette.get("accent_colors_hex", [])
    if not bg_hex or not ink_hex:
        errors.append("palette must define both 'background_hex' and 'structural_ink_hex'.")
        checks["three_color_rule"] = False
    elif not isinstance(accents, list) or len(accents) == 0:
        errors.append("palette.accent_colors_hex must contain at least 1 high-contrast accent color.")
        checks["three_color_rule"] = False
    elif len(accents) > 2:
        errors.append(
            f"Vox 3-Color Rule violation: found {len(accents)} accent colors; maximum is 1 primary (+1 optional secondary comparison accent)."
        )
        checks["three_color_rule"] = False
    else:
        if len(accents) == 2:
            warnings.append(
                "Using 2 accent colors: ensure the second accent is strictly for A-vs-B data comparison."
            )
        checks["three_color_rule"] = True

    # 3. Mixed Frame-Rate Contract
    timeline = recipe.get("timeline", {})
    cam_fps = timeline.get("camera_fps", 0)
    cutout_fps = timeline.get("cutout_posterize_fps", 0)
    if cam_fps not in (24, 25, 30, 60):
        errors.append(f"timeline.camera_fps should be 24, 25, 30, or 60 (got {cam_fps}).")
        checks["mixed_framerate_contract"] = False
    elif not (6 <= cutout_fps <= 15):
        errors.append(
            f"timeline.cutout_posterize_fps must be between 6 and 15 fps (typically 8-12 fps) for tactile stop-motion feel (got {cutout_fps})."
        )
        checks["mixed_framerate_contract"] = False
    else:
        checks["mixed_framerate_contract"] = True

    # 4. Null-Rigged Camera & Non-Linear Easing
    camera_rig = recipe.get("camera_rig", {})
    use_null = bool(camera_rig.get("use_null_controller"))
    sep_nulls = bool(camera_rig.get("separate_position_and_rotation_nulls"))
    easing = str(camera_rig.get("easing_curve", "")).strip().lower()

    if not use_null or not sep_nulls:
        errors.append(
            "camera_rig must set both 'use_null_controller' and 'separate_position_and_rotation_nulls' to true."
        )
        checks["null_rigged_camera"] = False
    else:
        checks["null_rigged_camera"] = True

    if not easing or easing == "linear":
        errors.append(
            "camera_rig.easing_curve cannot be empty or 'linear'. Use strong ease-out/ease-in-out (e.g., 'cubic-bezier(0.16, 1.0, 0.3, 1.0)')."
        )
        checks["nonlinear_easing"] = False
    else:
        checks["nonlinear_easing"] = True

    # 5. Tactile Texture Layering
    tactile = recipe.get("tactile_treatment", {})
    has_grid = tactile.get("background_grid") in {"dot_grid", "cross_grid", "line_grid"}
    has_grain = bool(tactile.get("paper_grain_overlay"))
    has_edges = bool(tactile.get("halftone_or_roughen_edges"))
    if not (has_grid or has_grain or has_edges):
        errors.append(
            "tactile_treatment must enable at least one of 'background_grid', 'paper_grain_overlay', or 'halftone_or_roughen_edges'."
        )
        checks["tactile_layering"] = False
    else:
        checks["tactile_layering"] = True

    # 6. Audio-Visual Sync
    audio_cues = recipe.get("audio_cues", [])
    if not isinstance(audio_cues, list) or len(audio_cues) == 0:
        errors.append(
            "audio_cues must contain at least 1 tactile sound design event (paper rustle, marker swipe, click, whoosh)."
        )
        checks["tactile_audio_sync"] = False
    else:
        checks["tactile_audio_sync"] = True

    return {
        "valid": len(errors) == 0,
        "checks": checks,
        "errors": errors,
        "warnings": warnings,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Validate or initialize a 2D/3D Vox-style motion graphics scene recipe."
    )
    parser.add_argument(
        "--recipe",
        type=Path,
        help="Path to an existing JSON recipe file to validate.",
    )
    parser.add_argument(
        "--init-template",
        type=Path,
        help="Write a starter Vox scene recipe JSON to this path.",
    )
    args = parser.parse_args(argv)

    if args.init_template:
        args.init_template.parent.mkdir(parents=True, exist_ok=True)
        args.init_template.write_text(
            json.dumps(DEFAULT_RECIPE_TEMPLATE, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(
            json.dumps(
                {"status": "created", "path": str(args.init_template)},
                indent=2,
                ensure_ascii=False,
            )
        )
        return 0

    if not args.recipe:
        parser.error("Provide either --recipe <path> or --init-template <path>.")

    recipe_data = json.loads(args.recipe.read_text(encoding="utf-8"))
    result = validate_recipe(recipe_data)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
