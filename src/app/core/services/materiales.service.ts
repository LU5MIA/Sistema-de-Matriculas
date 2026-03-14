import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Materiales, MaterialAula, MaterialEstudiante, AulaResultado, EstudianteResultado, AulaConMateriales } from '../../shared/interfaces/materiales.interface';

@Injectable({
    providedIn: 'root'
})
export class MaterialesService {

    private apiUrl = 'http://localhost:3000/api/materiales';

    constructor(private http: HttpClient) {}

    // ============ CRUD BÁSICO ============

    getMateriales(page: number = 1, limit: number = 10): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
    }

    getMaterialById(id: number): Observable<Materiales> {
        return this.http.get<Materiales>(`${this.apiUrl}/${id}`);
    }

    createMaterial(material: any): Observable<Materiales> {
        return this.http.post<Materiales>(this.apiUrl, material);
    }

    updateMaterial(id: number, material: any): Observable<Materiales> {
        return this.http.patch<Materiales>(`${this.apiUrl}/${id}`, material);
    }

    deleteMaterial(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    // ============ MÉTODOS PARA AULAS ============

    getAulasAsignadas(materialId: number): Observable<MaterialAula[]> {
        return this.http.get<MaterialAula[]>(`${this.apiUrl}/${materialId}/aulas`);
    }

    assignAula(materialId: number, aulaId: number, cantidad: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${materialId}/aulas`, {
            aula_id: aulaId,
            cantidad_asignada: cantidad
        });
    }

    removeAula(materialId: number, aulaId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${materialId}/aulas/${aulaId}`);
    }

    // ============ MÉTODOS PARA ESTUDIANTES ============

    getEstudiantesAsignados(materialId: number): Observable<MaterialEstudiante[]> {
        return this.http.get<MaterialEstudiante[]>(`${this.apiUrl}/${materialId}/estudiantes`);
    }

    assignEstudiante(materialId: number, estudianteId: number, cantidad: number, estado: string = 'Asignado'): Observable<any> {
        return this.http.post(`${this.apiUrl}/${materialId}/estudiantes`, {
            estudiante_id: estudianteId,
            cantidad_asignada: cantidad,
            estado
        });
    }

    removeEstudiante(materialId: number, estudianteId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${materialId}/estudiantes/${estudianteId}`);
    }

    // ============ MÉTODOS DE BÚSQUEDA ============

    buscarAula(query: string): Observable<AulaResultado[]> {
        return this.http.get<AulaResultado[]>(`${this.apiUrl}/buscar-aula/${query}`);
    }

    buscarEstudiantePorDni(dni: string): Observable<EstudianteResultado> {
        return this.http.get<EstudianteResultado>(`${this.apiUrl}/buscar-estudiante/${dni}`);
    }

    // ============ MÉTODOS POR TIPO ============

    getMaterialesPorTipo(tipo: string): Observable<Materiales[]> {
        return this.http.get<Materiales[]>(`${this.apiUrl}/tipo/${tipo}`);
    }

    // ============ ASIGNACIÓN MASIVA ============

    bulkAssignEstudiantes(materialId: number, asignaciones: { estudiante_id: number; cantidad_asignada: number }[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/${materialId}/estudiantes/bulk`, { asignaciones });
    }
}
