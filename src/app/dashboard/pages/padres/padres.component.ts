import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PadresService } from '../../../core/services/padres.service';
import { Padres } from '../../../shared/interfaces/padres.interface';

interface ParentForm {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  tipo_relacion: string;
  detalles_relacion: string;
  es_contacto_principal: boolean;
}

@Component({
  selector: 'app-padres',
  standalone: false,
  templateUrl: './padres.component.html',
  styleUrl: './padres.component.css'
})
export class PadresComponent implements OnInit {

  // ============ LISTA DE PADRES ============
  padres: Padres[] = [];

  // ============ MODAL ============
  modalAbierto: boolean = false;
  modoEditar: boolean = false;
  padreIdEditar: number | null = null;

  // ============ TABS ============
  activeTab: number = 1;

  // ============ FORMULARIOS ============
  formPadre: ParentForm = this.getDefaultForm('Padre');
  formMadre: ParentForm = this.getDefaultForm('Madre');

  // ============ ESTADOS DE BÚSQUEDA RENIEC ============
  buscandoDni: boolean = false;
  buscandoDniPadre: boolean = false;
  buscandoDniMadre: boolean = false;
  buscandoDniTutor: boolean = false;

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

  // ============ BÚSQUEDA DE ESTUDIANTES ============
  dniEstudiante: string = '';
  estudiantesAsignados: any[] = [];
  resultadosBusqueda: any[] = [];
  buscandoEstudiante: boolean = false;

  // ============ ELIMINAR ============
  padreIdEliminar: number | null = null;

  constructor(
    private dialog: MatDialog,
    private padresService: PadresService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarPadres();
  }

  // ============ CARGA DE DATOS ============

  cargarPadres(): void {
    this.padresService.getPadres().subscribe({
      next: (response: any) => {
        this.padres = response.data;
      },
      error: (err: any) => {
        console.error('Error al cargar padres:', err);
      }
    });
  }

  // ============ FORMULARIO POR DEFECTO ============

  getDefaultForm(tipoRelacion: string): ParentForm {
    return {
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      dni: '',
      telefono: '',
      email: '',
      direccion: '',
      tipo_relacion: tipoRelacion,
      detalles_relacion: '',
      es_contacto_principal: false
    };
  }

  // ============ BÚSQUEDA RENIEC (modo agregar, por tipo padre/madre) ============

