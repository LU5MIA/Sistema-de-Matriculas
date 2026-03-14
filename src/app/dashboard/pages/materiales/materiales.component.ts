import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MaterialesService } from '../../../core/services/materiales.service';
import { AulasService } from '../../../core/services/aulas.service';
import { Materiales, MaterialAulaResumen, EstudianteSeleccion } from '../../../shared/interfaces/materiales.interface';
import { Aulas } from '../../../shared/interfaces/aula.interface';

@Component({
    selector: 'app-materiales',
    standalone: false,
    templateUrl: './materiales.component.html',
    styleUrls: ['./materiales.component.css'],
})
export class MaterialesComponent implements OnInit {

    // ============ TABS ============
    tabActivo: 'inventario' | 'aseo' | 'trabajo' = 'inventario';

    // ============ TABLA PRINCIPAL ============
    materiales: Materiales[] = [];
    busqueda: string = '';
    limit: number = 10;
    page: number = 1;
    total: number = 0;

    // ============ MODAL CREAR/EDITAR ============
    modalFormAbierto: boolean = false;
    modoEditar: boolean = false;
    materialIdEditar: number | null = null;
    nombre: string = '';
    tipo: string = '';
    cantidad_total: number = 0;
    categoria: string = '';

    // ============ TAB ASEO POR AULAS ============
    aulasLista: Aulas[] = [];
    aulaIdAseo: number | null = null;
    materialesAseoAula: MaterialAulaResumen[] = [];
    materialesAseoDisponibles: Materiales[] = [];
    aseoMaterialId: number | null = null;
    aseoCantidad: number = 1;
    cargandoAseo: boolean = false;

    // ============ TAB TRABAJO POR AULAS ============
    aulaIdTrabajo: number | null = null;
    materialesTrabajoAula: MaterialAulaResumen[] = [];
    materialesTrabajoDisponibles: Materiales[] = [];
    trabajoMaterialId: number | null = null;
    trabajoCantidad: number = 1;
    cargandoTrabajo: boolean = false;

    // Asignar material a estudiantes
    trabajoMaterialEstudiantesId: number | null = null;
    estudiantesAula: EstudianteSeleccion[] = [];
    usarCantidadGeneral: boolean = true;
    cantidadGeneral: number = 1;
    cargandoEstudiantes: boolean = false;
    asignandoBulk: boolean = false;

    constructor(
        private dialog: MatDialog,
        private materialesService: MaterialesService,
        private aulasService: AulasService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarMateriales();
        this.cargarAulas();
    }

    // ============ TABS ============

    cambiarTab(tab: 'inventario' | 'aseo' | 'trabajo') {
        this.tabActivo = tab;
        if (tab === 'aseo' && this.materialesAseoDisponibles.length === 0) {
            this.cargarMaterialesAseoDisponibles();
        }
        if (tab === 'trabajo' && this.materialesTrabajoDisponibles.length === 0) {
            this.cargarMaterialesTrabajoDisponibles();
        }
    }

    cargarAulas() {
        this.aulasService.getAulas().subscribe({
            next: (data) => { this.aulasLista = data; },
            error: () => { this.aulasLista = []; }
        });
    }

    // ============ TABLA ============

    get materialesFiltrados(): Materiales[] {
        if (!this.busqueda.trim()) return this.materiales;
        const q = this.busqueda.toLowerCase();
        return this.materiales.filter(m =>
            m.nombre.toLowerCase().includes(q) ||
            m.categoria.toLowerCase().includes(q) ||
            m.tipo.toLowerCase().includes(q)
        );
    }

    cargarMateriales() {
        this.materialesService.getMateriales(this.page, this.limit).subscribe({
            next: (response: any) => {
                this.materiales = response.data || response;
                this.total = response.meta?.total || this.materiales.length;
            },
            error: (err) => console.error('Error al cargar materiales:', err)
        });
    }

    cambiarLimit(event: Event) {
        this.limit = parseInt((event.target as HTMLSelectElement).value);
        this.page = 1;
        this.cargarMateriales();
    }

    get totalPaginas(): number {
        return Math.ceil(this.total / this.limit);
    }

    paginaAnterior() {
        if (this.page > 1) {
            this.page--;
            this.cargarMateriales();
        }
    }

    paginaSiguiente() {
        if (this.page < this.totalPaginas) {
            this.page++;
            this.cargarMateriales();
        }
    }

    // ============ MODAL CREAR/EDITAR ============

    abrirAgregar() {
        this.modoEditar = false;
        this.materialIdEditar = null;
        this.limpiarFormulario();
        this.modalFormAbierto = true;
        this.cd.detectChanges();
    }

    abrirEditar(material: Materiales) {
        this.modoEditar = true;
        this.materialIdEditar = material.material_id || material.id || null;
        this.nombre = material.nombre;
        this.tipo = material.tipo;
        this.cantidad_total = material.cantidad_total;
        this.categoria = material.categoria;
        this.modalFormAbierto = true;
    }

