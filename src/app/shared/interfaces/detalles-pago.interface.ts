import { Padres } from "./padres.interface"
import { Pagos } from "./pagos.intreface"

export interface DetallesPago {
  detalle_id: number
  canal_pago: string
  monto: string
  fecha_pago: string
  pagos_id: number
  padre_id: number

  //relaciones
  pago: Pagos
  pagador: Padres
}

export interface DetallePagoCreate {
  canal_pago: string
  monto: string
}

export interface DetallePagoUpdate {
  padre_id: number
  canal_pago?: string
  monto?: string
  fecha_pago?: string
}