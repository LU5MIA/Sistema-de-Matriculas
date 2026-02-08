import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario: string = '';
  password: string = '';
  mostrarPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion() {
    this.errorMessage = '';

    if (!this.usuario || !this.password) {
      this.errorMessage = 'Complete los campos';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      username: this.usuario,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard/panel-control']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Nombre de usuario o contrasela incorrectos';
      }
    });
  }

}
