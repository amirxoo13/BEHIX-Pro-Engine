# Inkscape thumbnails and logo stickers

Make a vector thumbnail or title card in Inkscape (free, open source) with brand logos as clean stickers.
dacctal's open source video workflow, with menu names read from full-size frames and checked against the Inkscape docs.
Inkscape 1.3 or later is needed for the Shape Builder tool.

Reading map
- Canvas and palette
- Get a logo as real SVG
- Sticker outline and soft shadow
- Export and use

## Canvas and palette

1. Document Properties: 1920 x 1080 px for a YouTube thumbnail, 96 DPI.
2. Keep a palette strip on the canvas edge (outside the export area or on a hidden layer): two rows of 8 swatches,
   one pastel and one saturated, of the same hues plus a dark grey and a cream. Pick from it with the dropper so every
   thumbnail of the series uses the same colours.
3. Recolour every logo to the palette, even when its brand colours differ. The example recolours the Manim logo to
   the series' own green, blue and red.
- Use when / pitfalls: one fixed palette is what makes a series recognisable. Do not take colours from each logo.

## Get a logo as real SVG

1. Open simpleicons.org, search the brand, click the copy button on its card. It copies the SVG markup itself, not a
   link.
2. In Inkscape, Edit > Paste (Ctrl+V). The logo arrives as an editable path with all its nodes.
3. A pointer graphic (white arrow with a dark outline, drawn as a vector object) points at the subject.
- Use when / pitfalls: Simple Icons logos are single-colour. Check the brand's own usage rules before commercial use.

## Sticker outline and soft shadow

1. Select the logo, Ctrl+C, then Edit > Paste In Place (Ctrl+Alt+V) to stack a copy exactly on top.
2. Fill the lower copy white or cream, then Object > Lower One Step (Page Down) so it sits under the logo.
3. With the lower copy selected, Path > Dynamic Offset (Ctrl+J) and drag its handle out with the Node tool. Path >
   Outset (Ctrl+)) grows it by a fixed step instead. The video narrates Dynamic Offset while the menu shows Outset
   highlighted. Both give a rounded outline.
4. Holes inside the logo still show through. Use the Shape Builder tool (Inkscape 1.3+) and click the gaps to fill
   them into one solid shape.
5. Shadow: paste the outline in place again, run the same offset, fill it with the background colour, lower it one step.
6. Filters > Blurs > Blur...: Horizontal blur 10, Vertical blur 10, Live preview on, then Apply and Close.
7. Select logo, outline and shadow, Object > Group (Ctrl+G).
- Use when / pitfalls: Dynamic Offset no longer switches to the Node tool by itself since Inkscape 1.2, so pick the
  Node tool to see the handle. A blur pushes past the object bounds. Leave margin so the shadow is not clipped.

## Export and use

1. File > Export, Page, 1920 x 1080, PNG, into the video's folder as `thumbnail.png`.
2. The example also puts the thumbnail as the first frames of the video, a habit from when YouTube only let you pick
   a frame as the thumbnail. It keeps the click promise visible at second 0.

