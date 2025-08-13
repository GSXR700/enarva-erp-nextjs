// app/mobile/components/QualityCheckForm.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import type { Employee, Mission } from "@prisma/client";
import { Camera, Check, Send, Loader2, RefreshCw } from 'lucide-react';
import { useEdgeStore } from '@/lib/edgestore';

// Composant simple pour la signature
function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    let isDrawing = false;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        const startDrawing = (e: MouseEvent | TouchEvent) => {
            isDrawing = true;
            draw(e);
        };
        const stopDrawing = () => { isDrawing = false; ctx.beginPath(); };
        const draw = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing) return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const pos = 'touches' in e ? e.touches[0] : e;
            ctx.lineTo(pos.clientX - rect.left, pos.clientY - rect.top);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.clientX - rect.left, pos.clientY - rect.top);
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchend', stopDrawing);
        canvas.addEventListener('touchmove', draw);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mouseup', stopDrawing);
            // ... etc
        };
    }, []);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveSignature = () => {
        if (canvasRef.current) {
            onSave(canvasRef.current.toDataURL('image/png'));
        }
    };

    return (
        <div>
            <canvas ref={canvasRef} width="300" height="150" className="border rounded-md w-full bg-gray-50"></canvas>
            <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={clearCanvas} className="text-xs flex items-center gap-1 p-2 bg-gray-200 rounded-md"><RefreshCw size={14}/> Effacer</button>
                <button type="button" onClick={saveSignature} className="text-xs flex items-center gap-1 p-2 bg-blue-100 text-blue-800 rounded-md"><Check size={14}/> Confirmer Signature</button>
            </div>
        </div>
    );
}


export function QualityCheckForm({ missionId, clientId, onFinish }: { missionId: string; clientId: string; onFinish: () => void }) {
    const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
        "Sols nettoyés": false,
        "Surfaces dépoussiérées": false,
        "Poubelles vidées": false,
        "Vitres propres": false,
    });
    const [photos, setPhotos] = useState<File[]>([]);
    const [signature, setSignature] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChecklistChange = (item: string) => {
        setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleSubmit = async () => {
        if (!signature) {
            alert("La signature du client est requise.");
            return;
        }
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('missionId', missionId);
        formData.append('clientId', clientId);
        formData.append('checklist', JSON.stringify(checklist));

        const score = (Object.values(checklist).filter(v => v).length / Object.keys(checklist).length) * 100;
        formData.append('score', String(Math.round(score)));

        const sigBlob = await fetch(signature).then(res => res.blob());
        formData.append('signature', sigBlob, 'signature.png');

        photos.forEach(photo => formData.append('photos', photo));

        await fetch('/api/quality-checks', { method: 'POST', body: formData });

        alert("Rapport qualité envoyé !");
        setIsSubmitting(false);
        onFinish();
    };

    return (
        <div className="w-full p-6 rounded-2xl shadow-lg bg-white text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Contrôle Qualité</h2>

            <div className="mb-4">
                <h3 className="block text-sm font-medium text-gray-700 mb-2">Checklist de validation</h3>
                {Object.keys(checklist).map(item => (
                    <label key={item} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                        <input type="checkbox" checked={checklist[item]} onChange={() => handleChecklistChange(item)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500" />
                        <span>{item}</span>
                    </label>
                ))}
            </div>

            <div className="mb-4">
                <h3 className="block text-sm font-medium text-gray-700 mb-1">Photos (Preuve)</h3>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50">
                    <Camera size={32} />
                    <span className="text-sm mt-2">{photos.length > 0 ? `${photos.length} photo(s) sélectionnée(s)` : 'Ajouter des photos'}</span>
                </button>
            </div>

            <div className="mb-6">
                <h3 className="block text-sm font-medium text-gray-700 mb-1">Signature du Client</h3>
                <SignaturePad onSave={setSignature} />
            </div>

            <div className="flex gap-4">
                <button onClick={onFinish} className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Annuler</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                    <span>Soumettre le Rapport</span>
                </button>
            </div>
        </div>
    );
}