// src/services/aiService.js

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Menggunakan endpoint Gemini 1.5 Flash (ringan, cepat, cocok untuk JSON parsing)
const GEMINI_ENDPOINT = import.meta.env.VITE_GEMINI_URL + GEMINI_API_KEY;

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

        const response = await fetch(GEMINI_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.3,
                },
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || "Gagal memanggil Gemini API");
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error("Gemini tidak mengembalikan respons.");

        return JSON.parse(rawText);
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

        const response = await fetch(GEMINI_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.2,
                },
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || "Gagal memanggil Gemini API");
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error("Gemini tidak mengembalikan respons.");

        return JSON.parse(rawText);
    },
};