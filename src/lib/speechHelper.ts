export interface OpsiBacaSuara {
  rate?: number;
  pitch?: number;
  volume?: number;
  onSelesai?: () => void;
}

interface SuaraEspeak {
  name: string;
  identifier: string;
  languages?: Array<{ name: string; priority: number }>;
}

interface MesinEspeak {
  onReady: (callback: (error?: unknown) => void) => void;
  getVoices: (callback: (voices: SuaraEspeak[]) => void) => void;
  speak: (
    teks: string,
    opsi: {
      voice?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
      enhance?: boolean;
    },
    callback: (audio: Float32Array | null, sampleRate: number) => void,
  ) => void;
}

type KonstruktorEspeak = new (opsi?: {
  workerPath?: string;
  defaultVoice?: string;
  defaultRate?: number;
  defaultPitch?: number;
  defaultVolume?: number;
  enhanceAudio?: boolean;
}) => MesinEspeak;

declare global {
  interface Window {
    SimpleTTS?: KonstruktorEspeak;
    webkitAudioContext?: typeof AudioContext;
  }
}

const POLA_SUARA_INDONESIA = /indones|andika|gadis|damayanti|bahasa/i;

let daftarSuara: SpeechSynthesisVoice[] = [];
let janjiSuara: Promise<SpeechSynthesisVoice[]> | null = null;
let janjiEspeak: Promise<MesinEspeak | null> | null = null;
let konteksAudio: AudioContext | null = null;
let sumberAudio: AudioBufferSourceNode | null = null;
let generasi = 0;

export function dukunganSuara(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) ||
    "AudioContext" in window ||
    "webkitAudioContext" in window
  );
}

function pilihDariDaftar(daftar: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const cocok = daftar.filter(
    (suara) =>
      /^id(-|$)/i.test(suara.lang) || POLA_SUARA_INDONESIA.test(suara.name),
  );

  return (
    cocok.find((suara) => suara.localService) ??
    cocok[0] ??
    daftar.find((suara) => suara.lang.toLowerCase() === "id-id") ??
    null
  );
}

export function pilihSuaraIndonesia(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return pilihDariDaftar(window.speechSynthesis.getVoices());
}

function muatDaftarSuara(): Promise<SpeechSynthesisVoice[]> {
  if (daftarSuara.length > 0) return Promise.resolve(daftarSuara);
  if (janjiSuara) return janjiSuara;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }

  const janji = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let selesai = false;
    const beres = () => {
      if (selesai) return;
      selesai = true;
      window.speechSynthesis.removeEventListener("voiceschanged", beres);
      const suara = window.speechSynthesis.getVoices();
      if (suara.length > 0) daftarSuara = suara;
      janjiSuara = null;
      resolve(suara);
    };

    const awal = window.speechSynthesis.getVoices();
    if (awal.length > 0) {
      daftarSuara = awal;
      janjiSuara = null;
      resolve(awal);
      return;
    }

    window.speechSynthesis.addEventListener("voiceschanged", beres);
    window.setTimeout(beres, 1_200);
  });

  janjiSuara = janji;
  return janji;
}

function siapkanAudio(): AudioContext | null {
  if (!konteksAudio) {
    const Konstruktor = window.AudioContext ?? window.webkitAudioContext;
    if (!Konstruktor) return null;
    konteksAudio = new Konstruktor();
  }
  if (konteksAudio.state === "suspended") void konteksAudio.resume();
  return konteksAudio;
}

function putarAudioEspeak(
  audio: Float32Array,
  sampleRate: number,
  onSelesai?: () => void,
): boolean {
  const konteks = siapkanAudio();
  if (!konteks) return false;

  const buffer = konteks.createBuffer(1, audio.length, sampleRate);
  buffer.getChannelData(0).set(audio);
  const sumber = konteks.createBufferSource();
  sumber.buffer = buffer;
  sumber.connect(konteks.destination);
  sumber.onended = () => {
    if (sumberAudio === sumber) sumberAudio = null;
    onSelesai?.();
  };
  sumberAudio = sumber;
  sumber.start();
  return true;
}

