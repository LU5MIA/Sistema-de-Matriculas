import { Aulas } from "./aula.interface";
import { Estudiantes } from "./estudiantes.interface";
import { Padres } from "./padres.interface";

export interface Matriculas {
    matricula_id: number,
    codigo_matricula: string,
    situacion: string,
    procedencia: string,
    ie_procedencia: string,
    inscripcion: string,
    matricula: string,
    mensualidad: string,
    fecha_matricula: string,
    estado: string,

    //relaciones
    aula: Aulas | null,
    estudiante: Estudiantes | null,

}

export interface MatriculasVista extends Matriculas {
    dni: string;
    nivel: string;
    grado: string;
    seccion: string;
}

export interface MatriculaCreatePayload {
    estudiante_id: number;
    aula_id: number;

    situacion: string;
    procedencia: string;
    ie_procedencia: string;
    inscripcion: number;
    matricula: number;
    mensualidad: number;
}

export type MatriculaUpdatePayload = Partial<MatriculaCreatePayload>;

