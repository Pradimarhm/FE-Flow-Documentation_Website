import React, { useEffect, useState } from "react";
import { templateService } from "@/services/templateService";
import { Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { NODE_TYPE_CONFIG } from "@/config/nodeTypes";


export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // <--- Tambahkan ini

    // State disesuaikan dengan payload backend
    const [formData, setFormData] = useState({
        name: "",
        node_type: "process",
        default_input_params: "{}",
        default_validation: "",
        default_process_logic: "",
        default_output_template: "{}",
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
            let parsedInput = {};
            let parsedOutput = {};
            try {
                parsedInput = JSON.parse(formData.default_input_params);
                parsedOutput = JSON.parse(formData.default_output_template);
            } catch (jsonErr) {
                alert(
                    "Format default_input_params atau default_output_template harus JSON valid!",
                );
                return;
            }

            const payload = {
                name: formData.name,
                node_type: formData.node_type,
                default_input_params: parsedInput,
                default_validation: formData.default_validation,
                default_process_logic: formData.default_process_logic,
                default_output_template: parsedOutput,
            };

            await templateService.createTemplate(payload);
            setIsModalOpen(false);
            setFormData({
                name: "",
                node_type: "process",
                default_input_params: "{}",
                default_validation: "",
                default_process_logic: "",
                default_output_template: "{}",
            });
            fetchTemplates();
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
            <div className="flex justify-between items-center mb-10 pb-4 border-b-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-olive-900 tracking-tight">
                        Node Templates
                    </h1>
                    <p className="text-olive-700">
                        Kelola master template node untuk canvas flow
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xs bg-green-500 text-green-50 text-xs font-bold border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-green-700 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                    <Plus size={16} /> Tambah Template
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 text-olive-800">
                    <Loader2 className="animate-spin" size={20} /> Memuat data
                    template...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Di dalam map templates item[cite: 6] */}
                    {templates.map((item) => {
                        // Ambil konfigurasi visual berdasarkan node_type
                        const typeConfig = NODE_TYPE_CONFIG[item.node_type] || NODE_TYPE_CONFIG.process;
                        const IconComponent = typeConfig.icon;

                        return (
                            <div
                                key={item.id}
                                className="p-4 bg-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-3"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-2">
                                            {/* Ikon Otomatis Sesuai Type */}
                                            <div className={`p-1.5 border-2 border-black ${typeConfig.badgeColor}`}>
                                                <IconComponent size={16} className="text-black" />
                                            </div>
                                            <h3 className="font-bold text-olive-900 text-sm">
                                                {item.name}
                                            </h3>
                                        </div>
                                        
                                        {/* Badge Warna Sesuai Type */}
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${typeConfig.badgeColor}`}>
                                            {item.node_type}
                                        </span>
                                    </div>

                                    <div className="mt-3 text-[10px] bg-slate-50 p-2 border-2 border-black font-mono overflow-x-auto max-h-24">
                                        <p className="font-bold text-black mb-1">Input Params:</p>
                                        <pre>{JSON.stringify(item.default_input_params, null, 2)}</pre>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t-2 border-olive-200 pt-2">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-300 rounded cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-black text-olive-900 mb-4">
                            Tambah Template Node
                        </h2>
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3 text-xs"
                        >
                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Nama Template
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border-2 border-olive-900 font-semibold"
                                />
                            </div>
                            {/* Custom Neo-Brutalist Dropdown dengan Lucide Icon */}
                            <div className="relative">
                                <label className="font-bold text-olive-900 block mb-1">
                                    Node Type
                                </label>
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full p-2 border-2 border-olive-900 font-semibold bg-white cursor-pointer flex justify-between items-center select-none"
                                >
                                    <span className="capitalize">{formData.node_type}</span>
                                    <ChevronDown size={16} className={`text-olive-900 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-olive-900 shadow-[4px_4px_0px_rgba(54,69,79,1)] z-50 flex flex-col">
                                        {["start", "process", "validation", "database", "api", "end"].map((type) => (
                                            <div
                                                key={type}
                                                onClick={() => {
                                                    setFormData({ ...formData, node_type: type });
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="p-2 text-xs font-semibold hover:bg-olive-200 cursor-pointer capitalize border-b border-olive-200 last:border-b-0"
                                            >
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Input Params (JSON)
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.default_input_params}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            default_input_params:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border-2 border-olive-900 font-mono text-[11px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Validation Logic
                                </label>
                                <input
                                    type="text"
                                    value={formData.default_validation}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            default_validation: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border-2 border-olive-900 font-mono text-[11px]"
                                    placeholder="Contoh: stock > 10"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Process Logic
                                </label>
                                <input
                                    type="text"
                                    value={formData.default_process_logic}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            default_process_logic:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border-2 border-olive-900 font-mono text-[11px]"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-olive-900 block mb-1">
                                    Output Template (JSON)
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.default_output_template}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            default_output_template:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border-2 border-olive-900 font-mono text-[11px]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border-2 border-black font-bold text-olive-900 hover:bg-olive-200 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xs bg-green-500 text-green-50 text-xs font-bold border-2 border-olive-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-green-700 -translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
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
