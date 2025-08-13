// app/administration/planning/components/CalendarView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import '../planning.css';

interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

export const CalendarView = ({ initialEvents }: { initialEvents: ScheduleEvent[] }) => {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);

  const handleApiUpdate = async (eventId: string, start: string, end: string, revert: () => void) => {
    try {
      const response = await fetch(`/api/schedule/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end }),
      });
      if (!response.ok) throw new Error('Échec de la mise à jour');
      toast.success("Mission mise à jour.");
      router.refresh(); // Refresh server components
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("La modification n'a pas été enregistrée.");
      revert();
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    handleApiUpdate(dropInfo.event.id, dropInfo.event.startStr, dropInfo.event.endStr, dropInfo.revert);
  };

  // --- NEW HANDLER for resizing events ---
  const handleEventResize = (resizeInfo: any) => {
    handleApiUpdate(resizeInfo.event.id, resizeInfo.event.startStr, resizeInfo.event.endStr, resizeInfo.revert);
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      }}
      initialView={'timeGridWeek'}
      locale="fr"
      buttonText={{ today: "Aujourd'hui", month: 'Mois', week: 'Semaine', day: 'Jour', list: 'Liste' }}
      events={events}
      eventClick={(info) => router.push(`/administration/missions/${info.event.id}`)}
      editable={true}
      eventDrop={handleEventDrop}
      eventResize={handleEventResize} // <-- ENABLE RESIZE HANDLER
      nowIndicator={true}
      height="auto"
      slotMinTime="08:00:00"
      slotMaxTime="20:00:00"
      allDaySlot={false}
      eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false, hour12: false }}
    />
  );
};