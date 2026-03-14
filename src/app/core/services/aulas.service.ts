import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Aulas } from '../../shared/interfaces/aula.interface';
import { Observable } from 'rxjs';
import { AulaConMateriales, EstudianteResultado } from '../../shared/interfaces/materiales.interface';

@Injectable({
  providedIn: 'root'
})
export class AulasService {

  private apiUrl = 'http://localhost:3000/api/aulas';

  constructor(private http: HttpClient) {
    console.log('Servicio de Aulas inicializado')
  }

  // Obtener todos las aulas
  getAulas() {
    return this.http.get<Aulas[]>(this.apiUrl);
  }

  //Obtener una sola aula
  getAulasById(aula_id: number): Observable<Aulas> {
    return this.http.get<Aulas>(`${this.apiUrl}/${aula_id}`)
  }

  // Obtener resumen de materiales por aula
  getResumenMateriales(): Observable<AulaConMateriales[]> {
    return this.http.get<AulaConMateriales[]>(`${this.apiUrl}/resumen-materiales`);
  }

  // Obtener estudiantes matriculados en un aula (con filtro opcional por material)
  getEstudiantesPorAula(aulaId: number, materialId?: number): Observable<EstudianteResultado[]> {
    let url = `${this.apiUrl}/${aulaId}/estudiantes`;
    if (materialId) {
      url += `?material_id=${materialId}`;
    }
    return this.http.get<EstudianteResultado[]>(url);
  }

}
