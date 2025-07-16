"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { MapPin } from 'lucide-react';
import { useNotifications } from '@/app/context/NotificationContext'; 

interface EmployeeLocation {
    id: string;
    name: string | null;
    image: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
    lastSeen: Date | null;
}

// Création d'une icône personnalisée avec Lucide
const createCustomIcon = () => {
  return L.divIcon({
    html: ReactDOMServer.renderToString(
      <MapPin className="text-primary" fill="currentColor" size={32} />
    ),
    className: 'bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Pointe de l'icône
    popupAnchor: [0, -32],
  });
};


export function LiveMap({ initialEmployees }: { initialEmployees: EmployeeLocation[] }) {
    const [employees, setEmployees] = useState(initialEmployees);
    const { socket } = useNotifications();

    useEffect(() => {
        if (!socket) return;

        // S'abonner aux mises à jour de localisation
        socket.emit('join-tracking-room');

        const handleLocationUpdate = (updatedEmployee: EmployeeLocation) => {
            setEmployees(prevEmployees => {
                const existingEmployee = prevEmployees.find(emp => emp.id === updatedEmployee.id);
                if (existingEmployee) {
                    // Mettre à jour un employé existant
                    return prevEmployees.map(emp => 
                        emp.id === updatedEmployee.id ? updatedEmployee : emp
                    );
                } else {
                    // Ajouter un nouvel employé à la carte
                    return [...prevEmployees, updatedEmployee];
                }
            });
        };

        socket.on('location-update', handleLocationUpdate);

        // Nettoyage de l'écouteur
        return () => {
            socket.off('location-update', handleLocationUpdate);
        };
    }, [socket]);
    
    const defaultPosition: [number, number] = [33.5731, -7.5898];

    return (
        <MapContainer center={defaultPosition} zoom={7} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
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
                            icon={createCustomIcon()} // Utilisation de notre icône personnalisée
                        >
                            <Popup>
                                <b>{emp.name || 'Employé inconnu'}</b><br/>
                                Dernière MAJ: {emp.lastSeen ? new Date(emp.lastSeen).toLocaleTimeString() : 'N/A'}
                            </Popup>
                            <Tooltip permanent direction="top" offset={[0, -35]}>
                                {emp.name?.split(' ')[0]}
                            </Tooltip>
                        </Marker>
                    )
                }
                return null;
            })}
        </MapContainer>
    );
}