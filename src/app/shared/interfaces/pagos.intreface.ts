import { Aulas } from "./aula.interface"
import { DetallesPago } from "./detalles-pago.interface"
import { Estudiantes } from "./estudiantes.interface"
import { Matriculas } from "./matriculas.interface"
import { Padres } from "./padres.interface"

export interface Pagos {
  pagos_id: number
  concepto: string
  meses: string
  monto_total: number
  monto_pagado: string
  estado: string

  //relaciones
  matricula: Matriculas | null

  //relacion inversa
  detalles?: DetallesPago[];
}

export interface PagosVista extends Pagos {
  codigoMatricula: string;
  estudianteNombre: string;
}

export interface PagosCreatePayload {
  matricula_id: number;
  concepto: string;
  monto_total: number;
  monto_pagado: number;
  meses?: string; // opcional
}

export interface PagoUpdatePayload {
  monto_pagado?: string;
  estado?: string;
}

// export type PagosUpdatePayload = Partial<PagosCreatePayload>