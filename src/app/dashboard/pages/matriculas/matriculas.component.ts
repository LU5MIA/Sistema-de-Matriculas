import { Component } from '@angular/core';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-matriculas',
  standalone: false,
  templateUrl: './matriculas.component.html',
  styleUrl: './matriculas.component.css'
})
export class MatriculasComponent {

  constructor(private dialog: MatDialog) { }

  confirmarEliminar() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación',
        message: '¿Está seguro de eliminar esta matrícula?',
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
