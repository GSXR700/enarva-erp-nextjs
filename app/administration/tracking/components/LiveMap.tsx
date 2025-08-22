// app/administration/tracking/components/LiveMap.tsx
"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { MapPin, ChevronDown, ChevronUp, Users, Clock, Building, Calendar } from 'lucide-react';
import { useNotifications } from '@/app/context/NotificationContext';

interface EmployeeLocation {
    id: string;
    name: string | null;
    image: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
    lastSeen: Date | null;
    missions?: Array<{
        id: string;
        title: string | null;
        status: string;
        scheduledStart: Date;
        scheduledEnd: Date | null;
        actualStart: Date | null;
        actualEnd: Date | null;
        order?: {
            client: {
                nom: string;
                adresse?: string | null;
            }
        } | null;
    }>;
}

interface TeamStatsProps {
    employees: EmployeeLocation[];
    isMobile?: boolean;
}

// Création d'une icône personnalisée avec Lucide pour un meilleur rendu visuel
const createCustomIcon = (isActive: boolean = false) => {
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <MapPin 
        className={`${isActive ? 'text-green-500' : 'text-blue-500'}`} 
        fill="currentColor" 
        size={28} 
      />
    ),
    className: 'bg-transparent border-none',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Composant pour les statistiques d'équipe (version mobile compacte)
