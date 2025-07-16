// app/administration/planning/components/CalendarView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'; // <-- Importer le plugin pour la vue en liste
import { useRouter } from 'next/navigation';
import '../planning.css';

interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  employeeId: string;
  employeeName: string;
}

export const CalendarView = ({ initialEvents }: { initialEvents: ScheduleEvent[] }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile(); // Vérifier au chargement
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleEventClick = (clickInfo: any) => {
    router.push(`/administration/missions/${clickInfo.event.id}`);
  };

  const handleEventDrop = async (dropInfo: any) => {
    const { event } = dropInfo;
    try {
      const response = await fetch(`/api/schedule/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: event.startStr, end: event.endStr }),
      });
      if (!response.ok) throw new Error('Échec de la mise à jour');
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Une erreur est survenue. La modification n'a pas été enregistrée.");
      dropInfo.revert();
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]} // Ajout de listPlugin
      headerToolbar={isMobile ? {
        left: 'prev,next',
        center: 'title',
        right: 'listWeek,dayGridMonth' // Vue "liste" par défaut sur mobile
      } : {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      }}
      initialView={isMobile ? 'listWeek' : 'timeGridWeek'}
      locale="fr"
      buttonText={{
        today: "Aujourd'hui",
        month: 'Mois',
        week: 'Semaine',
        list: 'Liste'
      }}
      events={initialEvents}
      eventClick={handleEventClick}
      editable={true}
      eventDrop={handleEventDrop}
      selectable={true}
      nowIndicator={true}
      height="auto"
      slotMinTime="08:00:00"
      slotMaxTime="20:00:00"
      allDaySlot={false}
      eventTimeFormat={{
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false,
        hour12: false
      }}
    />
  );
};