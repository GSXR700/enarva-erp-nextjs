// app/administration/tracking/components/LiveMap.tsx
"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { MapPin, Users, Briefcase, Clock, Navigation } from 'lucide-react';
import { useNotifications } from '@/app/context/NotificationContext';
import Link from 'next/link';

interface EmployeeLocation {
    id: string;
    name: string | null;
    image: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
    lastSeen: Date | null;
    // Ajout des infos mission pour l'accès rapide
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

// Fonction pour grouper les employés par proximité (même localisation ou très proche)
const clusterEmployees = (employees: EmployeeLocation[]): EmployeeCluster[] => {
    const clusters: EmployeeCluster[] = [];
    const processed = new Set<string>();
    const PROXIMITY_THRESHOLD = 0.001; // ~100m de distance

    employees.forEach(employee => {
        if (!employee.currentLatitude || !employee.currentLongitude || processed.has(employee.id)) {
            return;
        }

        // Trouver tous les employés à proximité
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

        // Marquer comme traités
        nearbyEmployees.forEach(emp => processed.add(emp.id));

        // Créer le cluster
        clusters.push({
            latitude: employee.currentLatitude,
            longitude: employee.currentLongitude,
            employees: nearbyEmployees,
            id: `cluster-${employee.currentLatitude}-${employee.currentLongitude}`
        });
    });

    return clusters;
};

// Icône pour un seul employé
const createSingleEmployeeIcon = () => {
    return L.divIcon({
        html: ReactDOMServer.renderToString(
            <div className="relative">
                <MapPin className="text-blue-600" fill="currentColor" size={32} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
        ),
        className: 'bg-transparent border-none',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

// Icône pour un cluster d'employés
const createClusterIcon = (count: number) => {
    return L.divIcon({
        html: ReactDOMServer.renderToString(
            <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-white shadow-lg">
                    {count}
                </div>
                <Users className="absolute -bottom-1 -right-1 text-blue-600 bg-white rounded-full p-1" size={16} />
            </div>
        ),
        className: 'bg-transparent border-none',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

// Composant pour afficher les détails d'un employé
const EmployeeCard = ({ employee }: { employee: EmployeeLocation }) => (
    <div className="border-b border-gray-200 dark:border-gray-600 last:border-b-0 pb-3 last:pb-0 mb-3 last:mb-0">
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
                {employee.image ? (
                    <img 
                        src={employee.image} 
                        alt={employee.name || 'Employé'} 
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-gray-600" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {employee.name || 'Employé inconnu'}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>
                        {employee.lastSeen 
                            ? `MAJ: ${new Date(employee.lastSeen).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}`
                            : 'Jamais vu'
                        }
                    </span>
                </div>
                {employee.currentMission && (
                    <div className="mt-1">
                        <Link 
                            href={`/administration/missions/${employee.currentMission.id}`}
                            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            <Briefcase size={12} />
                            <span className="truncate max-w-[150px]">
                                {employee.currentMission.title}
                            </span>
                        </Link>
                        <div className="text-xs text-gray-500 mt-0.5">
                            Status: {employee.currentMission.status}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

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

    const defaultPosition: [number, number] = [33.5731, -7.5898]; // Casablanca

    // Grouper les employés par clusters
    const employeeClusters = clusterEmployees(employees);

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
                            <Popup maxWidth={300} className="custom-popup">
                                <div className="max-h-80 overflow-y-auto">
                                    {isSingleEmployee ? (
                                        // Affichage pour un seul employé
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                                                📍 Employé sur le terrain
                                            </h3>
                                            <EmployeeCard employee={employee} />
                                        </div>
                                    ) : (
                                        // Affichage pour plusieurs employés
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white flex items-center">
                                                <Users className="mr-2" size={20} />
                                                {cluster.employees.length} Employés ici
                                            </h3>
                                            <div className="space-y-3">
                                                {cluster.employees.map(emp => (
                                                    <EmployeeCard key={emp.id} employee={emp} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                            <Navigation size={12} className="mr-1" />
                                            {cluster.latitude.toFixed(4)}, {cluster.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                            
                            {isSingleEmployee && (
                                <Tooltip permanent direction="top" offset={[0, -35]} className="bg-primary text-white px-2 py-1 rounded">
                                    {employee.name?.split(' ')[0] || 'Employé'}
                                </Tooltip>
                            )}
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Overlay avec statistiques */}
            <div className="absolute top-4 right-4 bg-white dark:bg-dark-surface rounded-lg shadow-lg p-4 z-10 max-w-xs">
                <h3 className="font-semibold text-gray-800 dark:text-dark-text mb-3 flex items-center">
                    <Users className="mr-2" size={16} />
                    Équipes Actives
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-dark-subtle">Total employés:</span>
                        <span className="font-medium text-gray-800 dark:text-dark-text">
                            {employees.filter(emp => emp.currentLatitude && emp.currentLongitude).length}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-dark-subtle">Localisations:</span>
                        <span className="font-medium text-gray-800 dark:text-dark-text">
                            {employeeClusters.length}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-dark-subtle">En mission:</span>
                        <span className="font-medium text-green-600">
                            {employees.filter(emp => emp.currentMission).length}
                        </span>
                    </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-dark-subtle">
                        💡 Cliquez sur les marqueurs pour voir les détails et accéder aux missions
                    </p>
                </div>
            </div>
        </div>
    );
}