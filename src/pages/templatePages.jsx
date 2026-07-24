import React, { useEffect, useState } from "react";
import { templateService } from "@/services/templateService";
import { Plus, Trash2, Edit3, Loader2 } from "lucide-react";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state untuk POST /templates
    const [formData, setFormData] = useState({
        name: "",
        type: "approval",
        default_config: "{}",
    });

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const res = await templateService.getTemplates();
            setTemplates(res?.data || res || []);
        } catch (err) {
            console.error("Gagal ambil template:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let parsedConfig = {};
            try {
                parsedConfig = JSON.parse(formData.default_config);
            } catch (jsonErr) {
                alert("Format default_config harus berupa JSON yang valid!");
                return;
            }

            const payload = {
                name: formData.name,
                type: formData.type,
                default_config: parsedConfig,
            };

            await templateService.createTemplate(payload);
            setIsModalOpen(false);
            setFormData({ name: "", type: "approval", default_config: "{}" });
            fetchTemplates(); // Refresh list
        } catch (err) {
            console.error("Gagal buat template:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin mau hapus template ini?")) return;
        try {
            await templateService.deleteTemplate(id);
            fetchTemplates();
        } catch (err) {
            console.error("Gagal hapus template:", err);
        }
    };

    return (
        <div className="p-6 bg-olive-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-olive-900">Node Templates</h1>
                    <p className="text-xs text-olive-700">Kelola master template node untuk canvas flow</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 text-white font-bold px-4 py-2 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-green-500 active:translate-y-0.5 transition-all text-xs cursor-pointer"
                >
                    <Plus size={16} /> Tambah Template
                </button>
            </div>

            {/* List Template Table / Grid */}
            {isLoading ? (
                <div className="flex items-center gap-2 text-olive-800">
                    <Loader2 className="animate-spin" size={20} /> Memuat data template...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((item) => (
                        <div
                            key={item.id}
                            className="p-4 bg-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] flex flex-col justify-between gap-3"
                        >
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-olive-900 text-sm">{item.name}</h3>
                                    <span className="text-[10px] font-black uppercase bg-olive-200 text-olive-800 px-2 py-0.5 border border-olive-900">
                                        {item.type}
                                    </span>
                                </div>
                                <pre className="mt-2 text-[10px] bg-slate-100 p-2 border border-slate-300 font-mono overflow-x-auto max-h-24">
                                    {JSON.stringify(item.default_config, null, 2)}
                                </pre>
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-2 border-olive-200">
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-300 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Tambah Template */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-6 w-full max-w-md">
                        <h2 className="text-lg font-black text-olive-900 mb-4">Tambah Template Node</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
                            <div>
                                <label className="font-bold text-olive-900 block mb-1">Nama Template</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border-2 border-olive-900 font-semibold"
                                    placeholder="Contoh: Approval Node"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-olive-900 block mb-1">Type</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full p-2 border-2 border-olive-900 font-semibold"
                                    placeholder="Contoh: approval, api_call, condition"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-olive-900 block mb-1">Default Config (JSON Format)</label>
                                <textarea
                                    rows={4}
                                    value={formData.default_config}
                                    onChange={(e) => setFormData({ ...formData, default_config: e.target.value })}
                                    className="w-full p-2 border-2 border-olive-900 font-mono text-[11px]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border-2 border-black font-bold text-olive-900 hover:bg-olive-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border-2 border-black bg-green-600 text-white font-bold hover:bg-green-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}