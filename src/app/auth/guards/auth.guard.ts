import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AlertaService } from '../../core/services/alerta.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private alertaService: AlertaService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const rolUsuario = localStorage.getItem('rolUsuario');

    const rolesPermitidos = route.data['roles'];

    console.log('ROL:', rolUsuario);
    console.log('PERMITIDOS:', rolesPermitidos);

    if (rolesPermitidos && !rolesPermitidos.includes(rolUsuario)) {
      setTimeout(() => {
        this.router.navigate(['/dashboard/panel-control']);
      });

      this.alertaService.mostrar('No tienes permiso para acceder a este modulo.', 'info');

      return false;
    }

    return true;
  }
}