function TeamStats({ employees, isMobile = false }: TeamStatsProps) {
    const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
    
    const activeEmployees = employees.filter(emp => 
        emp.currentLatitude && emp.currentLongitude
    );
    
    const locationsCount = new Set(
        activeEmployees.map(emp => `${emp.currentLatitude}-${emp.currentLongitude}`)
    ).size;
    
    const employeesOnMission = activeEmployees.filter(emp => 
        emp.missions?.some(mission => mission.status === 'IN_PROGRESS')
    ).length;

    const toggleEmployee = (employeeId: string) => {
        const newExpanded = new Set(expandedEmployees);
        if (newExpanded.has(employeeId)) {
            newExpanded.delete(employeeId);
        } else {
            newExpanded.add(employeeId);
        }
        setExpandedEmployees(newExpanded);
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
        switch (status) {
            case 'IN_PROGRESS':
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
            case 'PENDING':
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
            case 'APPROBATION':
                return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return 'En cours';
            case 'PENDING': return 'En attente';
            case 'APPROBATION': return 'Validation';
            case 'COMPLETED': return 'Terminé';
            case 'VALIDATED': return 'Validé';
            case 'CANCELLED': return 'Annulé';
            default: return status;
        }
    };

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isMobile) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-4">
                {/* Header compact pour mobile */}
                <div className="p-3 border-b dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Équipes Actives
                    </h3>
                    <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                {activeEmployees.length}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">Employés</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                                {locationsCount}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">Localisations</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                                {employeesOnMission}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">En Mission</span>
                        </div>
                    </div>
                </div>

                {/* Liste des employés avec expand/collapse */}
                <div className="divide-y dark:divide-gray-700">
                    {activeEmployees.map(employee => {
                        const isExpanded = expandedEmployees.has(employee.id);
                        const activeMission = employee.missions?.find(m => m.status === 'IN_PROGRESS');
                        const lastSeen = employee.lastSeen ? new Date(employee.lastSeen) : null;
                        const isOnline = lastSeen && (new Date().getTime() - lastSeen.getTime()) < 5 * 60 * 1000;

                        return (
                            <div key={employee.id} className="p-3">
                                {/* En-tête employé */}
                                <button
                                    onClick={() => toggleEmployee(employee.id)}
                                    className="w-full flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        {/* Avatar */}
                                        <div className="relative">
                                            {employee.image ? (
                                                <img 
                                                    src={employee.image} 
                                                    alt={employee.name || ''} 
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                        {getInitials(employee.name)}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Indicateur en ligne */}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                                                isOnline ? 'bg-green-400' : 'bg-gray-400'
                                            }`} />
                                        </div>

                                        {/* Info employé */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                                {employee.name || 'Sans nom'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {isOnline ? `Actif il y a ${Math.floor((new Date().getTime() - lastSeen!.getTime()) / 60000)}min` : 'Hors ligne'}
                                            </p>
                                        </div>

                                        {/* Statut mission */}
                                        {activeMission && (
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                    En mission
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bouton expand */}
                                    <div className="ml-2">
                                        {isExpanded ? (
                                            <ChevronUp size={16} className="text-gray-400" />
                                        ) : (
                                            <ChevronDown size={16} className="text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Détails missions (expandable) */}
                                {isExpanded && (
                                    <div className="mt-3 pl-11 space-y-2">
                                        {employee.missions && employee.missions.length > 0 ? (
                                            employee.missions.map(mission => (
                                                <div 
                                                    key={mission.id}
                                                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                                >
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
                                                                {mission.order?.client?.nom || mission.title || 'Mission sans titre'}
                                                            </p>
                                                            {mission.order?.client?.adresse && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                                    <Building size={10} />
                                                                    <span className="truncate">{mission.order.client.adresse}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className={getStatusBadge(mission.status)}>
                                                            {getStatusText(mission.status)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            <span>
                                                                {new Date(mission.scheduledStart).toLocaleTimeString('fr-FR', { 
                                                                    hour: '2-digit', 
                                                                    minute: '2-digit' 
                                                                })}
                                                            </span>
                                                        </div>
                                                        {mission.actualStart && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={10} />
                                                                <span className="text-green-600 dark:text-green-400">
                                                                    Démarré {new Date(mission.actualStart).toLocaleTimeString('fr-FR', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                Aucune mission assignée
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Version desktop (existante)
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
                <Users className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Équipes Actives</h3>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {activeEmployees.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Employés</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {locationsCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Localisations</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {employeesOnMission}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">En Mission</div>
                </div>
                <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1 animate-pulse"></div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Temps Réel</div>
                </div>
            </div>
        </div>
    );
}

export function LiveMap({ initialEmployees }: { initialEmployees: EmployeeLocation[] }) {
    const [employees, setEmployees] = useState(initialEmployees);
    const [isMobile, setIsMobile] = useState(false);
    const { socket } = useNotifications();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!socket) return;

        // L'admin rejoint une "salle" pour écouter les mises à jour de localisation
        socket.emit('join-tracking-room');

        const handleLocationUpdate = (updatedEmployee: EmployeeLocation) => {
            setEmployees(prevEmployees => {
                const existingEmployee = prevEmployees.find(emp => emp.id === updatedEmployee.id);
                if (existingEmployee) {
                    // Mettre à jour la position d'un employé existant
                    return prevEmployees.map(emp =>
                        emp.id === updatedEmployee.id ? updatedEmployee : emp
                    );
                } else {
                    // Ajouter un nouvel employé à la carte s'il n'y était pas
                    return [...prevEmployees, updatedEmployee];
                }
            });
        };

        socket.on('location-update', handleLocationUpdate);

        // Nettoyage de l'écouteur lors du démontage du composant
        return () => {
            socket.off('location-update', handleLocationUpdate);
        };
    }, [socket]);

    const defaultPosition: [number, number] = [33.5731, -7.5898]; // Position par défaut (Casablanca)

    return (
        <div className="flex flex-col h-full">
            {/* Stats compactes pour mobile */}
            <TeamStats employees={employees} isMobile={isMobile} />
            
            {/* Carte */}
            <div className="flex-1 relative min-h-[300px]">
                <MapContainer 
                    center={defaultPosition} 
                    zoom={7} 
                    scrollWheelZoom={true} 
                    style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                    className="z-10"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {employees.map(emp => {
                        if (emp.currentLatitude && emp.currentLongitude) {
                            const hasActiveMission = emp.missions?.some(m => m.status === 'IN_PROGRESS');
                            return (
                                <Marker
                                    key={emp.id}
                                    position={[emp.currentLatitude, emp.currentLongitude]}
                                    icon={createCustomIcon(hasActiveMission)}
                                >
                                    <Popup>
                                        <div className="min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                {emp.image ? (
                                                    <img 
                                                        src={emp.image} 
                                                        alt={emp.name || ''} 
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-indigo-600">
                                                            {emp.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {emp.name || 'Employé inconnu'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Dernière MAJ: {emp.lastSeen ? new Date(emp.lastSeen).toLocaleTimeString() : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {emp.missions && emp.missions.length > 0 && (
                                                <div className="space-y-1">
                                                    {emp.missions.slice(0, 2).map(mission => (
                                                        <div key={mission.id} className="p-2 bg-gray-50 rounded text-xs">
                                                            <div className="font-medium text-gray-800">
                                                                {mission.order?.client?.nom || mission.title || 'Mission sans titre'}
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className={getStatusBadge(mission.status).replace('px-2 py-1', 'px-1 py-0.5')}>
                                                                    {getStatusText(mission.status)}
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    {new Date(mission.scheduledStart).toLocaleTimeString('fr-FR', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {emp.missions.length > 2 && (
                                                        <div className="text-xs text-gray-500 text-center">
                                                            +{emp.missions.length - 2} autres missions
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                    <Tooltip permanent direction="top" offset={[0, -30]} opacity={0.9}>
                                        <span className="text-xs font-medium">
                                            {emp.name?.split(' ')[0] || 'Employé'}
                                        </span>
                                    </Tooltip>
                                </Marker>
                            );
                        }
                        return null;
                    })}
                </MapContainer>
            </div>
        </div>
    );

    // Fonctions utilitaires pour les badges de statut
    function getStatusBadge(status: string) {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
        switch (status) {
            case 'IN_PROGRESS':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'PENDING':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'APPROBATION':
                return `${baseClasses} bg-orange-100 text-orange-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    }

    function getStatusText(status: string) {
        switch (status) {
            case 'IN_PROGRESS': return 'En cours';
            case 'PENDING': return 'En attente';
            case 'APPROBATION': return 'Validation';
            case 'COMPLETED': return 'Terminé';
            case 'VALIDATED': return 'Validé';
            case 'CANCELLED': return 'Annulé';
            default: return status;
        }
    }
}