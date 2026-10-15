// Sonidos sintetizados con Web Audio (sin archivos). Solo suenan si el ajuste
// `sounds` está activado: quien llama decide.

export type SoundKind = 'move' | 'capture' | 'check' | 'correct' | 'wrong' | 'complete';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(ac: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, gain: number, endFreq?: number) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Un golpe seco de madera: ruido filtrado muy corto. */
function knock(ac: AudioContext, start: number, freq: number, gain: number) {
  const len = Math.floor(ac.sampleRate * 0.06);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 1.4;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start(start);
}

export function playSound(kind: SoundKind) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.01;
  switch (kind) {
    case 'move':
      knock(ac, t, 1500, 0.9);
      break;
    case 'capture':
      knock(ac, t, 900, 1.1);
      knock(ac, t + 0.045, 1300, 0.6);
      break;
    case 'check':
      knock(ac, t, 1500, 0.8);
      tone(ac, 880, t + 0.02, 0.12, 'triangle', 0.06);
      break;
    case 'correct':
      tone(ac, 659, t, 0.11, 'sine', 0.12);
      tone(ac, 988, t + 0.09, 0.18, 'sine', 0.12);
      break;
    case 'wrong':
      tone(ac, 220, t, 0.22, 'triangle', 0.12, 150);
      break;
    case 'complete':
      [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, t + i * 0.09, 0.22, 'sine', 0.1));
      break;
  }
}
