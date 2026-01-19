import { Component } from '@angular/core';

@Component({
  selector: 'app-estudiantes',
  standalone: false,
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css'
})
export class EstudiantesComponent {

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


}
