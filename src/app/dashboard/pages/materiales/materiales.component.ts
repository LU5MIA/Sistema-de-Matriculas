import { Component, OnInit } from '@angular/core';
import { MaterialesService, AulaSelect } from '../../../core/services/materiales.service';
import {
  Material,
  CreateMaterial,
  MaterialTipo,
  MaterialAulaAsignada,
  MaterialEstudianteAsignado,
  AulaBusqueda,
  EstudianteBusqueda,
  BulkAsignacion,
  EstadoMaterialEstudiante,
  EstudianteAula,
} from '../../../shared/interfaces/material.interface';

type ModalTipo = 'crear' | 'editar' | 'asignarAula' | 'asignarEstudiante' | 'bulkEstudiante' | null;
type FiltroTipo = 'TODOS' | 'ASEO' | 'TRABAJO';
type PanelTipo = 'aulas' | 'estudiantes';

@Component({
  selector: 'app-materiales',
  standalone: false,
  templateUrl: './materiales.component.html',
  styleUrl: './materiales.component.css',
})
export class MaterialesComponent implements OnInit {

  constructor(private materialesService: MaterialesService) {}

  // ============ ESTADO GENERAL ============
  materiales: Material[] = [];
  materialesOriginales: Material[] = [];
  cargando = false;
  busqueda = '';
  filtroTipo: FiltroTipo = 'TODOS';

  // ============ PAGINACIÓN ============
  paginaActual = 1;
  limitePorPagina = 10;
  totalRegistros = 0;
  totalPaginas = 0;

  // ============ MODAL ============
  modalActivo: ModalTipo = null;

  // Form crear/editar
  formMaterial: CreateMaterial = { nombre: '', tipo: 'ASEO', cantidad_total: 0, categoria: '' };
  materialEditando: Material | null = null;
  guardando = false;

  // ============ MATERIAL SELECCIONADO (panel lateral) ============
  materialSeleccionado: Material | null = null;
  panelActivo: PanelTipo = 'aulas';
  aulasAsignadas: MaterialAulaAsignada[] = [];
  estudiantesAsignados: MaterialEstudianteAsignado[] = [];
  cargandoPanel = false;

  // ============ MODAL ASIGNAR AULA ============
  todasLasAulas: AulaSelect[] = [];
  cargandoTodasLasAulas = false;
  aulaSeleccionadaId: number | null = null;
  cantidadAula = 1;
  asignandoAula = false;

  // ============ MODAL ASIGNAR ESTUDIANTE POR AULA ============
  aulaSeleccionadaEstudiantesId: number | null = null;
  estudiantesAula: EstudianteAula[] = [];
  cargandoEstudiantesAula = false;
  asignandoEstudiantesAula = false;

  // ============ LIFECYCLE ============

  ngOnInit(): void {
    this.cargarMateriales();
  }

  // ============ CARGA DE DATOS ============

  cargarMateriales(): void {
    this.cargando = true;
    this.materialesService.getMateriales(this.paginaActual, this.limitePorPagina).subscribe({
      next: (resp) => {
        this.materialesOriginales = resp.data;
        this.totalRegistros = resp.meta.total;
        this.totalPaginas = resp.meta.lastPage;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar materiales', err);
        this.cargando = false;
      },
    });
  }

  // ============ FILTROS Y BÚSQUEDA ============

  aplicarFiltros(): void {
    let lista = [...this.materialesOriginales];

    if (this.filtroTipo !== 'TODOS') {
      lista = lista.filter((m) => m.tipo === this.filtroTipo);
    }

    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      lista = lista.filter(
        (m) =>
          m.nombre.toLowerCase().includes(q) ||
          m.categoria.toLowerCase().includes(q)
      );
    }

