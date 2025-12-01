import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// System instruction to give the AI context about the Volleyball Club
const SYSTEM_INSTRUCTION = `
Sei l'assistente virtuale ufficiale della Libertas Borgo Volley, una società di pallavolo situata a Borgo San Dalmazzo (CN).
I colori sociali sono il Bianco e il Blu.
Il tuo tono deve essere sportivo, accogliente e professionale.
Rispondi alle domande dei tifosi, genitori e atleti.

Informazioni chiave da sapere (inventate per demo):
- Presidente: Mario Rossi.
- Palestra di casa: Palazzetto dello Sport di Borgo San Dalmazzo, Via Giovanni XXIII.
- Squadre: Abbiamo squadre dal Minivolley alla Serie C.
- Prossima partita: Sabato alle 18:00 contro il Cuneo Volley (Serie C).
- Contatti: info@libertasborgo.it.

Se non sai una risposta specifica, invita l'utente a contattare la segreteria tramite la pagina Contatti.
Rispondi sempre in italiano.
Sii conciso.
`;

export const getGeminiResponse = async (userMessage: string): Promise<string> => {
  if (!API_KEY) {
    return "Mi dispiace, la chiave API non è configurata. Non posso rispondere al momento.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Using gemini-2.5-flash for speed and efficiency for a chat bot
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "Mi dispiace, non ho capito la domanda.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Si è verificato un errore nel recuperare la risposta. Riprova più tardi.";
  }
};