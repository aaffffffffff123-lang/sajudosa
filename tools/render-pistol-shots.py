"""Deterministic, original pistol reports; four 500 ms mono PCM clips.

The first 55 ms carry the report. Short, sparse reflections leave space between
190 ms held-fire events. Keep other weapons and voices in the existing bank.
Run from the repository root: python tools/render-pistol-shots.py
"""
from pathlib import Path
import wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
N = SR // 2
t = np.arange(N) / SR

def band(x, low, high):
    return sosfilt(butter(2, [low, high], btype='bandpass', fs=SR, output='sos'), x)

def shot(seed):
    rng = np.random.default_rng(seed)
    noise = rng.normal(0, 1, N)
    attack = np.minimum(t / .00035, 1)
    crack = band(noise, 1700, 10000) * np.exp(-t / .0036) * 1.9
    report = band(noise, 260, 6200) * np.exp(-t / .016) * 1.6
    body = np.sin(2*np.pi*(165+rng.uniform(-8, 8))*t) * np.exp(-t / .018) * .30
    # Short metal/pressure resonance: a sharp 'tang', without a falling laser pitch.
    ring = sum(np.sin(2*np.pi*f*rng.uniform(.985, 1.015)*t) * a
               for f, a in [(1280, .17), (2140, .11), (3460, .045)]) * np.exp(-t/.026)
    dry = np.tanh((crack+report+body+ring)*attack*1.3)
    out = dry.copy()
    for delay, gain in [(.021, .14), (.047, .075), (.079, .032)]:
        n = round((delay+rng.uniform(-.001, .001))*SR)
        out[n:] += band(dry, 500, 6000)[:-n] * gain
    # Mechanical return follows the report; the much quieter case lands later.
    for delay, gain, decay, freq in [(.052, .055, .003, 3100), (.070, .025, .002, 4100), (.245, .013, .009, 5700), (.292, .005, .006, 7200)]:
        u = np.maximum(0, t-delay)
        out += (t>=delay)*np.sin(2*np.pi*freq*u)*np.exp(-u/decay)*gain
    out = sosfilt(butter(2, 65, btype='highpass', fs=SR, output='sos'), out)
    out *= np.minimum(1, np.maximum(0, (.42-t)/.015))
    out *= .94 / np.max(np.abs(out))
    return out

clips = [shot(seed) for seed in [1007, 1029, 1107, 2031]]
target = Path(__file__).resolve().parents[1] / 'assets/pistol-shots-v2.wav'
target.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(target), 'wb') as f:
    f.setnchannels(1)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((np.concatenate(clips)*32767).astype('<i2').tobytes())
for i, x in enumerate(clips):
    early = np.sqrt(np.mean(x[:int(.06*SR)]**2))
    tail = np.sqrt(np.mean(x[int(.15*SR):int(.19*SR)]**2))
    assert np.max(np.abs(x)) < .95
    assert np.max(np.abs(x[-int(.07*SR):])) == 0
    assert tail / early < .02, 'tail would smear the next held shot'
    print(f'clip {i+1}: peak={np.max(np.abs(x)):.2f}, pre-next-shot tail={20*np.log10(max(1e-10,tail/early)):.1f} dB')
print(target.name, target.stat().st_size, 'bytes')
