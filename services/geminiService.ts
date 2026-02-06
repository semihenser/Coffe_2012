import { GoogleGenAI } from "@google/genai";
import { Person } from "../types";

export const generateMotivationMessage = async (unpaidPeople: Person[], paidPeople: Person[]): Promise<string> => {
  // Always use process.env.API_KEY directly as per guidelines. 
  // We assume the environment is correctly configured.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const unpaidNames = unpaidPeople.map(p => p.name).join(', ');
  const paidNames = paidPeople.map(p => p.name).join(', ');

  const prompt = `
    Sen ofis kahve fonunu yöneten eğlenceli, biraz sarkastik ama sevilen bir yapay zekasın.
    
    Durum Raporu:
    Parayı veren harika insanlar: ${paidNames || "Henüz kimse vermedi :("}
    Henüz pamuk elleri cebe atmayanlar: ${unpaidNames || "Herkes ödedi! Harika!"}

    Görev:
    Ofis grubuna (Slack/WhatsApp) atılacak kısa, komik ve tatlı-sert bir mesaj yaz. 
    Parayı vermeyenleri (isim vermeden genel konuşarak ya da çok tatlı sitem ederek) ödemeye teşvik et. 
    Kahvenin önemini vurgula. Türk ofis kültürüne uygun olsun. Emojiler kullan.
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

    return response.text || "Kahve hayattır, lütfen ödeme yapalım! ☕";
  } catch (error) {
    console.error("Gemini error:", error);
    return "Şu an yaratıcılığım tıkandı ama kahve lazım! ☕";
  }
};