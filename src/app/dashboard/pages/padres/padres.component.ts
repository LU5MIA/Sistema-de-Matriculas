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
        console.log('Padres cargados:', this.padres);
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

  // ✅ Método para buscar DNI en RENIEC
  buscarDniReniec() {
    // Convertir a string y limpiar espacios
    const dniString = String(this.dni || '').trim();

    console.log('DNI ingresado:', dniString); // ← Debug
    console.log('Longitud:', dniString.length); // ← Debug

    // Validar que el DNI tenga 8 dígitos
    if (!dniString || dniString.length !== 8 || !/^\d{8}$/.test(dniString)) {
      alert('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    this.buscandoDni = true;

    this.padresService.buscarDniEnReniec(dniString).subscribe({
      next: (response) => {
        this.buscandoDni = false;

        console.log('Respuesta de RENIEC:', response);

        // Autocompletar campos con los datos de RENIEC
        this.nombres = response.nombres;
        this.apellido_paterno = response.apellidoPaterno;
        this.apellido_materno = response.apellidoMaterno;

        alert('✅ Datos encontrados en RENIEC. Complete los campos restantes.');
      },
      error: (err) => {
        this.buscandoDni = false;
        console.error('Error al buscar DNI:', err);

        if (err.status === 404) {
          alert('❌ DNI no encontrado en RENIEC');
        } else if (err.status === 401) {
          alert('❌ Error de autenticación con el servicio de RENIEC. Verifique el token.');
        } else if (err.status === 400) {
          alert('❌ DNI inválido. Debe tener 8 dígitos numéricos.');
        } else {
          alert('❌ Error al consultar DNI: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  // Variables del formulario
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

  // Variables para asignar estudiantes 
  dniEstudiante: string = '';
  relacionEstudiante: string = '';
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

        // Verificar duplicados
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
    console.log('Abriendo modal agregar...');
    this.modoEditar = false;
    this.padreIdEditar = null;
    this.limpiarFormulario();
    this.modalAbierto = true;
    console.log('modalAbierto set to true');
    this.cd.detectChanges();
  }

  limpiarFormulario() {
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

  // En padres.component.ts

  async guardarPadre() {
    if (!this.nombres || !this.apellido_paterno || !this.dni || !this.tipoRelacion) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const padreData = {
      nombres: this.nombres,
      apellido_paterno: this.apellido_paterno,
      apellido_materno: this.apellido_materno,
      dni: this.dni,
      telefono: this.telefono,
      email: this.email,
      direccion: this.direccion,
      tipo_relacion: this.tipoRelacion,
      detalles_relacion: this.detallesRelacion,
      es_contacto_principal: this.esApoderadoPrincipal
    };

    try {
      if (this.modoEditar && this.padreIdEditar) {
        // 1. Actualizar datos del padre
        await this.padresService.updatePadre(this.padreIdEditar, padreData).toPromise();

        // 2. Sincronizar estudiantes asignados
        await this.sincronizarEstudiantesAsignados(this.padreIdEditar);

        this.mostrarExito('Padre actualizado correctamente');
      } else {
        // 1. Crear nuevo padre
        const nuevoPadre = await this.padresService.createPadre(padreData).toPromise();

        if (!nuevoPadre) {
          throw new Error('No se recibió respuesta del servidor al crear el padre');
        }

        const id = nuevoPadre.padre_id || nuevoPadre.id;

        if (id && this.estudiantesAsignados.length > 0) {
          // 2. Asignar estudiantes (en creación no hay que eliminar)
          const asignaciones = this.estudiantesAsignados.map(est =>
            this.padresService.assignEstudiante(id, est.estudiante_id || est.id)
          );

          await forkJoin(asignaciones).toPromise();
        }

        this.mostrarExito('Padre registrado correctamente');
      }

      this.cerrarModal();
      this.cargarPadres();

    } catch (err: unknown) {
      console.error('Error al guardar:', err);
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
  }

  async sincronizarEstudiantesAsignados(padreId: number) {
    try {
      // Obtener estudiantes actualmente asignados
      const asignacionesActuales = await this.padresService
        .getEstudiantesAsignados(padreId)
        .toPromise();

      // Verificar que asignacionesActuales no sea undefined
      if (!asignacionesActuales) {
        console.warn('No se pudieron obtener las asignaciones actuales');
        return;
      }

      // Crear mapas para comparación
      const mapaActual = new Map();
      asignacionesActuales.forEach(a => {
        mapaActual.set(a.estudiante_id, a);
      });

      const mapaNuevo = new Map();
      this.estudiantesAsignados.forEach(e => {
        mapaNuevo.set(e.estudiante_id || e.id, e);
      });

      // Eliminar relaciones que ya no están
      for (const [id, estudiante] of mapaActual) {
        if (!mapaNuevo.has(id)) {
          await this.padresService.removeEstudiante(padreId, id).toPromise();
        }
      }

      // Agregar nuevas relaciones
      for (const [id, estudiante] of mapaNuevo) {
        if (!mapaActual.has(id)) {
          await this.padresService
            .assignEstudiante(padreId, id)
            .toPromise();
        }
      }

    } catch (err: unknown) {
      console.error('Error sincronizando estudiantes:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        throw new Error((err as { message: string }).message);
      } else {
        throw new Error('Error desconocido al sincronizar estudiantes');
      }
    }
  }

  mostrarExito(msg: string) {
    alert(msg);
    this.cerrarModal();
    this.cargarPadres();
  }

  padreIdEliminar: number | null = null;

  confirmarEliminar(padre?: Padres) {
    if (padre) {
      this.padreIdEliminar = padre.padre_id || padre.id || null;
    }

    // Si no se pasa padre, asumimos que se llamó desde el modal viejo? No, siempre pasamos padre ahora.
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
