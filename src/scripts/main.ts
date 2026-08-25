// A browser drum kit. Every sound below is synthesized live with the Web
// Audio API — no samples, no <audio> tags — so the AudioContext only exists
// once a player interacts (autoplay policy leaves it suspended otherwise).

function noiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

type Voice = (ctx: AudioContext, out: AudioNode) => void;

function playKick(ctx: AudioContext, out: AudioNode) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
  gain.gain.setValueAtTime(1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(gain).connect(out);
  osc.start(now);
  osc.stop(now + 0.3);
}

function playSnare(ctx: AudioContext, out: AudioNode) {
  const now = ctx.currentTime;

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 0.2);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  noise.connect(noiseFilter).connect(noiseGain).connect(out);
  noise.start(now);
  noise.stop(now + 0.2);

  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.value = 180;
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.6, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  body.connect(bodyGain).connect(out);
  body.start(now);
  body.stop(now + 0.15);
}

// Shared by both hi-hat states: inharmonic square oscillators through a
// narrow bandpass reads as metallic, the way a real hi-hat's overlapping
// partials do. Only the envelope length tells closed and open apart.
function playHiHat(ctx: AudioContext, out: AudioNode, duration: number) {
  const now = ctx.currentTime;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 8000;
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  bandpass.connect(highpass).connect(gain).connect(out);

  for (const freq of [200, 300, 550, 800, 1100, 1500]) {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;
    osc.connect(bandpass);
    osc.start(now);
    osc.stop(now + duration);
  }
}

// A closed hit chokes almost instantly; an open hit rings and sizzles —
// the two pedal positions of a real hi-hat.
function playHiHatClosed(ctx: AudioContext, out: AudioNode) {
  playHiHat(ctx, out, 0.06);
}

function playHiHatOpen(ctx: AudioContext, out: AudioNode) {
  playHiHat(ctx, out, 0.5);
}

// One pitch-swept oscillator shared by all three toms — only the frequency
// range and length change from rack tom down to floor tom.
function makeTom(highFreq: number, lowFreq: number, duration: number): Voice {
  return (ctx, out) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(highFreq, now);
    osc.frequency.exponentialRampToValueAtTime(lowFreq, now + duration);
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.1);
    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + duration + 0.1);
  };
}

const playHiTom = makeTom(320, 150, 0.22);
const playMidTom = makeTom(220, 90, 0.28);
const playLowTom = makeTom(150, 65, 0.34);

function playCrash(ctx: AudioContext, out: AudioNode) {
  const now = ctx.currentTime;
  const duration = 1.2;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, duration);
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 5000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  noise.connect(highpass).connect(gain).connect(out);
  noise.start(now);
  noise.stop(now + duration);
}

// A ride reads as a longer, softer wash than a crash, with a clear bell
// pitch ringing underneath it rather than pure noise.
function playRide(ctx: AudioContext, out: AudioNode) {
  const now = ctx.currentTime;
  const duration = 1.6;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, duration);
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 6000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  noise.connect(bandpass).connect(noiseGain).connect(out);
  noise.start(now);
  noise.stop(now + duration);

  const bell = ctx.createOscillator();
  bell.type = "sine";
  bell.frequency.value = 800;
  const bellGain = ctx.createGain();
  bellGain.gain.setValueAtTime(0.25, now);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  bell.connect(bellGain).connect(out);
  bell.start(now);
  bell.stop(now + 0.8);
}

const VOICES: Record<string, Voice> = {
  kick: playKick,
  snare: playSnare,
  "hihat-closed": playHiHatClosed,
  "hihat-open": playHiHatOpen,
  "hi-tom": playHiTom,
  "mid-tom": playMidTom,
  "low-tom": playLowTom,
  ride: playRide,
  crash: playCrash,
};

let audioContext: AudioContext | undefined;
let master: GainNode | undefined;

function getAudio(): { ctx: AudioContext; out: GainNode } {
  if (!audioContext || !master) {
    audioContext = new AudioContext();
    master = audioContext.createGain();
    master.gain.value = 0.9;
    master.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return { ctx: audioContext, out: master };
}

function trigger(drum: string, pad?: HTMLElement) {
  const voice = VOICES[drum];
  if (!voice) return;
  const { ctx, out } = getAudio();
  voice(ctx, out);
  if (pad) {
    pad.classList.add("active");
    setTimeout(() => pad.classList.remove("active"), 120);
  }
}

const pads = document.querySelectorAll<HTMLButtonElement>(".hit");
const keyToPad = new Map<string, HTMLButtonElement>();

for (const pad of pads) {
  const key = pad.dataset.key;
  if (key) keyToPad.set(key, pad);
  pad.addEventListener("pointerdown", () => {
    const drum = pad.dataset.drum;
    if (drum) trigger(drum, pad);
  });
}

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const pad = keyToPad.get(event.key.toLowerCase());
  if (!pad) return;
  const drum = pad.dataset.drum;
  if (drum) trigger(drum, pad);
});
