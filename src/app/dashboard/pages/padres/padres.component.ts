import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PadresService } from '../../../core/services/padres.service';
import { Padres } from '../../../shared/interfaces/padres.interface';
import { forkJoin } from 'rxjs';

interface ApiError {
  status?: number;
  message?: string;
  error?: {
    message?: string;
  };
}

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

  modalAbierto: boolean = false;
  modoEditar: boolean = false;
  padreIdEditar: number | null = null;
  buscandoDni: boolean = false;

  // ESTADO DE TABS
  activeTab: number = 1;

  // VARIABLES DE FORMULARIO
  formPadre: ParentForm = this.getDefaultForm('Padre');
  formMadre: ParentForm = this.getDefaultForm('Madre');

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

  // ✅ Método para buscar DNI en RENIEC
  buscarDniReniec(tipo: 'padre' | 'madre') {
    const formTarget = tipo === 'padre' ? this.formPadre : this.formMadre;
    const dniString = String(formTarget.dni || '').trim();

    if (!dniString || dniString.length !== 8 || !/^\d{8}$/.test(dniString)) {
      alert('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    this.buscandoDni = true;

    this.padresService.buscarDniEnReniec(dniString).subscribe({
      next: (response) => {
        this.buscandoDni = false;
        formTarget.nombres = response.nombres;
        formTarget.apellido_paterno = response.apellidoPaterno;
        formTarget.apellido_materno = response.apellidoMaterno;
        alert('✅ Datos encontrados en RENIEC. Complete los campos restantes.');
      },
      error: (err) => {
        this.buscandoDni = false;
        console.error('Error al buscar DNI:', err);

        if (err.status === 404) {
          alert('❌ DNI no encontrado en RENIEC');
        } else if (err.status === 401) {
          alert('❌ Error autenticación con RENIEC (Token).');
        } else if (err.status === 400) {
          alert('❌ DNI inválido. Debe tener 8 dígitos.');
        } else {
          alert('❌ Error al consultar DNI: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  // Variables para asignar estudiantes compartidas
  dniEstudiante: string = '';
  estudiantesAsignados: any[] = [];

  buscarEstudiante() {
    if (this.dniEstudiante.length !== 8) {
      alert('El DNI debe tener 8 dígitos');
      return;
    }

    this.padresService.getEstudianteByDni(this.dniEstudiante).subscribe({
      next: (estudiante) => {
        if (!estudiante) {
          alert('Estudiante no encontrado');
          return;
        }

        const duplicado = this.estudiantesAsignados.find(e => e.dni === estudiante.dni);
        if (duplicado) {
          alert('El estudiante ya está en la lista');
          return;
        }

        this.estudiantesAsignados.push(estudiante);
        this.dniEstudiante = ''; // Limpiar campo
      },
      error: (err) => {
        console.error('Error al buscar estudiante:', err);
        alert('Error al buscar estudiante (ver consola)');
      }
    });
  }

  eliminarEstudianteDeLista(index: number) {
    this.estudiantesAsignados.splice(index, 1);
  }

  abrirEditar(padre?: Padres) {
    if (padre) {
      this.modoEditar = true;
      this.padreIdEditar = padre.padre_id || padre.id || null;
      this.cargarDatosEnFormulario(padre);
      this.modalAbierto = true;
    }
  }

  abrirAgregar() {
    this.modoEditar = false;
    this.padreIdEditar = null;
    this.limpiarFormulario();
    this.activeTab = 1;
    this.modalAbierto = true;
    this.cd.detectChanges();
  }

  limpiarFormulario() {
    this.formPadre = this.getDefaultForm('Padre');
    this.formMadre = this.getDefaultForm('Madre');
    this.estudiantesAsignados = [];
    this.dniEstudiante = '';
  }

  cargarDatosEnFormulario(padre: Padres) {
    this.limpiarFormulario();

    const parentData = {
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
        next: (data) => {
          this.estudiantesAsignados = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  async guardarPadre() {
    if (this.modoEditar && this.padreIdEditar) {
      // Editar solo la pestaña activa / padre correspondiente
      const formData = this.activeTab === 2 ? this.formMadre : this.formPadre;

      if (!formData.nombres || !formData.apellido_paterno || !formData.dni || !formData.tipo_relacion) {
        alert('Por favor complete los campos obligatorios del padre editado');
        return;
      }

      try {
        await this.padresService.updatePadre(this.padreIdEditar, formData).toPromise();
        await this.sincronizarEstudiantesAsignados(this.padreIdEditar);
        this.mostrarExito('Registro actualizado correctamente');
      } catch (err) {
        this.mostrarError(err);
      }
    } else {
      // MODO AGREGAR: Evaluar si guardan 1 o 2 apoderados
      const savePadre = !!(this.formPadre.dni && this.formPadre.nombres);
      const saveMadre = !!(this.formMadre.dni && this.formMadre.nombres);

      if (!savePadre && !saveMadre) {
        alert('Debe rellenar al menos los datos de un apoderado (o Padre o Madre)');
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
        const promesas = [];
        let idPadreFinal = null;
        let idMadreFinal = null;

        // 1. Guardar Padre
        if (savePadre) {
          const respPadre = await this.padresService.createPadre(this.formPadre).toPromise();
          idPadreFinal = respPadre?.padre_id || respPadre?.id;
        }

        // 2. Guardar Madre
        if (saveMadre) {
          const respMadre = await this.padresService.createPadre(this.formMadre).toPromise();
          idMadreFinal = respMadre?.padre_id || respMadre?.id;
        }

        // 3. Asignar Hijos a ambos
        const asignacionesPromises = [];
        for (const est of this.estudiantesAsignados) {
          const estId = est.estudiante_id || est.id;
          if (idPadreFinal) asignacionesPromises.push(this.padresService.assignEstudiante(idPadreFinal, estId).toPromise());
          if (idMadreFinal) asignacionesPromises.push(this.padresService.assignEstudiante(idMadreFinal, estId).toPromise());
        }

        if (asignacionesPromises.length > 0) {
          await Promise.all(asignacionesPromises);
        }

        this.mostrarExito('Registro(s) guardado(s) exitosamente');
      } catch (err) {
        this.mostrarError(err);
      }
    }
  }

  async sincronizarEstudiantesAsignados(padreId: number) {
    try {
      const asignacionesActuales = await this.padresService.getEstudiantesAsignados(padreId).toPromise();
      if (!asignacionesActuales) return;

      const mapaActual = new Map();
      asignacionesActuales.forEach(a => mapaActual.set(a.estudiante_id, a));

      const mapaNuevo = new Map();
      this.estudiantesAsignados.forEach(e => mapaNuevo.set(e.estudiante_id || e.id, e));

      for (const [id, _] of mapaActual) {
        if (!mapaNuevo.has(id)) {
          await this.padresService.removeEstudiante(padreId, id).toPromise();
        }
      }

      for (const [id, _] of mapaNuevo) {
        if (!mapaActual.has(id)) {
          await this.padresService.assignEstudiante(padreId, id).toPromise();
        }
      }
    } catch (err: unknown) {
      console.error('Error sincronizando estudiantes:', err);
      throw new Error('Error al sincronizar hijos');
    }
  }

  mostrarExito(msg: string) {
    alert(msg);
    this.cerrarModal();
    this.cargarPadres();
  }

  mostrarError(err: unknown) {
    console.error('Error:', err);
    let errorMessage = 'Error desconocido';
    if (err && typeof err === 'object') {
      if ('error' in err && err.error && typeof err.error === 'object' && 'message' in err.error) {
        errorMessage = (err.error as { message: string }).message;
      } else if ('message' in err) {
        errorMessage = (err as { message: string }).message;
      }
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    alert('Error: ' + errorMessage);
  }

  padreIdEliminar: number | null = null;
  confirmarEliminar(padre?: Padres) {
    if (padre) {
      this.padreIdEliminar = padre.padre_id || padre.id || null;
    }
    if (!this.padreIdEliminar) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación',
        message: '¿Está seguro de eliminar este padre?',
        icon: 'fa-solid fa-triangle-exclamation',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.eliminarPadre();
    });
  }

  eliminarPadre() {
    if (this.padreIdEliminar) {
      this.padresService.deletePadre(this.padreIdEliminar).subscribe({
        next: () => {
          this.padreIdEliminar = null;
          this.mostrarExito('Padre eliminado');
        },
        error: (err: any) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
        }
      });
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

}
