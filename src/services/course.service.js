import User from '../models/user.model.js';
import Course from '../models/course.model.js';
export const createCourseService = async ({ title, description, tags, sections, instructor }) => {
  if (!title || !description || !tags || !sections || !instructor) {
    throw new Error('Faltan datos requeridos.');
  }

  const instructorExists = await User.findById(instructor);
  if (!instructorExists) {
    throw new Error('Instructor no encontrado.');
  }

  const newCourse = await Course.create({
    title,
    description,
    tags,
    sections,
    instructor,
  });

  return newCourse;
};

export const enrollInCourseService = async (courseId, userId) => {
  // Buscar el curso
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('El curso no existe');
  }

  // Validar si el usuario es el instructor del curso
  if (course.instructor && String(course.instructor) === String(userId)) {
    throw new Error('No puedes inscribirte como estudiante en un curso que tú enseñas.');
  }

  // Validar si el usuario ya está inscrito en el curso
  if (course.students.some((studentId) => String(studentId) === String(userId))) {
    throw new Error('Ya estás inscrito en este curso');
  }

  // Inscribir al usuario en el curso
  course.students.push(userId);
  await course.save();

  // Agregar el curso a los cursos del estudiante
  const student = await User.findById(userId);
  student.coursesAsStudent.push(courseId);
  await student.save();

  return course; // Retorna el curso con la inscripción exitosa
};

export const assignInstructorToCourseService = async (courseId, instructorId) => {
  // Buscar el curso
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Curso no encontrado');
  }

  // Verificar si el instructor ya está asignado al curso
  if (course.instructor?.toString() === instructorId.toString()) {
    throw new Error('Este instructor ya es el instructor principal de este curso');
  }

  // Verificar si el instructor era estudiante del curso
  const wasStudent = course.students.includes(instructorId);
  if (wasStudent) {
    course.students = course.students.filter(studentId => studentId.toString() !== instructorId);
  }

  // Asignar el instructor al curso
  course.instructor = instructorId;
  await course.save();

  // Obtener el instructor y agregar el curso a sus cursos
  const instructor = await User.findById(instructorId);
  if (!instructor.coursesAsInstructor.includes(courseId)) {
    instructor.coursesAsInstructor.push(courseId);
  }

  // Si el instructor estaba como estudiante, eliminar el curso de `coursesAsStudent`
  if (wasStudent) {
    instructor.coursesAsStudent = instructor.coursesAsStudent.filter(
      studentCourseId => studentCourseId.toString() !== courseId
    );
  }

  await instructor.save();

  return { course, wasStudent }; // Retornar los datos relevantes
};

export const assignCatedraticoService = async (courseId, catedraticoId) => {
  const catedratico = await User.findById(catedraticoId);
  if (!catedratico || catedratico.role !== 'catedratico') {
    throw new Error('Catedrático no encontrado o no válido');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Curso no encontrado');
  }

  // Verificar si el catedrático ya está asignado al curso
  if (course.catedraticos.includes(catedraticoId)) {
    throw new Error('Este catedrático ya está asignado a este curso');
  }

  // Asignar el catedrático al curso
  course.catedraticos.push(catedraticoId);
  await course.save();

  // Agregar el curso a los cursos del catedrático
  if (!catedratico.coursesAsCatedratico.includes(courseId)) {
    catedratico.coursesAsCatedratico.push(courseId);
    await catedratico.save();
  }

  return course; // Retornar el curso actualizado
};


export const getCoursesService = async (search) => {
  let courses;

  if (search) {
    // Realizar búsqueda por título usando expresión regular (case-insensitive)
    courses = await Course.find({
      title: { $regex: search, $options: "i" },
    });
  } else {
    courses = await Course.find();
  }

  return courses;
};



export const getUserCoursesService = async (userId) => {
  const user = await User.findById(userId)
    .populate('coursesAsStudent')
    .populate('coursesAsInstructor')
    .populate('coursesAsCatedratico');

  if (!user) {
    throw new Error('User not found');
  }

  return [
    ...user.coursesAsStudent,
    ...user.coursesAsInstructor,
    ...user.coursesAsCatedratico
  ];
};


export const getInstructorCoursesAsStudentService = async (userId) => {
  const user = await User.findById(userId).populate('coursesAsStudent');

  if (!user) {
    throw new Error('User not found');
  }

  return user.coursesAsStudent;
};



export const deleteCourseService = async (courseId) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw new Error('Course not found');
  }

  await Course.findByIdAndDelete(courseId);
};



export const getCourseByIdService = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate('instructor', 'name email role')
    .populate('catedraticos', 'name email role')
    .populate('students', 'name email');
  
  if (!course) {
    throw new Error('Course not found');
  }

  return course;
};



export const removeUserFromCourseService = async (courseId, userId) => {
  // Buscar el curso
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('El curso no existe');
  }

  // Validar si el usuario está asociado al curso (ya sea como estudiante o instructor)
  if (!course.students.includes(userId) && String(course.instructor) !== String(userId)) {
    throw new Error('El usuario no está asociado a este curso');
  }

  // Eliminar al usuario de la lista de estudiantes o instructor del curso
  if (course.students.includes(userId)) {
    course.students = course.students.filter(studentId => String(studentId) !== String(userId));
  }
  if (String(course.instructor) === String(userId)) {
    course.instructor = null;  // Eliminar el instructor
  }

  await course.save();

  // Eliminar el curso de los cursos del usuario
  const user = await User.findById(userId);
  user.coursesAsStudent = user.coursesAsStudent.filter(courseId => String(courseId) !== String(courseId));
  await user.save();

  return course; // Retorna el curso con el usuario eliminado
};
