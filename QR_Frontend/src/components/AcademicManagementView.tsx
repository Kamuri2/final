import { useState, useEffect } from 'react';

interface Grupo {
    id: number;
    nombre: string;
}

interface Carrera {
    id: number;
    nombre: string;
    grupos: Grupo[];
}

const AcademicManagementView = () => {
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [selectedCarrera, setSelectedCarrera] = useState<Carrera | null>(null);

    // Inputs independientes para evitar que se escriba en ambos lados
    const [inputCarrera, setInputCarrera] = useState("");
    const [inputGrupo, setInputGrupo] = useState("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const API_URL = 'https://api-fraktalid.utvt.cloud/graphql';

    // --- 1. LEER (READ): Cargar datos desde la DB ---
    const fetchData = async () => {
        const query = { query: `query { getCarreras { id nombre grupos { id nombre } } }` };
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(query),
            });
            const result = await res.json();
            const lista = result.data.getCarreras || [];
            setCarreras(lista);

            if (selectedCarrera) {
                const actualizada = lista.find((c: Carrera) => c.id === selectedCarrera.id);
                if (actualizada) setSelectedCarrera(actualizada);
            }
        } catch (e) { console.error("Error al jalar datos:", e); }
    };

    // Solo cargamos los datos al inicio. El script de Tenor ha sido ELIMINADO.
    useEffect(() => {
        fetchData();
    }, []);

    // --- 2. CREAR (CREATE) ---
    const handleCreate = async (tipo: 'carrera' | 'grupo') => {
        const valor = tipo === 'carrera' ? inputCarrera : inputGrupo;
        if (!valor) return;

        const mutation = tipo === 'carrera'
            ? { query: `mutation($n: String!) { createCarrera(nombre: $n) { id } }`, variables: { n: valor } }
            : { query: `mutation($n: String!, $cId: Int!) { createGrupo(nombre: $n, carreraId: $cId) { id } }`, variables: { n: valor, cId: selectedCarrera?.id } };

        await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mutation) });

        if (tipo === 'carrera') setInputCarrera("");
        else setInputGrupo("");

        fetchData();
    };

    // --- 3. ACTUALIZAR (UPDATE) ---
    const handleUpdate = async (tipo: 'carrera' | 'grupo', id: number) => {
        const mutationName = tipo === 'carrera' ? 'updateCarrera' : 'updateGrupo';
        const mutation = {
            query: `mutation($id: Int!, $n: String!) { ${mutationName}(id: $id, nombre: $n) { id } }`,
            variables: { id, n: editValue }
        };
        await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mutation) });
        setEditingId(null);
        fetchData();
    };

    // --- 4. ELIMINAR (DELETE) ---
    const handleDelete = async (tipo: 'carrera' | 'grupo', id: number) => {
        if (!confirm(`¿Eliminar este ${tipo}?`)) return;
        const mutationName = tipo === 'carrera' ? 'deleteCarrera' : 'deleteGrupo';
        const mutation = { query: `mutation($id: Int!) { ${mutationName}(id: $id) { id } }`, variables: { id } };
        await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mutation) });
        if (tipo === 'carrera' && selectedCarrera?.id === id) setSelectedCarrera(null);
        fetchData();
    };

    return (
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500">

            {/* HEADER CON BRANDING Y EL MICHI LOCAL */}
            <div className="flex justify-between items-center px-2">
                <div className="flex-1">
                    <h2 className="text-3xl font-black tracking-tighter uppercase font-jp text-white">Gestión Académica</h2>
                    <p className="text-[#B08D6D] text-[10px] tracking-[0.4em] uppercase">Carreras / Grupos / Estructura</p>
                </div>


                <div className="flex-1 flex justify-center">
                    {/* Contenedor más grande, transparente y centrado */}
                    <div className="w-90 h-90">
                        <img
                            src="/hu-tao-cool.gif"
                            alt="rei-ayanami"
                            className="w-50 h-50 object-contain"
                        />
                    </div>
                </div>

                {/* BRANDING QRIFY */}
                <div className="flex-1 flex justify-end">
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <h1 className="text-xl font-black tracking-[0.2em] text-white leading-none">QRIFY</h1>
                            <p className="text-[7px] text-[#B08D6D] tracking-[0.3em] uppercase">Admin Console</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-1 bg-[#B08D6D] rounded-full blur opacity-20 animate-pulse"></div>
                            <img src="/ICONO.png" className="relative w-40 h-40 rounded-full border border-[#B08D6D]/40 shadow-lg" alt="logo" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PANEL IZQUIERDO: CARRERAS (SIN CAMBIOS VISUALES SOLICITADOS) */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-[#B08D6D] text-[10px] font-black tracking-[0.4em] uppercase px-2">Lista de Carreras</h3>

                    <div className="bg-white/10 p-4 rounded-2xl border border-[#B08D6D]/30 flex gap-2 shadow-inner focus-within:border-[#B08D6D] transition-all">
                        <input
                            type="text"
                            placeholder="Escribe la carrera..."
                            value={inputCarrera}
                            onChange={(e) => setInputCarrera(e.target.value)}
                            className="flex-1 bg-transparent text-sm font-bold outline-none text-white placeholder:text-white/20"
                        />
                        <button onClick={() => handleCreate('carrera')} className="bg-[#B08D6D] text-black w-8 h-8 rounded-lg font-black hover:scale-110 transition-transform">＋</button>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {carreras.map(c => (
                            <div key={c.id} onClick={() => setSelectedCarrera(c)} className={`group p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${selectedCarrera?.id === c.id ? 'border-[#B08D6D] bg-[#B08D6D]/20 shadow-[0_0_20px_rgba(176,141,109,0.1)]' : 'border-white/5 bg-black/40 hover:bg-white/5'}`}>
                                {editingId === c.id ? (
                                    <input
                                        autoFocus
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => handleUpdate('carrera', c.id)}
                                        className="bg-white/20 text-white outline-none text-sm font-bold w-full p-1 rounded border border-[#B08D6D]"
                                    />
                                ) : (
                                    <span className="text-sm font-black uppercase text-white tracking-tight">{c.nombre}</span> // Letras Blancas
                                )}
                                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingId(c.id); setEditValue(c.nombre); }} className="text-white hover:text-[#B08D6D] text-[9px] font-black underline decoration-[#B08D6D]/40">EDITAR</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete('carrera', c.id); }} className="text-white hover:text-red-500 text-[9px] font-black underline decoration-red-500/40">BORRAR</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PANEL DERECHO: GRUPOS (SIN CAMBIOS VISUALES SOLICITADOS) */}
                <div className="lg:col-span-8 bg-black/60 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    {/* Logo de fondo sutil */}
                    <img src="/ICONO.png" className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.03] pointer-events-none grayscale" />

                    {selectedCarrera ? (
                        <div className="relative z-10 animate-in slide-in-from-right-4">
                            <h3 className="text-2xl font-black text-white mb-8 border-b border-white/10 pb-4 uppercase italic tracking-tighter">
                                Carrera: <span className="text-[#B08D6D]">{selectedCarrera.nombre}</span>
                            </h3>

                            <div className="flex gap-4 mb-8">
                                <input
                                    type="text"
                                    placeholder="Nombre del Grupo (Ej. 7A)"
                                    value={inputGrupo}
                                    onChange={(e) => setInputGrupo(e.target.value)}
                                    className="flex-1 bg-white/10 border border-white/10 p-4 rounded-2xl text-sm font-black outline-none text-white focus:border-[#B08D6D] transition-all placeholder:text-white/20 shadow-inner"
                                />
                                <button onClick={() => handleCreate('grupo')} className="bg-[#B08D6D] text-black font-black px-10 rounded-2xl text-xs uppercase tracking-widest hover:bg-[#d4ac87] transition-all shadow-lg">
                                    Añadir Grupo
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedCarrera.grupos.map(g => (
                                    <div key={g.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center group hover:border-[#B08D6D]/50 transition-all shadow-md">
                                        {editingId === g.id ? (
                                            <input
                                                autoFocus
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => handleUpdate('grupo', g.id)}
                                                className="bg-white/20 text-[#B08D6D] outline-none font-black w-full p-1 rounded"
                                            />
                                        ) : (
                                            <span className="font-mono text-[#B08D6D] font-black uppercase text-lg">{g.nombre}</span>
                                        )}
                                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => { setEditingId(g.id); setEditValue(g.nombre); }} className="text-white hover:text-[#B08D6D] text-[10px] font-black">EDT</button>
                                            <button onClick={() => handleDelete('grupo', g.id)} className="text-white hover:text-red-500 text-[10px] font-black">DEL</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 relative z-10">
                            <div className="w-24 h-24 mb-6 opacity-10 animate-pulse">
                                <img src="/ICONO.png" className="grayscale invert" alt="logo" />
                            </div>
                            <p className="text-[10px] tracking-[0.8em] font-black text-white/30 uppercase text-center">Selecciona una carrera de la lista</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcademicManagementView;