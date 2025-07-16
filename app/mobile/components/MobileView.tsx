"use client";

import { useState, useEffect } from 'react';
import type { Employee, Mission, Order, Client } from "@prisma/client";
import { Camera, ShieldCheck, ListChecks, Loader2, PlayCircle, StopCircle, CheckCircle, MapPin } from "lucide-react";
import { QualityCheckForm } from './QualityCheckForm';
import { ObservationUploader } from './ObservationUploader';
import { AttachmentForm } from './AttachmentForm'; // Import du nouveau formulaire
import { punchTimesheet } from '../actions';
import { useLocationTracker } from '../hooks/useLocationTracker';

type MissionWithDetails = Mission & {
  order: Order & {
    client: Client;
  };
};

function MissionCard({ mission, onSelect }: { mission: MissionWithDetails; onSelect: () => void; }) {
    const getStatusBadge = () => {
        switch (mission.status) {
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (
        <div onClick={onSelect} className="w-full p-4 mb-4 rounded-xl shadow-md bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">{mission.order.client.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge()}`}>{mission.status}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5"><MapPin size={12} /> {mission.order.client.address}</p>
            <p className="text-sm text-gray-500 mt-2">Prévu à: {new Date(mission.scheduledStart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    );
}

export function MobileView({ employee }: { employee: Employee }) {
    const [missions, setMissions] = useState<MissionWithDetails[]>([]);
    const [selectedMission, setSelectedMission] = useState<MissionWithDetails | null>(null);
    const [activeForm, setActiveForm] = useState<'observation' | 'quality' | 'attachment' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPunching, setIsPunching] = useState(false);

    const isTrackingActive = missions.some(m => m.status === 'IN_PROGRESS');
    useLocationTracker(isTrackingActive);

    const fetchMissions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/missions/employee/${employee.id}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setMissions(data);
        } catch (error) {
            console.error("Failed to fetch missions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, [employee.id]);

    const handlePunch = async (mission: MissionWithDetails) => {
        setIsPunching(true);
        await punchTimesheet(employee.id, mission.id);
        await fetchMissions();
        setSelectedMission(null);
        setIsPunching(false);
    };

    const handleSelectMission = (mission: MissionWithDetails) => {
        setSelectedMission(mission);
    };

    const handleFinishForm = () => {
        setActiveForm(null);
        setSelectedMission(null);
        fetchMissions();
    };

    if (activeForm && selectedMission) {
        if (activeForm === 'observation') return <div className="min-h-screen bg-gray-50 flex items-center p-4"><ObservationUploader employee={employee} missionId={selectedMission.id} onFinish={handleFinishForm} /></div>;
        if (activeForm === 'quality') return <div className="min-h-screen bg-gray-50 flex items-center p-4"><QualityCheckForm missionId={selectedMission.id} clientId={selectedMission.order.clientId} onFinish={handleFinishForm} /></div>;
        if (activeForm === 'attachment') return <div className="min-h-screen bg-gray-50 flex items-center p-4"><AttachmentForm mission={selectedMission} onFinish={handleFinishForm} /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            <header className="w-full text-center py-4">
                <h1 className="text-2xl font-bold text-gray-800">Mes Missions du Jour</h1>
                <p className="text-gray-500">{employee.firstName} {employee.lastName}</p>
            </header>

            <main className="w-full max-w-sm flex-1 flex flex-col justify-start pt-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-gray-500" size={32} /></div>
                ) : missions.length > 0 ? (
                    missions.map(mission => <MissionCard key={mission.id} mission={mission} onSelect={() => handleSelectMission(mission)} />)
                ) : (
                    <div className="text-center text-gray-500 mt-10 p-6 bg-white rounded-lg shadow-sm">
                        <ListChecks size={40} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="font-semibold">Aucune mission pour aujourd'hui.</h3>
                        <p className="text-sm">Reposez-vous bien !</p>
                    </div>
                )}

                {selectedMission && (
                    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
                        <div className="w-full bg-white rounded-t-2xl p-6">
                            <h3 className="text-lg font-bold text-center mb-2">Mission: {selectedMission.order.client.name}</h3>
                            <p className="text-center text-sm text-gray-500 mb-6">Que souhaitez-vous faire ?</p>
                            <div className="space-y-4">
                                {selectedMission.status === 'PENDING' && (
                                    <button onClick={() => handlePunch(selectedMission)} disabled={isPunching} className="w-full py-4 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition">
                                        {isPunching ? <Loader2 className="animate-spin"/> : <PlayCircle size={20} />}
                                        <span>Démarrer la mission</span>
                                    </button>
                                )}
                                {selectedMission.status === 'IN_PROGRESS' && (
                                    <button onClick={() => handlePunch(selectedMission)} disabled={isPunching} className="w-full py-4 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition">
                                        {isPunching ? <Loader2 className="animate-spin"/> : <StopCircle size={20} />}
                                        <span>Terminer la mission</span>
                                    </button>
                                )}
                                {selectedMission.status === 'COMPLETED' && (
                                    <>
                                        <button onClick={() => setActiveForm('attachment')} className="w-full py-4 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                                            <CheckCircle size={20} />
                                            <span>Signer l'Attachement</span>
                                        </button>
                                        <button onClick={() => setActiveForm('observation')} className="w-full py-4 bg-gray-800 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition">
                                            <Camera size={20} />
                                            <span>Signaler une Observation</span>
                                        </button>
                                        <button onClick={() => setActiveForm('quality')} className="w-full py-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition">
                                            <ShieldCheck size={20} />
                                            <span>Lancer le Contrôle Qualité</span>
                                        </button>
                                    </>
                                )}
                            </div>
                            <button onClick={() => setSelectedMission(null)} className="w-full text-center mt-6 text-gray-500 font-semibold">
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}