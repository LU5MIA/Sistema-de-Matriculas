// src/app/shared/interfaces/prestamo.interface.ts

export interface Prestamo {
  prestamo_id: number;
  material_id: number;
  material: {
    material_id: number;
    nombre: string;
    tipo: string;
    categoria: string;
  };
  estudiante_id: number;
  estudiante?: any;
  aula_origen_id: number;
  aula_origen: {
    aula_id: number;
    nivel: string;
    grado: string;
    seccion: string;
  };
  aula_destino_id: number;
  aula_destino: {
    aula_id: number;
    nivel: string;
    grado: string;
    seccion: string;
  };
  cantidad: number;
  fecha_prestamo: string;
  fecha_devolucion: string | null;
  fecha_devolucion_esperada: string | null;
  estado: 'Activo' | 'Devuelto' | 'Vencido';
}

export interface CreatePrestamoDto {
  material_id: number;
  aula_origen_id: number;
  aula_destino_id: number;
  cantidad: number;
  fecha_devolucion_esperada?: string;
}

export interface UpdatePrestamoDto {
  cantidad?: number;
  fecha_devolucion_esperada?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}