import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  dropdownAbierto = false;
  nombreUsuario: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Invitado';
  }


  toggleDropdown() {
    this.dropdownAbierto = !this.dropdownAbierto;
  }

  cerrarSesion() {
    this.dropdownAbierto = false;
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('empleadoLogueado');
    this.router.navigate(['/login']);
  }

}
