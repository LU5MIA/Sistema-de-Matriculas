import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prestamo, CreatePrestamoDto, PaginatedResponse, UpdatePrestamoDto } from '../../shared/interfaces/prestamo.interface';

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {
  private baseUrl = 'http://localhost:3000/api/prestamos';

  constructor(private http: HttpClient) { }

  // ============ CRUD BÁSICO ============

  getAll(page = 1, limit = 10): Observable<PaginatedResponse<Prestamo>> {
    return this.http.get<PaginatedResponse<Prestamo>>(`${this.baseUrl}?page=${page}&limit=${limit}`);
  }

  getById(id: number): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreatePrestamoDto): Observable<Prestamo> {
    return this.http.post<Prestamo>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdatePrestamoDto): Observable<Prestamo> {
    return this.http.patch<Prestamo>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // ============ OPERACIONES ESPECÍFICAS ============

  getPrestamosActivos(aulaId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/aula/${aulaId}/activos`);
  }

  getPrestamosRealizados(aulaId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/aula/${aulaId}/realizados`);
  }

  getPrestamosRecibidos(aulaId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/aula/${aulaId}/recibidos`);
  }

  getVencidos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/vencidos/all`);
  }

  devolverPrestamo(id: number): Observable<Prestamo> {
    return this.http.patch<Prestamo>(`${this.baseUrl}/${id}/devolver`, {});
  }
}
