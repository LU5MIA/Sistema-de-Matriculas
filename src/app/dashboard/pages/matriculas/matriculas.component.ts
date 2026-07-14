import { Component } from '@angular/core';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
  Matriculas,
  MatriculasVista,
  MatriculaUpdatePayload,
} from '../../../shared/interfaces/matriculas.interface';
import { MatriculasService } from '../../../core/services/matriculas.service';
import { forkJoin } from 'rxjs';
import { AulasService } from '../../../core/services/aulas.service';
import { PadresService } from '../../../core/services/padres.service';
import { Aulas } from '../../../shared/interfaces/aula.interface';
import { Estudiantes } from '../../../shared/interfaces/estudiantes.interface';
import { EstudiantesService } from '../../../core/services/estudiantes.service';
import { AlertaService } from '../../../core/services/alerta.service';

@Component({
  selector: 'app-matriculas',
  standalone: false,
  templateUrl: './matriculas.component.html',
  styleUrl: './matriculas.component.css',
})
export class MatriculasComponent {
  constructor(
    private matriculasService: MatriculasService,
    private aulasService: AulasService,
    private alertaService: AlertaService,
  ) {}

  cargando: boolean = false;

  modalMatriculaAbierto: boolean = false;
  modalEditarMatricula: boolean = false;

  //form de matriculas
  seccionActiva: 'estudiante' | 'detalles' | 'apoderado' = 'estudiante';
  modoEditar: boolean = false;
  //procedenciaSeleccionado: string = '';

  //filtros
  codigoBusqueda: string = '';
  cantidad_Mostrar: number = 10;

  //busqueda por dni estudiante
  dni_estudiante: string = '';
  estudiante: Estudiantes | null = null;

  //busqueda por dni padre
  dni_padre: string = '';
  padre: any = null;
  buscandoDni: boolean = false;

  //aulas de la bd
  aulas: Aulas[] = [];
  niveles: string[] = [];
  grados: string[] = [];
  secciones: string[] = [];

  //matriculas
  matriculaOriginal?: Matriculas;
  matriculasOriginales: Matriculas[] = [];
  matriculasVista: MatriculasVista[] = [];
  matriculasVistaOriginal: MatriculasVista[] = [];

  // nueva matricula
  matricula: Matriculas = {
    matricula_id: 0,
    codigo_matricula: '',
    situacion: '',
    procedencia: '',
    ie_procedencia: '',
    inscripcion: '',
    matricula: '',
    mensualidad: '',
    fecha_matricula: '',
    estado: 'Activo',
    estudiante: null,
    aula: null,
  };

  ngOnInit(): void {
    this.cargarMatriculas();
  }

  cargarMatriculas(): void {
    this.matriculasService.getMatriculas().subscribe((data) => {
      const vista = data.map((m) => ({
        ...m,
        nivel: m.aula?.nivel ?? 'Desconocido',
        grado: m.aula?.grado ?? 'Desconocido',
        seccion: m.aula?.seccion ?? 'Desconocido',
        dni: m.estudiante?.dni ?? 'Desconocido',
      }));

      this.matriculasVistaOriginal = [...vista];
      this.matriculasVista = [...vista];
      this.aplicarFiltros();
    });

    this.aulasService.getAulas().subscribe((data) => {
      this.aulas = data;
      this.niveles = [...new Set(data.map((a) => a.nivel))];
    });
  }

  buscarPorDni(): void {
    if (!this.dni_estudiante || this.dni_estudiante.length !== 8) {
      this.alertaService.mostrar('Ingrese un DNI válido de 8 dígitos', 'info');
      return;
    }

    this.buscandoDni = true;

    this.matriculasService
      .buscarEstudiantePorDni(this.dni_estudiante)
      .subscribe({
        next: (estudiante) => {
          setTimeout(() => {
            this.buscandoDni = false;
            this.estudiante = estudiante;
            this.matricula.estudiante = estudiante;
          }, 800);
          this.alertaService.mostrar(
            'Estudiante encontrado, puede continuar',
            'success'
          );
        },

        error: () => {
          this.buscandoDni = false;
          this.alertaService.mostrar(
            'Estudiante no encontrado, puede registrarlo',
            'error'
          );
        },
      });
  }

  //filtro para nivel, grado y sección en la tabla

  filtro = {
    nivel: 'todos',
    grado: 'todos',
    seccion: 'todos',
  };

