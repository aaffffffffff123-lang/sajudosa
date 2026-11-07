"""Render normal reptile cries and rare human/reptile double-throat variants.

Requires ffmpeg, numpy and scipy. All processing happens here, never on a hit.
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[1]
SR = 24000


def band(x, lo, hi):
    return sosfilt(butter(3, [lo, hi], btype="bandpass", fs=SR, output="sos"), x)


def fit(x, seconds, peak):
    n = round(seconds * SR)
    y = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
    y *= peak / max(.001, np.max(np.abs(y)))
    fade = min(round(SR * .025), n // 3)
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade:] *= np.linspace(1, 0, fade)
    return y


def main():
    meta = json.loads((ROOT / 'assets/fight-sounds-v1.json').read_text())
    pcm = subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(ROOT / 'assets/fight-sounds-v1.mp3'),
        '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'])
    bank = np.frombuffer(pcm, dtype='<f4').astype(np.float64)

    def clip(kind, i):
        at, length = meta['clips']['v:' + kind][i]
        x = bank[at:at + length].copy()
        voiced = np.flatnonzero(np.abs(x) > .006)
        return x[:min(len(x), int(voiced[-1]) + round(.035 * SR))]

    groups = {'reptile-present': [], 'uncanny-human': [], 'uncanny-reptile': []}
    for i in range(8):
        # Preserve the original throat; bring the dry hiss forward enough that
        # its identity is present in the first 400 ms, even during fast attacks.
        base = fit(clip('reptile', i), .69 + .018 * (i % 4), .66)
        rasp = fit(band(base, 850, 4800), len(base) / SR, .18)
        t = np.arange(len(base)) / SR
        rasp *= .65 + .35 * np.sin(2 * np.pi * (27 + i * 1.7) * t)
        normal = base + rasp
        normal *= .82 / max(.001, np.max(np.abs(normal)))
        groups['reptile-present'].append(normal)

    for form in ['human', 'reptile']:
        for i in [1, 4, 6]:
            lead = (fit(clip('scream', i), .63 + i * .014, .68)
                    if form == 'human' else groups['reptile-present'][i].copy() * .88)
            # A mismatched second pitch comes in after the recognisable attack
            # cry, then hangs on briefly after its mouth should have gone quiet.
            inner = fit(band(clip('reptile', (i + 2) % 8), 90, 1900), .91, .29)
            t = np.arange(len(inner)) / SR
            inner *= .72 + .18 * np.sin(2 * np.pi * (19 + i) * t) + .1 * np.sin(2 * np.pi * 31.7 * t)
            thin = fit(band(clip('scream', i), 700, 3400), .82, .12)
            thin *= np.sin(2 * np.pi * (113 + i * 9.3) * np.arange(len(thin)) / SR)
            y = np.zeros(round(1.22 * SR))
            y[:len(lead)] += lead
            delay = round(.15 * SR)
            y[delay:delay + len(inner)] += inner
            delay = round(.23 * SR)
            y[delay:delay + len(thin)] += thin
            y *= min(1, .88 / max(.001, np.max(np.abs(y))))
            y[-round(.06 * SR):] *= np.linspace(1, 0, round(.06 * SR))
            groups['uncanny-' + form].append(y)

    output, offsets, cursor = [], {}, 0
    for name, sounds in groups.items():
        offsets[name] = []
        for y in sounds:
            offsets[name].append([cursor, len(y)])
            output.extend([y, np.zeros(round(.08 * SR))])
            cursor += len(y) + round(.08 * SR)
    samples = np.concatenate(output)
    path = ROOT / 'assets/uncanny-cries-v2.wav'
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(np.round(samples * 32767).astype('<i2').tobytes())
    (ROOT / 'assets/uncanny-cries-v2.json').write_text(
        json.dumps({'sampleRate': SR, 'clips': offsets}, indent=2) + '\n')
    print(path.name, 'duration', len(samples) / SR, 'peak', float(np.max(np.abs(samples))))


if __name__ == '__main__':
    main()
