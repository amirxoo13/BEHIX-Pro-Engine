#!/usr/bin/env python3
"""Audit the local environment for 2D/3D Vox-style motion graphics tools.

Reports installed free/open-source and local tools (Blender, DaVinci Resolve,
Remotion + Three.js, FFmpeg, yt-dlp, Python, Node/pnpm, OBS) and suggests
exact winget/free download commands for optional tools (QGIS, Inkscape,
Krita, GIMP, Google Earth Studio).
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


TOOL_SPECS: list[dict[str, Any]] = [
    {
        "id": "blender",
        "name": "Blender (3D / 2.5D Camera & Geometry Nodes)",
        "category": "3d_and_25d",
        "required": True,
        "commands": ["blender"],
        "candidate_paths": [
            r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 5.0\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 4.3\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
        ],
        "version_args": ["--version"],
        "install_cmd": "winget install BlenderFoundation.Blender",
    },
    {
        "id": "davinci_resolve",
        "name": "DaVinci Resolve + Fusion (Node 2D/3D Compositing & NLE)",
        "category": "compositing_and_nle",
        "required": False,
        "commands": ["Resolve"],
        "candidate_paths": [
            r"C:\Program Files\Blackmagic Design\DaVinci Resolve\Resolve.exe",
            r"C:\Program Files\Blackmagic Design\DaVinci Resolve\fuscript.exe",
        ],
        "version_args": None,
        "install_cmd": "Download DaVinci Resolve Free: https://www.blackmagicdesign.com/products/davinciresolve",
    },
    {
        "id": "ffmpeg",
        "name": "FFmpeg (Video/Audio/Texture Processing & Encoding)",
        "category": "media_pipeline",
        "required": True,
        "commands": ["ffmpeg"],
        "candidate_paths": [
            str(Path.home() / ".local" / "bin" / "ffmpeg.exe"),
        ],
        "version_args": ["-version"],
        "install_cmd": "winget install Gyan.FFmpeg",
    },
    {
        "id": "ffprobe",
        "name": "FFprobe (Media Stream & Frame Rate Inspector)",
        "category": "media_pipeline",
        "required": True,
        "commands": ["ffprobe"],
        "candidate_paths": [
            str(Path.home() / ".local" / "bin" / "ffprobe.exe"),
        ],
        "version_args": ["-version"],
        "install_cmd": "winget install Gyan.FFmpeg",
    },
    {
        "id": "yt_dlp",
        "name": "yt-dlp (Archival Reference & Transcript Extractor)",
        "category": "research_and_archival",
        "required": False,
        "commands": ["yt-dlp"],
        "candidate_paths": [
            str(Path.home() / ".local" / "bin" / "yt-dlp.exe"),
        ],
        "version_args": ["--version"],
        "install_cmd": "winget install yt-dlp.yt-dlp",
    },
    {
        "id": "node",
        "name": "Node.js (Remotion + Three.js Runtime)",
        "category": "code_driven_2d_3d",
        "required": True,
        "commands": ["node"],
        "candidate_paths": [
            r"C:\Program Files\nodejs\node.exe",
        ],
        "version_args": ["--version"],
        "install_cmd": "winget install OpenJS.NodeJS.LTS",
    },
    {
        "id": "uv",
        "name": "uv (Python Asset & Data Automation Runner)",
        "category": "code_driven_2d_3d",
        "required": True,
        "commands": ["uv"],
        "candidate_paths": [
            str(Path.home() / ".local" / "bin" / "uv.exe"),
        ],
        "version_args": ["--version"],
        "install_cmd": "winget install astral-sh.uv",
    },
    {
        "id": "obs",
        "name": "OBS Studio (Viewport / Map Capture)",
        "category": "capture",
        "required": False,
        "commands": ["obs64"],
        "candidate_paths": [
            r"C:\Program Files\obs-studio\bin\64bit\obs64.exe",
        ],
        "version_args": None,
        "install_cmd": "winget install OBSProject.OBSStudio",
    },
    {
        "id": "qgis",
        "name": "QGIS (Free GIS Map & DEM Heightmap Generator — replaces GEOlayers 3)",
        "category": "gis_and_maps",
        "required": False,
        "commands": ["qgis", "qgis-bin"],
        "candidate_paths": [
            r"C:\Program Files\QGIS 3.40.0\bin\qgis-bin.exe",
            r"C:\Program Files\QGIS 3.38.0\bin\qgis-bin.exe",
            r"C:\Program Files\QGIS 3.34.0\bin\qgis-bin.exe",
        ],
        "version_args": ["--version"],
        "install_cmd": "winget install OSGeo.QGIS",
    },
    {
        "id": "inkscape",
        "name": "Inkscape (Free SVG Vector Editor — replaces Adobe Illustrator)",
        "category": "vector_and_raster",
        "required": False,
        "commands": ["inkscape"],
        "candidate_paths": [
            r"C:\Program Files\Inkscape\bin\inkscape.exe",
        ],
        "version_args": ["--version"],
        "install_cmd": "winget install Inkscape.Inkscape",
    },
    {
        "id": "krita",
        "name": "Krita (Free Raster Cutout, Halftone & Texture Painter — replaces Photoshop)",
        "category": "vector_and_raster",
        "required": False,
        "commands": ["krita"],
        "candidate_paths": [
            r"C:\Program Files\Krita (x64)\bin\krita.exe",
        ],
        "version_args": ["--version"],
        "install_cmd": "winget install KDE.Krita",
    },
    {
        "id": "gimp",
        "name": "GIMP (Free Image Manipulation & Thresholding)",
        "category": "vector_and_raster",
        "required": False,
        "commands": ["gimp", "gimp-2.10"],
        "candidate_paths": [
            r"C:\Program Files\GIMP 2\bin\gimp-2.10.exe",
        ],
        "version_args": ["--version"],
        "install_cmd": "winget install GIMP.GIMP",
    },
]


def locate_executable(commands: list[str], candidate_paths: list[str]) -> str | None:
    """Return the first resolved executable path from PATH or candidate paths."""
    for cmd in commands:
        found = shutil.which(cmd)
        if found:
            return found
    for path_str in candidate_paths:
        if os.path.isfile(path_str):
            return path_str
    return None


def probe_version(exe_path: str, version_args: list[str] | None) -> str:
    """Return the first line of version output if available."""
    if not version_args:
        return "installed"
    try:
        completed = subprocess.run(
            [exe_path, *version_args],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        output = (completed.stdout or completed.stderr or "").strip()
        if output:
            return output.splitlines()[0].strip()
    except Exception:
        pass
    return "installed"


def check_remotion_workspace() -> dict[str, Any]:
    """Check whether the user's Remotion + Three.js workspace is present."""
    candidates = [
        Path.home() / "Documents" / "social" / "remotion" / "package.json",
        Path.cwd() / "remotion" / "package.json",
        Path.cwd() / "package.json",
    ]
    for pkg_path in candidates:
        if pkg_path.is_file():
            try:
                data = json.loads(pkg_path.read_text(encoding="utf-8"))
                deps = {
                    **data.get("dependencies", {}),
                    **data.get("devDependencies", {}),
                }
                if "remotion" in deps or "three" in deps:
                    return {
                        "id": "remotion_three",
                        "name": "Remotion + Three.js Workspace (Code-Driven 2D/3D Motion)",
                        "category": "code_driven_2d_3d",
                        "installed": True,
                        "path": str(pkg_path.parent),
                        "version": f"remotion={deps.get('remotion', 'n/a')}, three={deps.get('three', 'n/a')}",
                        "install_cmd": "pnpm install (inside remotion workspace)",
                    }
            except Exception:
                continue
    return {
        "id": "remotion_three",
        "name": "Remotion + Three.js Workspace (Code-Driven 2D/3D Motion)",
        "category": "code_driven_2d_3d",
        "installed": False,
        "path": None,
        "version": None,
        "install_cmd": "npx create-video@latest",
    }


