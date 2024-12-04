import Course from '../models/course.model.js';
import User from '../models/user.model.js';

export const createCourse = async (req, res) => {
  try {
    const { title, description, tags, sections, instructor } = req.body; 

    const newCourse = await Course.create({
      title,
      description,
      tags,
      sections,
      instructor, 
    });

    res.status(201).json({ message: 'Curso creado exitosamente.', course: newCourse });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el curso.', error: error.message });
  }
};


export const enrollInCourse = async (req, res) => {
  const { courseId } = req.params; 
  const userId = req.user._id; 

  console.log("Datos recibidos en el backend:", { courseId, userId });

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'El curso no existe' });
    }

    // Validar si el usuario es el instructor del curso
    if (course.instructor && String(course.instructor) === String(userId)) {
      return res.status(400).json({ message: 'No puedes inscribirte como estudiante en un curso que tú enseñas.' });
    }

    // Validar si el usuario ya está inscrito como estudiante
    if (course.students.some((studentId) => String(studentId) === String(userId))) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso' });
    }

    // Inscribir al usuario en el curso
    course.students.push(userId);
    await course.save();

    // Agregar el curso a los cursos del estudiante
    const student = await User.findById(userId);
    student.coursesAsStudent.push(courseId);
    await student.save();

    res.status(200).json({ message: 'Inscripción exitosa al curso', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al inscribirse en el curso', error: error.message });
  }
};

export const assignInstructorToCourse = async (req, res) => {
  const { courseId } = req.body; 
  const { instructorId } = req.params; 

  try {
    if (req.user.role !== "catedratico") {
      return res.status(403).json({ message: "No tienes permisos para realizar esta acción" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Verificar si el instructor ya está asignado al curso
    if (course.instructor?.toString() === instructorId.toString()) {
      return res.status(400).json({ message: "Este instructor ya es el instructor principal de este curso" });
    }

    const wasStudent = course.students.includes(instructorId);
    if (wasStudent) {
      course.students = course.students.filter(studentId => studentId.toString() !== instructorId);
    }

    // Asignar el instructor al curso
    course.instructor = instructorId;
    await course.save();

    // Agregar el curso a los cursos del instructor
    const instructor = await User.findById(instructorId);
    if (!instructor.coursesAsInstructor.includes(courseId)) {
      instructor.coursesAsInstructor.push(courseId);
    }

    // Si estaba como estudiante, eliminar el curso de `coursesAsStudent` del instructor
    if (wasStudent) {
      instructor.coursesAsStudent = instructor.coursesAsStudent.filter(
        studentCourseId => studentCourseId.toString() !== courseId
      );
    }

    await instructor.save();

    res.status(200).json({ 
      message: wasStudent 
        ? "Instructor asignado y eliminado como estudiante del curso" 
        : "Instructor asignado correctamente al curso", 
      course 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al asignar instructor", error: error.message });
  }
};

export const assignCatedratico = async (req, res) => {
    const { catedraticoId } = req.params; 
    const { courseId } = req.body; 

    try {
        const catedratico = await User.findById(catedraticoId);
        if (!catedratico || catedratico.role !== 'catedratico') {
            return res.status(404).json({ message: 'Catedrático no encontrado o no válido.' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado.' });
        }

        if (course.catedraticos.includes(catedraticoId)) {
            return res.status(400).json({ message: 'Este catedrático ya está asignado a este curso.' });
        }

        // Agregar el catedrático al arreglo del curso
        course.catedraticos.push(catedraticoId);
        await course.save();

        if (!catedratico.coursesAsCatedratico.includes(courseId)) {
            catedratico.coursesAsCatedratico.push(courseId); 
            await catedratico.save(); 
        }

        res.status(200).json({
            message: 'Catedrático asignado exitosamente.',
            course,
        });
    } catch (error) {
        console.error('Error al asignar catedrático:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const getCourses = async (req, res) => {
  try {
    const { search } = req.query; 
    let courses;

    if (search) {
      courses = await Course.find({
        title: { $regex: search, $options: "i" }, 
      });
    } else {
      courses = await Course.find();
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving courses', error: error.message });
  }
};

export const getUserCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate('coursesAsStudent')        
      .populate('coursesAsInstructor')     
      .populate('coursesAsCatedratico');    

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const courses = [
      ...user.coursesAsStudent,
      ...user.coursesAsInstructor,
      ...user.coursesAsCatedratico
    ];

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user courses', error: error.message });
  }
};

export const getInstructorCoursesAsStudent = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('coursesAsStudent');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.coursesAsStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving courses as student', error: error.message });
  }
};

  export const deleteCourse = async (req, res) => {
    console.log("Parametros recibidos:", req.params); 
  
    const { courseId } = req.params;
  
    if (!courseId) {
      return res.status(400).json({ message: "El ID del curso es requerido" });
    }
  
    try {
      const course = await Course.findById(courseId);
  
      if (!course) {
        return res.status(404).json({ message: "Curso no encontrado" });
      }
  
      await Course.findByIdAndDelete(courseId);
  
      return res.status(200).json({ message: "Curso eliminado con éxito" });
  
    } catch (error) {
      return res.status(500).json({ message: error.message || "Hubo un error al intentar eliminar el curso" });
    }
};


export const getCourseById = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id)
            .populate('instructor', 'name email role') 
            .populate('catedraticos', 'name email role') 
            .populate('students', 'name email'); 

        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado.' });
        }

        res.status(200).json(course);
    } catch (error) {
        console.error('Error al obtener el curso:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


export const leaveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id; 

      console.log(courseId + userId);
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    if (course.instructor?.toString() === userId.toString()) {
      return res.status(400).json({ message: 'El instructor no puede salir del curso' });
    }

    if (course.students.includes(userId)) {
      course.students = course.students.filter(studentId => studentId.toString() !== userId.toString());
    }

    if (course.catedraticos.includes(userId)) {
      course.catedraticos = course.catedraticos.filter(catedraticoId => catedraticoId.toString() !== userId.toString());
    }

    await course.save();

    const user = await User.findById(userId);

    if (user.coursesAsStudent.includes(courseId)) {
      user.coursesAsStudent = user.coursesAsStudent.filter(courseIdInList => courseIdInList.toString() !== courseId);
    }

    if (user.coursesAsCatedratico.includes(courseId)) {
      user.coursesAsCatedratico = user.coursesAsCatedratico.filter(courseIdInList => courseIdInList.toString() !== courseId);
    }

    await user.save(); 

    return res.status(200).json({ message: 'Usuario eliminado del curso correctamente' });
  } catch (err) {
    console.error("Error al eliminar del curso:", err);
    res.status(500).json({ message: 'Error al eliminar al usuario del curso' });
  }
};


export const addSection = async (req, res) => {
  // Obtén el courseId desde la URL
  const { courseId } = req.params;
  // Obtén los datos de la sección desde el cuerpo de la solicitud
  const sectionData = req.body;

  console.log(courseId); // Verifica que el courseId sea el correcto
  console.log(sectionData); // Verifica que la sección está llegando correctamente

  try {
    // Busca el curso por su ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Asigna el orden basado en el número de secciones existentes
    const newOrder = course.sections.length + 1;
    const newSection = {
      ...sectionData,
      order: newOrder,
    };

    // Agrega la nueva sección al curso
    course.sections.push(newSection);

    // Guarda el curso con la nueva sección
    await course.save();

    // Devuelve el curso actualizado
    return res.status(200).json(course);
  } catch (error) {
    console.error("Error al agregar la sección:", error);
    res.status(500).json({ message: "Error al agregar la sección" });
  }
};
