import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pagos, PagosCreatePayload } from '../../shared/interfaces/pagos.intreface';
import { Observable } from 'rxjs';

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

  //Agregar pago
  addPago(pago: PagosCreatePayload): Observable<any> {
    return this.http.post(this.apiUrl, pago);
  }

  //Actualizar pago
  updatePago(id: number, pago: Partial<PagosCreatePayload>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, pago);
  }
}