    this.materiales = lista;
  }

  cambiarFiltro(tipo: FiltroTipo): void {
    this.filtroTipo = tipo;
    this.aplicarFiltros();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  // ============ PAGINACIÓN ============

  irPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarMateriales();
  }

  cambiarLimite(event: Event): void {
    this.limitePorPagina = Number((event.target as HTMLSelectElement).value);
    this.paginaActual = 1;
    this.cargarMateriales();
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // ============ MODALES ABRIR/CERRAR ============

  abrirCrear(): void {
    this.formMaterial = { nombre: '', tipo: 'ASEO', cantidad_total: 0, categoria: '' };
    this.materialEditando = null;
    this.abrirModal('crear');
  }

  abrirEditar(material: Material): void {
    this.materialEditando = material;
    this.formMaterial = {
      nombre: material.nombre,
      tipo: material.tipo,
      cantidad_total: material.cantidad_total,
      categoria: material.categoria,
    };
    this.abrirModal('editar');
  }

  abrirAsignarEstudiantesAula(): void {
    if (this.aulasAsignadas.length === 0) {
      alert('Primero debes asignar este material a un aula.');
      return;
    }
    this.abrirModal('asignarEstudiante');
  }

  abrirModal(tipo: ModalTipo): void {
    this.modalActivo = tipo;
  }

  cerrarModal(): void {
    const contenido = document.querySelector('.modal-content');
    if (contenido) {
      contenido.classList.add('salir');
      setTimeout(() => {
        this.modalActivo = null;
        this.resetForms();
      }, 250);
    } else {
      this.modalActivo = null;
      this.resetForms();
    }
  }

  resetForms(): void {
    this.aulaSeleccionadaId = null;
    this.cantidadAula = 1;
    this.aulaSeleccionadaEstudiantesId = null;
    this.estudiantesAula = [];
    this.cargandoEstudiantesAula = false;
  }

  // ============ CREAR / EDITAR MATERIAL ============

  guardarMaterial(): void {
    if (!this.formMaterial.nombre.trim() || !this.formMaterial.categoria.trim() || this.formMaterial.cantidad_total <= 0) {
      alert('Completa todos los campos correctamente.');
      return;
    }
    this.guardando = true;

    if (this.materialEditando) {
      this.materialesService.updateMaterial(this.materialEditando.material_id, this.formMaterial).subscribe({
        next: () => {
          this.guardando = false;
          this.cargarMateriales();
          this.cerrarModal();
          if (this.materialSeleccionado?.material_id === this.materialEditando?.material_id) {
            this.materialSeleccionado = null;
          }
        },
        error: (err) => {
          this.guardando = false;
          alert(err.error?.message || 'Error al actualizar material');
        },
      });
    } else {
      this.materialesService.createMaterial(this.formMaterial).subscribe({
        next: () => {
          this.guardando = false;
          this.paginaActual = 1;
          this.cargarMateriales();
          this.cerrarModal();
        },
        error: (err) => {
          this.guardando = false;
          alert(err.error?.message || 'Error al crear material');
        },
      });
    }
  }

  // ============ ELIMINAR MATERIAL ============

  eliminarMaterial(material: Material): void {
    if (!confirm(`¿Eliminar el material "${material.nombre}"? Esta acción no es permanente.`)) return;

    this.materialesService.deleteMaterial(material.material_id).subscribe({
      next: () => {
        this.cargarMateriales();
        if (this.materialSeleccionado?.material_id === material.material_id) {
          this.materialSeleccionado = null;
        }
      },
      error: (err) => alert(err.error?.message || 'Error al eliminar material'),
    });
  }

  // ============ PANEL LATERAL DE ASIGNACIONES ============

  seleccionarMaterial(material: Material): void {
    if (this.materialSeleccionado?.material_id === material.material_id) {
      this.materialSeleccionado = null;
      return;
    }
    this.materialSeleccionado = material;
    this.panelActivo = 'aulas';
    this.cargarAulas();
  }

  cambiarPanel(panel: PanelTipo): void {
    this.panelActivo = panel;
    if (panel === 'aulas') this.cargarAulas();
    else this.cargarEstudiantes();
  }

  cerrarPanel(): void {
    this.materialSeleccionado = null;
  }

  cargarAulas(): void {
    if (!this.materialSeleccionado) return;
    this.cargandoPanel = true;
    this.materialesService.getAulasAsignadas(this.materialSeleccionado.material_id).subscribe({
      next: (data) => { this.aulasAsignadas = data; this.cargandoPanel = false; },
      error: () => { this.cargandoPanel = false; },
    });
  }

  cargarEstudiantes(): void {
    if (!this.materialSeleccionado) return;
    this.cargandoPanel = true;
    this.materialesService.getEstudiantesAsignados(this.materialSeleccionado.material_id).subscribe({
      next: (data) => { this.estudiantesAsignados = data; this.cargandoPanel = false; },
      error: () => { this.cargandoPanel = false; },
    });
  }

  // ============ ASIGNAR A AULA ============

  abrirAsignarAula(): void {
    this.cargandoTodasLasAulas = true;
    this.materialesService.getTodasLasAulas().subscribe({
      next: (aulas) => {
        this.todasLasAulas = aulas;
        this.cargandoTodasLasAulas = false;
      },
      error: () => {
        this.cargandoTodasLasAulas = false;
        alert('Error al cargar aulas');
      }
    });
    this.abrirModal('asignarAula');
  }

  confirmarAsignarAula(): void {
    if (!this.aulaSeleccionadaId || !this.materialSeleccionado || this.cantidadAula <= 0) {
      alert('Selecciona un aula e indica una cantidad válida.');
      return;
    }
    this.asignandoAula = true;
    this.materialesService.asignarAula(this.materialSeleccionado.material_id, {
      aula_id: Number(this.aulaSeleccionadaId),
      cantidad_asignada: this.cantidadAula,
    }).subscribe({
      next: () => {
        this.asignandoAula = false;
        this.cerrarModal();
        this.cargarAulas();
      },
      error: (err) => {
        this.asignandoAula = false;
        alert(err.error?.message || 'Error al asignar aula');
      },
    });
  }

  quitarAula(asignacion: MaterialAulaAsignada): void {
    if (!this.materialSeleccionado) return;
    if (!confirm(`¿Quitar la asignación al aula ${asignacion.aula_nombre}?`)) return;
    this.materialesService.quitarAula(this.materialSeleccionado.material_id, asignacion.aula_id).subscribe({
      next: () => this.cargarAulas(),
      error: (err) => alert(err.error?.message || 'Error al quitar asignación'),
    });
  }

  // ============ ASIGNAR A ESTUDIANTE POR AULA ============

  cargarEstudiantesPorAula(): void {
    if (!this.aulaSeleccionadaEstudiantesId || !this.materialSeleccionado) return;
    this.cargandoEstudiantesAula = true;
    this.materialesService.getEstudiantesPorAula(this.aulaSeleccionadaEstudiantesId, this.materialSeleccionado.material_id).subscribe({
      next: (data) => {
        this.estudiantesAula = data.map(e => ({ ...e, seleccionado: false, cantidad_asignada: 1 }));
        this.cargandoEstudiantesAula = false;
      },
      error: () => {
        this.cargandoEstudiantesAula = false;
        alert('Error al cargar estudiantes del aula');
      }
    });
  }

  get todosEstudiantesSeleccionados(): boolean {
    return this.estudiantesAula.length > 0 && this.estudiantesAula.every(e => e.seleccionado);
  }

  toggleSeleccionarTodosEstudiantes(event: any): void {
    const seleccionado = event.target.checked;
    this.estudiantesAula.forEach(e => e.seleccionado = seleccionado);
  }

  confirmarAsignarEstudiantesAula(): void {
    const seleccionados = this.estudiantesAula.filter(e => e.seleccionado && (e.cantidad_asignada ?? 0) > 0);
    if (seleccionados.length === 0) {
      alert('Selecciona al menos un estudiante válido e indica una cantidad mayor a 0.');
      return;
    }
    if (!this.materialSeleccionado) return;

    const asignaciones: BulkAsignacion[] = seleccionados.map(e => ({
      estudiante_id: e.estudiante_id,
      cantidad_asignada: e.cantidad_asignada ?? 1
    }));

    this.asignandoEstudiantesAula = true;
    this.materialesService.asignarEstudiantesMasivo(this.materialSeleccionado.material_id, { asignaciones }).subscribe({
      next: (res) => {
        this.asignandoEstudiantesAula = false;
        let msg = `✅ Asignados: ${res.asignados}`;
        if (res.errores.length) msg += `\n⚠️ Errores:\n${res.errores.join('\n')}`;
        alert(msg);
        this.cerrarModal();
        this.cargarEstudiantes();
      },
      error: (err) => {
        this.asignandoEstudiantesAula = false;
        alert(err.error?.message || 'Error al asignar masivamente');
      },
    });
  }

  quitarEstudiante(asignacion: MaterialEstudianteAsignado): void {
    if (!this.materialSeleccionado) return;
    if (!confirm(`¿Quitar la asignación a ${asignacion.estudiante_nombre}?`)) return;
    this.materialesService.quitarEstudiante(this.materialSeleccionado.material_id, asignacion.estudiante_id).subscribe({
      next: () => this.cargarEstudiantes(),
      error: (err) => alert(err.error?.message || 'Error al quitar asignación'),
    });
  }

  // ============ HELPERS ============

  getTipoLabel(tipo: MaterialTipo): string {
    return tipo === 'ASEO' ? '🧹 Aseo' : '📚 Trabajo';
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Asignado': return 'badge-asignado';
      case 'Devuelto': return 'badge-devuelto';
      case 'Perdido': return 'badge-perdido';
      default: return '';
    }
  }
}
