import { Component } from '@angular/core';
import { MatriculasService } from '../../../core/services/matriculas.service';
import { EstudiantesService } from '../../../core/services/estudiantes.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-panel-control',
  standalone: false,
  templateUrl: './panel-control.component.html',
  styleUrl: './panel-control.component.css'
})
export class PanelControlComponent {

  totalMatriculas: number = 0;
  totalEstudiantes: number = 0;
  constructor(
    private matriculasService: MatriculasService,
    private estudiantesService: EstudiantesService,
    private router: Router,
    private route: ActivatedRoute // 👈 FALTABA ESTO
  ) { }

  ngOnInit() {
    this.cargarMatriculas();
    this.cargarEstudiantes();
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

  irMatriculas() {
    this.router.navigate(['/dashboard/matriculas']);
  }

}
