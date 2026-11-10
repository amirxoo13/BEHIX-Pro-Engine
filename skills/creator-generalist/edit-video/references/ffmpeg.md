# FFmpeg

Command recipes for editing jobs without an editor: trim, join, reframe, captions, speed, loudness and platform
encodes. Written from the official FFmpeg documentation (ffmpeg.org/ffmpeg-filters.html). Run each command on a
copy and check the output with `ffprobe` and a few extracted frames.

Reading map
- Inspect
- Trim and join
- Reframe and scale
- Captions and text
- Speed and transitions
- Audio and loudness
- Encode for platforms
- Frames and GIFs

## Inspect

**Read duration, size, frame rate and codecs**
1. `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact input.mp4`
- Use when / pitfalls: check every export against the platform limits before upload.
- Source: [ffprobe documentation](https://ffmpeg.org/ffprobe.html)

**Find scene cuts**
1. `ffmpeg -i input.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep pts_time`
- Use when / pitfalls: 0.3 is a start. Lower it for soft cuts. Crossfades rarely register.
- Source: [select filter](https://ffmpeg.org/ffmpeg-filters.html#select_002c-aselect)

## Trim and join

**Trim without re-encoding**
1. `ffmpeg -ss 00:00:12 -to 00:00:27 -i input.mp4 -c copy clip.mp4`
- Use when / pitfalls: a stream copy cuts only on keyframes, so the start can shift. Re-encode for a frame-exact cut.
- Source: [ffmpeg main options](https://ffmpeg.org/ffmpeg.html#Main-options)

**Frame-exact trim**
1. `ffmpeg -ss 12.0 -i input.mp4 -t 15.0 -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k clip.mp4`
- Source: [ffmpeg main options](https://ffmpeg.org/ffmpeg.html#Main-options)

**Join clips with the same codec and size**
1. Write `list.txt` with one line per clip: `file 'clip1.mp4'`.
2. `ffmpeg -f concat -safe 0 -i list.txt -c copy joined.mp4`
- Use when / pitfalls: clips with different sizes, rates or codecs need the `concat` filter and a re-encode.
- Source: [concat demuxer](https://ffmpeg.org/ffmpeg-formats.html#concat)

## Reframe and scale

**Landscape to 9:16 with a centre crop**
1. `ffmpeg -i input.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy vertical.mp4`
- Use when / pitfalls: move the crop with `crop=ih*9/16:ih:x_offset:0` when the subject is off centre.
- Source: [crop filter](https://ffmpeg.org/ffmpeg-filters.html#crop)

**Landscape inside 9:16 on a blurred copy**
1. `ffmpeg -i input.mp4 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:a copy vertical.mp4`
- Source: [overlay filter](https://ffmpeg.org/ffmpeg-filters.html#overlay-1)

## Captions and text

**Burn an SRT or ASS file**
1. `ffmpeg -i input.mp4 -vf "subtitles=captions.srt:force_style='FontName=Arial,FontSize=14,Outline=2,Alignment=2,MarginV=120'" -c:a copy captioned.mp4`
- Use when / pitfalls: an ASS file keeps per-word styling and positions. On Windows, escape the drive colon in the
  path (`C\:/clips/captions.srt`) or run from the folder.
- Source: [subtitles filter](https://ffmpeg.org/ffmpeg-filters.html#subtitles-1)

**Draw a title**
1. `ffmpeg -i input.mp4 -vf "drawtext=fontfile=font.ttf:text='Day 1':fontsize=96:fontcolor=white:borderw=4:x=(w-tw)/2:y=h*0.18:enable='between(t,0,2)'" out.mp4`
- Source: [drawtext filter](https://ffmpeg.org/ffmpeg-filters.html#drawtext-1)

## Speed and transitions

**Change speed with audio**
1. 2x: `ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" fast.mp4`
- Use when / pitfalls: one `atempo` takes 0.5 to 100. Chain two for less than 0.5. Smooth slow motion needs
  `minterpolate` or an optical flow editor.
- Source: [setpts](https://ffmpeg.org/ffmpeg-filters.html#setpts_002c-asetpts), [atempo](https://ffmpeg.org/ffmpeg-filters.html#atempo)

**Crossfade two clips**
1. `ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[v];[0:a][1:a]acrossfade=d=0.5[a]" -map "[v]" -map "[a]" out.mp4`
- Use when / pitfalls: `offset` is the length of clip A minus the fade. Both clips need the same size and rate.
  Other transitions: `wipeleft`, `slideup`, `circleopen`, `pixelize`.
- Source: [xfade filter](https://ffmpeg.org/ffmpeg-filters.html#xfade)

## Audio and loudness

**Measure loudness**
1. `ffmpeg -i out.mp4 -af loudnorm=print_format=summary -f null -`
2. Read Input Integrated (LUFS) and Input True Peak.
- Use when / pitfalls: streaming platforms normalize playback to roughly -14 LUFS. Aim near it with true peak
  under -1 dBTP so the mix is not turned down or clipped.
- Source: [loudnorm filter](https://ffmpeg.org/ffmpeg-filters.html#loudnorm)

**Normalize to -14 LUFS**
1. `ffmpeg -i in.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy out.mp4`
- Use when / pitfalls: a two-pass run (feed the measured values back) is more exact than one pass.
- Source: [loudnorm filter](https://ffmpeg.org/ffmpeg-filters.html#loudnorm)

**Duck music under a voice**
1. `ffmpeg -i voice.wav -i music.wav -filter_complex "[1:a][0:a]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[ducked];[ducked][0:a]amix=inputs=2:normalize=0[a]" -map "[a]" mix.wav`
- Source: [sidechaincompress](https://ffmpeg.org/ffmpeg-filters.html#sidechaincompress)

## Encode for platforms

**H.264 MP4 that every platform accepts**
1. `ffmpeg -i master.mov -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart upload.mp4`
- Use when / pitfalls: `yuv420p` avoids black or failed uploads from 10-bit or 4:4:4 sources. Keep the source frame
  rate (24, 30 or 60) rather than forcing 30. Check each platform's current length and size limits before upload.
- Source: [H.264 encoding guide](https://trac.ffmpeg.org/wiki/Encode/H.264)

**Low quality preview**
1. `ffmpeg -i master.mov -vf scale=-2:540 -c:v libx264 -crf 30 -preset veryfast -c:a aac -b:a 96k preview.mp4`
- Source: [H.264 encoding guide](https://trac.ffmpeg.org/wiki/Encode/H.264)

## Frames and GIFs

**Extract frames to check**
1. One frame: `ffmpeg -ss 3.2 -i out.mp4 -frames:v 1 frame.png`
2. A contact sheet: `ffmpeg -i out.mp4 -vf "fps=1,scale=320:-1,tile=5x4" -frames:v 1 sheet.png`
- Source: [tile filter](https://ffmpeg.org/ffmpeg-filters.html#tile-1)

**Good-looking GIF**
1. `ffmpeg -i clip.mp4 -vf "fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" clip.gif`
- Source: [palettegen](https://ffmpeg.org/ffmpeg-filters.html#palettegen)
