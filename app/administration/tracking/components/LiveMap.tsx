// app/administration/tracking/components/LiveMap.tsx
"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { MapPin, Users, Clock, Building, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotifications } from '@/app/context/NotificationContext';

// Interface mise à jour selon l'API corrigée
interface EmployeeLocation {
    id: string;
    name: string;
    image: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
    lastSeen: Date | null;
    role: string;
    hasActiveMission: boolean;
    missionCount: number;
    missions: Array<{
        id: string;
        title: string;
        status: string;
        scheduledStart: Date;
        scheduledEnd: Date | null;
        actualStart: Date | null;
        actualEnd: Date | null;
        notes: string | null;
        order?: {
          id: string;
          orderNumber: string;
          client: {
            id: string;
            nom: string;
            adresse: string | null;
            telephone: string | null;
          };
        } | null;
    }>;
}

interface TeamStatsProps {
    employees: EmployeeLocation[];
    isMobile?: boolean;
}

// Création d'une icône personnalisée avec Lucide
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

// Composant pour les statistiques d'équipe
function TeamStats({ employees, isMobile = false }: TeamStatsProps) {
    const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
    
    const activeEmployees = employees.filter(emp => 
        emp.currentLatitude && emp.currentLongitude
    );
    
    const locationsCount = new Set(
        activeEmployees.map(emp => `${emp.currentLatitude}-${emp.currentLongitude}`)
    ).size;
    
    const employeesOnMission = activeEmployees.filter(emp => emp.hasActiveMission).length;

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

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isMobile) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-4">
                {/* Header compact pour mobile */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
                        Équipes Actives
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {activeEmployees.length}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Employés</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {locationsCount}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Localisations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {employeesOnMission}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">En Mission</div>
                        </div>
                        <div className="text-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1 animate-pulse"></div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Temps Réel</div>
                        </div>
                    </div>

                    {/* Liste des employés avec expand/collapse sur mobile */}
                    <div className="space-y-2">
                        {activeEmployees.slice(0, 3).map(employee => {
                            const isExpanded = expandedEmployees.has(employee.id);
                            const lastSeen = employee.lastSeen ? new Date(employee.lastSeen) : null;
                            const isOnline = lastSeen && (new Date().getTime() - lastSeen.getTime()) < 5 * 60 * 1000;

                            return (
                                <div key={employee.id} className="border dark:border-gray-600 rounded-lg p-2">
                                    <button
                                        onClick={() => toggleEmployee(employee.id)}
                                        className="w-full flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {/* Avatar */}
                                            <div className="relative">
                                                {employee.image ? (
                                                    <img 
                                                        src={employee.image} 
                                                        alt={employee.name} 
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

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                                    {employee.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {employee.missionCount} mission{employee.missionCount > 1 ? 's' : ''}
                                                    {employee.hasActiveMission && (
                                                        <span className="ml-1 text-green-600 dark:text-green-400">• Active</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronDown 
                                            size={16} 
                                            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                        />
                                    </button>

                                    {/* Détails missions expandables */}
                                    {isExpanded && employee.missions.length > 0 && (
                                        <div className="mt-2 pl-10 space-y-1">
                                            {employee.missions.map(mission => (
                                                <div key={mission.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium text-gray-900 dark:text-white truncate">
                                                            {mission.order?.client?.nom || mission.title}
                                                        </span>
                                                        <span className={getStatusBadge(mission.status)}>
                                                            {getStatusText(mission.status)}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-400">
                                                        {new Date(mission.scheduledStart).toLocaleTimeString('fr-FR', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        
                        {activeEmployees.length > 3 && (
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                +{activeEmployees.length - 3} autres employés sur la carte
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Version desktop
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
                <Users className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Équipes Actives</h3>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        socket.emit('join-tracking-room');

        const handleLocationUpdate = (updatedEmployee: EmployeeLocation) => {
            setEmployees(prevEmployees => {
                const existingEmployee = prevEmployees.find(emp => emp.id === updatedEmployee.id);
                if (existingEmployee) {
                    return prevEmployees.map(emp =>
                        emp.id === updatedEmployee.id ? updatedEmployee : emp
                    );
                } else {
                    return [...prevEmployees, updatedEmployee];
                }
            });
        };

        socket.on('location-update', handleLocationUpdate);

        return () => {
            socket.off('location-update', handleLocationUpdate);
        };
    }, [socket]);

    const defaultPosition: [number, number] = [33.5731, -7.5898]; // Casablanca

    return (
        <div className="flex flex-col h-full">
            <TeamStats employees={employees} isMobile={isMobile} />
            
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
                            return (
                                <Marker
                                    key={emp.id}
                                    position={[emp.currentLatitude, emp.currentLongitude]}
                                    icon={createCustomIcon(emp.hasActiveMission)}
                                >
                                    <Popup>
                                        <div className="min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                {emp.image ? (
                                                    <img 
                                                        src={emp.image} 
                                                        alt={emp.name} 
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-indigo-600">
                                                            {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-gray-900">{emp.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {emp.missionCount} mission{emp.missionCount > 1 ? 's' : ''}
                                                        {emp.hasActiveMission && ' • En cours'}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {emp.missions.length > 0 && (
                                                <div className="space-y-1">
                                                    {emp.missions.slice(0, 2).map(mission => (
                                                        <div key={mission.id} className="p-2 bg-gray-50 rounded text-xs">
                                                            <div className="font-medium text-gray-800">
                                                                {mission.order?.client?.nom || mission.title}
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-gray-500">
                                                                    {new Date(mission.scheduledStart).toLocaleTimeString('fr-FR', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </span>
                                                                <span className={`px-1 py-0.5 rounded text-xs ${
                                                                    mission.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                                                                    mission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {mission.status}
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
                                            {emp.name.split(' ')[0]}
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
}