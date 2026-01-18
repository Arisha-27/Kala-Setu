// src/projects/artist/lib/translation.ts

export const translateMessage = async (text: string, sourceLang: string, targetLang: string) => {
  try {
    if (!text || !text.trim()) return "";

    // Don't translate if languages are the same
    if (sourceLang === targetLang) return text;

    // 👇 MAGIC FIX: Use the free Google Translate endpoint (client=gtx)
    // This requires NO API KEY and works instantly.
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    const data = await response.json();

    // The API returns a nested array structure. We map and join the segments.
    // Example response: [[["Translated Text", "Original", ...]]]
    if (data && data[0]) {
      return data[0].map((item: any) => item[0]).join("");
    }

    return text;

  } catch (error) {
    console.error("Translation Error:", error);
    return text; // Fallback to original text
  }
};