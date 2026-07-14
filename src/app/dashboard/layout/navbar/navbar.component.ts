import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RolesService } from '../../../core/services/roles.service';
import { Roles } from '../../../shared/interfaces/roles.interface';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  dropdownAbierto = false;
  nombreUsuario: string = '';
  roles: Roles[] = [];
  rolUsuario: string = '';

  constructor(
    private router: Router,
    private rolesService: RolesService,
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Invitado';
    this.rolUsuario = localStorage.getItem('rolUsuario') || 'Invitado';
  }

  // cargarRoles(): void {
  //   this.rolesService.getRoles().subscribe((data) => {
  //     this.roles = data;
  //     console.log('Roles obtenidos en Navbar:', data);
  //   });
  // }

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
