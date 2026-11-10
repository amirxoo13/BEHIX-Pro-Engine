#!/usr/bin/env python3
"""Unit tests for 2d-generalist skill scripts and structure."""

from __future__ import annotations

import copy
import json
import tempfile
import unittest
from pathlib import Path

import check_vox_toolchain
import generate_vox_assets
import validate_vox_recipe


SKILL_ROOT = Path(__file__).resolve().parent.parent


class TestVoxSkillStructure(unittest.TestCase):
    def test_skill_md_line_limit_and_frontmatter(self) -> None:
        skill_md = SKILL_ROOT / "SKILL.md"
        self.assertTrue(skill_md.is_file(), "SKILL.md must exist")
        lines = skill_md.read_text(encoding="utf-8").splitlines()
        self.assertLessEqual(
            len(lines),
            100,
            f"SKILL.md must be <= 100 lines, got {len(lines)}",
        )
        self.assertEqual(lines[0], "---")
        self.assertTrue(any(line.startswith("name: 2d-generalist") for line in lines))

    def test_references_and_openai_yaml_exist(self) -> None:
        expected_files = [
            SKILL_ROOT / "agents" / "openai.yaml",
            SKILL_ROOT / "references" / "vox-psychology-and-design.md",
            SKILL_ROOT / "references" / "2d-3d-toolchain-matrix.md",
            SKILL_ROOT / "references" / "maps-and-geodata-2d-3d.md",
            SKILL_ROOT / "references" / "charts-timelines-and-data.md",
            SKILL_ROOT / "references" / "archival-collage-and-camera.md",
        ]
        for path in expected_files:
            self.assertTrue(path.is_file(), f"Missing expected skill file: {path}")


class TestToolchainAudit(unittest.TestCase):
    def test_audit_toolchain_returns_valid_schema(self) -> None:
        report = check_vox_toolchain.audit_toolchain()
        self.assertIn("summary", report)
        self.assertIn("recommended_stacks", report)
        self.assertIn("installed", report)
        self.assertIn("missing_optional", report)
        self.assertGreaterEqual(report["summary"]["installed_count"], 1)


class TestGenerateVoxAssets(unittest.TestCase):
    def test_generate_vox_asset_pack_creates_svgs_and_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out_dir = Path(tmp) / "assets"
            meta = generate_vox_assets.generate_vox_asset_pack(
                output_dir=out_dir,
                palette_id="dark_geopolitical",
                width=1280,
                height=720,
            )
            self.assertEqual(meta["palette_id"], "dark_geopolitical")
            for key, file_path_str in meta["files"].items():
                p = Path(file_path_str)
                self.assertTrue(p.is_file(), f"Expected asset file for {key} at {p}")
            palette_data = json.loads(
                Path(meta["files"]["palette_json"]).read_text(encoding="utf-8")
            )
            self.assertEqual(palette_data["active_palette"], "dark_geopolitical")


class TestValidateVoxRecipe(unittest.TestCase):
    def test_default_template_is_valid(self) -> None:
        recipe = copy.deepcopy(validate_vox_recipe.DEFAULT_RECIPE_TEMPLATE)
        result = validate_vox_recipe.validate_recipe(recipe)
        self.assertTrue(result["valid"], f"Expected valid template, got errors: {result['errors']}")
        self.assertTrue(all(result["checks"].values()))

    def test_rejects_linear_easing_and_excess_accents(self) -> None:
        bad = copy.deepcopy(validate_vox_recipe.DEFAULT_RECIPE_TEMPLATE)
        bad["palette"]["accent_colors_hex"] = ["#FFF200", "#E63946", "#00D4B2"]
        bad["camera_rig"]["easing_curve"] = "linear"
        result = validate_vox_recipe.validate_recipe(bad)
        self.assertFalse(result["valid"])
        self.assertFalse(result["checks"]["three_color_rule"])
        self.assertFalse(result["checks"]["nonlinear_easing"])


if __name__ == "__main__":
    unittest.main()
