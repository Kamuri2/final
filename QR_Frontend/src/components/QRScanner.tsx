import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
    onResult: (result: string) => void;
}

const QRScanner = ({ onResult }: QRScannerProps) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        scannerRef.current = new Html5Qrcode("reader");

        const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
            let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            let scanningRegionSize = Math.floor(minEdgeSize * 0.8);
            return {
                width: scanningRegionSize,
                height: scanningRegionSize
            };
        }

        const startScanner = async () => {
            try {
                // Paso 1: Si ya estaba escaneando algo, lo matamos primero
                if (scannerRef.current?.isScanning) {
                    await scannerRef.current.stop();
                }

                // Paso 2: Iniciamos forzando la cámara frontal ("user")
                await scannerRef.current?.start(
                    // Forzamos "user" para la frontal, "environment" para la trasera
                    { facingMode: "user" },
                    {
                        fps: 60,
                        qrbox: qrboxFunction,
                        aspectRatio: 1.0,
                        // Esto ayuda a que el navegador entienda que NO queremos la trasera
                        disableFlip: false
                    },
                    (decodedText) => {
                        // Alerta de éxito (puedes quitarla luego)
                        // alert("✅ QR Detectado");
                        scannerRef.current?.stop().then(() => onResult(decodedText));
                    },
                    () => { }
                );
            } catch (err) {
                // Si falla el modo "user", intentamos avisar qué pasó
                alert("Error al abrir cámara frontal: " + err);
                console.error(err);
            }
        };
        startScanner();

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [onResult]);

    return (
        <div className="relative w-full mx-auto overflow-hidden rounded-2xl border-2 border-matcha/40 bg-black">
            <div id="reader" className="w-full aspect-square"></div>

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-3/4 h-3/4 border-2 border-matcha-vivid animate-pulse rounded-lg shadow-[0_0_15px_rgba(155,224,155,0.5)]">
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-matcha-vivid"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-matcha-vivid"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-matcha-vivid"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-matcha-vivid"></div>
                </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/60 px-3 py-1 rounded-full text-[10px] text-matcha-vivid uppercase tracking-widest font-jp">
                    スキャン中...
                </span>
            </div>
        </div>
    );
};

export default QRScanner;