import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion() {

    if (!this.usuario || !this.password) {
      alert('Complete todos los campos');
      return;
    }

    // 🔹 PRUEBA LOCAL (luego backend)
    if (this.usuario === 'admin' && this.password === '1234') {
      alert('Login correcto');
      this.router.navigate(['/dashboard/panel-control']);
      // aquí luego rediriges al dashboard
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  }

}
