import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Padres } from '../../shared/interfaces/padres.interface';
import { Observable } from 'rxjs';
import { Aulas } from '../../shared/interfaces/aula.interface';

@Injectable({
  providedIn: 'root'
})
export class PadresService {

  private apiUrl = 'http://localhost:3000/api/padres';
  private apiPeruUrl = 'http://localhost:3000/api/api-peru'; // ← AGREGAR

  constructor(private http: HttpClient) {
    console.log('Servicio de Padres inicializado')
  }

  // Obtener todos los Padres
  getPadres() {
    return this.http.get<Padres[]>(this.apiUrl);
  }

  // Obtener un solo Padre
  getPadresById(padre_id: number): Observable<Padres> {
    return this.http.get<Padres>(`${this.apiUrl}/${padre_id}`)
  }

  // Obtener padres por estudiante
  getPadresByEstudiante(estudianteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estudiante/${estudianteId}`);
  }

  // ✅ Buscar DNI en RENIEC (usa el módulo común api-peru)
  buscarDniEnReniec(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiPeruUrl}/dni/${dni}`);
  }

  // Buscar estudiante por DNI
  getEstudianteByDni(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search-estudiante/${dni}`);
  }

  // Crear nuevo padre
  createPadre(padre: any): Observable<Padres> {
    return this.http.post<Padres>(this.apiUrl, padre);
  }

  // Actualizar padre existente
  updatePadre(id: number, padre: any): Observable<Padres> {
    return this.http.patch<Padres>(`${this.apiUrl}/${id}`, padre);
  }

  // Eliminar padre
  deletePadre(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Asignar estudiante a padre
  assignEstudiante(padreId: number, estudianteId: number) {
    return this.http.post(`${this.apiUrl}/${padreId}/estudiantes`, {
      estudiante_id: estudianteId
    });
  }

  // Eliminar asignación de estudiante
  removeEstudiante(padreId: number, estudianteId: number) {
    return this.http.delete(`${this.apiUrl}/${padreId}/estudiantes/${estudianteId}`);
  }

  // Obtener estudiantes asignados
  getEstudiantesAsignados(padreId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${padreId}/estudiantes`);
  }
}