function muatEspeak(): Promise<MesinEspeak | null> {
  if (janjiEspeak) return janjiEspeak;

  janjiEspeak = new Promise((resolve) => {
    let selesai = false;
    const beres = (mesin: MesinEspeak | null) => {
      if (selesai) return;
      selesai = true;
      resolve(mesin);
    };

    const mulai = () => {
      const Konstruktor = window.SimpleTTS;
      if (!Konstruktor) {
        beres(null);
        return;
      }

      const mesin = new Konstruktor({
        workerPath: "/espeak/espeakng.worker.js",
        defaultVoice: "id",
        defaultRate: 160,
        defaultPitch: 50,
        defaultVolume: 1,
        enhanceAudio: true,
      });

      mesin.onReady((error) => {
        if (error) {
          beres(null);
          return;
        }
        beres(mesin);
      });

      window.setTimeout(() => beres(null), 12_000);
    };

    if (window.SimpleTTS) {
      mulai();
      return;
    }

    const script = document.createElement("script");
    script.src = "/espeak/espeakng-simple.js";
    script.async = true;
    script.onload = mulai;
    script.onerror = () => beres(null);
    document.head.appendChild(script);
  });

  return janjiEspeak;
}

function pilihSuaraEspeak(mesin: MesinEspeak): Promise<SuaraEspeak | null> {
  return new Promise((resolve) => {
    mesin.getVoices((voices) => {
      const suara =
        voices.find((item) =>
          item.languages?.some((bahasa) => /^id(-|$)/i.test(bahasa.name)),
        ) ??
        voices.find((item) => /indonesian/i.test(item.name)) ??
        voices.find((item) => item.identifier === "id") ??
        null;
      resolve(suara);
    });
  });
}

function bacaDenganEspeak(
  teks: string,
  opsi: OpsiBacaSuara,
  idGenerasi: number,
): Promise<boolean> {
  return muatEspeak().then(async (mesin) => {
    if (!mesin || idGenerasi !== generasi) return false;

    const suara = await pilihSuaraEspeak(mesin);
    if (!suara || idGenerasi !== generasi) return false;

    return new Promise((resolve) => {
      mesin.speak(
        teks,
        {
          voice: suara.identifier,
          rate: Math.round((opsi.rate ?? 0.95) * 170),
          pitch: 50,
          volume: opsi.volume ?? 1,
          enhance: true,
        },
        (audio, sampleRate) => {
          if (idGenerasi !== generasi || !audio) {
            resolve(false);
            return;
          }

          resolve(putarAudioEspeak(audio, sampleRate, opsi.onSelesai));
        },
      );
    });
  });
}

function ucapkanNative(
  teks: string,
  suara: SpeechSynthesisVoice,
  opsi: OpsiBacaSuara,
): Promise<boolean> {
  return new Promise((resolve) => {
    const ucapan = new SpeechSynthesisUtterance(teks);
    ucapan.lang = "id-ID";
    ucapan.voice = suara;
    ucapan.rate = opsi.rate ?? 0.95;
    ucapan.pitch = opsi.pitch ?? 1;
    ucapan.volume = opsi.volume ?? 1;
    ucapan.onend = () => opsi.onSelesai?.();

    let selesai = false;
    const beres = (berhasil: boolean) => {
      if (selesai) return;
      selesai = true;
      resolve(berhasil);
    };

    ucapan.onstart = () => beres(true);
    ucapan.onerror = () => beres(false);
    window.speechSynthesis.speak(ucapan);
    window.setTimeout(() => {
      if (!selesai) beres(window.speechSynthesis.speaking);
    }, 1_600);
  });
}

export async function bacaTeks(teks: string, opsi: OpsiBacaSuara = {}): Promise<boolean> {
  if (!dukunganSuara()) return false;

  const isi = teks.trim();
  if (!isi) return false;

  hentikanSuara();
  const idGenerasi = generasi;
  siapkanAudio();

  const daftar = await muatDaftarSuara();
  if (idGenerasi !== generasi) return false;

  const suara = pilihDariDaftar(daftar);
  if (suara) {
    const berhasil = await ucapkanNative(isi, suara, opsi);
    if (berhasil) return true;
    window.speechSynthesis.cancel();
    if (idGenerasi !== generasi) return false;
  }

  return bacaDenganEspeak(isi, opsi, idGenerasi);
}

export function hentikanSuara(): void {
  generasi += 1;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  if (sumberAudio) {
    try {
      sumberAudio.stop();
    } catch {
      // Audio sudah berhenti.
    }
    sumberAudio = null;
  }
}

export function sedangBerbicara(): boolean {
  if (!dukunganSuara()) return false;
  return (
    (typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      window.speechSynthesis.speaking) ||
    sumberAudio !== null
  );
}