def audit_toolchain() -> dict[str, Any]:
    """Run a full audit of installed and optional free Vox motion graphics tools."""
    results: list[dict[str, Any]] = []
    for spec in TOOL_SPECS:
        exe = locate_executable(spec["commands"], spec["candidate_paths"])
        installed = exe is not None
        version = probe_version(exe, spec["version_args"]) if exe else None
        results.append(
            {
                "id": spec["id"],
                "name": spec["name"],
                "category": spec["category"],
                "required": spec["required"],
                "installed": installed,
                "path": exe,
                "version": version,
                "install_cmd": spec["install_cmd"],
            }
        )

    remotion_info = check_remotion_workspace()
    results.append(
        {
            "id": remotion_info["id"],
            "name": remotion_info["name"],
            "category": remotion_info["category"],
            "required": False,
            "installed": remotion_info["installed"],
            "path": remotion_info["path"],
            "version": remotion_info["version"],
            "install_cmd": remotion_info["install_cmd"],
        }
    )

    installed_tools = [r for r in results if r["installed"]]
    missing_tools = [r for r in results if not r["installed"]]

    recommended_stacks = {
        "stack_a_code_driven_2d_3d": {
            "ready": any(r["id"] == "node" and r["installed"] for r in results)
            and any(r["id"] == "ffmpeg" and r["installed"] for r in results),
            "description": "Remotion + Three.js + SVG/Canvas + Python/FFmpeg (Automated 2D/3D charts, maps, kinetic typography)",
        },
        "stack_b_node_compositing": {
            "ready": any(r["id"] == "davinci_resolve" and r["installed"] for r in results),
            "description": "DaVinci Resolve + Fusion (Node-based 2D/3D camera rigs, Set Matte, Displace, Sound Design)",
        },
        "stack_c_full_3d_25d_blender": {
            "ready": any(r["id"] == "blender" and r["installed"] for r in results),
            "description": "Blender 5.2 (3D terrain displacement, multi-plane archival collage, isometric dioramas, grease pencil)",
        },
    }

    return {
        "summary": {
            "installed_count": len(installed_tools),
            "missing_optional_count": len(missing_tools),
            "ready_to_produce_2d_and_3d": any(
                s["ready"] for s in recommended_stacks.values()
            ),
        },
        "recommended_stacks": recommended_stacks,
        "installed": installed_tools,
        "missing_optional": missing_tools,
    }


