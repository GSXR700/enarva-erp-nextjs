// app/mobile/components/MobileView.tsx
"use client";

import { useState, useEffect } from 'react';
import type { Employee, Mission, Order, Client } from "@prisma/client";
import { Camera, ShieldCheck, ListChecks, Loader2, PlayCircle, StopCircle, CheckCircle, MapPin, Clock, RefreshCw } from "lucide-react";
import { QualityCheckForm } from './QualityCheckForm';
import { ObservationUploader } from './ObservationUploader';
import { AttachmentForm } from './AttachmentForm';
import { punchTimesheet } from '../actions';
import { useLocationTracker } from '../hooks/useLocationTracker';

type MissionWithDetails = Mission & {
  order: (Order & { // The order can be null
    client: Client;
  }) | null;
};

function MissionCard({ mission, onSelect }: { mission: MissionWithDetails; onSelect: () => void; }) {
    const getStatusBadge = () => {
        switch (mission.status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            case 'APPROBATION': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'VALIDATED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = () => {
        switch (mission.status) {
            case 'PENDING': return 'En attente';
            case 'IN_PROGRESS': return 'En cours';
            case 'COMPLETED': return 'Terminée';
            case 'APPROBATION': return 'Attente validation';
            case 'VALIDATED': return 'Validée';
            case 'CANCELLED': return 'Annulée';
            default: return mission.status;
        }
    };

    const getStatusIcon = () => {
        switch (mission.status) {
            case 'PENDING': return <Clock size={14} />;
            case 'IN_PROGRESS': return <PlayCircle size={14} />;
            case 'COMPLETED': return <CheckCircle size={14} />;
            case 'APPROBATION': return <Clock size={14} />;
            case 'VALIDATED': return <CheckCircle size={14} />;
            default: return null;
        }
    };

    // Safely access the title and address, providing fallbacks
    const title = mission.order?.client?.nom || mission.title || "Mission sans titre";
    const address = mission.order?.client?.adresse || "Adresse non disponible";

    return (
        <div 
            onClick={onSelect} 
            className="w-full p-4 mb-4 rounded-xl shadow-md bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-800 truncate">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <MapPin size={12} className="flex-shrink-0" /> 
                        <span className="truncate">{address}</span>
                    </p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge()}`}>
                    {getStatusIcon()}
                    <span>{getStatusText()}</span>
                </div>
            </div>
            
            <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-600">
                    Prévu: {new Date(mission.scheduledStart).toLocaleString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                    })}
                </p>
                
                {mission.actualStart && (
                    <p className="text-xs text-blue-600">
                        Démarré: {new Date(mission.actualStart).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </p>
                )}
                
                {mission.actualEnd && mission.status === 'APPROBATION' && (
                    <p className="text-xs text-orange-600">
                        Terminé: {new Date(mission.actualEnd).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}

export function MobileView({ employee }: { employee: Employee }) {
    const [missions, setMissions] = useState<MissionWithDetails[]>([]);
    const [selectedMission, setSelectedMission] = useState<MissionWithDetails | null>(null);
    const [activeForm, setActiveForm] = useState<'observation' | 'quality' | 'attachment' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPunching, setIsPunching] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const isTrackingActive = missions.some(m => m.status === 'IN_PROGRESS');
    useLocationTracker(isTrackingActive);

    const fetchMissions = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);
        
        try {
            console.log(`🔄 Fetching missions for employee ${employee.id}`);
            
            const response = await fetch(`/api/missions/employee/${employee.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                },
                cache: 'no-store',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`📦 Fetched ${data.length} missions:`, data.map((m: any) => ({ id: m.id, status: m.status })));
            
            setMissions(data);
            setLastRefresh(new Date());
            
        } catch (error) {
            console.error("❌ Failed to fetch missions:", error);
            setError("Impossible de charger les missions. Vérifiez votre connexion.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMissions();
        
        // Auto-refresh every 30 seconds to catch status updates
        const interval = setInterval(() => {
            console.log("🔄 Auto-refreshing missions...");
            fetchMissions(true);
        }, 30000);
        
        return () => clearInterval(interval);
    }, [employee.id]);

    const handlePunch = async (mission: MissionWithDetails) => {
        console.log(`👊 Punching mission ${mission.id} with status ${mission.status}`);
        setIsPunching(true);
        setError(null);
        
        try {
            const result = await punchTimesheet(employee.id, mission.id);
            console.log(`⚡ Punch result:`, result);
            
            if (result.success) {
                console.log(`✅ Punch successful, refreshing missions...`);
                // Wait a moment for the database to update
                await new Promise(resolve => setTimeout(resolve, 1000));
                await fetchMissions();
                setSelectedMission(null);
            } else {
                setError(result.error || "Erreur lors du pointage");
                console.error("❌ Punch failed:", result.error);
            }
        } catch (error) {
            console.error("❌ Punch error:", error);
            setError("Erreur de connexion lors du pointage");
        } finally {
            setIsPunching(false);
        }
    };

    const handleSelectMission = (mission: MissionWithDetails) => {
        console.log(`🎯 Selected mission ${mission.id} with status ${mission.status}`);
        setSelectedMission(mission);
        setError(null);
    };

    const handleFinishForm = () => {
        setActiveForm(null);
        setSelectedMission(null);
        fetchMissions();
    };

    const handleManualRefresh = () => {
        fetchMissions(true);
    };

    if (activeForm && selectedMission) {
        if (activeForm === 'observation') 
            return (
                <div className="min-h-screen bg-gray-50 flex items-center p-4">
                    <ObservationUploader 
                        employee={employee} 
                        missionId={selectedMission.id} 
                        onFinish={handleFinishForm} 
                    />
                </div>
            );
        
        if (activeForm === 'quality' && selectedMission.order) 
            return (
                <div className="min-h-screen bg-gray-50 flex items-center p-4">
                    <QualityCheckForm 
                        missionId={selectedMission.id} 
                        clientId={selectedMission.order.clientId} 
                        onFinish={handleFinishForm} 
                    />
                </div>
            );
        
        if (activeForm === 'attachment' && selectedMission.order) 
            return (
                <div className="min-h-screen bg-gray-50 flex items-center p-4">
                    <AttachmentForm 
                        mission={selectedMission as MissionWithDetails & { order: Order & { client: Client } }} 
                        onFinish={handleFinishForm} 
                    />
                </div>
            );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Mes Missions</h1>
                        <p className="text-sm text-gray-500">{employee.firstName} {employee.lastName}</p>
                    </div>
                    <button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw 
                            size={20} 
                            className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
                
                {/* Status and Error Messages */}
                <div className="mt-3 space-y-2">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                            Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </span>
                        {isRefreshing && (
                            <span className="text-blue-600">Actualisation...</span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <Loader2 className="animate-spin text-gray-500 mx-auto mb-4" size={32} />
                            <p className="text-gray-500">Chargement des missions...</p>
                        </div>
                    </div>
                ) : missions.length > 0 ? (
                    <div className="space-y-4">
                        {missions.map(mission => (
                            <MissionCard 
                                key={mission.id} 
                                mission={mission} 
                                onSelect={() => handleSelectMission(mission)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center mt-16 p-6 bg-white rounded-lg shadow-sm">
                        <ListChecks size={40} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="font-semibold text-gray-600 mb-2">Aucune mission pour aujourd'hui</h3>
                        <p className="text-sm text-gray-500">Reposez-vous bien !</p>
                    </div>
                )}
            </main>

            {/* Mission Detail Modal */}
            {selectedMission && (
                <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
                    <div className="w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-800 truncate">
                                    {selectedMission.order?.client?.nom || selectedMission.title}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <span>Status: {selectedMission.status}</span>
                                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                </p>
                                {selectedMission.order?.client?.adresse && (
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {selectedMission.order.client.adresse}
                                    </p>
                                )}
                            </div>
                            <button 
                                onClick={() => setSelectedMission(null)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
                            >
                                ×
                            </button>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {/* START MISSION */}
                            {selectedMission.status === 'PENDING' && (
                                <button 
                                    onClick={() => handlePunch(selectedMission)} 
                                    disabled={isPunching} 
                                    className="w-full py-4 bg-green-600 text-white rounded-lg flex items-center justify-center gap-3 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPunching ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <PlayCircle size={20} />
                                    )}
                                    <span className="font-semibold">Démarrer la mission</span>
                                </button>
                            )}
                            
                            {/* STOP MISSION */}
                            {selectedMission.status === 'IN_PROGRESS' && (
                                <button 
                                    onClick={() => handlePunch(selectedMission)} 
                                    disabled={isPunching} 
                                    className="w-full py-4 bg-red-600 text-white rounded-lg flex items-center justify-center gap-3 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPunching ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <StopCircle size={20} />
                                    )}
                                    <span className="font-semibold">Terminer la mission</span>
                                </button>
                            )}
                            
                            {/* MISSION WAITING FOR APPROBATION */}
                            {selectedMission.status === 'APPROBATION' && (
                                <div className="w-full py-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg flex items-center justify-center gap-3">
                                    <Clock size={20} />
                                    <div className="text-center">
                                        <p className="font-semibold">En attente d'approbation</p>
                                        <p className="text-xs text-orange-600 mt-1">
                                            Votre superviseur doit valider cette mission
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {/* MISSION COMPLETED - FORMS AVAILABLE */}
                            {selectedMission.status === 'COMPLETED' && (
                                <>
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-center">
                                        <p className="font-semibold">Mission terminée</p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Vous pouvez maintenant effectuer les contrôles qualité
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setActiveForm('attachment')} 
                                        disabled={!selectedMission.order} 
                                        className="w-full py-4 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle size={20} />
                                        <span>Signer l'Attachement</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setActiveForm('observation')} 
                                        className="w-full py-4 bg-gray-800 text-white rounded-lg flex items-center justify-center gap-3 hover:bg-gray-900 transition"
                                    >
                                        <Camera size={20} />
                                        <span>Signaler une Observation</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setActiveForm('quality')} 
                                        disabled={!selectedMission.order} 
                                        className="w-full py-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ShieldCheck size={20} />
                                        <span>Contrôle Qualité</span>
                                    </button>
                                    
                                    {!selectedMission.order && (
                                        <p className="text-xs text-gray-500 text-center mt-2">
                                            * Certaines actions nécessitent une commande client
                                        </p>
                                    )}
                                </>
                            )}
                            
                            {/* MISSION VALIDATED */}
                            {selectedMission.status === 'VALIDATED' && (
                                <div className="w-full py-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center justify-center gap-3">
                                    <CheckCircle size={20} />
                                    <div className="text-center">
                                        <p className="font-semibold">Mission validée</p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Cette mission est terminée et approuvée
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Close Button */}
                        <button 
                            onClick={() => setSelectedMission(null)} 
                            className="w-full text-center mt-6 py-3 text-gray-500 font-semibold hover:text-gray-700 hover:bg-gray-50 rounded-lg transition"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}