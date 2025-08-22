// app/administration/tracking/components/LiveMap.tsx
// 🎨 REDESIGN: Popup moderne et cohérent avec Enarva
"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { 
    MapPin, Users, Briefcase, Clock, Navigation, 
    Calendar, User, Phone, CheckCircle, AlertCircle,
    ExternalLink, MapIcon, Timer
} from 'lucide-react';
import { useNotifications } from '@/app/context/NotificationContext';
import Link from 'next/link';

interface EmployeeLocation {
    id: string;
    name: string | null;
    image: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
    lastSeen: Date | null;
    currentMission?: {
        id: string;
        title: string;
        status: string;
        scheduledStart: Date;
        scheduledEnd: Date;
    } | null;
}

interface EmployeeCluster {
    latitude: number;
    longitude: number;
    employees: EmployeeLocation[];
    id: string;
}

// Fonction de clustering (reste identique)
const clusterEmployees = (employees: EmployeeLocation[]): EmployeeCluster[] => {
    const clusters: EmployeeCluster[] = [];
    const processed = new Set<string>();
    const PROXIMITY_THRESHOLD = 0.001;

    employees.forEach(employee => {
        if (!employee.currentLatitude || !employee.currentLongitude || processed.has(employee.id)) {
            return;
        }

        const nearbyEmployees = employees.filter(emp => {
            if (!emp.currentLatitude || !emp.currentLongitude || processed.has(emp.id)) {
                return false;
            }

            const distance = Math.sqrt(
                Math.pow(emp.currentLatitude - employee.currentLatitude!, 2) +
                Math.pow(emp.currentLongitude - employee.currentLongitude!, 2)
            );

            return distance <= PROXIMITY_THRESHOLD;
        });

        nearbyEmployees.forEach(emp => processed.add(emp.id));

        clusters.push({
            latitude: employee.currentLatitude,
            longitude: employee.currentLongitude,
            employees: nearbyEmployees,
            id: `cluster-${employee.currentLatitude}-${employee.currentLongitude}`
        });
    });

    return clusters;
};

