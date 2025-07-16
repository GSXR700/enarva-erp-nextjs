// app/mobile/components/ObservationUploader.tsx
"use client";

import { useState, useRef } from 'react';
import { useEdgeStore } from '@/lib/edgestore';
import { saveObservation } from '../actions';
import { Camera, Send, Loader2 } from 'lucide-react';
import type { Employee } from '@prisma/client';

// On passe maintenant missionId dans les props
export function ObservationUploader({ employee, missionId, onFinish }: { employee: Employee; missionId: string; onFinish: () => void }) {
    const [file, setFile] = useState<File>();
    const [content, setContent] = useState('');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const { edgestore } = useEdgeStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (file && content) {
            setError('');
            setProgress(1);
            const res = await edgestore.observations.upload({
                file,
                onProgressChange: (progress) => {
                    setProgress(progress);
                },
            });
            
            await saveObservation({
                missionId: missionId, // <-- Utilisation de l'ID dynamique
                content: content,
                url: res.url,
            });

            alert("Observation envoyée !");
            onFinish();
        } else {
            setError('Veuillez ajouter une photo et une description.');
        }
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="w-full p-6 rounded-2xl shadow-lg bg-white text-left">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Signaler une Observation</h2>
            
            <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    placeholder="Décrivez ce que vous voyez..."
                    className="w-full p-2 border rounded-md"
                    required
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={(e) => { setFile(e.target.files?.[0]) }} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50">
                    <Camera size={32} />
                    <span className="text-sm mt-2">{file ? file.name : 'Prendre une photo'}</span>
                </button>
            </div>
            
            {progress > 0 && progress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-4">
                <button type="button" onClick={onFinish} className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                    Annuler
                </button>
                <button type="submit" disabled={progress > 0 && progress < 100} className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50">
                    {(progress > 0 && progress < 100) ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                    <span>Envoyer</span>
                </button>
            </div>
        </form>
    );
}