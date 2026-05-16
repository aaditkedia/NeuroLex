// Thin wrapper around the browser SpeechSynthesis API. Exposes a tiny
// imperative controller that React components can hold in a ref.

export type TTSState = 'idle' | 'speaking' | 'paused';

export type TTSController = {
  speak: (text: string, opts?: { rate?: number; pitch?: number; voiceURI?: string }) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  state: () => TTSState;
  voices: () => SpeechSynthesisVoice[];
  isSupported: () => boolean;
};

export function createTTS(onChange?: (s: TTSState) => void): TTSController {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  let current: SpeechSynthesisUtterance | null = null;

  const emit = (s: TTSState) => onChange?.(s);

  return {
    isSupported: () => supported,
    voices: () => (supported ? speechSynthesis.getVoices() : []),
    state: () => {
      if (!supported) return 'idle';
      if (speechSynthesis.speaking && !speechSynthesis.paused) return 'speaking';
      if (speechSynthesis.paused) return 'paused';
      return 'idle';
    },
    speak: (text, opts = {}) => {
      if (!supported || !text.trim()) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 1;
      u.pitch = opts.pitch ?? 1;
      if (opts.voiceURI) {
        const v = speechSynthesis.getVoices().find((vv) => vv.voiceURI === opts.voiceURI);
        if (v) u.voice = v;
      }
      u.onend = () => emit('idle');
      u.onerror = () => emit('idle');
      u.onstart = () => emit('speaking');
      u.onpause = () => emit('paused');
      u.onresume = () => emit('speaking');
      current = u;
      speechSynthesis.speak(u);
    },
    pause: () => {
      if (!supported) return;
      speechSynthesis.pause();
    },
    resume: () => {
      if (!supported) return;
      speechSynthesis.resume();
    },
    stop: () => {
      if (!supported) return;
      speechSynthesis.cancel();
      current = null;
      emit('idle');
    },
  };
}
