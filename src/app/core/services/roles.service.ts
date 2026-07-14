import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Roles } from '../../shared/interfaces/roles.interface';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = 'http://localhost:3000/api/roles';

  constructor(private http: HttpClient) { 
    console.log('Servicio de Roles inicializado');
  }

  // Obtener nombres de los roles
  getRoles() {
    return this.http.get<Roles[]>(this.apiUrl);
  }
}
