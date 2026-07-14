// ============ ENUMS ============

export type MaterialTipo = 'ASEO' | 'TRABAJO';

export type EstadoMaterialEstudiante = 'Asignado' | 'Devuelto' | 'Perdido';

// ============ MATERIAL ============

export interface Material {
  material_id: number;
  nombre: string;
  tipo: MaterialTipo;
  cantidad_total: number;
  categoria: string;
  creado_en: string;
  cantidad_disponible?: number; // calculado en findByTipo
}

export interface CreateMaterial {
  nombre: string;
  tipo: MaterialTipo;
  cantidad_total: number;
  categoria: string;
}

export interface UpdateMaterial {
  nombre?: string;
  tipo?: MaterialTipo;
  cantidad_total?: number;
  categoria?: string;
}

// ============ PAGINACIÓN ============

export interface PaginatedMateriales {
  data: Material[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

// ============ ASIGNACIÓN A AULAS ============

export interface MaterialAulaAsignada {
  material_aula_id: number;
  aula_id: number;
  aula_nombre: string;
  grado: string;
  seccion: string;
  cantidad_asignada: number;
}

export interface AsignarAulaPayload {
  aula_id: number;
  cantidad_asignada: number;
}

// ============ ASIGNACIÓN A ESTUDIANTES ============

export interface MaterialEstudianteAsignado {
  material_estudiante_id: number;
  estudiante_id: number;
  estudiante_nombre: string;
  dni: string;
  cantidad_asignada: number;
  estado: EstadoMaterialEstudiante;
}

export interface AsignarEstudiantePayload {
  estudiante_id: number;
  cantidad_asignada: number;
  estado: EstadoMaterialEstudiante;
}

export interface BulkAsignacion {
  estudiante_id: number;
  cantidad_asignada: number;
}

export interface BulkAsignarPayload {
  asignaciones: BulkAsignacion[];
}

export interface BulkAsignarResult {
  asignados: number;
  errores: string[];
}

// ============ BÚSQUEDA ============

export interface AulaBusqueda {
  aula_id: number;
  grado: string;
  seccion: string;
}

export interface EstudianteBusqueda {
  estudiante_id: number;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
}

export interface EstudianteAula {
  estudiante_id: number;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  seleccionado?: boolean;
  cantidad_asignada?: number;
}