  onFiltroNivelChange(event: Event) {
    this.filtro.nivel = (event.target as HTMLSelectElement).value;

    if (this.filtro.nivel === 'todos') {
      this.grados = [];
      this.secciones = [];
      this.filtro.grado = 'todos';
      this.filtro.seccion = 'todos';
      return;
    }

    this.grados = [
      ...new Set(
        this.aulas
          .filter((a) => a.nivel === this.filtro.nivel)
          .map((a) => a.grado),
      ),
    ];

    this.filtro.grado = 'todos';
    this.secciones = [];
  }

  onFiltroGradoChange(event: Event) {
    this.filtro.grado = (event.target as HTMLSelectElement).value;

    if (this.filtro.grado === 'todos') {
      this.secciones = [];
      this.filtro.seccion = 'todos';
      return;
    }

    this.secciones = [
      ...new Set(
        this.aulas
          .filter(
            (a) =>
              a.nivel === this.filtro.nivel && a.grado === this.filtro.grado,
          )
          .map((a) => a.seccion),
      ),
    ];

    this.filtro.seccion = 'todos';
  }

  aplicarFiltroTabla(): void {
    this.matriculasVista = this.matriculasVistaOriginal.filter((m) => {
      if (this.filtro.nivel !== 'todos' && m.nivel !== this.filtro.nivel) {
        return false;
      }

      if (this.filtro.grado !== 'todos' && m.grado !== this.filtro.grado) {
        return false;
      }

      if (
        this.filtro.seccion !== 'todos' &&
        m.seccion !== this.filtro.seccion
      ) {
        return false;
      }

      return true;
    });
  }

  //filtro para cantidad a mostrar

  cambiarCantidad(event: Event): void {
    const valor = Number((event.target as HTMLSelectElement).value);
    this.cantidad_Mostrar = valor;
    this.aplicarFiltros();
  }

  onCodigoChange(valor: string): void {
    const sinEspacios = valor.replace(/\s/g, '');
    this.codigoBusqueda = sinEspacios;
    this.filtrarPorCodigo();
  }

  filtrarPorCodigo(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let lista = [...this.matriculasVistaOriginal];

    if (this.codigoBusqueda.trim() !== '') {
      lista = lista.filter((m) =>
        m.codigo_matricula?.includes(this.codigoBusqueda.trim()),
      );
    }

    if (this.cantidad_Mostrar > 0) {
      lista = lista.slice(0, this.cantidad_Mostrar);
    }

    this.matriculasVista = lista;
  }

  addMatricula(): void {
    if (!this.matricula.estudiante?.estudiante_id) {
      this.alertaService.mostrar('Seleccione un estudiante válido', 'info');
      this.seccionActiva = 'estudiante';
      return;
    }

    if (!this.matricula.aula?.aula_id) {
      this.alertaService.mostrar('Seleccione un aula válida', 'info');
      this.seccionActiva = 'detalles';
      return;
    }
    if (!this.matricula.situacion || !this.matricula.procedencia) {
      this.alertaService.mostrar('Complete los datos de la matrícula', 'info');
      this.seccionActiva = 'detalles';
      return;
    }

    // VALIDAR MONTOS VACÍOS
    if (
      this.matricula.inscripcion === '' ||
      this.matricula.inscripcion == null ||
      this.matricula.matricula === '' ||
      this.matricula.matricula == null ||
      this.matricula.mensualidad === '' ||
      this.matricula.mensualidad == null
    ) {
      this.alertaService.mostrar('Complete todos los montos', 'info');
      this.seccionActiva = 'detalles';
      return;
    }

    // VALIDAR QUE SEAN NÚMEROS
    if (
      isNaN(Number(this.matricula.inscripcion)) ||
      isNaN(Number(this.matricula.matricula)) ||
      isNaN(Number(this.matricula.mensualidad))
    ) {
      this.alertaService.mostrar('Montos inválidos', 'error');
      this.seccionActiva = 'detalles';
      return;
    }
    const payload = {
      estudiante_id: this.matricula.estudiante.estudiante_id,
      aula_id: this.matricula.aula.aula_id,
      situacion: this.matricula.situacion,
      procedencia: this.matricula.procedencia,
      ie_procedencia: this.matricula.ie_procedencia,
      inscripcion: Number(this.matricula.inscripcion),
      matricula: Number(this.matricula.matricula),
      mensualidad: Number(this.matricula.mensualidad),
    };

    if (
      isNaN(Number(this.matricula.inscripcion)) ||
      isNaN(Number(this.matricula.matricula)) ||
      isNaN(Number(this.matricula.mensualidad))
    ) {
      this.alertaService.mostrar('Montos inválidos', 'error');
      return;
    }

    this.matriculasService.addMatricula(payload).subscribe({
      next: () => {
        this.mostrarMensajeSimple('Matrícula registrada con éxito', 'success');

        this.cerrarModal();

        this.cargarMatriculas();
      },

      error: (err) => {
        console.error(err);

        const mensaje = err?.error?.message || 'Error al registrar matrícula';

        this.alertaService.mostrar(mensaje, 'error');
      },
    });
  }

