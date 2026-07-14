export interface Materiales {
    material_id?: number;
    id?: number;
    nombre: string;
    tipo: string;
    cantidad_total: number;
    cantidad_disponible?: number;
    categoria: string;
    creado_en?: Date;
    material_aulas?: MaterialAula[]; // Agregar relaciones
    material_estudiantes?: MaterialEstudiante[];
}

export interface MaterialAula {
    material_aula_id?: number;
    aula_id: number;
    aula_nombre?: string;
    grado?: string;
    seccion?: string;
    cantidad_asignada: number;
}

export interface MaterialEstudiante {
    material_estudiante_id?: number;
    estudiante_id: number;
    estudiante_nombre?: string;
    dni?: string;
    cantidad_asignada: number;
    estado?: string;
}

export interface AulaResultado {
    aula_id: number;
    grado: string;
    seccion: string;
}

export interface EstudianteResultado {
    estudiante_id: number;
    dni: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
}

export interface MaterialAulaResumen {
    material_aula_id: number;
    material_id: number;
    nombre: string;
    cantidad_asignada: number;
    categoria: string;
}

export interface AulaConMateriales {
    aula_id: number;
    nivel: string;
    grado: string;
    seccion: string;
    materiales_aseo: MaterialAulaResumen[];
    materiales_trabajo: MaterialAulaResumen[];
    total_aseo: number;
    total_trabajo: number;
}

export interface EstudianteSeleccion {
    estudiante_id: number;
    dni: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    seleccionado: boolean;
    cantidad: number;
}