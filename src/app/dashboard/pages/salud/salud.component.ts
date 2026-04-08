import { Component, OnInit } from '@angular/core';
import { InformacionMedica, InformacionMedicaCreate, PadreMedico } from '../../../shared/interfaces/informacion-medica.interface';
import { InformacionMedicaService } from '../../../core/services/informacion-medica.service';
import { EstudiantesService } from '../../../core/services/estudiantes.service';
import { Estudiantes } from '../../../shared/interfaces/estudiantes.interface';

@Component({
  selector: 'app-salud',
  standalone: false,
  templateUrl: './salud.component.html',
  styleUrl: './salud.component.css'
})
export class SaludComponent implements OnInit {

  constructor(
    private saludService: InformacionMedicaService,
    private estudiantesService: EstudiantesService
  ) { }

  // Datos
  registros: InformacionMedica[] = [];
  registrosOriginales: InformacionMedica[] = [];
  estudiantesDisponibles: Estudiantes[] = [];

  // UI
  modalAbierto = false;
  modoEditar = false;
  cargando = false;
  busqueda = '';
  cantidadMostrar = 10;
  registroEditandoId = 0;

  // Formulario
  form: InformacionMedicaCreate = {
    estudiante_id: 0,
    condicion: '',
    tipo_condicion: '',
    gravedad: '',
    descripcion: ''
  };

  tiposCondicion = ['Alergia', 'Enfermedad Crónica', 'Discapacidad', 'Otro'];
  gravedades = ['Leve', 'Moderado', 'Grave'];

  ngOnInit(): void {
    this.cargarRegistros();
    this.cargarEstudiantesDisponibles();
  }

  cargarRegistros(): void {
    this.cargando = true;
    this.saludService.getAll().subscribe({
      next: (data) => {
        this.registrosOriginales = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarEstudiantesDisponibles(): void {
    this.estudiantesService.getEstudiantes().subscribe(data => {
      this.estudiantesDisponibles = data.filter(e => e.estado === 'Activo');
    });
  }

  aplicarFiltros(): void {
    let lista = [...this.registrosOriginales];

    if (this.busqueda.trim()) {
      const b = this.busqueda.toLowerCase().trim();
      lista = lista.filter(r =>
        r.estudiante?.nombres?.toLowerCase().includes(b) ||
        r.estudiante?.apellido_paterno?.toLowerCase().includes(b) ||
        r.estudiante?.apellido_materno?.toLowerCase().includes(b) ||
        r.estudiante?.dni?.includes(b) ||
        r.condicion?.toLowerCase().includes(b)
      );
    }

    if (this.cantidadMostrar > 0) {
      lista = lista.slice(0, this.cantidadMostrar);
    }

    this.registros = lista;
  }

  cambiarCantidad(event: Event): void {
    this.cantidadMostrar = Number((event.target as HTMLSelectElement).value);
    this.aplicarFiltros();
  }

  onBusquedaChange(valor: string): void {
    this.busqueda = valor;
    this.aplicarFiltros();
  }

  // --- Nombre completo del estudiante ---
  getNombreCompleto(r: InformacionMedica): string {
    if (!r.estudiante) return '-';
    return `${r.estudiante.nombres} ${r.estudiante.apellido_paterno} ${r.estudiante.apellido_materno}`;
  }

  // --- Datos del padre/contacto principal ---
  getContactoPadre(r: InformacionMedica): PadreMedico | null {
    if (!r.estudiante.padres?.length) return null;
    return r.estudiante.padres.find(p => p.es_contacto_principal) ?? r.estudiante.padres[0];
  }

  getNombrePadre(r: InformacionMedica): string {
    const p = this.getContactoPadre(r);
    if (!p) return '—';
    return `${p.nombres} ${p.apellido_paterno}`;
  }

  getTelefonoPadre(r: InformacionMedica): string {
    const p = this.getContactoPadre(r);
    return p?.telefono ?? '—';
  }

  // --- Badge de gravedad ---
  getGravedadClass(gravedad: string | null): string {
    switch (gravedad?.toLowerCase()) {
      case 'leve': return 'badge-leve';
      case 'moderado': return 'badge-moderado';
      case 'grave': return 'badge-grave';
      default: return 'badge-sin-dato';
    }
  }

  getTipoClass(tipo: string | null): string {
    switch (tipo?.toLowerCase()) {
      case 'alergia': return 'tipo-alergia';
      case 'enfermedad crónica': return 'tipo-cronica';
      case 'discapacidad': return 'tipo-discapacidad';
      default: return 'tipo-otro';
    }
  }

  // --- Modal ---
  abrirAgregar(): void {
    this.form = {
      estudiante_id: 0,
      condicion: '',
      tipo_condicion: '',
      gravedad: '',
      descripcion: ''
    };
    this.modoEditar = false;
    this.modalAbierto = true;
  }

  abrirEditar(r: InformacionMedica): void {
    this.form = {
      estudiante_id: r.estudiante.estudiante_id,
      condicion: r.condicion ?? '',
      tipo_condicion: r.tipo_condicion ?? '',
      gravedad: r.gravedad ?? '',
      descripcion: r.descripcion ?? ''
    };
    this.registroEditandoId = r.informacion_medica_id;
    this.modoEditar = true;
    this.modalAbierto = true;
  }

  guardar(): void {
    if (!this.form.estudiante_id || !this.form.condicion.trim() || !this.form.gravedad) {
      alert('Completa los campos obligatorios: Estudiante, Condición y Gravedad.');
      return;
    }

    if (this.modoEditar) {
      this.saludService.update(this.registroEditandoId, this.form).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarRegistros();
          alert('✅ Registro médico actualizado correctamente.');
        },
        error: (err) => alert(err.error?.message || 'Error al actualizar el registro.')
      });
    } else {
      this.saludService.create(this.form).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarRegistros();
          alert('✅ Registro médico guardado correctamente.');
        },
        error: (err) => alert(err.error?.message || 'Error al guardar el registro.')
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este registro médico?')) {
      this.saludService.remove(id).subscribe({
        next: () => this.cargarRegistros(),
        error: (err) => alert(err.error?.message || 'Error al eliminar.')
      });
    }
  }

  cerrarModal(): void {
    const modal = document.querySelector('.modal-content');
    if (modal) {
      modal.classList.add('salir');
      setTimeout(() => { this.modalAbierto = false; }, 250);
    } else {
      this.modalAbierto = false;
    }
  }
}
