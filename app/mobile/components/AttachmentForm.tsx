"use client";

import { useRef, useState, useEffect } from "react";
import type { Mission, Order, Client } from "@prisma/client";
import { Loader2, RefreshCw, Send, Check } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore";
import { saveAttachment } from "@/app/administration/missions/actions";

type SignaturePadProps = { title: string; onSave: (dataUrl: string) => void; };

const SignaturePad = ({ title, onSave }: SignaturePadProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    let isDrawing = false;
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const getPosition = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            const pos = 'touches' in e ? e.touches[0] : e;
            return { x: pos.clientX - rect.left, y: pos.clientY - rect.top };
        };

        const startDrawing = (e: MouseEvent | TouchEvent) => { isDrawing = true; draw(e); };
        const stopDrawing = () => { isDrawing = false; ctx.beginPath(); };
        const draw = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing) return;
            e.preventDefault();
            const { x, y } = getPosition(e);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchend', stopDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });

        return () => { /* Nettoyage des écouteurs */ };
    }, []);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    const handleSave = () => canvasRef.current && onSave(canvasRef.current.toDataURL('image/png'));
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{title}</label>
            <canvas ref={canvasRef} width="300" height="150" className="border rounded-md w-full bg-gray-50 touch-none"></canvas>
            <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={clearCanvas} className="text-xs flex items-center gap-1 p-2 bg-gray-200 rounded-md"><RefreshCw size={14}/> Effacer</button>
                <button type="button" onClick={handleSave} className="text-xs flex items-center gap-1 p-2 bg-blue-100 text-blue-800 rounded-md"><Check size={14}/> Confirmer</button>
            </div>
        </div>
    );
};

type MissionWithDetails = Mission & { order: Order & { client: Client } };

export function AttachmentForm({ mission, onFinish }: { mission: MissionWithDetails, onFinish: () => void }) {
    const [supervisorSignature, setSupervisorSignature] = useState<string | null>(null);
    const [clientSignature, setClientSignature] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { edgestore } = useEdgeStore();

    const uploadSignature = async (signatureDataUrl: string, path: string) => {
        const blob = await fetch(signatureDataUrl).then(res => res.blob());
        const file = new File([blob], path.split('/').pop()!, { type: 'image/png' });
        const res = await edgestore.publicFiles.upload({ file });
        return res.url;
    };

    const handleSubmit = async () => {
        if (!supervisorSignature || !clientSignature) {
            alert("Les deux signatures sont requises.");
            return;
        }
        setIsSubmitting(true);
        try {
            const supervisorSignatureUrl = await uploadSignature(supervisorSignature, `attachments/${mission.id}-supervisor.png`);
            const clientSignatureUrl = await uploadSignature(clientSignature, `attachments/${mission.id}-client.png`);

            const result = await saveAttachment({
                missionId: mission.id,
                supervisorSignatureUrl,
                clientSignatureUrl
            });

            if (result.success) {
                alert("Validation enregistrée !");
                onFinish();
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert("Erreur lors de l'upload des signatures.");
            console.error(error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="w-full p-6 rounded-2xl shadow-lg bg-white text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Validation de Mission</h2>
            <p className="text-sm text-gray-500 mb-4">Client : {mission.order.client.nom}</p>

            <div className="space-y-6">
                <SignaturePad title="Signature du Superviseur/Chef d'équipe" onSave={setSupervisorSignature} />
                <SignaturePad title="Signature du Client" onSave={setClientSignature} />
            </div>

            <div className="flex gap-4 mt-8">
                <button type="button" onClick={onFinish} className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                    Annuler
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting || !supervisorSignature || !clientSignature} className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                    <span>Valider et Clôturer</span>
                </button>
            </div>
        </div>
    );
}