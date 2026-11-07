"""Build three short, human-led double-throat cries from the existing sound bank.

Requires ffmpeg, numpy and scipy. No speech synthesis or rendering runs in-game.
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
    y *= peak / max(0.001, np.max(np.abs(y)))
    fade = min(round(SR * .035), n // 3)
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

    output, offsets = [], []
    cursor = 0
    for i in [1, 4, 6]:
        human = fit(clip('scream', i), .63 + i * .014, .68)
        # The first 150 ms is only the existing human cry. A lower second throat
        # emerges underneath, with a thin inharmonic rasp rather than a roar.
        inner = band(clip('reptile', i), 100, 1900)
        inner = fit(inner, .91 + i * .012, .24)
        t = np.arange(len(inner)) / SR
        inner *= .72 + .18 * np.sin(2 * np.pi * (19 + i) * t) + .1 * np.sin(2 * np.pi * 31.7 * t)
        thin = fit(band(human, 700, 3400), .82, .075)
        thin *= np.sin(2 * np.pi * (113 + i * 9.3) * np.arange(len(thin)) / SR)
        y = np.zeros(round(1.22 * SR))
        y[:len(human)] += human
        delay = round(.15 * SR)
        y[delay:delay + len(inner)] += inner
        delay = round(.23 * SR)
        y[delay:delay + len(thin)] += thin
        y *= min(1, .88 / max(.001, np.max(np.abs(y))))
        y[-round(.06 * SR):] *= np.linspace(1, 0, round(.06 * SR))
        offsets.append([cursor, len(y)])
        output.extend([y, np.zeros(round(.08 * SR))])
        cursor += len(y) + round(.08 * SR)
    samples = np.concatenate(output)
    path = ROOT / 'assets/uncanny-cries-v1.wav'
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(np.round(samples * 32767).astype('<i2').tobytes())
    (ROOT / 'assets/uncanny-cries-v1.json').write_text(
        json.dumps({'sampleRate': SR, 'clips': offsets}, indent=2) + '\n')
    print(path.name, 'duration', len(samples) / SR, 'peak', float(np.max(np.abs(samples))))


if __name__ == '__main__':
    main()
