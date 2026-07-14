import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Material,
  CreateMaterial,
  UpdateMaterial,
  PaginatedMateriales,
  MaterialAulaAsignada,
  AsignarAulaPayload,
  MaterialEstudianteAsignado,
  AsignarEstudiantePayload,
  BulkAsignarPayload,
  BulkAsignarResult,
  AulaBusqueda,
  EstudianteBusqueda,
  EstudianteAula,
  MaterialTipo,
} from '../../shared/interfaces/material.interface';

// Interfaz simplificada para listado de aulas del selector
export interface AulaSelect {
  aula_id: number;
  nivel: string;
  grado: string;
  seccion: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialesService {
  private apiUrl = 'http://localhost:3000/api/materiales';

  constructor(private http: HttpClient) { }

  // ============ CRUD BÁSICO ============

  getMateriales(page = 1, limit = 10): Observable<PaginatedMateriales> {
    return this.http.get<PaginatedMateriales>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getMaterialById(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/${id}`);
  }

  getMaterialesByTipo(tipo: MaterialTipo): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  createMaterial(material: CreateMaterial): Observable<Material> {
    return this.http.post<Material>(this.apiUrl, material);
  }

  updateMaterial(id: number, material: UpdateMaterial): Observable<Material> {
    return this.http.patch<Material>(`${this.apiUrl}/${id}`, material);
  }

  deleteMaterial(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ============ AULAS ============

  getAulasAsignadas(materialId: number): Observable<MaterialAulaAsignada[]> {
    return this.http.get<MaterialAulaAsignada[]>(`${this.apiUrl}/${materialId}/aulas`);
  }

  asignarAula(materialId: number, payload: AsignarAulaPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/${materialId}/aulas`, payload);
  }

  quitarAula(materialId: number, aulaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${materialId}/aulas/${aulaId}`);
  }

  // ============ ESTUDIANTES ============

  getEstudiantesAsignados(materialId: number): Observable<MaterialEstudianteAsignado[]> {
    return this.http.get<MaterialEstudianteAsignado[]>(`${this.apiUrl}/${materialId}/estudiantes`);
  }

  asignarEstudiante(materialId: number, payload: AsignarEstudiantePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/${materialId}/estudiantes`, payload);
  }

  asignarEstudiantesMasivo(materialId: number, payload: BulkAsignarPayload): Observable<BulkAsignarResult> {
    return this.http.post<BulkAsignarResult>(`${this.apiUrl}/${materialId}/estudiantes/bulk`, payload);
  }

  quitarEstudiante(materialId: number, estudianteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${materialId}/estudiantes/${estudianteId}`);
  }

  // ============ BÚSQUEDAS ============

  getTodasLasAulas(): Observable<AulaSelect[]> {
    return this.http.get<AulaSelect[]>('http://localhost:3000/api/aulas');
  }

  getEstudiantesPorAula(aulaId: number, materialId: number): Observable<EstudianteAula[]> {
    return this.http.get<EstudianteAula[]>(`http://localhost:3000/api/aulas/${aulaId}/estudiantes?material_id=${materialId}`);
  }

  buscarAula(query: string): Observable<AulaBusqueda[]> {
    return this.http.get<AulaBusqueda[]>(`${this.apiUrl}/buscar-aula/${encodeURIComponent(query)}`);
  }

  buscarEstudiantePorDni(dni: string): Observable<EstudianteBusqueda> {
    return this.http.get<EstudianteBusqueda>(`${this.apiUrl}/buscar-estudiante/${dni}`);
  }
}