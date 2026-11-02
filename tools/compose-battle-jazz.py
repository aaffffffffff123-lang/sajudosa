#!/usr/bin/env python3
"""Original 32-bar, 196 BPM swing cue. Writes timed MIDI-style events for render-score.c.
Render with GeneralUser GS 2.0.3; the SoundFont is an external build dependency.
"""
from pathlib import Path
import math, random, sys
BPM=196; SR=44100; BEAT=60/BPM; BARS=32
rng=random.Random(730196); events=[]
def note(ch,pitch,beat,duration,vel):
    if pitch is None:return
    start=max(0,round(beat*BEAT*SR));end=round((beat+duration)*BEAT*SR)
    events.extend([(start,1,ch,pitch,vel),(end,0,ch,pitch,0)])
# Root, warm rootless piano voicing, walking bass, and a deliberately composed horn hook.
A=[
 (38,[53,57,59,64],[38,41,45,49],[74,77,81,None,79,77,76,74]),
 (38,[53,57,60,64],[50,45,43,42],[None,69,72,73,74,77,76,None]),
 (43,[53,57,58,62],[43,46,50,52],[79,82,81,79,None,77,74,73]),
 (45,[55,58,61,64],[45,49,52,49],[73,76,79,82,81,None,76,73]),
 (38,[53,57,59,64],[38,41,45,48],[74,77,81,None,84,81,79,77]),
 (47,[57,63,65,69],[47,51,54,53],[75,78,81,83,None,81,78,75]),
 (40,[55,58,62,67],[40,43,46,44],[76,79,82,None,81,79,76,74]),
 (45,[55,58,61,65],[45,49,52,37],[73,76,79,82,81,79,76,73]),
]
B=[
 (46,[57,62,65,69],[46,50,53,52],[77,None,81,84,86,84,81,77]),
 (39,[55,61,65,68],[39,43,46,44],[79,82,85,82,None,79,77,75]),
 (45,[55,60,64,67],[45,48,52,49],[76,79,84,83,81,None,79,76]),
 (38,[54,60,64,69],[38,42,45,42],[78,81,84,81,None,78,76,74]),
 (43,[53,58,62,65],[43,46,50,49],[79,82,86,84,82,79,None,77]),
 (36,[52,58,62,67],[36,40,43,44],[76,79,82,81,79,76,74,72]),
 (41,[57,60,64,67],[41,45,48,44],[77,81,84,None,83,81,79,77]),
 (45,[55,58,61,65],[45,49,52,37],[76,79,82,85,84,82,79,73]),
]
for bar in range(BARS):
    root,chord,bass,melody=(B if 16<=bar<24 else A)[bar%8]
    b=bar*4
    # Four-to-the-bar bass with chromatic approaches and occasional pickup.
    for k,p in enumerate(bass):note(1,p,b+k,.86,90+rng.randrange(-5,6))
    if bar%4==3:note(1,bass[-1]+1,b+3.68,.19,65)
    # Syncopated piano comping: short, unevenly weighted chord punches.
    pattern=[(.0,.27,80),(1.65,.26,70),(2.65,.43,79)] if bar%2==0 else [(.65,.28,71),(2,.30,84),(3.65,.22,68)]
    for at,dur,v in pattern:
        for i,p in enumerate(chord):note(0,p,b+at+i*.008,dur,v+rng.randrange(-6,5))
    # Guitar quietly marks the quarter-note pulse underneath.
    for k in range(4):
        for p in chord[:3]:note(4,p-12,b+k+.012,.19,43+(k%2)*4)
    # Trumpet and tenor exchange two-bar phrases; bridge has piano responses.
    lead=2 if bar%8<4 else 3
    for k,p in enumerate(melody):
        at=k//2+(0 if k%2==0 else .63)
        dur=(.48 if k%2==0 else .25)
        if p is not None:
            if 16<=bar<24 and bar%2:note(0,p+12,b+at,dur,83+rng.randrange(-5,5))
            else:note(lead,p if lead==2 else p-12,b+at,dur,93+(k%2)*5+rng.randrange(-5,5))
    # Brass section answers at phrase ends, with room left for the melody.
    if bar%4 in (1,3):
        for k,at in enumerate([1.65,3.0]):
            for p in chord[1:3]:note(5,p,b+at,.22,67+k*7)
    # Jazz ride pattern, hi-hat on 2/4, tight snare backbeats and ghost notes.
    for at,v in [(0,76),(1,64),(1.65,55),(2,78),(3,64),(3.65,55)]:note(9,51,b+at,.16,v+rng.randrange(-5,5))
    for at in [1,3]:note(9,44,b+at,.13,66);note(9,38,b+at+.013,.14,75+rng.randrange(-5,5))
    for at in [0,2]:note(9,36,b+at,.18,72 if at==0 else 58)
    if bar%2:note(9,38,b+2.65,.09,37)
    if bar%8==7:
        for j,p in enumerate([38,38,48,45]):note(9,p,b+3+j*.25,.12,55+j*8)
    if bar in [0,8,16,24]:note(9,49,b,.6,65)
# Export exact sample positions; renderer keeps note tails for a seamless wrap.
events.sort(key=lambda e:(e[0],e[1]))
out=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/battle-jazz-events.txt')
out.write_text('\n'.join(' '.join(map(str,e)) for e in events)+'\n')
print(f'{BPM} BPM, {BARS} bars, {BARS*4*BEAT:.9f} sec, {len(events)//2} notes')
