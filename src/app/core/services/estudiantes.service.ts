import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Estudiantes, EstudiantesCreate } from '../../shared/interfaces/estudiantes.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {

  private apiUrl = 'http://localhost:3000/api/estudiantes';

  constructor(private http: HttpClient) {
    console.log('Servicio de Estudiantes Activo');
  }

  // Obtener todos los estudiantes
  getEstudiantes() {
    return this.http.get<Estudiantes[]>(this.apiUrl);
  }

  //Obtener una sola aula
  getEstudianteById(estudiante_id: number): Observable<Estudiantes> {
    return this.http.get<Estudiantes>(`${this.apiUrl}/${estudiante_id}`)
  }

  //Agregar estudiante
  addEstudiante(estudiante: EstudiantesCreate): Observable<any> {
    return this.http.post(this.apiUrl, estudiante)
  }

  //Actualizar un estudiante
  updateEstudiante(id: number, estudiante: Partial<Estudiantes>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, estudiante);
  }

  //Cambiar estado de un estudiante
  cambiarEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/estado/${id}`, { estado: nuevoEstado })
  }
}
