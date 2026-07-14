import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertaService } from '../../core/services/alerta.service';

@Component({
  selector: 'app-alerta',
  // standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta.component.html',
  styleUrl: './alerta.component.css',
})
export class AlertaComponent implements OnInit {
  /* ALERTA MODERNA */
  mensajeModal: string = '';
  tipoMensajeModal: 'success' | 'error' | 'info' = 'success';

  mostrarModal: boolean = false;

  ocultando = false;

  constructor(private alertService: AlertaService) {}

  ngOnInit(): void {
    this.alertService.alert$.subscribe((data: any) => {
      this.mostrarMensajeModal(data.mensaje, data.tipo);
    });
  }

  mostrarMensajeModal(texto: string, tipo: 'success' | 'error' | 'info') {
    this.ocultando = false;

    this.mensajeModal = texto;
    this.tipoMensajeModal = tipo;

    this.mostrarModal = true;

    setTimeout(() => {
      this.ocultando = true;

      setTimeout(() => {
        this.mostrarModal = false;
        this.ocultando = false;
      }, 300);
    }, 3000);
  }

  cerrarAlertaModal() {
    this.ocultando = true;

    setTimeout(() => {
      this.mensajeModal = '';
      this.mostrarModal = false;
      this.ocultando = false;
    }, 300);
  }
}
