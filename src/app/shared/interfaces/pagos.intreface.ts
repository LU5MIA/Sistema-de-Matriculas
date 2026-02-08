import { Aulas } from "./aula.interface"
import { Estudiantes } from "./estudiantes.interface"
import { Matriculas } from "./matriculas.interface"
import { Padres } from "./padres.interface"

export interface Pagos {
    pagos_id: number
    concepto: string
    canal_pago: string
    meses: string
    monto: number
    fecha_pago: string
    estado: string

    //relaciones
    aula: Aulas | null
    estudiante: Estudiantes | null
    matricula: Matriculas | null
    pagador: Padres | null
}

export interface PagosVista extends Pagos {
    aulaNombre: string;
    estudianteNombre: string;
}

export interface PagosCreatePayload {
    pagos_id: number
    matricula_id: number
    estudiante_id: number
    aula_id: number
    padre_id: number
    concepto: string
    canal_pago: string
    meses: string
    monto: number
    fecha_pago: string
    estado: string
}

export type PagosUpdatePayload = Partial<PagosCreatePayload>