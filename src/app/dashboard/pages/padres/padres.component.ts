import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PadresService } from '../../../core/services/padres.service';
import { Padres } from '../../../shared/interfaces/padres.interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-padres',
  standalone: false,
  templateUrl: './padres.component.html',
  styleUrl: './padres.component.css'
})
export class PadresComponent implements OnInit {

  padres: Padres[] = [];

  constructor(
    private dialog: MatDialog,
    private padresService: PadresService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarPadres();
  }

  cargarPadres() {
    this.padresService.getPadres().subscribe({
      next: (response: any) => {
        this.padres = response.data;
      },
      error: (err) => {
        console.error('Error al cargar padres:', err);
      }
    });
  }

  // ============ MODAL ============
  modalAbierto: boolean = false;
  modoEditar: boolean = false;
  padreIdEditar: number | null = null;

  // ============ MODO FORMULARIO (solo para crear) ============
  modoFormulario: 'padre_madre' | 'tutor' = 'padre_madre';

  // ============ SECCIÓN PADRE ============
  padreDni: string = '';
  padreNombres: string = '';
  padreApellidoPaterno: string = '';
  padreApellidoMaterno: string = '';
  padreTelefono: string = '';
  padreEmail: string = '';
  padreDireccion: string = '';
  padreEsContactoPrincipal: boolean = false;
  buscandoDniPadre: boolean = false;

  // ============ SECCIÓN MADRE ============
  madreDni: string = '';
  madreNombres: string = '';
  madreApellidoPaterno: string = '';
  madreApellidoMaterno: string = '';
  madreTelefono: string = '';
  madreEmail: string = '';
  madreDireccion: string = '';
  madreEsContactoPrincipal: boolean = false;
  buscandoDniMadre: boolean = false;

  // ============ SECCIÓN TUTOR ============
  tutorDni: string = '';
  tutorNombres: string = '';
  tutorApellidoPaterno: string = '';
  tutorApellidoMaterno: string = '';
  tutorTelefono: string = '';
  tutorEmail: string = '';
  tutorDireccion: string = '';
  tutorDetallesRelacion: string = '';
  tutorEsContactoPrincipal: boolean = false;
  buscandoDniTutor: boolean = false;

  // ============ EDICIÓN (variables planas) ============
  nombres: string = '';
  apellido_paterno: string = '';
  apellido_materno: string = '';
  dni: string = '';
  telefono: string = '';
  email: string = '';
  direccion: string = '';
  tipoRelacion: string = '';
  detallesRelacion: string = '';
  esApoderadoPrincipal: boolean = false;
  buscandoDni: boolean = false;

  // ============ ESTUDIANTES ============
  dniEstudiante: string = '';
  estudiantesAsignados: any[] = [];
  resultadosBusqueda: any[] = [];
  buscandoEstudiante: boolean = false;

  // ============ ELIMINAR ============
  padreIdEliminar: number | null = null;

  // ============ BÚSQUEDA RENIEC GENÉRICA ============

