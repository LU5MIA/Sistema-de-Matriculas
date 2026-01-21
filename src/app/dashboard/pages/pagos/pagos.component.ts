import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-pagos',
  standalone: false,
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent {
  constructor(private dialog: MatDialog) { }

  modalAbierto: boolean = false;
  modalPagoEstudiante: boolean = false;
  seccionActiva: 'datos' | 'pago' = 'datos';
  conceptoSeleccionado: string = '';
  @ViewChild('modalPago') modalPago!: ElementRef;
  @ViewChild('modalPrincipal') modalPrincipal!: ElementRef;


  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

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
    }, 250);
  }

  confirmarEliminarPago() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación',
        message: '¿Está seguro de eliminar este pago?',
        icon: 'fa-solid fa-triangle-exclamation',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarEstudiante();
      }
    });
  }

  eliminarEstudiante() {
    console.log('Estudiante eliminado');
  }

}
