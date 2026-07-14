import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { navbarData } from './nav-data';
import { INavbarData } from './helper';
import { Router } from '@angular/router';

interface SideNavToggle {
  screenWidth: number;
  collapse: boolean;
}

@Component({
  selector: 'app-sidenav',
  standalone: false,
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('350ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('350ms', style({ opacity: 0 })),
      ]),
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate(
          '1000ms',
          keyframes([
            style({ transform: 'rotate(0deg)', offset: '0' }),
            style({ transform: 'rotate(2turn)', offset: '1' }),
          ]),
        ),
      ]),
    ]),
  ],
})
export class SidenavComponent implements OnInit {
  rolUsuario: string = '';

  @Output() onTogleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navData = navbarData;
  multiple: boolean = true;
  menuFiltrado: INavbarData[] = [];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onTogleSideNav.emit({
        collapse: this.collapsed,
        screenWidth: this.screenWidth,
      });
    }
  }

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    this.rolUsuario = localStorage.getItem('rolUsuario') || '';

    // Filtrar menú según rol
    this.menuFiltrado = this.navData.filter((item) =>
      item.roles?.includes(this.rolUsuario),
    );

    // Obtener ruta actual
    const rutaActual = this.router.url;

    // Validar si la ruta actual está permitida
    const tienePermiso = this.navData.some(
      (item) =>
        rutaActual.includes(item.routeLink) &&
        item.roles?.includes(this.rolUsuario),
    );

    // Si no tiene permiso, redireccionar
    if (!tienePermiso) {
      alert('No tienes permisos para acceder a este módulo.');

      this.router.navigate(['/dashboard/panel-control']);
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onTogleSideNav.emit({
      collapse: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onTogleSideNav.emit({
      collapse: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  handleClick(item: INavbarData): void {
    this.shrinkItems(item);
    item.expanded = !item.expanded;
  }

  getActiveClass(data: INavbarData): string {
    return this.router.url.includes(data.routeLink) ? 'active' : '';
  }

  shrinkItems(item: INavbarData): void {
    if (!this.multiple) {
      for (let modelItem of this.navData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
  }

  mostrarLogout = false;

  logout() {
    this.mostrarLogout = true;
  }

  cancelarLogout() {
    this.mostrarLogout = false;
  }

  confirmarLogout() {
    localStorage.clear();

    this.mostrarLogout = false;

    this.router.navigate(['auth/login']);
  }
}
