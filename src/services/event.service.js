import Event from '../models/event.model.js';
import Course from '../models/course.model.js';
import User from '../models/user.model.js';

const createEvent = async ({ title, description, date, location, courseId }) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Curso no encontrado');
  }

  const newEvent = new Event({
    title,
    description,
    date,
    location,
    course: courseId,
  });

  return await newEvent.save();
};

const getEventsByCourse = async (courseId) => {
  return await Event.find({ course: courseId }).populate('course', 'name description');
};

const updateEvent = async (eventId, updatedData) => {
  const event = await Event.findByIdAndUpdate(eventId, updatedData, { new: true });
  if (!event) {
    throw new Error('Evento no encontrado');
  }
  return event;
};

const deleteEvent = async (eventId) => {
  const event = await Event.findByIdAndDelete(eventId);
  if (!event) {
    throw new Error('Evento no encontrado');
  }
  return event;
};

const getCoursesByUser = async (userId) => {
  const user = await User.findById(userId).populate('coursesAsStudent');
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user.coursesAsStudent;
};

const getEventsByCourses = async (courses) => {
  if (!courses || courses.length === 0) {
    return [];
  }
  const courseIds = courses.map((course) => course._id);
  return await Event.find({ course: { $in: courseIds } }).populate('course', 'name');
};

const getAllEvents = async () => {
  return await Event.find().populate('course', 'name description');
};

export {
  createEvent,
  getEventsByCourse,
  updateEvent,
  deleteEvent,
  getCoursesByUser,
  getEventsByCourses,
  getAllEvents,
};