    limpiarFormulario() {
        this.nombre = '';
        this.tipo = '';
        this.cantidad_total = 0;
        this.categoria = '';
    }

    async guardarMaterial() {
        if (!this.nombre.trim() || !this.tipo || !this.categoria.trim()) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        if (this.cantidad_total < 0) {
            alert('La cantidad total no puede ser negativa');
            return;
        }

        const materialData = {
            nombre: this.nombre.trim(),
            tipo: this.tipo,
            cantidad_total: this.cantidad_total,
            categoria: this.categoria.trim()
        };

        try {
            if (this.modoEditar && this.materialIdEditar) {
                await this.materialesService.updateMaterial(this.materialIdEditar, materialData).toPromise();
            } else {
                await this.materialesService.createMaterial(materialData).toPromise();
            }
            this.cerrarModalForm();
            this.cargarMateriales();
        } catch (err: any) {
            const msg = err?.error?.message || err?.message || 'Error desconocido';
            alert('Error: ' + msg);
        }
    }

    cerrarModalForm() {
        const modal = document.querySelector('.modal-form .modal-content');
        if (modal) {
            modal.classList.add('salir');
            setTimeout(() => {
                this.modalFormAbierto = false;
                this.limpiarFormulario();
                this.cd.detectChanges();
            }, 250);
        } else {
            this.modalFormAbierto = false;
            this.limpiarFormulario();
        }
    }

