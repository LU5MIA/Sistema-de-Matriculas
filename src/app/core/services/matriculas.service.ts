import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatriculaCreatePayload, Matriculas } from '../../shared/interfaces/matriculas.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatriculasService {

  private apiUrl = 'http://localhost:3000/api/matriculas'

  constructor(private http: HttpClient) {
    console.log('Servicio de matriculas Activo')
  }

  //Obtener todas las matriculas
  getMatriculas() {
    return this.http.get<Matriculas[]>(this.apiUrl);
  }

  // Buscar aula por nivel, grado y sección
  buscarAula(nivel: string, grado: string, seccion: string ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/buscar`,
      {
        params: {
          nivel,
          grado,
          seccion
        }
      }
    );
  }


  // Buscar estudiante por DNI
  buscarEstudiantePorDni(dni: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/estudiante/${dni}`);
  }

  // Buscar apoderado por DNI
  buscarPadrePorDni(dni: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/padre/${dni}`);
  }

  //Agregar matricula
  addMatricula(matricula: MatriculaCreatePayload): Observable<any> {
    return this.http.post(this.apiUrl, matricula)
  }

  //Actualizar una matricula
  updateMatricula(id: number, matricula: Partial<MatriculaCreatePayload>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, matricula)
  }

  //Eliminar una matricula
  deleteMatricula(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
  }

  // //Cambiar estado de una matricula
  // cambiarEstado(id: number, nuevoEstado: string): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/estado/${id}`, { estado: nuevoEstado })
  // }
}