  buscarDniReniecGenerico(dni: string, target: 'padre' | 'madre' | 'tutor') {
    const dniString = String(dni || '').trim();
    if (!dniString || dniString.length !== 8 || !/^\d{8}$/.test(dniString)) {
      alert('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    if (target === 'padre') this.buscandoDniPadre = true;
    else if (target === 'madre') this.buscandoDniMadre = true;
    else this.buscandoDniTutor = true;

    this.padresService.buscarDniEnReniec(dniString).subscribe({
      next: (response) => {
        if (target === 'padre') {
          this.buscandoDniPadre = false;
          this.padreNombres = response.nombres;
          this.padreApellidoPaterno = response.apellidoPaterno;
          this.padreApellidoMaterno = response.apellidoMaterno;
        } else if (target === 'madre') {
          this.buscandoDniMadre = false;
          this.madreNombres = response.nombres;
          this.madreApellidoPaterno = response.apellidoPaterno;
          this.madreApellidoMaterno = response.apellidoMaterno;
        } else {
          this.buscandoDniTutor = false;
          this.tutorNombres = response.nombres;
          this.tutorApellidoPaterno = response.apellidoPaterno;
          this.tutorApellidoMaterno = response.apellidoMaterno;
        }
        alert('Datos encontrados en RENIEC. Complete los campos restantes.');
      },
      error: (err) => {
        if (target === 'padre') this.buscandoDniPadre = false;
        else if (target === 'madre') this.buscandoDniMadre = false;
        else this.buscandoDniTutor = false;

        if (err.status === 404) {
          alert('DNI no encontrado en RENIEC');
        } else if (err.status === 401) {
          alert('Error de autenticación con el servicio de RENIEC');
        } else {
          alert('Error al consultar DNI: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  // RENIEC para modo edición
  buscarDniReniec() {
    const dniString = String(this.dni || '').trim();
    if (!dniString || dniString.length !== 8 || !/^\d{8}$/.test(dniString)) {
      alert('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    this.buscandoDni = true;
    this.padresService.buscarDniEnReniec(dniString).subscribe({
      next: (response) => {
        this.buscandoDni = false;
        this.nombres = response.nombres;
        this.apellido_paterno = response.apellidoPaterno;
        this.apellido_materno = response.apellidoMaterno;
        alert('Datos encontrados en RENIEC. Complete los campos restantes.');
      },
      error: (err) => {
        this.buscandoDni = false;
        if (err.status === 404) {
          alert('DNI no encontrado en RENIEC');
        } else {
          alert('Error al consultar DNI: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  // ============ BÚSQUEDA DE ESTUDIANTES ============

  buscarEstudiante() {
    const query = this.dniEstudiante.trim();
    if (query.length < 3) {
      alert('Ingrese al menos 3 dígitos para buscar');
      return;
    }

    this.buscandoEstudiante = true;
    this.resultadosBusqueda = [];
    this.padresService.searchEstudiantesByDni(query).subscribe({
      next: (estudiantes) => {
        this.buscandoEstudiante = false;
        const idsAsignados = new Set(this.estudiantesAsignados.map(e => e.estudiante_id || e.id));
        this.resultadosBusqueda = estudiantes.filter(e => !idsAsignados.has(e.estudiante_id || e.id));
      },
      error: (err) => {
        this.buscandoEstudiante = false;
        console.error('Error al buscar estudiantes:', err);
        alert('Error al buscar estudiantes');
      }
    });
  }

  agregarEstudianteDeBusqueda(estudiante: any) {
    const id = estudiante.estudiante_id || estudiante.id;
    const duplicado = this.estudiantesAsignados.find(e => (e.estudiante_id || e.id) === id);
    if (duplicado) {
      alert('El estudiante ya está en la lista');
      return;
    }
    this.estudiantesAsignados.push(estudiante);
    this.resultadosBusqueda = this.resultadosBusqueda.filter(e => (e.estudiante_id || e.id) !== id);
  }

  eliminarEstudianteDeLista(index: number) {
    this.estudiantesAsignados.splice(index, 1);
  }

  // ============ MODAL ABRIR/CERRAR ============

  abrirAgregar() {
    this.modoEditar = false;
    this.padreIdEditar = null;
    this.limpiarFormulario();
    this.modalAbierto = true;
    this.cd.detectChanges();
  }

  abrirEditar(padre?: Padres) {
    if (padre) {
      this.modoEditar = true;
      this.padreIdEditar = padre.padre_id || padre.id || null;
      this.cargarDatosEnFormulario(padre);
      this.modalAbierto = true;
    }
  }

  cerrarModal() {
    const modal = document.querySelector('.modal-content');
    if (modal) {
      modal.classList.add('salir');
      setTimeout(() => {
        this.modalAbierto = false;
        this.limpiarFormulario();
        this.cd.detectChanges();
      }, 250);
    } else {
      this.modalAbierto = false;
      this.limpiarFormulario();
      this.cd.detectChanges();
    }
  }

  limpiarFormulario() {
    this.modoFormulario = 'padre_madre';
    this.padreDni = '';
    this.padreNombres = '';
    this.padreApellidoPaterno = '';
    this.padreApellidoMaterno = '';
    this.padreTelefono = '';
    this.padreEmail = '';
    this.padreDireccion = '';
    this.padreEsContactoPrincipal = false;
    this.madreDni = '';
    this.madreNombres = '';
    this.madreApellidoPaterno = '';
    this.madreApellidoMaterno = '';
    this.madreTelefono = '';
    this.madreEmail = '';
    this.madreDireccion = '';
    this.madreEsContactoPrincipal = false;
    this.tutorDni = '';
    this.tutorNombres = '';
    this.tutorApellidoPaterno = '';
    this.tutorApellidoMaterno = '';
    this.tutorTelefono = '';
    this.tutorEmail = '';
    this.tutorDireccion = '';
    this.tutorDetallesRelacion = '';
    this.tutorEsContactoPrincipal = false;
    this.nombres = '';
    this.apellido_paterno = '';
    this.apellido_materno = '';
    this.dni = '';
    this.telefono = '';
    this.email = '';
    this.direccion = '';
    this.tipoRelacion = '';
    this.detallesRelacion = '';
    this.esApoderadoPrincipal = false;
    this.estudiantesAsignados = [];
    this.resultadosBusqueda = [];
    this.dniEstudiante = '';
  }

  cargarDatosEnFormulario(padre: Padres) {
    this.nombres = padre.nombres;
    this.apellido_paterno = padre.apellido_paterno;
    this.apellido_materno = padre.apellido_materno;
    this.dni = padre.dni;
    this.telefono = padre.telefono || '';
    this.email = padre.email || '';
    this.direccion = padre.direccion || '';
    this.tipoRelacion = padre.tipo_relacion;
    this.detallesRelacion = padre.detalles_relacion || '';
    this.esApoderadoPrincipal = padre.es_contacto_principal || false;

    if (this.padreIdEditar) {
      this.padresService.getEstudiantesAsignados(this.padreIdEditar).subscribe({
        next: (data) => {
          this.estudiantesAsignados = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ============ GUARDAR ============

  async guardarPadre() {
    if (this.modoEditar) {
      await this.guardarEdicion();
      return;
    }

    try {
      const padresCreados: number[] = [];

      if (this.modoFormulario === 'padre_madre') {
        if (!this.padreDni || !this.padreNombres || !this.padreApellidoPaterno || !this.padreApellidoMaterno) {
          alert('Complete al menos los datos del padre (DNI, nombres y apellidos)');
          return;
        }

        if (this.madreDni && this.padreDni === this.madreDni) {
          alert('El DNI del padre y la madre no pueden ser iguales');
          return;
        }

        const padreData = {
          dni: this.padreDni,
          nombres: this.padreNombres,
          apellido_paterno: this.padreApellidoPaterno,
          apellido_materno: this.padreApellidoMaterno,
          telefono: this.padreTelefono || undefined,
          email: this.padreEmail || undefined,
          direccion: this.padreDireccion || undefined,
          tipo_relacion: 'Padre',
          es_contacto_principal: this.padreEsContactoPrincipal
        };

        const nuevoPadre = await this.padresService.createPadre(padreData).toPromise();
        if (nuevoPadre) {
          padresCreados.push(nuevoPadre.padre_id || (nuevoPadre as any).id);
        }

        if (this.madreDni && this.madreNombres && this.madreApellidoPaterno && this.madreApellidoMaterno) {
          const madreData = {
            dni: this.madreDni,
            nombres: this.madreNombres,
            apellido_paterno: this.madreApellidoPaterno,
            apellido_materno: this.madreApellidoMaterno,
            telefono: this.madreTelefono || undefined,
            email: this.madreEmail || undefined,
            direccion: this.madreDireccion || undefined,
            tipo_relacion: 'Madre',
            es_contacto_principal: this.madreEsContactoPrincipal
          };

          try {
            const nuevaMadre = await this.padresService.createPadre(madreData).toPromise();
            if (nuevaMadre) {
              padresCreados.push(nuevaMadre.padre_id || (nuevaMadre as any).id);
            }
          } catch (err: any) {
            alert('Error al crear la madre: ' + (err?.error?.message || err?.message || 'Error desconocido') + '\nEl padre fue creado correctamente.');
          }
        }

      } else {
        if (!this.tutorDni || !this.tutorNombres || !this.tutorApellidoPaterno || !this.tutorApellidoMaterno) {
          alert('Complete los datos del tutor (DNI, nombres y apellidos)');
          return;
        }

        const tutorData = {
          dni: this.tutorDni,
          nombres: this.tutorNombres,
          apellido_paterno: this.tutorApellidoPaterno,
          apellido_materno: this.tutorApellidoMaterno,
          telefono: this.tutorTelefono || undefined,
          email: this.tutorEmail || undefined,
          direccion: this.tutorDireccion || undefined,
          tipo_relacion: 'Tutor',
          detalles_relacion: this.tutorDetallesRelacion || undefined,
          es_contacto_principal: this.tutorEsContactoPrincipal
        };

        const nuevoTutor = await this.padresService.createPadre(tutorData).toPromise();
        if (nuevoTutor) {
          padresCreados.push(nuevoTutor.padre_id || (nuevoTutor as any).id);
        }
      }

      if (padresCreados.length > 0 && this.estudiantesAsignados.length > 0) {
        const asignaciones: any[] = [];
        for (const padreId of padresCreados) {
          for (const est of this.estudiantesAsignados) {
            asignaciones.push(
              this.padresService.assignEstudiante(padreId, est.estudiante_id || est.id)
            );
          }
        }
        await forkJoin(asignaciones).toPromise();
      }

      this.mostrarExito('Registro guardado correctamente');

    } catch (err: any) {
      console.error('Error al guardar:', err);
      alert('Error: ' + (err?.error?.message || err?.message || 'Error desconocido'));
    }
  }

  async guardarEdicion() {
    if (!this.nombres || !this.apellido_paterno || !this.dni || !this.tipoRelacion) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const padreData = {
      nombres: this.nombres,
      apellido_paterno: this.apellido_paterno,
      apellido_materno: this.apellido_materno,
      dni: this.dni,
      telefono: this.telefono || undefined,
      email: this.email || undefined,
      direccion: this.direccion || undefined,
      tipo_relacion: this.tipoRelacion,
      detalles_relacion: this.detallesRelacion || undefined,
      es_contacto_principal: this.esApoderadoPrincipal
    };

    try {
      if (this.padreIdEditar) {
        await this.padresService.updatePadre(this.padreIdEditar, padreData).toPromise();
        await this.sincronizarEstudiantesAsignados(this.padreIdEditar);
        this.mostrarExito('Registro actualizado correctamente');
      }
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      alert('Error: ' + (err?.error?.message || err?.message || 'Error desconocido'));
    }
  }

  async sincronizarEstudiantesAsignados(padreId: number) {
    try {
      const asignacionesActuales = await this.padresService
        .getEstudiantesAsignados(padreId)
        .toPromise();

      if (!asignacionesActuales) return;

      const mapaActual = new Map();
      asignacionesActuales.forEach(a => mapaActual.set(a.estudiante_id, a));

      const mapaNuevo = new Map();
      this.estudiantesAsignados.forEach(e => mapaNuevo.set(e.estudiante_id || e.id, e));

      for (const [id] of mapaActual) {
        if (!mapaNuevo.has(id)) {
          await this.padresService.removeEstudiante(padreId, id).toPromise();
        }
      }

      for (const [id] of mapaNuevo) {
        if (!mapaActual.has(id)) {
          await this.padresService.assignEstudiante(padreId, id).toPromise();
        }
      }
    } catch (err: any) {
      console.error('Error sincronizando estudiantes:', err);
      throw new Error(err?.message || 'Error al sincronizar estudiantes');
    }
  }

  mostrarExito(msg: string) {
    alert(msg);
    this.cerrarModal();
    this.cargarPadres();
  }

  // ============ ELIMINAR ============

  confirmarEliminar(padre?: Padres) {
    if (padre) {
      this.padreIdEliminar = padre.padre_id || padre.id || null;
    }
    if (!this.padreIdEliminar) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación',
        message: '¿Está seguro de eliminar este registro?',
        icon: 'fa-solid fa-triangle-exclamation',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarPadre();
      }
    });
  }

  eliminarPadre() {
    if (this.padreIdEliminar) {
      this.padresService.deletePadre(this.padreIdEliminar).subscribe({
        next: () => {
          this.padreIdEliminar = null;
          this.mostrarExito('Registro eliminado');
        },
        error: (err: any) => {
          alert('Error al eliminar: ' + (err?.error?.message || err.message));
        }
      });
    }
  }
}
