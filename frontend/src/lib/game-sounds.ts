let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function resumeGameAudio(): void {
  const c = getCtx();
  if (c?.state === "suspended") void c.resume();
}

function playOsc(
  freq: number,
  duration: number,
  type: OscillatorType,
  peakGain: number,
  freqEnd?: number
): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  if (c.state !== "running") return;

  const t0 = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined && freqEnd !== freq) {
    o.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + duration);
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + duration + 0.03);
}

function playNoise(duration: number, peakGain: number): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  if (c.state !== "running") return;
  const t0 = c.currentTime;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peakGain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(g);
  g.connect(c.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

export function playShoot(): void {
  playOsc(880, 0.045, "square", 0.06, 220);
  playOsc(440, 0.06, "sine", 0.04, 120);
}

export function playHit(): void {
  playNoise(0.07, 0.12);
  playOsc(180, 0.08, "triangle", 0.05, 60);
}

export function playHurt(): void {
  playNoise(0.1, 0.14);
  playOsc(95, 0.14, "sawtooth", 0.045, 45);
}

export function playKill(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  if (c.state !== "running") return;
  const t0 = c.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    const start = t0 + i * 0.05;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.07, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    o.connect(g);
    g.connect(c.destination);
    o.start(start);
    o.stop(start + 0.22);
  });
}
