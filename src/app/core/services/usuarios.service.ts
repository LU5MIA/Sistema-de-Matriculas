import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Usuarios,
  UsuariosCreate,
} from '../../shared/interfaces/usuarios.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {
    console.log('Servicio de Usuarios Activo');
  }

  // Obtener todos los usuarios
  getUsuarios() {
    return this.http.get<Usuarios[]>(this.apiUrl);
  }

  // Agregar un nuevo usuario
  addUsuario(usuario: UsuariosCreate): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  // Actualizar un usuario existente
  updateUsuario(user_id: number, usuario: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${user_id}`, usuario);
  }

  // Cambiar el estado de un usuario (activar/desactivar)
  cambiarEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/estado/${id}`, { estado: nuevoEstado })
  }
}
