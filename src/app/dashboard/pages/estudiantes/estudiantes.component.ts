import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-estudiantes',
  standalone: false,
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css'
})
export class EstudiantesComponent {

  constructor(private dialog: MatDialog) { }

  modalAbierto: boolean = false;
  modoEditar: boolean = false;

  abrirEditar() {
    this.modoEditar = true;
    this.modalAbierto = true;
  }

  abrirAgregar() {
    this.modoEditar = false;
    this.modalAbierto = true;
  }

  cerrarModal() {
    const modal = document.querySelector('.modal-content');

    if (modal) {
      modal.classList.add('salir');

      setTimeout(() => {
        this.modalAbierto = false;
      }, 250); // mismo tiempo que la animación
    }
  }

  confirmarEliminar() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación',
        message: '¿Está seguro de eliminar este estudiante?',
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
