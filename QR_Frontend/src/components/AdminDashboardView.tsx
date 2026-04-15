import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Definimos lo que esperamos recibir del servidor
interface Registro {
    id: number;
    fecha_hora: string;
    concedido: boolean;
    motivo_rechazo: string | null;
    puntos_acceso: { nombre: string };
    usuarios_sistema: {
        alumnos: {
            nombre_completo: string;
            matricula: string;
            carrera: string;
            grupos: { nombre: string } | null;
        } | null;
    };
}

const AdminDashboardView = () => {
    const [fecha, setFecha] = useState(
        new Intl.DateTimeFormat('fr-CA', {
            timeZone: 'America/Mexico_City',
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date())
    );
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [loading, setLoading] = useState(false);

    const formatTimeMX = (isoString: string) => {
        if (!isoString) return "N/A";
        const fechaLimpia = isoString.replace('Z', '');
        return new Date(fechaLimpia).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const fetchReporte = async () => {
        setLoading(true);
        const GQL_QUERY = {
            query: `
                query GetReporte($fecha: String!) {
                  reporteDiario(fecha: $fecha) {
                    id 
                    fecha_hora 
                    concedido 
                    motivo_rechazo
                    puntos_acceso { nombre }
                    usuarios_sistema {
                      alumnos { 
                        nombre_completo 
                        matricula 
                        carrera
                        grupos { nombre } 
                      }
                    }
                  }
                }
              `,
            variables: { fecha }
        };
        try {
            const response = await fetch('https://api-fraktalid.utvt.cloud/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(GQL_QUERY),
            });
            const result = await response.json();
            setRegistros(result.data.reporteDiario || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReporte(); }, [fecha]);

    const exportarExcel = () => {
        const datosRaw = registros.map(reg => ({
            'Hora': formatTimeMX(reg.fecha_hora),
            'Matrícula': reg.usuarios_sistema.alumnos?.matricula || 'N/A',
            'Alumno': reg.usuarios_sistema.alumnos?.nombre_completo || 'N/A',
            'Carrera': reg.usuarios_sistema.alumnos?.carrera || 'N/A',
            'Grupo': reg.usuarios_sistema.alumnos?.grupos?.nombre || 'N/A',
            'Resultado': reg.concedido ? 'ACCESO' : 'DENEGADO',
            'Punto': reg.puntos_acceso?.nombre || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(datosRaw);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Accesos");
        XLSX.writeFile(wb, `Qrify_Reporte_${fecha}.xlsx`);
    };

    // 💥 DATOS MEJORADOS: Combinamos la matemática con el mundo real
    const tau = 0.5;
    const laplaceData = [];
    for (let t = 0; t <= 3; t += 0.2) {
        let faseExplicacion = "";

        // Traducimos el tiempo matemático a lo que pasa en tu API/Hardware
        if (t === 0.0) faseExplicacion = "Lectura del Código QR";
        else if (t <= 0.6) faseExplicacion = "Validando identidad en Base de Datos";
        else if (t <= 1.4) faseExplicacion = "Enviando pulso de apertura";
        else if (t < 2.0) faseExplicacion = "Estabilizando mecanismo de puerta";
        else faseExplicacion = "✅ Acceso Seguro (Listo para el siguiente)";

        laplaceData.push({
            tiempo: t.toFixed(1) + 's',
            apertura: Number(((1 - Math.exp(-t / tau)) * 100).toFixed(0)),
            fase: faseExplicacion // Guardamos la explicación humana
        });
    }

    // 🎨 Tooltip Personalizado para que se vea increíble al pasar el mouse
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0A0A0A]/90 border border-[#B08D6D] p-3 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-white text-[11px] mb-1">Tiempo transcurrido: <span className="font-bold text-[#B08D6D]">{label}</span></p>
                    <p className="text-white text-[11px] mb-2">Progreso del Sistema: <span className="font-bold text-[#B08D6D]">{payload[0].value}%</span></p>
                    <div className="border-t border-white/10 pt-2 mt-2">
                        <p className="text-[10px] text-[#B08D6D] font-bold uppercase tracking-wider">{payload[0].payload.fase}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full text-white animate-fade-in">
            {/* Barra de Herramientas */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-black/20 p-6 rounded-3xl border border-white/5">
                <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold font-jp tracking-tighter">Bitácora de Accesos</h2>
                    <p className="text-[10px] text-[#B08D6D] tracking-[0.3em] uppercase">Control Maestro de Seguridad</p>
                </div>

                <div className="flex gap-2">
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="bg-white/5 border border-white/10 p-2 rounded-xl text-sm outline-none focus:border-[#B08D6D] text-white color-scheme-dark"
                    />
                    <button
                        onClick={exportarExcel}
                        className="bg-[#B08D6D] text-black font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#8e7158] transition-all"
                    >
                        Descargar .XLSX
                    </button>
                </div>
            </div>

            {/* 💥 PANEL TRADUCIDO AL ESPAÑOL HUMANO */}
            <div className="mb-6 p-6 bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row gap-6 items-center">
                <div className="w-full lg:w-1/3">
                    <h3 className="text-lg font-bold font-jp text-[#B08D6D] tracking-tighter mb-2">Tiempos del Sistema</h3>
                    <p className="text-xs text-white/70 mb-4">
                        Representación del tiempo promedio que tarda el servidor en validar un QR y habilitar la entrada de forma segura.
                    </p>
                    <ul className="text-[11px] text-white/60 space-y-3">
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Retardo de Red/API:</span>
                            <span className="text-[#B08D6D] font-mono">0.5 seg</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-1">
                            <span>Bloqueo Antispam:</span>
                            <span className="text-[#B08D6D] font-mono">2.0 seg</span>
                        </li>
                    </ul>
                </div>

                <div className="w-full lg:w-2/3 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={laplaceData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="tiempo" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                            {/* Inyectamos nuestro Tooltip inteligente */}
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Line
                                type="monotone"
                                dataKey="apertura"
                                stroke="#B08D6D"
                                strokeWidth={3}
                                dot={{ r: 3, fill: '#000', stroke: '#B08D6D', strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: '#B08D6D' }}
                                name="Progreso"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TABLA DE REGISTROS */}
            <div className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl text-center">
                <table className="w-full text-left text-xs">
                    <thead className="bg-[#B08D6D]/10 text-[#B08D6D] uppercase tracking-widest text-[9px]">
                        <tr>
                            <th className="p-4">Hora</th>
                            <th className="p-4">Alumno</th>
                            <th className="p-4">Carrera / Grupo</th>
                            <th className="p-4 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={4} className="p-10 text-center opacity-40">Cargando bitácora...</td></tr>
                        ) : registros.length === 0 ? (
                            <tr><td colSpan={4} className="p-10 text-center opacity-40">No hay registros para este día.</td></tr>
                        ) : (
                            registros.map(reg => (
                                <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-[#B08D6D]">
                                        {formatTimeMX(reg.fecha_hora)}
                                    </td>

                                    <td className="p-4">
                                        <p className="font-bold">{reg.usuarios_sistema.alumnos?.nombre_completo}</p>
                                        <p className="opacity-40">{reg.usuarios_sistema.alumnos?.matricula}</p>
                                    </td>
                                    <td className="p-4 uppercase">
                                        <p>{reg.usuarios_sistema.alumnos?.carrera}</p>
                                        <p className="text-[#B08D6D] opacity-60">{reg.usuarios_sistema.alumnos?.grupos?.nombre || 'S/G'}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-md font-black text-[8px] ${reg.concedido ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {reg.concedido ? 'OK' : 'FAIL'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboardView;