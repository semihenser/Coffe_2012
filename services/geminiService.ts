import { GoogleGenAI } from "@google/genai";
import { Person } from "../types";

export const generateMotivationMessage = async (zeroContributors: Person[], topContributors: Person[]): Promise<string> => {
  // Use process.env.API_KEY as per Google GenAI SDK guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const zeroNames = zeroContributors.map(p => p.name).join(', ');
  const topNames = topContributors.slice(0, 3).map(p => `${p.name} (₺${p.totalPaid})`).join(', ');

  const prompt = `
    Sen ofis kahve fonunu yöneten eğlenceli, biraz sarkastik ama sevilen bir yapay zekasın.
    
    Durum Raporu:
    Bu ayın kahramanları: ${topNames || "Bu ay henüz kimse elini cebine atmadı :("}
    Bu ay henüz siftahı olmayan, pamuk ellerin cebe gitmediği kişiler: ${zeroNames || "Bu ay herkes bir şeyler ateşledi, harika!"}

    Görev:
    Ofis grubuna (Slack/WhatsApp) atılacak kısa, komik ve tatlı-sert bir mesaj yaz.
    Bu ay ödeme yapmayanları (isim vermeden genel konuşarak ya da çok tatlı sitem ederek) ödemeye teşvik et.
    Kahve fonunun aylık periyotlarla toplandığını ve taze kahve için kasanın dolması gerektiğini hatırlat.
    Türk ofis kültürüne uygun olsun. Emojiler kullan.
    Maksimum 3 cümle olsun.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || "Kahve hayattır, kasayı dolduralım arkadaşlar! ☕";
  } catch (error) {
    console.error("Gemini error:", error);
    return "Şu an yaratıcılığım tıkandı ama kahve lazım! ☕";
  }
};