  buscarDniReniecPorTipo(tipo: 'padre' | 'madre'): void {
    const formTarget = tipo === 'padre' ? this.formPadre : this.formMadre;
    const dniString = String(formTarget.dni || '').trim();

    if (!dniString || dniString.length !== 8 || !/^\d{8}$/.test(dniString)) {
      alert('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    if (tipo === 'padre') this.buscandoDniPadre = true;
    else this.buscandoDniMadre = true;

    this.padresService.buscarDniEnReniec(dniString).subscribe({
      next: (response: any) => {
        if (tipo === 'padre') this.buscandoDniPadre = false;
        else this.buscandoDniMadre = false;

        formTarget.nombres = response.nombres;
        formTarget.apellido_paterno = response.apellidoPaterno;
        formTarget.apellido_materno = response.apellidoMaterno;
        alert('✅ Datos encontrados en RENIEC. Complete los campos restantes.');
      },
      error: (err: any) => {
        if (tipo === 'padre') this.buscandoDniPadre = false;
        else this.buscandoDniMadre = false;

        console.error('Error al buscar DNI:', err);
        if (err.status === 404) {
          alert('❌ DNI no encontrado en RENIEC');
        } else if (err.status === 401) {
          alert('❌ Error de autenticación con RENIEC (Token).');
        } else if (err.status === 400) {
          alert('❌ DNI inválido. Debe tener 8 dígitos.');
        } else {
          alert('❌ Error al consultar DNI: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  // ============ BÚSQUEDA RENIEC GENÉRICA (padre/madre/tutor) ============

  buscarDniReniecGenerico(dni: string, target: 'padre' | 'madre' | 'tutor'): void {
    const dniString = String(dni || '').trim();
    if (!dniString || dniString.length !== 8 || !/^\d{8}$/.test(dniString)) {
      alert('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    if (target === 'padre') this.buscandoDniPadre = true;
    else if (target === 'madre') this.buscandoDniMadre = true;
    else this.buscandoDniTutor = true;

    this.padresService.buscarDniEnReniec(dniString).subscribe({
      next: (response: any) => {
        if (target === 'padre') {
          this.buscandoDniPadre = false;
          this.formPadre.nombres = response.nombres;
          this.formPadre.apellido_paterno = response.apellidoPaterno;
          this.formPadre.apellido_materno = response.apellidoMaterno;
        } else if (target === 'madre') {
          this.buscandoDniMadre = false;
          this.formMadre.nombres = response.nombres;
          this.formMadre.apellido_paterno = response.apellidoPaterno;
          this.formMadre.apellido_materno = response.apellidoMaterno;
        } else {
          this.buscandoDniTutor = false;
          this.tutorNombres = response.nombres;
          this.tutorApellidoPaterno = response.apellidoPaterno;
          this.tutorApellidoMaterno = response.apellidoMaterno;
        }
        alert('✅ Datos encontrados en RENIEC. Complete los campos restantes.');
      },
      error: (err: any) => {
        if (target === 'padre') this.buscandoDniPadre = false;
        else if (target === 'madre') this.buscandoDniMadre = false;
        else this.buscandoDniTutor = false;

        if (err.status === 404) {
          alert('❌ DNI no encontrado en RENIEC');
        } else if (err.status === 401) {
          alert('❌ Error de autenticación con el servicio de RENIEC');
        } else {
          alert('❌ Error al consultar DNI: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  // ============ BÚSQUEDA RENIEC (modo edición, usa buscandoDni genérico) ============

  buscarDniReniecEdicion(dni: string, formTarget: ParentForm): void {
    const dniString = String(dni || '').trim();
    if (!dniString || dniString.length !== 8 || !/^\d{8}$/.test(dniString)) {
      alert('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    this.buscandoDni = true;
    this.padresService.buscarDniEnReniec(dniString).subscribe({
      next: (response: any) => {
        this.buscandoDni = false;
        formTarget.nombres = response.nombres;
        formTarget.apellido_paterno = response.apellidoPaterno;
        formTarget.apellido_materno = response.apellidoMaterno;
        alert('✅ Datos encontrados en RENIEC. Complete los campos restantes.');
      },
      error: (err: any) => {
        this.buscandoDni = false;
        if (err.status === 404) {
          alert('❌ DNI no encontrado en RENIEC');
        } else {
          alert('❌ Error al consultar DNI: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  // ============ BÚSQUEDA DE ESTUDIANTES ============

  buscarEstudiante(): void {
    const query = this.dniEstudiante.trim();
    if (query.length < 3) {
      alert('Ingrese al menos 3 dígitos para buscar');
      return;
    }

    this.buscandoEstudiante = true;
    this.resultadosBusqueda = [];
    this.padresService.searchEstudiantesByDni(query).subscribe({
      next: (estudiantes: any[]) => {
        this.buscandoEstudiante = false;
        const idsAsignados = new Set(this.estudiantesAsignados.map((e: any) => e.estudiante_id || e.id));
        this.resultadosBusqueda = estudiantes.filter((e: any) => !idsAsignados.has(e.estudiante_id || e.id));
      },
      error: (err: any) => {
        this.buscandoEstudiante = false;
        console.error('Error al buscar estudiantes:', err);
        alert('Error al buscar estudiantes');
      }
    });
  }

  agregarEstudianteDeBusqueda(estudiante: any): void {
    const id = estudiante.estudiante_id || estudiante.id;
    const duplicado = this.estudiantesAsignados.find((e: any) => (e.estudiante_id || e.id) === id);
    if (duplicado) {
      alert('El estudiante ya está en la lista');
      return;
    }
    this.estudiantesAsignados.push(estudiante);
    this.resultadosBusqueda = this.resultadosBusqueda.filter((e: any) => (e.estudiante_id || e.id) !== id);
  }

  eliminarEstudianteDeLista(index: number): void {
    this.estudiantesAsignados.splice(index, 1);
  }

  // ============ MODAL ABRIR/CERRAR ============

  abrirAgregar(): void {
    this.modoEditar = false;
    this.padreIdEditar = null;
    this.limpiarFormulario();
    this.activeTab = 1;
    this.modalAbierto = true;
    this.cd.detectChanges();
  }

  abrirEditar(padre?: Padres): void {
    if (padre) {
      this.modoEditar = true;
      this.padreIdEditar = padre.padre_id || padre.id || null;
      this.cargarDatosEnFormulario(padre);
      this.modalAbierto = true;
    }
  }

  limpiarFormulario(): void {
    this.formPadre = this.getDefaultForm('Padre');
    this.formMadre = this.getDefaultForm('Madre');
    this.estudiantesAsignados = [];
    this.resultadosBusqueda = [];
    this.dniEstudiante = '';
  }

  cargarDatosEnFormulario(padre: Padres): void {
    this.limpiarFormulario();

    const parentData: ParentForm = {
      nombres: padre.nombres,
      apellido_paterno: padre.apellido_paterno,
      apellido_materno: padre.apellido_materno,
      dni: padre.dni,
      telefono: padre.telefono || '',
      email: padre.email || '',
      direccion: padre.direccion || '',
      tipo_relacion: padre.tipo_relacion,
      detalles_relacion: padre.detalles_relacion || '',
      es_contacto_principal: padre.es_contacto_principal || false
    };

    if (padre.tipo_relacion?.toLowerCase() === 'madre' || padre.tipo_relacion?.toLowerCase() === 'tutora') {
      this.formMadre = parentData;
      this.activeTab = 2;
    } else {
      this.formPadre = parentData;
      this.activeTab = 1;
    }

    if (this.padreIdEditar) {
      this.padresService.getEstudiantesAsignados(this.padreIdEditar).subscribe({
        next: (data: any) => {
          this.estudiantesAsignados = data;
          this.cd.detectChanges();
        },
        error: (err: any) => console.error(err)
      });
    }
  }

  // ============ GUARDAR ============

  async guardarPadre(): Promise<void> {
    if (this.modoEditar && this.padreIdEditar) {
      const formData = this.activeTab === 2 ? this.formMadre : this.formPadre;

      if (!formData.nombres || !formData.apellido_paterno || !formData.dni || !formData.tipo_relacion) {
        alert('Por favor complete los campos obligatorios del padre editado');
        return;
      }

      try {
        await this.padresService.updatePadre(this.padreIdEditar, formData).toPromise();
        await this.sincronizarEstudiantesAsignados(this.padreIdEditar);
        this.mostrarExito('Registro actualizado correctamente');
      } catch (err: unknown) {
        this.mostrarError(err);
      }
    } else {
      const savePadre = !!(this.formPadre.dni && this.formPadre.nombres);
      const saveMadre = !!(this.formMadre.dni && this.formMadre.nombres);

      if (!savePadre && !saveMadre) {
        alert('Debe rellenar al menos los datos de un apoderado (Padre o Madre)');
        return;
      }

      if (savePadre && (!this.formPadre.nombres || !this.formPadre.apellido_paterno || !this.formPadre.dni || !this.formPadre.tipo_relacion)) {
        alert('Faltan campos obligatorios en la pestaña Padre/Tutor 1');
        return;
      }

      if (saveMadre && (!this.formMadre.nombres || !this.formMadre.apellido_paterno || !this.formMadre.dni || !this.formMadre.tipo_relacion)) {
        alert('Faltan campos obligatorios en la pestaña Madre/Tutor 2');
        return;
      }

      try {
        let idPadreFinal: number | undefined = undefined;
        let idMadreFinal: number | undefined = undefined;

        if (savePadre) {
          const respPadre = await this.padresService.createPadre(this.formPadre).toPromise();
          idPadreFinal = respPadre?.padre_id || respPadre?.id;
        }

        if (saveMadre) {
          const respMadre = await this.padresService.createPadre(this.formMadre).toPromise();
          idMadreFinal = respMadre?.padre_id || respMadre?.id;
        }

        const asignacionesPromises: Promise<any>[] = [];
        for (const est of this.estudiantesAsignados) {
          const estId = est.estudiante_id || est.id;
          if (idPadreFinal) asignacionesPromises.push(this.padresService.assignEstudiante(idPadreFinal, estId).toPromise());
          if (idMadreFinal) asignacionesPromises.push(this.padresService.assignEstudiante(idMadreFinal, estId).toPromise());
        }

        if (asignacionesPromises.length > 0) {
          await Promise.all(asignacionesPromises);
        }

        this.mostrarExito('Registro(s) guardado(s) exitosamente');
      } catch (err: unknown) {
        this.mostrarError(err);
      }
    }
  }

  // ============ SINCRONIZAR ESTUDIANTES ============

  async sincronizarEstudiantesAsignados(padreId: number): Promise<void> {
    try {
      const asignacionesActuales = await this.padresService.getEstudiantesAsignados(padreId).toPromise();
      if (!asignacionesActuales) return;

      const mapaActual = new Map<number, any>();
      asignacionesActuales.forEach((a: any) => mapaActual.set(a.estudiante_id, a));

      const mapaNuevo = new Map<number, any>();
      this.estudiantesAsignados.forEach((e: any) => mapaNuevo.set(e.estudiante_id || e.id, e));

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
    } catch (err: unknown) {
      console.error('Error sincronizando estudiantes:', err);
      throw new Error('Error al sincronizar hijos');
    }
  }

  // ============ MENSAJES ============

  mostrarExito(msg: string): void {
    alert(msg);
    this.cerrarModal();
    this.cargarPadres();
  }

  mostrarError(err: unknown): void {
    console.error('Error:', err);
    let errorMessage = 'Error desconocido';
    if (err && typeof err === 'object') {
      if ('error' in err && (err as any).error && typeof (err as any).error === 'object' && 'message' in (err as any).error) {
        errorMessage = ((err as any).error as { message: string }).message;
      } else if ('message' in err) {
        errorMessage = (err as { message: string }).message;
      }
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    alert('Error: ' + errorMessage);
  }

  // ============ CONFIRMAR Y ELIMINAR ============

  confirmarEliminar(padre?: Padres): void {
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

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) this.eliminarPadre();
    });
  }

  eliminarPadre(): void {
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

  // ============ CERRAR MODAL ============

  cerrarModal(): void {
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
}