    descartarMaterial(material: Materiales) {
        const id = material.material_id || material.id;
        if (!id) return;

        const cantidadStr = prompt(
            `¿Cuántas unidades de "${material.nombre}" desea descartar?\n\nCantidad actual en inventario: ${material.cantidad_total}`
        );
        if (cantidadStr === null) return;

        const cantidad = parseInt(cantidadStr);
        if (isNaN(cantidad) || cantidad < 1) {
            alert('Ingrese una cantidad válida mayor a 0');
            return;
        }
        if (cantidad > material.cantidad_total) {
            alert('La cantidad a descartar no puede ser mayor a la cantidad actual (' + material.cantidad_total + ')');
            return;
        }

        const nuevaCantidad = material.cantidad_total - cantidad;
        const esEliminacionTotal = nuevaCantidad === 0;

        const mensaje = esEliminacionTotal
            ? `Se descartarán todas las ${cantidad} unidades de "${material.nombre}".\nEsto eliminará el material del inventario.\n\n¿Está seguro?`
            : `Se descontarán ${cantidad} unidades de "${material.nombre}".\n\nCantidad actual: ${material.cantidad_total}\nNueva cantidad: ${nuevaCantidad}\n\n¿Está seguro?`;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '380px',
            data: {
                title: esEliminacionTotal ? 'Eliminar Material' : 'Descartar Material',
                message: mensaje,
                icon: 'fa-solid fa-triangle-exclamation',
                confirmText: esEliminacionTotal ? 'Eliminar' : 'Descartar',
                cancelText: 'Cancelar'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (esEliminacionTotal) {
                    this.materialesService.deleteMaterial(id).subscribe({
                        next: () => this.cargarMateriales(),
                        error: (err: any) => alert('Error al eliminar: ' + (err?.error?.message || err.message))
                    });
                } else {
                    this.materialesService.updateMaterial(id, { cantidad_total: nuevaCantidad }).subscribe({
                        next: () => this.cargarMateriales(),
                        error: (err: any) => alert('Error al descartar: ' + (err?.error?.message || err.message))
                    });
                }
            }
        });
    }

    // ============ UTILIDADES ============

    formatearFecha(fecha: any): string {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    // ============ TAB ASEO POR AULAS ============

    cargarMaterialesAseoDisponibles() {
        this.materialesService.getMaterialesPorTipo('ASEO').subscribe({
            next: (data) => { this.materialesAseoDisponibles = data; },
            error: () => { this.materialesAseoDisponibles = []; }
        });
    }

    onAulaAseoChange() {
        if (!this.aulaIdAseo) {
            this.materialesAseoAula = [];
            return;
        }
        this.cargandoAseo = true;
        this.aulasService.getResumenMateriales().subscribe({
            next: (aulas) => {
                const aula = aulas.find(a => a.aula_id === this.aulaIdAseo);
                this.materialesAseoAula = aula ? aula.materiales_aseo : [];
                this.cargandoAseo = false;
            },
            error: () => { this.materialesAseoAula = []; this.cargandoAseo = false; }
        });
    }

    asignarAseoAAula() {
        if (!this.aseoMaterialId || this.aseoCantidad < 1 || !this.aulaIdAseo) return;
        this.materialesService.assignAula(this.aseoMaterialId, this.aulaIdAseo, this.aseoCantidad).subscribe({
            next: () => {
                this.aseoMaterialId = null;
                this.aseoCantidad = 1;
                this.onAulaAseoChange();
                this.cargarMaterialesAseoDisponibles();
            },
            error: (err: any) => alert('Error: ' + (err?.error?.message || err.message))
        });
    }

    // ============ TAB TRABAJO POR AULAS ============

    cargarMaterialesTrabajoDisponibles() {
        this.materialesService.getMaterialesPorTipo('TRABAJO').subscribe({
            next: (data) => { this.materialesTrabajoDisponibles = data; },
            error: () => { this.materialesTrabajoDisponibles = []; }
        });
    }

    onAulaTrabajoChange() {
        if (!this.aulaIdTrabajo) {
            this.materialesTrabajoAula = [];
            this.estudiantesAula = [];
            this.trabajoMaterialEstudiantesId = null;
            return;
        }
        this.cargandoTrabajo = true;
        this.aulasService.getResumenMateriales().subscribe({
            next: (aulas) => {
                const aula = aulas.find(a => a.aula_id === this.aulaIdTrabajo);
                this.materialesTrabajoAula = aula ? aula.materiales_trabajo : [];
                this.cargandoTrabajo = false;
            },
            error: () => { this.materialesTrabajoAula = []; this.cargandoTrabajo = false; }
        });
        // Reset estudiantes al cambiar aula
        this.estudiantesAula = [];
        this.trabajoMaterialEstudiantesId = null;
    }

    asignarTrabajoAAula() {
        if (!this.trabajoMaterialId || this.trabajoCantidad < 1 || !this.aulaIdTrabajo) return;
        this.materialesService.assignAula(this.trabajoMaterialId, this.aulaIdTrabajo, this.trabajoCantidad).subscribe({
            next: () => {
                this.trabajoMaterialId = null;
                this.trabajoCantidad = 1;
                this.onAulaTrabajoChange();
                this.cargarMaterialesTrabajoDisponibles();
            },
            error: (err: any) => alert('Error: ' + (err?.error?.message || err.message))
        });
    }

    // ============ ASIGNAR MATERIAL A ESTUDIANTES DEL AULA ============

    onMaterialEstudiantesChange() {
        if (!this.trabajoMaterialEstudiantesId || !this.aulaIdTrabajo) {
            this.estudiantesAula = [];
            return;
        }
        this.cargandoEstudiantes = true;
        this.aulasService.getEstudiantesPorAula(this.aulaIdTrabajo, this.trabajoMaterialEstudiantesId).subscribe({
            next: (data) => {
                this.estudiantesAula = data.map(e => ({
                    ...e,
                    seleccionado: false,
                    cantidad: this.cantidadGeneral
                }));
                this.cargandoEstudiantes = false;
            },
            error: () => { this.estudiantesAula = []; this.cargandoEstudiantes = false; }
        });
    }

    toggleSeleccionarTodos() {
        const todosSeleccionados = this.estudiantesAula.every(e => e.seleccionado);
        this.estudiantesAula.forEach(e => e.seleccionado = !todosSeleccionados);
    }

    get todosSeleccionados(): boolean {
        return this.estudiantesAula.length > 0 && this.estudiantesAula.every(e => e.seleccionado);
    }

    get algunoSeleccionado(): boolean {
        return this.estudiantesAula.some(e => e.seleccionado);
    }

    get cantidadSeleccionados(): number {
        return this.estudiantesAula.filter(e => e.seleccionado).length;
    }

    onCantidadGeneralChange() {
        if (this.usarCantidadGeneral) {
            this.estudiantesAula.forEach(e => e.cantidad = this.cantidadGeneral);
        }
    }

    asignarMaterialAEstudiantes() {
        if (!this.trabajoMaterialEstudiantesId || !this.algunoSeleccionado) return;

        const seleccionados = this.estudiantesAula.filter(e => e.seleccionado);
        const asignaciones = seleccionados.map(e => ({
            estudiante_id: e.estudiante_id,
            cantidad_asignada: this.usarCantidadGeneral ? this.cantidadGeneral : e.cantidad
        }));

        const cantidadInvalida = asignaciones.some(a => a.cantidad_asignada < 1);
        if (cantidadInvalida) {
            alert('Todas las cantidades deben ser mayor a 0');
            return;
        }

        this.asignandoBulk = true;
        this.materialesService.bulkAssignEstudiantes(this.trabajoMaterialEstudiantesId, asignaciones).subscribe({
            next: (result) => {
                this.asignandoBulk = false;
                let mensaje = `${result.asignados} estudiante(s) asignado(s) correctamente.`;
                if (result.errores && result.errores.length > 0) {
                    mensaje += '\nErrores:\n' + result.errores.join('\n');
                }
                alert(mensaje);
                this.onMaterialEstudiantesChange();
                this.cargarMaterialesTrabajoDisponibles();
            },
            error: (err: any) => {
                this.asignandoBulk = false;
                alert('Error: ' + (err?.error?.message || err.message));
            }
        });
    }

    getNombreMaterialTrabajo(materialId: number): string {
        const mat = this.materialesTrabajoDisponibles.find(m => m.material_id === materialId);
        return mat ? mat.nombre : '';
    }
}
