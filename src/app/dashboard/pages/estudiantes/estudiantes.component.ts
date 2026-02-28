import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Estudiantes, EstudiantesCreate } from '../../../shared/interfaces/estudiantes.interface';
import { EstudiantesService } from '../../../core/services/estudiantes.service';

@Component({
  selector: 'app-estudiantes',
  standalone: false,
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css'
})
export class EstudiantesComponent {

  constructor(private dialog: MatDialog, private estudiantesService: EstudiantesService) { }

  modalAbierto: boolean = false;
  modoEditar: boolean = false;
  estudiantes: Estudiantes[] = [];
  estudianteOriginal?: Estudiantes;
  dniBusqueda: string = '';
  cantidadMostrar: number = 10; //cantidad de registros a mostrar
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
    estado: 'Activo'
  }

  // // Variables del formulario
  // nombres: string = '';
  // apellido_paterno: string = '';
  // apellido_materno: string = '';
  // dni: string = '';
  // fecha_nacimiento: string = '';
  // genero: string = '';

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {
    this.estudiantesService.getEstudiantes().subscribe(data => {
      this.estudiantesOriginales = data;
      this.aplicarFiltros();
    })
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
      lista = lista.filter(e =>
        e.dni.includes(this.dniBusqueda.trim())
      );
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
      alert('Por favor ingrese un DNI válido de 8 dígitos');
      return;
    }

    this.buscandoDni = true;

    this.estudiantesService.buscarDniEnReniec(dniString).subscribe({
      next: (response) => {
        this.buscandoDni = false;

        console.log('Respuesta de RENIEC:', response);

        // Autocompletar campos con los datos de RENIEC
        this.estudiante.nombres = this.formatearNombre(response.nombres);
        this.estudiante.apellido_paterno = this.formatearNombre(response.apellidoPaterno);
        this.estudiante.apellido_materno = this.formatearNombre(response.apellidoMaterno);

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

  formatearNombre(texto: string): string {
    return texto
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  addEstudiante(): void {
    const dni = this.estudiante.dni.trim();
    const nombres = this.estudiante.nombres.trim().toLowerCase();
    const apPaterno = this.estudiante.apellido_paterno.trim().toLowerCase();
    const apMaterno = this.estudiante.apellido_materno.trim().toLowerCase();

    if (!dni || !nombres || !apPaterno || !apMaterno || !this.estudiante.fecha_nacimiento || !this.estudiante.genero) {
      alert('Completa todos los campos');
      return;
    }

    const dniExiste = this.estudiantes.some(e => e.dni === dni);

    if (dniExiste) {
      alert('Ya existe un estudiante con ese DNI');
      return;
    }

    const nombreCompletoExiste = this.estudiantes.some(e =>
      e.nombres.trim().toLowerCase() === nombres &&
      e.apellido_paterno.trim().toLowerCase() === apPaterno &&
      e.apellido_materno.trim().toLowerCase() === apMaterno
    );

    if (nombreCompletoExiste) {
      alert('Ya existe un estudiante con el mismo nombre y apellidos');
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
        this.cargarEstudiantes();
        this.cerrarModal();
        alert('Se agregó el estudiante');
      },
      error: (err) => {
        alert(err.error?.message || 'Error al registrar estudiante');
      }
    });

  }

  updateEstudiante(): void {

    if (!this.estudianteOriginal) return;

    const cambios: Partial<Estudiantes> = {};

    if (this.estudiante.nombres !== this.estudianteOriginal.nombres)
      cambios.nombres = this.estudiante.nombres;

    if (this.estudiante.apellido_paterno !== this.estudianteOriginal.apellido_paterno)
      cambios.apellido_paterno = this.estudiante.apellido_paterno;

    if (this.estudiante.apellido_materno !== this.estudianteOriginal.apellido_materno)
      cambios.apellido_materno = this.estudiante.apellido_materno;

    if (this.estudiante.fecha_nacimiento !== this.estudianteOriginal.fecha_nacimiento)
      cambios.fecha_nacimiento = this.estudiante.fecha_nacimiento;

    if (this.estudiante.genero !== this.estudianteOriginal.genero)
      cambios.genero = this.estudiante.genero;

    if (Object.keys(cambios).length === 0) {
      alert('No se realizaron cambios');
      return;
    }

    const nombreCompletoExiste = this.estudiantes.some(e =>
      e.estudiante_id !== this.estudiante.estudiante_id &&
      e.nombres.trim().toLowerCase() === this.estudiante.nombres.trim().toLowerCase() &&
      e.apellido_paterno.trim().toLowerCase() === this.estudiante.apellido_paterno.trim().toLowerCase() &&
      e.apellido_materno.trim().toLowerCase() === this.estudiante.apellido_materno.trim().toLowerCase()
    );

    if (nombreCompletoExiste) {
      alert('Ya existe un estudiante con el mismo nombre y apellidos');
      return;
    }

    this.estudiantesService
      .updateEstudiante(this.estudiante.estudiante_id, cambios)
      .subscribe({
        next: () => {
          this.cargarEstudiantes();
          this.cerrarModal();
          alert('Se actualizó el estudiante');
        },
        error: (err) => {
          alert(err.error?.message || 'Error al actualizar estudiante');
        }
      });
  }

  guardar(): void {
    if (this.modoEditar) {
      this.updateEstudiante();
    } else {
      this.addEstudiante();
    }
  }

  cambiarEstado(estudiante: Estudiantes) {
    const nuevoEstado = estudiante.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const accion = nuevoEstado === 'Activo' ? 'activar' : 'desactivar';

    if (confirm(`¿Seguro que deseas ${accion} a este estudiante?`)) {

      this.estudiantesService
        .cambiarEstado(estudiante.estudiante_id, nuevoEstado)
        .subscribe(() => {
          estudiante.estado = nuevoEstado;
          console.log('Estado actualizado');
        });

    }
  }

  abrirEditar = (estudiante: Estudiantes) => {
    this.estudiante = { ...estudiante }
    this.estudianteOriginal = { ...estudiante }
    this.modoEditar = true;
    this.modalAbierto = true;
  }

  abrirAgregar(): void {
    this.estudiante = {
      estudiante_id: 0,
      dni: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      genero: '',
      estado: 'Activo'
    }
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
