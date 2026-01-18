const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inline_data: { mime_type: string; data: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inline_data: {
            mime_type: file.type,
            data: base64Data
          }
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.readAsDataURL(file);
  });
};

export const generateListingFromImage = async (file: File) => {
  try {
    if (!file) throw new Error("No file provided");

    const imagePart = await fileToGenerativePart(file);

    const prompt = `
      You are an expert curator for an Indian Artisan Marketplace. 
      Analyze the image and generate a product listing in RAW JSON format.
      Fields required:
      - "title": Catchy title mentioning craft and material.
      - "description": 2 sentences describing the item, its traditional origin (guess state like Rajasthan/Bengal), and utility.
      - "tags": Array of 5 keywords.
      - "price": Estimated price in INR (number only, e.g. 1500).
      
      Output strictly valid JSON only. No markdown formatting.
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            imagePart
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error Body:", errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) throw new Error("No text returned from AI");

    // Clean up response if AI adds markdown code blocks
    const cleanJson = textResponse.replace(/```json|```/g, '').trim();

    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("AI Generation Failed:", error);
    return null;
  }
};