  /* ALERTA SIMPLE */
  mensajeSimple: string = '';
  tipoMensajeSimple: 'success' | 'error' = 'success';

  /* ALERTA MODERNA */
  mensajeModal: string = '';
  tipoMensajeModal: 'success' | 'error' | 'info' = 'success';

  mostrarModal: boolean = false;

  ocultando = false;

  mostrarMensajeSimple(texto: string, tipo: 'success' | 'error') {
    this.mensajeSimple = texto;
    this.tipoMensajeSimple = tipo;

    setTimeout(() => {
      this.mensajeSimple = '';
    }, 3000);
  }

  mostrarMensajeModal(texto: string, tipo: 'success' | 'error' | 'info') {
    this.ocultando = false;

    this.mensajeModal = texto;
    this.tipoMensajeModal = tipo;

    this.mostrarModal = true;

    setTimeout(() => {
      // ACTIVAR ANIMACIÓN
      this.ocultando = true;

      // ESPERAR ANIMACIÓN
      setTimeout(() => {
        this.mostrarModal = false;
        this.ocultando = false;
      }, 300);
    }, 3000);
  }

  cerrarAlertaSimple() {
    this.mensajeSimple = '';
  }
  cerrarAlertaModal() {
    this.ocultando = true;

    setTimeout(() => {
      this.mensajeModal = '';
      this.mostrarModal = false;
      this.ocultando = false;
    }, 300);
  }

  onNivelChange(event: Event) {
    const nivel = (event.target as HTMLSelectElement).value;

    this.grados = [
      ...new Set(
        this.aulas.filter((a) => a.nivel === nivel).map((a) => a.grado),
      ),
    ];

    this.secciones = [];
    if (this.matricula.aula) {
      this.matricula.aula.grado = '';
      this.matricula.aula.seccion = '';
    }
  }

  onGradoChange() {
    if (!this.matricula.aula) return;

    this.secciones = [
      ...new Set(
        this.aulas
          .filter(
            (a) =>
              a.nivel === this.matricula.aula?.nivel &&
              a.grado === this.matricula.aula?.grado,
          )
          .map((a) => a.seccion),
      ),
    ];

    if (this.matricula.aula) {
      this.matricula.aula.seccion = '';
    }
  }

  onSeccionChange() {
    if (
      !this.matricula.aula ||
      !this.matricula.aula.nivel ||
      !this.matricula.aula.grado ||
      !this.matricula.aula.seccion
    ) {
      return;
    }

    this.matriculasService
      .buscarAula(
        this.matricula.aula.nivel,
        this.matricula.aula.grado,
        this.matricula.aula.seccion,
      )
      .subscribe({
        next: (aula) => {
          this.matricula.aula = aula;
        },
        error: () => {
          alert('Aula no encontrada');
          this.matricula.aula = null;
        },
      });
  }

  formatearDecimal(campo: 'inscripcion' | 'matricula' | 'mensualidad') {
    const valor = this.matricula[campo];
    if (valor !== null && valor !== undefined && valor !== '') {
      this.matricula[campo] = Number(valor).toFixed(2);
    }
  }

  updateMatricula(): void {
    if (!this.matriculaOriginal) return;

    const cambios: MatriculaUpdatePayload = {};

    if (this.matricula.aula?.aula_id !== this.matriculaOriginal.aula?.aula_id) {
      cambios.aula_id = this.matricula.aula?.aula_id;
    }
    if (this.matricula.situacion !== this.matriculaOriginal.situacion)
      cambios.situacion = this.matricula.situacion;

    if (this.matricula.situacion !== this.matriculaOriginal.situacion)
      cambios.situacion = this.matricula.situacion;

    if (this.matricula.procedencia !== this.matriculaOriginal.procedencia)
      cambios.procedencia = this.matricula.procedencia;

    if (this.matricula.ie_procedencia !== this.matriculaOriginal.ie_procedencia)
      cambios.ie_procedencia = this.matricula.ie_procedencia;

    if (this.matricula.inscripcion !== this.matriculaOriginal.inscripcion)
      cambios.inscripcion = Number(this.matricula.inscripcion);

    if (this.matricula.matricula !== this.matriculaOriginal.matricula)
      cambios.matricula = Number(this.matricula.matricula);

    if (this.matricula.mensualidad !== this.matriculaOriginal.mensualidad)
      cambios.mensualidad = Number(this.matricula.mensualidad);

    if (Object.keys(cambios).length === 0) {
      this.alertaService.mostrar('No se realizaron cambios', 'info');
      return;
    }

    this.matriculasService
      .updateMatricula(this.matricula.matricula_id, cambios)
      .subscribe({
        next: (res) => {
          this.cargarMatriculas();
          this.cerrarModal();
          this.alertaService.mostrar(
            'Matrícula actualizada con éxito',
            'success',
          );
        },
        error: (err) => {
          if (err.error?.message) {
            alert(err.error.message[0]); // mensaje del DTO
          } else {
            this.alertaService.mostrar(
              'Error al actualizar la matrícula',
              'error',
            );
          }
        },
      });
  }

