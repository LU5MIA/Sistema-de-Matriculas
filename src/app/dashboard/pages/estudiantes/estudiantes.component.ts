import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Estudiantes,
  EstudiantesCreate,
} from '../../../shared/interfaces/estudiantes.interface';
import { EstudiantesService } from '../../../core/services/estudiantes.service';
import { AlertaService } from '../../../core/services/alerta.service';

@Component({
  selector: 'app-estudiantes',
  standalone: false,
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css',
})
export class EstudiantesComponent {
  constructor(
    private dialog: MatDialog,
    private estudiantesService: EstudiantesService,
    private alertaService: AlertaService,
  ) {}

  cargando: boolean = false;
  modalAbierto: boolean = false;
  modoEditar: boolean = false;
  estudiantes: Estudiantes[] = [];
  estudianteOriginal?: Estudiantes;
  dniBusqueda: string = '';
  cantidadMostrar: number = 10; 
  estudiantesOriginales: Estudiantes[] = [];
  buscandoDni: boolean = false;
  estudiante: Estudiantes = {
    estudiante_id: 0,
    dni: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: '',
    genero: '',
    estado: 'Activo',
  };

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.estudiantesService.getEstudiantes().subscribe((data) => {
      this.estudiantesOriginales = data;
      this.aplicarFiltros();
    });
  }

  cambiarCantidad(event: Event): void {
    const valor = Number((event.target as HTMLSelectElement).value);
    this.cantidadMostrar = valor;
    this.aplicarFiltros();
  }

  onDniChange(valor: string): void {
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    this.dniBusqueda = soloNumeros.slice(0, 8);
    this.filtrarPorDni();
  }

  filtrarPorDni(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let lista = [...this.estudiantesOriginales];

    // filtro por DNI
    if (this.dniBusqueda.trim() !== '') {
      lista = lista.filter((e) => e.dni.includes(this.dniBusqueda.trim()));
    }

    // filtro por cantidad
    if (this.cantidadMostrar > 0) {
      lista = lista.slice(0, this.cantidadMostrar);
    }

    this.estudiantes = lista;
  }

  // ✅ Método para buscar DNI en RENIEC
  buscarDniReniec() {
    // Convertir a string y limpiar espacios
    const dniString = String(this.estudiante.dni || '').trim();

    console.log('DNI ingresado:', dniString); // ← Debug
    console.log('Longitud:', dniString.length); // ← Debug

    // Validar que el DNI tenga 8 dígitos
    if (!dniString || dniString.length !== 8 || !/^\d{8}$/.test(dniString)) {
      this.alertaService.mostrar(
        'DNI inválido. Debe tener 8 dígitos numéricos.',
        'info',
      );
      return;
    }

    this.buscandoDni = true;

    this.estudiantesService.buscarDniEnReniec(dniString).subscribe({
      next: (response) => {
        this.buscandoDni = false;

        console.log('Respuesta de RENIEC:', response);

        // Autocompletar campos con los datos de RENIEC
        this.estudiante.nombres = this.formatearNombre(response.nombres);
        this.estudiante.apellido_paterno = this.formatearNombre(
          response.apellidoPaterno,
        );
        this.estudiante.apellido_materno = this.formatearNombre(
          response.apellidoMaterno,
        );

        this.alertaService.mostrar(
          'Datos encontrados en RENIEC. Complete los campos restantes.',
          'success',
        );
      },
      error: (err) => {
        this.buscandoDni = false;
        console.error('Error al buscar DNI:', err);

        if (err.status === 404) {
          this.alertaService.mostrar('DNI no encontrado en RENIEC', 'error');
        } else if (err.status === 401) {
          this.alertaService.mostrar(
            'Error de autenticación con el servicio de RENIEC. Verifique el token.',
            'error',
          );
        } else if (err.status === 400) {
          this.alertaService.mostrar(
            'DNI inválido. Debe tener 8 dígitos numéricos.',
            'error',
          );
        } else {
          this.alertaService.mostrar(
            'Error al consultar DNI: ' + (err.error?.message || err.message),
            'error',
          );
        }
      },
    });
  }

  formatearNombre(texto: string): string {
    return texto
      .toLowerCase()
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  addEstudiante(): void {
    const dni = this.estudiante.dni.trim();
    const nombres = this.estudiante.nombres.trim().toLowerCase();
    const apPaterno = this.estudiante.apellido_paterno.trim().toLowerCase();
    const apMaterno = this.estudiante.apellido_materno.trim().toLowerCase();

    if (
      !dni ||
      !nombres ||
      !apPaterno ||
      !apMaterno ||
      !this.estudiante.fecha_nacimiento ||
      !this.estudiante.genero
    ) {
      this.alertaService.mostrar('Completa todos los campos', 'info');
      return;
    }

    const dniExiste = this.estudiantes.some((e) => e.dni === dni);

    if (dniExiste) {
      this.alertaService.mostrar('Ya existe un estudiante con ese DNI', 'info');
      return;
    }

    const nombreCompletoExiste = this.estudiantes.some(
      (e) =>
        e.nombres.trim().toLowerCase() === nombres &&
        e.apellido_paterno.trim().toLowerCase() === apPaterno &&
        e.apellido_materno.trim().toLowerCase() === apMaterno,
    );

    if (nombreCompletoExiste) {
      this.alertaService.mostrar(
        'Ya existe un estudiante con el mismo nombre y apellidos',
        'info',
      );
      return;
    }

    const payload: EstudiantesCreate = {
      dni: this.estudiante.dni,
      nombres: this.estudiante.nombres,
      apellido_paterno: this.estudiante.apellido_paterno,
      apellido_materno: this.estudiante.apellido_materno,
      fecha_nacimiento: this.estudiante.fecha_nacimiento,
      genero: this.estudiante.genero,
    };

    this.estudiantesService.addEstudiante(payload).subscribe({
      next: () => {
        this.mostrarMensaje('Estudiante registrado exitosamente', 'success');
        this.cargarEstudiantes();
        this.cerrarModal();
      },
      error: (err) => {
        this.alertaService.mostrar(
          err.error?.message || 'Error al registrar estudiante',
          'error',
        );
      },
    });
  }

  updateEstudiante(): void {
    if (!this.estudianteOriginal) return;

    const cambios: Partial<Estudiantes> = {};

    if (this.estudiante.nombres !== this.estudianteOriginal.nombres)
      cambios.nombres = this.estudiante.nombres;

    if (
      this.estudiante.apellido_paterno !==
      this.estudianteOriginal.apellido_paterno
    )
      cambios.apellido_paterno = this.estudiante.apellido_paterno;

    if (
      this.estudiante.apellido_materno !==
      this.estudianteOriginal.apellido_materno
    )
      cambios.apellido_materno = this.estudiante.apellido_materno;

    if (
      this.estudiante.fecha_nacimiento !==
      this.estudianteOriginal.fecha_nacimiento
    )
      cambios.fecha_nacimiento = this.estudiante.fecha_nacimiento;

    if (this.estudiante.genero !== this.estudianteOriginal.genero)
      cambios.genero = this.estudiante.genero;

    if (Object.keys(cambios).length === 0) {
      this.alertaService.mostrar('No se realizaron cambios', 'info');
      return;
    }

    const nombreCompletoExiste = this.estudiantes.some(
      (e) =>
        e.estudiante_id !== this.estudiante.estudiante_id &&
        e.nombres.trim().toLowerCase() ===
          this.estudiante.nombres.trim().toLowerCase() &&
        e.apellido_paterno.trim().toLowerCase() ===
          this.estudiante.apellido_paterno.trim().toLowerCase() &&
        e.apellido_materno.trim().toLowerCase() ===
          this.estudiante.apellido_materno.trim().toLowerCase(),
    );

    if (nombreCompletoExiste) {
      this.alertaService.mostrar(
        'Ya existe un estudiante con el mismo nombre y apellidos',
        'info',
      );
      return;
    }

    this.estudiantesService
      .updateEstudiante(this.estudiante.estudiante_id, cambios)
      .subscribe({
        next: () => {
          this.cargarEstudiantes();
          this.cerrarModal();
          this.alertaService.mostrar('Se actualizó el estudiante', 'success');
        },
        error: (err) => {
          this.alertaService.mostrar(
            err.error?.message || 'Error al actualizar estudiante',
            'error',
          );
        },
      });
  }

  guardar(): void {
    if (this.modoEditar) {
      this.updateEstudiante();
    } else {
      this.addEstudiante();
    }
  }

  // Variables para mostrar mensajes de éxito/error

  mensaje: string = '';
  tipoMensaje: 'success' | 'error' = 'success';

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;

    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  ocultando = false;

  cerrarAlerta() {
    this.ocultando = true;

    setTimeout(() => {
      this.mensaje = '';
      this.ocultando = false;
    }, 300); // mismo tiempo que la animación
  }

  mostrarConfirmacionEstado = false;

  estudianteSeleccionado!: Estudiantes;

  nuevoEstado!: string;

  cambiarEstado(estudiante: Estudiantes) {
    this.estudianteSeleccionado = estudiante;

    this.nuevoEstado = estudiante.estado === 'Activo' ? 'Inactivo' : 'Activo';

    this.mostrarConfirmacionEstado = true;
  }

  confirmarCambioEstado() {
    this.estudiantesService
      .cambiarEstado(
        this.estudianteSeleccionado.estudiante_id,
        this.nuevoEstado,
      )
      .subscribe({
        next: () => {
          this.estudianteSeleccionado.estado = this.nuevoEstado;

          this.mostrarConfirmacionEstado = false;

          this.alertaService.mostrar(
            `Estudiante ${
              this.nuevoEstado === 'Activo' ? 'activado' : 'desactivado'
            } correctamente`,
            'success',
          );
        },

        error: () => {
          this.alertaService.mostrar('Error al cambiar estado', 'error');
        },
      });
  }

  cancelarCambioEstado() {
    this.mostrarConfirmacionEstado = false;
  }

  abrirEditar = (estudiante: Estudiantes) => {
    this.estudiante = { ...estudiante };
    this.estudianteOriginal = { ...estudiante };
    this.modoEditar = true;
    this.modalAbierto = true;
  };

  abrirAgregar(): void {
    this.estudiante = {
      estudiante_id: 0,
      dni: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      genero: '',
      estado: 'Activo',
    };
    this.modoEditar = false;
    this.modalAbierto = true;
  }

  cerrarModal() {
    const modal = document.querySelector('.modal-content');
    if (modal) {
      modal.classList.add('salir');
      setTimeout(() => {
        this.modalAbierto = false;
      }, 250); // tiempo que la animación dura
    }
  }
}
