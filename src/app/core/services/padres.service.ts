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

  constructor(private http: HttpClient) {
    console.log('Servicio de Padres inicializado')
  }

  //Obtener todos los Padres
  getPadres() {
    return this.http.get<Padres[]>(this.apiUrl);
  }

  //Obtener un solo Padre
  getPadresById(padre_id: number): Observable<Padres>{
    return this.http.get<Padres>(`${this.apiUrl}/${padre_id}`)
  }
}
