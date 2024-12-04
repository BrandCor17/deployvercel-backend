import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Relación con el curso
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
