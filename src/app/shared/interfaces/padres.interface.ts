export interface Padres {
  padre_id?: number; /* Opcional para nuevos registros */
  id?: number; /* Alias posible si el backend retorna id */
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipo_relacion: string;
  detalles_relacion: string;
  es_contacto_principal?: boolean;
}