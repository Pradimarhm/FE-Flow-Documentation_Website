import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const MODEL_NAME = "gemini-3.5-flash";

export const aiService = {
    generateFlowDetails: async ({ flowName }) => {
        if (!GEMINI_API_KEY) {
            throw new Error("VITE_GEMINI_API_KEY belum terpasang di .env!");
        }

        const promptText = `
        Kamu adalah AI Assistant untuk sistem Workflow Engine Enterprise.
        Tugasmu adalah membuat deskripsi profesional dan merekomendasikan kategori berdasarkan nama Flow yang diinput user.

        Nama Flow: "${flowName}"

        Aturan Output:
        - "description": Buat penjelasan singkat (1-2 kalimat) yang jelas, formal, dan profesional mengenai alur proses dari flow tersebut.
        - "category": Tentukan kategori yang paling cocok dari opsi berikut: ["general", "approval", "automation", "integration", "notification"].

        Format JSON Wajib:
        {
          "description": "Deskripsi alur proses di sini...",
          "category": "approval"
        }
        `;

        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: promptText,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.3,
                },
            });

            const rawText = response.text;
            if (!rawText) throw new Error("Gemini tidak mengembalikan respons.");

            return JSON.parse(rawText);
        } catch (error) {
            console.error("Gemini API Error (generateFlowDetails):", error);
            throw new Error(error.message || "Gagal memanggil Gemini API");
        }
    },

    generateTemplateDetails: async ({ name, nodeType }) => {
        if (!GEMINI_API_KEY) {
            throw new Error("VITE_GEMINI_API_KEY belum terpasang di .env!");
        }

        const promptText = `
        Kamu adalah AI Assistant untuk workflow engine visual. 
        Tugasmu adalah generate default configuration untuk template node berdasarkan Nama Template dan Node Type.

        Nama Template: "${name}"
        Node Type: "${nodeType}"

        Aturan Output:
        - "default_input_params": JSON Object berisi parameter input default yang relevan (misal: {"stock": 10, "item_id": "string"}).
        - "default_validation": String logika/JS expression singkat jika relevan (misal: "stock > 0 && item_id != null"), atau biarkan "" jika tidak perlu.
        - "default_process_logic": String ringkas logika/query/endpoint (misal: "SELECT stock FROM products WHERE id = :item_id").
        - "default_output_template": JSON Object contoh response/output (misal: {"status": "success", "isValid": true}).

        Format JSON WAJIB MURNI:
        {
            "default_input_params": {},
            "default_validation": "",
            "default_process_logic": "",
            "default_output_template": {}
        }
        `;

        try {
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: promptText,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.2,
                },
            });

            const rawText = response.text;
            if (!rawText) throw new Error("Gemini tidak mengembalikan respons.");

            return JSON.parse(rawText);
        } catch (error) {
            console.error("Gemini API Error (generateTemplateDetails):", error);
            throw new Error(error.message || "Gagal memanggil Gemini API");
        }
    },
};