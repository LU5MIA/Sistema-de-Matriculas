import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InformacionMedica, InformacionMedicaCreate } from '../../shared/interfaces/informacion-medica.interface';

@Injectable({
  providedIn: 'root'
})
export class InformacionMedicaService {

  private apiUrl = 'http://localhost:3000/api/informacion-medica';

  constructor(private http: HttpClient) { }

  getAll(): Observable<InformacionMedica[]> {
    return this.http.get<InformacionMedica[]>(this.apiUrl);
  }

  getById(id: number): Observable<InformacionMedica> {
    return this.http.get<InformacionMedica>(`${this.apiUrl}/${id}`);
  }

  create(data: InformacionMedicaCreate): Observable<InformacionMedica> {
    return this.http.post<InformacionMedica>(this.apiUrl, data);
  }

  update(id: number, data: Partial<InformacionMedicaCreate>): Observable<InformacionMedica> {
    return this.http.patch<InformacionMedica>(`${this.apiUrl}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
