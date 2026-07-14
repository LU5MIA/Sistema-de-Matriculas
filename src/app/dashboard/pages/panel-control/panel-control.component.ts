import { Component } from '@angular/core';
import { MatriculasService } from '../../../core/services/matriculas.service';
import { EstudiantesService } from '../../../core/services/estudiantes.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PagosService } from '../../../core/services/pagos.service';

@Component({
  selector: 'app-panel-control',
  standalone: false,
  templateUrl: './panel-control.component.html',
  styleUrl: './panel-control.component.css',
})
export class PanelControlComponent {
  totalMatriculas: number = 0;
  totalEstudiantes: number = 0;
  totalPagos: number = 0;

  constructor(
    private matriculasService: MatriculasService,
    private estudiantesService: EstudiantesService,
    private pagosService: PagosService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.cargarMatriculas();
    this.cargarEstudiantes();
    this.cargarPagos();
  }

  cargarMatriculas() {
    this.matriculasService.getMatriculas().subscribe((data) => {
      this.totalMatriculas = data.length;
      console.log('Total Matriculas:', this.totalMatriculas);
    });
  }

  cargarEstudiantes() {
    this.estudiantesService.getEstudiantes().subscribe((data) => {
      this.totalEstudiantes = data.length;
      console.log('Total Estudiantes:', this.totalEstudiantes);
    });
  }

  cargarPagos() {
    this.pagosService.getPagos().subscribe((data) => {
      const pagosPagados = data.filter((p) => p.estado === 'Pagado');

      this.totalPagos = pagosPagados.length;

      console.log('Total Pagos Pagados:', this.totalPagos);
    });
  }

  irMatriculas() {
    this.router.navigate(['/dashboard/matriculas']);
  }
}
