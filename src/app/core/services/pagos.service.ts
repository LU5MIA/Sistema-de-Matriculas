import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pagos, PagosCreatePayload } from '../../shared/interfaces/pagos.intreface';
import { Observable } from 'rxjs';
import { Matriculas } from '../../shared/interfaces/matriculas.interface';
import { DetallesPago } from '../../shared/interfaces/detalles-pago.interface';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  private apiUrl = 'http://localhost:3000/api/pagos';

  constructor(private http: HttpClient) {
    console.log('Servicio de Pagos ha sido creado');
  }

  // Obtener todos los pagos
  getPagos() {
    return this.http.get<Pagos[]>(this.apiUrl);
  }

  getNombreEstudiante(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/estudiante/${id}`, {
      responseType: 'text'
    });
  }

  getNombreAula(id: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/aula/${id}`, {
      responseType: 'text'
    });
  }

  // 🔎 Buscar matrícula por código
  getMatriculaByCodigo(codigo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/matricula/${codigo}`);
  }

  // 🔹 Crear pago (deuda)
  addPago(pago: PagosCreatePayload): Observable<Pagos> {
    return this.http.post<Pagos>(this.apiUrl, pago);
  }

  // 🔹 Crear detalle de un pago existente
  addDetalle(pagosId: number, detalle: Partial<DetallesPago>): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/detalle/${pagosId}`,
      detalle
    );
  }

  //Actualizar pago
  updatePago(id: number, pago: Partial<PagosCreatePayload>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, pago);
  }
}
