export interface OpsiBacaSuara {
  rate?: number;
  pitch?: number;
  volume?: number;
  onSelesai?: () => void;
}

export function dukunganSuara(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

export function pilihSuaraIndonesia(): SpeechSynthesisVoice | null {
  if (!dukunganSuara()) return null;

  const daftarSuara = window.speechSynthesis.getVoices();
  return (
    daftarSuara.find((suara) => suara.lang.toLowerCase() === "id-id") ??
    daftarSuara.find((suara) => suara.lang.toLowerCase().startsWith("id")) ??
    null
  );
}

export function bacaTeks(teks: string, opsi: OpsiBacaSuara = {}): boolean {
  if (!dukunganSuara()) return false;

  const isi = teks.trim();
  if (!isi) return false;

  window.speechSynthesis.cancel();

  const ucapan = new SpeechSynthesisUtterance(isi);
  ucapan.lang = "id-ID";
  ucapan.rate = opsi.rate ?? 0.95;
  ucapan.pitch = opsi.pitch ?? 1;
  ucapan.volume = opsi.volume ?? 1;

  const suaraIndonesia = pilihSuaraIndonesia();
  if (suaraIndonesia) ucapan.voice = suaraIndonesia;
  if (opsi.onSelesai) ucapan.onend = opsi.onSelesai;

  window.speechSynthesis.speak(ucapan);
  return true;
}

export function hentikanSuara(): void {
  if (!dukunganSuara()) return;
  window.speechSynthesis.cancel();
}

export function sedangBerbicara(): boolean {
  return dukunganSuara() && window.speechSynthesis.speaking;
}
