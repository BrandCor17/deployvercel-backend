import * as eventService from '../services/event.service.js';

const createEvent = async (req, res, next) => {
  const { title, description, date, location, courseId } = req.body;

  if (!title || !date || !courseId) {
    return res.status(400).json({ message: 'Faltan datos obligatorios: title, date o courseId' });
  }

  try {
    const event = await eventService.createEvent({ title, description, date, location, courseId });
    res.status(201).json(event);
  } catch (error) {
    next(error); 
  }
};

const getEventsByCourse = async (req, res, next) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ message: 'Se requiere el ID del curso' });
  }

  try {
    const events = await eventService.getEventsByCourse(courseId);
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No se encontraron eventos para este curso' });
    }
    res.json(events);
  } catch (error) {
    next(error);
  }
};


const deleteEvent = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    await eventService.deleteEvent(eventId);
    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

const getEventsForUser = async (req, res, next) => {
  const userId = req.user._id; 

  try {
    const userCourses = await eventService.getCoursesByUser(userId);

    if (!userCourses || userCourses.length === 0) {
      return res.status(404).json({ message: 'No estás inscrito en ningún curso' });
    }

    const events = await eventService.getEventsByCourses(userCourses);

    if (events.length === 0) {
      return res.status(404).json({ message: 'No hay eventos disponibles para tus cursos' });
    }

    res.json(events);
  } catch (error) {
    next(error);
  }
};

const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    if (events.length === 0) {
      return res.status(404).json({ message: 'No hay eventos disponibles' });
    }
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export {
  createEvent,
  getEventsByCourse,
  deleteEvent,
  getEventsForUser,
  getAllEvents,
};