// 🎨 NOUVEAUX ICÔNES MODERNES
const createSingleEmployeeIcon = () => {
    return L.divIcon({
        html: ReactDOMServer.renderToString(
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <User className="text-white" size={20} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
        ),
        className: 'bg-transparent border-none',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

const createClusterIcon = (count: number) => {
    return L.divIcon({
        html: ReactDOMServer.renderToString(
            <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-xl">
                    {count}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Users className="text-indigo-600" size={14} />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-ping opacity-30"></div>
            </div>
        ),
        className: 'bg-transparent border-none',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
    });
};

// 🎨 FONCTION HELPER POUR LES STATUS
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'PENDING':
            return {
                bg: 'bg-amber-100 dark:bg-amber-900/30',
                text: 'text-amber-800 dark:text-amber-200',
                icon: <Clock size={14} className="text-amber-600" />,
                label: 'En Attente'
            };
        case 'IN_PROGRESS':
            return {
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                text: 'text-blue-800 dark:text-blue-200',
                icon: <Timer size={14} className="text-blue-600" />,
                label: 'En Cours'
            };
        case 'COMPLETED':
            return {
                bg: 'bg-green-100 dark:bg-green-900/30',
                text: 'text-green-800 dark:text-green-200',
                icon: <CheckCircle size={14} className="text-green-600" />,
                label: 'Terminée'
            };
        default:
            return {
                bg: 'bg-gray-100 dark:bg-gray-800',
                text: 'text-gray-800 dark:text-gray-200',
                icon: <AlertCircle size={14} className="text-gray-600" />,
                label: status
            };
    }
};

// 🎨 COMPOSANT CARTE EMPLOYÉ REDESIGNÉ
const ModernEmployeeCard = ({ employee }: { employee: EmployeeLocation }) => {
    const statusStyle = employee.currentMission ? getStatusStyle(employee.currentMission.status) : null;
    const timeAgo = employee.lastSeen ? 
        Math.floor((Date.now() - new Date(employee.lastSeen).getTime()) / (1000 * 60)) : null;

    return (
        <div className="group bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            {/* Header avec avatar et nom */}
            <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                    {employee.image ? (
                        <img 
                            src={employee.image} 
                            alt={employee.name || 'Employé'} 
                            className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center border-3 border-white shadow-md">
                            <User size={20} className="text-white" />
                        </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-base truncate">
                        {employee.name || 'Employé'}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock size={12} />
                        <span>
                            {timeAgo !== null ? (
                                timeAgo < 1 ? "À l'instant" : 
                                timeAgo < 60 ? `Il y a ${timeAgo}min` : 
                                `Il y a ${Math.floor(timeAgo / 60)}h`
                            ) : 'Hors ligne'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Mission Info (si présente) */}
            {employee.currentMission ? (
                <div className="space-y-3">
                    <div className={`${statusStyle?.bg} ${statusStyle?.text} px-3 py-2 rounded-lg flex items-center space-x-2`}>
                        {statusStyle?.icon}
                        <span className="font-medium text-sm">{statusStyle?.label}</span>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-start space-x-2 mb-2">
                            <Briefcase size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white text-sm leading-tight">
                                    {employee.currentMission.title}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                            <Calendar size={12} />
                            <span>
                                {new Date(employee.currentMission.scheduledStart).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })} - {new Date(employee.currentMission.scheduledEnd).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </span>
                        </div>

                        <Link 
                            href={`/administration/missions/${employee.currentMission.id}`}
                            className="inline-flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
                        >
                            <span>Voir la mission</span>
                            <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-slate-400 dark:text-slate-500 mb-1">
                        <MapIcon size={20} className="mx-auto" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Pas de mission active
                    </p>
                </div>
            )}
        </div>
    );
};

// 🎨 COMPOSANT PRINCIPAL LIVEMAP
export function LiveMap({ initialEmployees }: { initialEmployees: EmployeeLocation[] }) {
    const [employees, setEmployees] = useState(initialEmployees);
    const { socket } = useNotifications();

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

    const defaultPosition: [number, number] = [33.5731, -7.5898];
    const employeeClusters = clusterEmployees(employees);
    const hasEmployees = employeeClusters.length > 0;

    return (
        <div className="h-full w-full relative">
            <MapContainer 
                center={defaultPosition} 
                zoom={10} 
                scrollWheelZoom={true} 
                style={{ 
                    height: '100%', 
                    width: '100%', 
                    borderRadius: '0.5rem',
                    position: 'relative',
                    zIndex: 0
                }}
                className="leaflet-container"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {employeeClusters.map(cluster => {
                    const isSingleEmployee = cluster.employees.length === 1;
                    const employee = cluster.employees[0];
                    
                    return (
                        <Marker
                            key={cluster.id}
                            position={[cluster.latitude, cluster.longitude]}
                            icon={isSingleEmployee 
                                ? createSingleEmployeeIcon() 
                                : createClusterIcon(cluster.employees.length)
                            }
                        >
                            <Popup 
                                maxWidth={350} 
                                className="modern-popup"
                                closeButton={true}
                            >
                                <div className="max-h-96 overflow-y-auto">
                                    {isSingleEmployee ? (
                                        <div className="p-2">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                                    Employé en Direct
                                                </h3>
                                            </div>
                                            <ModernEmployeeCard employee={employee} />
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                                    {cluster.employees.length} Employés Ici
                                                </h3>
                                            </div>
                                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                                {cluster.employees.map(emp => (
                                                    <ModernEmployeeCard key={emp.id} employee={emp} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Footer avec coordonnées */}
                                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600 px-2">
                                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                                            <Navigation size={12} />
                                            <span>
                                                {cluster.latitude.toFixed(4)}, {cluster.longitude.toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                            
                            {isSingleEmployee && (
                                <Tooltip 
                                    permanent 
                                    direction="top" 
                                    offset={[0, -35]} 
                                    className="modern-tooltip"
                                >
                                    <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {employee.name?.split(' ')[0] || 'Employé'}
                                    </div>
                                </Tooltip>
                            )}
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Overlay statistiques redesigné */}
            <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 z-10 min-w-[280px]">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    Équipes Actives
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {employees.filter(emp => emp.currentLatitude && emp.currentLongitude).length}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Employés</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {employeeClusters.length}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Localisations</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {employees.filter(emp => emp.currentMission).length}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">En Mission</div>
                    </div>
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${socket ? 'text-emerald-500' : 'text-red-500'}`}>
                            {socket ? '●' : '○'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Temps Réel</div>
                    </div>
                </div>
            </div>
        </div>
    );
}