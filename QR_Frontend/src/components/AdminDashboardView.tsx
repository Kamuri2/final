import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Definimos lo que esperamos recibir del servidor (según tu Prisma)
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
            carrera: string; // Es un String en tu esquema
            grupos: { nombre: string } | null; // Es una relación
        } | null;
    };
}

const AdminDashboardView = () => {
    // 🕒 Forzamos la fecha de inicio a la zona horaria de México
    const [fecha, setFecha] = useState(
        new Intl.DateTimeFormat('fr-CA', {
            timeZone: 'America/Mexico_City',
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date())
    );
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [loading, setLoading] = useState(false);

    // 🕒 Esta función ignora la zona horaria y lee la "hora de pared" exacta
    const formatTimeMX = (isoString: string) => {
        if (!isoString) return "N/A";

        // ⚡ EL TRUCO: Quitamos la 'Z' para que el navegador NO reste 6 horas
        const fechaLimpia = isoString.replace('Z', '');

        return new Date(fechaLimpia).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    // Traer los datos de la base de datos
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
            const response = await fetch('http://192.168.100.6:3000/graphql', {
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

    // Función para descargar el EXCEL
    const exportarExcel = () => {
        const datosRaw = registros.map(reg => ({
            'Hora': formatTimeMX(reg.fecha_hora),
            'Matrícula': reg.usuarios_sistema.alumnos?.matricula || 'N/A',
            'Alumno': reg.usuarios_sistema.alumnos?.nombre_completo || 'N/A',
            'Carrera': reg.usuarios_sistema.alumnos?.carrera || 'N/A',
            'Grupo': reg.usuarios_sistema.alumnos?.grupos?.nombre || 'N/A', // 👈 Agregado '?' para evitar errores
            'Resultado': reg.concedido ? 'ACCESO' : 'DENEGADO',
            'Punto': reg.puntos_acceso?.nombre || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(datosRaw);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Accesos");
        XLSX.writeFile(wb, `Qrify_Reporte_${fecha}.xlsx`);
    };

    return (
        <div className="w-full text-white animate-fade-in">
            {/* Barra de Herramientas */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-black/20 p-6 rounded-3xl border border-white/5">
                <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold font-jp tracking-tighter">Bitácora de Accesos</h2>
                    <p className="text-[10px] text-[#B08D6D] tracking-[0.3em] uppercase">Control Maestro de Seguridad</p>
                </div>

                <div className="flex gap-2">
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="bg-white/5 border border-white/10 p-2 rounded-xl text-sm outline-none focus:border-[#B08D6D]"
                    />
                    <button
                        onClick={exportarExcel}
                        className="bg-[#B08D6D] text-black font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#8e7158] transition-all"
                    >
                        Descargar .XLSX
                    </button>
                </div>
            </div>

            {/* TabLA */}
            <div className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl, text-align: center">
                <table className="w-full text-left text-xs">
                    <thead className="bg-[#B08D6D]/10 text-[#B08D6D] uppercase tracking-widest text-[9px]">
                        <tr>
                            <th className="p-4">Hora</th>
                            <th className="p-4">Alumno</th>
                            <th className="p-4">Carrera / Grupo</th>
                            {/*<th className="p-4">Estado</th>*/}
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
                                    <td className="p-4">
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