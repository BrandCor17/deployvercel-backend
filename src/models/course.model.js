import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, default: 0 }, 
  resources: [
    {
      type: { type: String, enum: ['link', 'file'], required: true },
      url: { 
        type: String, 
        required: true, 
        match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
      },
    },
  ],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    tags: [{ type: String }], 
    sections: [sectionSchema],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    catedraticos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true } 
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