  guardar(): void {
    if (this.modoEditar) {
      this.updateMatricula();
    } else {
      this.addMatricula();
    }
  }

  abrirAgregar(): void {
    this.matricula = {
      matricula_id: 0,
      codigo_matricula: '',
      situacion: '',
      procedencia: '',
      ie_procedencia: '',
      inscripcion: '',
      matricula: '',
      mensualidad: '',
      fecha_matricula: '',
      estado: 'Activo',

      estudiante: {
        estudiante_id: 0,
        dni: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        genero: '',
        fecha_nacimiento: '',
        estado: 'Activo',
      },

      aula: {
        aula_id: 0,
        nivel: '',
        grado: '',
        seccion: '',
      },
    };
    this.modoEditar = false;
    this.modalMatriculaAbierto = true;
  }

  abrirEditar = (matricula: Matriculas) => {
    this.matricula = JSON.parse(JSON.stringify(matricula));
    this.matriculaOriginal = JSON.parse(JSON.stringify(matricula));
    this.dni_estudiante = matricula.estudiante?.dni ?? '';

    if (this.matricula.aula) {
      this.grados = [
        ...new Set(
          this.aulas
            .filter((a) => a.nivel === this.matricula.aula!.nivel)
            .map((a) => a.grado),
        ),
      ];

      this.secciones = [
        ...new Set(
          this.aulas
            .filter(
              (a) =>
                a.nivel === this.matricula.aula!.nivel &&
                a.grado === this.matricula.aula!.grado,
            )
            .map((a) => a.seccion),
        ),
      ];
    }

    this.modalMatriculaAbierto = true;
    this.modoEditar = true;
  };

  cerrarModal(): void {
    const modal = document.querySelector('.modal-content');
    if (modal) {
      modal.classList.add('salir');
      setTimeout(() => {
        this.modalMatriculaAbierto = false;
        this.matricula = this.getMatriculaVacia();
        this.matriculaOriginal = undefined;
        this.seccionActiva = 'estudiante';
        this.grados = [];
        this.secciones = [];
        this.dni_estudiante = '';
        this.dni_padre = '';
      }, 250);
    }
  }

  getMatriculaVacia(): Matriculas {
    return {
      matricula_id: 0,
      codigo_matricula: '',
      situacion: '',
      procedencia: '',
      ie_procedencia: '',
      inscripcion: '',
      matricula: '',
      mensualidad: '',
      fecha_matricula: '',
      estado: 'Activo',
      estudiante: null,
      aula: null,
    };
  }

  mostrarConfirmacion = false;
  MatriculaAEliminar: Matriculas | null = null;

  cancelarEliminacion() {
    this.mostrarConfirmacion = false;
    this.MatriculaAEliminar = null;
  }

  confirmarEliminacion() {
    const id =
      this.MatriculaAEliminar?.matricula_id ||
      this.MatriculaAEliminar?.matricula_id;

    if (!id) return;

    this.matriculasService.deleteMatricula(id).subscribe({
      next: () => {
        this.mostrarConfirmacion = false;
        this.MatriculaAEliminar = null;
        this.mostrarMensajeSimple(
          'Matrícula eliminada correctamente',
          'success',
        );
        this.cargarMatriculas();
      },
      error: (err: any) => {
        console.error('Error al eliminar:', err);
        this.mostrarMensajeSimple('Error al eliminar', 'error');
      },
    });
  }

  eliminarMatricula(matricula: Matriculas) {
    this.MatriculaAEliminar = matricula;
    this.mostrarConfirmacion = true;
  }
}
