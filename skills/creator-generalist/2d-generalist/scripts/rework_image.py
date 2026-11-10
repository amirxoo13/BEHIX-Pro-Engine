"""Rework a real photo or scan into the editorial collage look: crop, duotone, posterize, halftone, grain and a torn
paper border. The output is a PNG with alpha, ready for Remotion, Fusion or Blender cards.

Run:
  uv run --no-project --with pillow --with numpy python scripts/rework_image.py <in> <out.png>
      [--crop x,y,w,h] [--width 1600] [--duotone "#1b2a49,#f2e6cf"] [--posterize 5] [--halftone 9 --halftone-strength 0.35]
      [--grain 0.06] [--torn 18] [--border 14] [--seed 3]

Order: crop, resize, duotone (or keep colour), posterize, halftone, grain, torn border. Every step is optional; with
no flags the photo is only resized. Keep the photo recognisable: rework it so it sits in the piece's palette and
paper, never so far that the real object is lost.
"""

import argparse
import sys

import numpy
from PIL import Image, ImageDraw, ImageFilter


def parse_colour(text):
    text = text.strip().lstrip("#")
    return numpy.array([int(text[index:index + 2], 16) for index in (0, 2, 4)], dtype=numpy.float32)


def duotone(image, dark_hex, light_hex):
    grey = numpy.asarray(image.convert("L"), dtype=numpy.float32)[..., None] / 255.0
    dark = parse_colour(dark_hex)
    light = parse_colour(light_hex)
    mixed = dark * (1.0 - grey) + light * grey
    return Image.fromarray(mixed.clip(0, 255).astype(numpy.uint8), "RGB")


def halftone(image, cell, strength=0.35, dark_hex="#151515"):
    """Dots sized by darkness on a 45-degree screen, blended at `strength` so the halftone is felt, not seen."""
    grey = image.convert("L").rotate(45, expand=True, fillcolor=255)
    width, height = grey.size
    small = grey.resize((max(1, width // cell), max(1, height // cell)), Image.BILINEAR)
    dots = Image.new("L", (width, height), 255)
    draw = ImageDraw.Draw(dots)
    pixels = numpy.asarray(small, dtype=numpy.float32) / 255.0
    for row in range(pixels.shape[0]):
        for column in range(pixels.shape[1]):
            radius = (1.0 - pixels[row, column]) * cell * 0.5
            if radius < 0.4:
                continue
            centre_x = column * cell + cell / 2
            centre_y = row * cell + cell / 2
            draw.ellipse([centre_x - radius, centre_y - radius, centre_x + radius, centre_y + radius], fill=0)
    dots = dots.rotate(-45, expand=False)
    left = (dots.width - image.width) // 2
    top = (dots.height - image.height) // 2
    dots = dots.crop((left, top, left + image.width, top + image.height))
    ink = Image.new("RGB", image.size, tuple(int(value) for value in parse_colour(dark_hex)))
    printed = Image.composite(image, ink, dots)
    return Image.blend(image, printed, strength)


def add_grain(image, amount, seed):
    generator = numpy.random.default_rng(seed)
    array = numpy.asarray(image, dtype=numpy.float32)
    noise = generator.normal(0.0, 255.0 * amount, array.shape[:2])[..., None]
    return Image.fromarray((array + noise).clip(0, 255).astype(numpy.uint8), "RGB")


def edge_noise(length, depth, generator):
    """Ragged paper fibre edge: three octaves of smooth noise, so the tear wanders instead of zigzagging."""
    offsets = numpy.zeros(length)
    for wavelength, weight in ((max(8, length // 6), 0.55), (28, 0.3), (5, 0.15)):
        anchors = generator.uniform(0.0, 1.0, length // wavelength + 3)
        positions = numpy.arange(length) / wavelength
        offsets += numpy.interp(positions, numpy.arange(len(anchors)), anchors) * weight
    return 0.2 * depth + offsets * 0.8 * depth


def torn_mask(size, depth, seed):
    width, height = size
    generator = numpy.random.default_rng(seed)
    top = edge_noise(width, depth, generator)
    bottom = edge_noise(width, depth, generator)
    left = edge_noise(height, depth, generator)
    right = edge_noise(height, depth, generator)
    rows = numpy.arange(height)[:, None]
    columns = numpy.arange(width)[None, :]
    inside = (rows >= top[None, :]) & (rows <= height - 1 - bottom[None, :]) &              (columns >= left[:, None]) & (columns <= width - 1 - right[:, None])
    mask = Image.fromarray((inside * 255).astype(numpy.uint8), "L")
    return mask.filter(ImageFilter.GaussianBlur(0.7))


def torn_paper(image, depth, border, seed):
    """Photo torn smaller than a paper backing that is itself torn: the two-layer torn border."""
    paper_size = (image.width + border * 2, image.height + border * 2)
    paper = Image.new("RGBA", paper_size, (244, 238, 224, 255))
    paper.putalpha(torn_mask(paper_size, depth, seed))
    photo = image.convert("RGBA")
    photo.putalpha(torn_mask(image.size, max(4, depth // 2), seed + 1))
    paper.alpha_composite(photo, (border, border))
    return paper


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("source")
    parser.add_argument("target")
    parser.add_argument("--crop", default=None, help="x,y,w,h in source pixels")
    parser.add_argument("--width", type=int, default=1600)
    parser.add_argument("--duotone", default=None, help='"#dark,#light"')
    parser.add_argument("--posterize", type=int, default=0, help="bits per channel, 3 to 6")
    parser.add_argument("--halftone", type=int, default=0, help="dot cell in pixels, 6 to 14")
    parser.add_argument("--halftone-strength", type=float, default=0.35, help="0.2 to 0.6; 1.0 is pure dots")
    parser.add_argument("--grain", type=float, default=0.0, help="0.03 to 0.08")
    parser.add_argument("--torn", type=int, default=0, help="tear depth in pixels, 10 to 30")
    parser.add_argument("--border", type=int, default=14, help="paper margin around the photo")
    parser.add_argument("--seed", type=int, default=3)
    arguments = parser.parse_args()

    image = Image.open(arguments.source)
    alpha = image.getchannel("A") if "A" in image.getbands() else None
    image = image.convert("RGB")
    if arguments.crop:
        x_position, y_position, crop_width, crop_height = (int(value) for value in arguments.crop.split(","))
        image = image.crop((x_position, y_position, x_position + crop_width, y_position + crop_height))
        alpha = alpha.crop((x_position, y_position, x_position + crop_width, y_position + crop_height)) if alpha else None
    if image.width > arguments.width:
        new_size = (arguments.width, round(image.height * arguments.width / image.width))
        image = image.resize(new_size, Image.LANCZOS)
        alpha = alpha.resize(new_size, Image.LANCZOS) if alpha else None
    if arguments.duotone:
        dark_hex, light_hex = arguments.duotone.split(",")
        image = duotone(image, dark_hex, light_hex)
    if arguments.posterize:
        image = image.convert("RGB").quantize(colors=2 ** arguments.posterize, dither=Image.Dither.NONE).convert("RGB")
    if arguments.halftone:
        image = halftone(image, arguments.halftone, arguments.halftone_strength)
    if arguments.grain:
        image = add_grain(image, arguments.grain, arguments.seed)
    if arguments.torn:
        result = torn_paper(image, arguments.torn, arguments.border, arguments.seed)
    else:
        result = image.convert("RGBA")
        if alpha is not None:
            result.putalpha(alpha)
    result.save(arguments.target)
    print(f"{arguments.target} {result.width}x{result.height}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
