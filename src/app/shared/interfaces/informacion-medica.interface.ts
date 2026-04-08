export interface PadreMedico {
  padre_id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string | null;
  email: string;
  tipo_relacion: string;
  es_contacto_principal: boolean;
}

export interface EstudianteMedico {
  estudiante_id: number;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  genero: string;
  estado: string;
  padres?: PadreMedico[];
}

export interface InformacionMedica {
  informacion_medica_id: number;
  condicion: string | null;
  tipo_condicion: string | null;
  gravedad: string | null;
  descripcion: string | null;
  estudiante: EstudianteMedico;
}

export interface InformacionMedicaCreate {
  estudiante_id: number;
  condicion: string;
  tipo_condicion?: string;
  gravedad?: string;
  descripcion?: string;
}
