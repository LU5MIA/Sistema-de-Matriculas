import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Pagos, PagosVista } from '../../../shared/interfaces/pagos.intreface';
import { PagosService } from '../../../core/services/pagos.service';

@Component({
  selector: 'app-pagos',
  standalone: false,
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent {
  constructor(
    private dialog: MatDialog,
    private pagosService: PagosService
  ) { }

  modalAbierto: boolean = false;
  modalPagoEstudiante: boolean = false;
  seccionActiva: 'datos' | 'pago' = 'datos';
  conceptoSeleccionado: string = '';

  pagos: Pagos[] = [];
  pagosVista: PagosVista[] = [];
  pagosVistaBase: PagosVista[] = [];
  textoBusqueda: string = '';

  //traer de la bd los meses
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];


  @ViewChild('modalPago') modalPago!: ElementRef;
  @ViewChild('modalPrincipal') modalPrincipal!: ElementRef;


  //nuevo pago
  pago: Pagos = {
    pagos_id: 0,
    concepto: '',
    monto: 0,
    fecha_pago: '',
    estado: '',
    canal_pago: '',
    meses: '',

    estudiante: null,
    aula: null,
    matricula: null,
    pagador: null
  }


  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.pagosService.getPagos().subscribe(data => {

      const vista = data.map(p => {

        const nivel = p.aula?.nivel ?? '';
        const grado = p.aula?.grado ?? '';
        const seccion = p.aula?.seccion ?? '';

        const nombres = p.estudiante?.nombres ?? '';
        const apellidoP = p.estudiante?.apellido_paterno ?? '';
        const apellidoM = p.estudiante?.apellido_materno ?? '';

        return {
          ...p,
          aulaNombre: p.aula
            ? `${nivel} ${grado} ${seccion}`.trim()
            : 'Aula no asignada',

          estudianteNombre: p.estudiante
            ? `${nombres} ${apellidoP} ${apellidoM}`.trim()
            : 'Estudiante no asignado'
        };
      });

      this.pagosVistaBase = [...vista];
      this.pagosVista = [...vista];
    });
  }

  filtrarPagos(): void {

    const texto = this.textoBusqueda.trim().toLowerCase();

    if (!texto) {
      this.pagosVista = [...this.pagosVistaBase];
      return;
    }

    this.pagosVista = this.pagosVistaBase.filter(p =>
      p.estudianteNombre.toLowerCase().includes(texto)
    );
  }

  descargarRecibo(url: string) {
    window.open(url, '_blank');
  }

  pagoEstudiante() {
    this.modalPagoEstudiante = true;
    this.modalAbierto = false;
  }

  RealizarPago() {
    this.modalPagoEstudiante = false;
    this.modalAbierto = true;
  }

  cerrarModal(element: HTMLElement, tipo: 'pago' | 'principal') {
    element.classList.add('salir');

    setTimeout(() => {
      if (tipo === 'pago') this.modalPagoEstudiante = false;
      else this.modalAbierto = false;
    }, 250); // tiempo que la animación dura
  }

  // confirmarEliminarPago() {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirmación',
  //       message: '¿Está seguro de eliminar este pago?',
  //       icon: 'fa-solid fa-triangle-exclamation',
  //       confirmText: 'Eliminar',
  //       cancelText: 'Cancelar'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.eliminarEstudiante();
  //     }
  //   });
  // }

  // eliminarEstudiante() {
  //   console.log('Estudiante eliminado');
  // }

}
