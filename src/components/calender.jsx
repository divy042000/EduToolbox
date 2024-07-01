import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { getTasks } from '../services/taskService';

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await getTasks();
    const events = response.data.map(task => ({
      title: task.title,
      start: task.dueDate,
    }));
    setEvents(events);
  };

  return <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={events} />;
};

export default CalendarComponent;