def format_markdown_report(report: dict[str, Any]) -> str:
    """Format the audit report as human-readable Markdown."""
    lines: list[str] = [
        "# Vox 2D/3D Toolchain Audit",
        "",
        f"- **Installed tools**: {report['summary']['installed_count']}",
        f"- **Optional free tools available to install**: {report['summary']['missing_optional_count']}",
        "",
        "## Ready Production Stacks",
    ]
    for stack_id, stack in report["recommended_stacks"].items():
        status = "READY" if stack["ready"] else "MISSING DEPENDENCIES"
        lines.append(f"- **{stack_id}** [{status}]: {stack['description']}")

    lines.extend(["", "## Installed Tools (Ready to Use)"])
    for item in report["installed"]:
        lines.append(
            f"- **{item['name']}** (`{item['id']}`)\n"
            f"  - Path: `{item['path']}`\n"
            f"  - Version: `{item['version']}`"
        )

    lines.extend(["", "## Optional Free Tools (Install Only If Needed)"])
    for item in report["missing_optional"]:
        lines.append(
            f"- **{item['name']}** (`{item['id']}`)\n"
            f"  - Free Install Command: `{item['install_cmd']}`"
        )

    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(
        description="Audit installed and optional free 2D/3D tools for Vox-style motion graphics."
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output machine-readable JSON instead of Markdown.",
    )
    args = parser.parse_args(argv)
    report = audit_toolchain()
    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(format_markdown_report(report))
    return 0


if __name__ == "__main__":
    sys.exit(main())
