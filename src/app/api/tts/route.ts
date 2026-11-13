const MAKS_PANJANG_TEKS = 190;

export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get("text")?.trim() ?? "";

  if (!text) {
    return new Response("Teks kosong", { status: 400 });
  }

  if (text.length > MAKS_PANJANG_TEKS) {
    return new Response("Teks terlalu panjang", { status: 400 });
  }

  const url = new URL("https://translate.googleapis.com/translate_tts");
  url.searchParams.set("ie", "UTF-8");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("tl", "id");
  url.searchParams.set("q", text);

  try {
    const google = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
      cache: "no-store",
    });

    if (!google.ok || !google.body) {
      return new Response("Suara Google tidak tersedia", { status: 502 });
    }

    return new Response(google.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Gagal menghubungi Google", { status: 502 });
  }
}
