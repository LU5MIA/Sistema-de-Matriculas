export interface Estudiantes {
  estudiante_id: number;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  genero: string;
  estado: string;
}

export interface EstudiantesCreate {
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  genero: string;
}