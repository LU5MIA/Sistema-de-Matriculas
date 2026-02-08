import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Aulas } from '../../shared/interfaces/aula.interface';
import { Observable } from 'rxjs';

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

}
