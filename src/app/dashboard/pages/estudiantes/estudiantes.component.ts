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

  addEstudiante(): void {
    if (!this.estudiante.dni || !this.estudiante.nombres.trim()
      || !this.estudiante.apellido_paterno.trim()
      || !this.estudiante.apellido_materno.trim()
      || !this.estudiante.fecha_nacimiento.trim()
      || !this.estudiante.genero
    ) {
      alert('Completa todos los campos');
      return;
    }

    const dniExiste = this.estudiantes.some(e =>
      e.dni === this.estudiante.dni
    );

    if (dniExiste) {
      alert('Ya existe un estudiante con ese DNI');
      return;
    }

    const nombreCompletoExiste = this.estudiantes.some(e =>
      e.nombres.trim().toLowerCase() === this.estudiante.nombres.trim().toLowerCase() &&
      e.apellido_paterno.trim().toLowerCase() === this.estudiante.apellido_paterno.trim().toLowerCase() &&
      e.apellido_materno.trim().toLowerCase() === this.estudiante.apellido_materno.trim().toLowerCase()
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

    this.estudiantesService.addEstudiante(payload).subscribe(() => {
      this.cargarEstudiantes();
      this.cerrarModal();
      alert('Se agregó el estudiante');
    });
  }

  updateEstudiante(): void {

    if (!this.estudianteOriginal) return;

    const cambios: Partial<Estudiantes> = {};

    if (this.estudiante.dni !== this.estudianteOriginal.dni)
      cambios.dni = this.estudiante.dni;

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

    this.estudiantesService
      .updateEstudiante(this.estudiante.estudiante_id, cambios)
      .subscribe({
        next: () => {
          this.cargarEstudiantes();
          this.cerrarModal();
          alert('Se actualizó el estudiante');
        },
        error: (err) => {
          if (err.error?.message) {
            alert(err.error.message[0]); // mensaje del DTO
          } else {
            alert('Error al actualizar el estudiante');
          }
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
