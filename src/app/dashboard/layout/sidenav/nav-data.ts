import { INavbarData } from './helper';

export const navbarData: INavbarData[] = [
  {
    routeLink: 'panel-control',
    icon: 'fas fa-home',
    label: 'Panel de Control',
    roles: ['Administrador', 'Profesor', 'Secretaria', 'Tesorera']
  },
  {
    routeLink: 'estudiantes',
    icon: 'fa fa-user-graduate',
    label: 'Estudiantes',
    roles: ['Administrador', 'Profesor', 'Secretaria']
  },
  {
    routeLink: 'padres',
    icon: 'fa fa-users',
    label: 'Padres',
    roles: ['Administrador', 'Profesor', 'Secretaria']
  },
  {
    routeLink: 'matriculas',
    icon: 'fa fa-book-open',
    label: 'Matrículas',
    roles: [ 'Administrador', 'Secretaria']
  },
  {
    routeLink: 'pagos',
    icon: 'fa fa-credit-card',
    label: 'Pagos',
    roles: ['Administrador', 'Tesorera']
  },
  {
    routeLink: 'salud',
    icon: 'fa fa-heart-pulse',
    label: 'Salud Estudiantil',
    roles: ['Administrador', 'Secretaria']
  },
  {
    routeLink: 'usuarios',
    icon: 'fa fa-user',
    label: 'Usuarios',
    roles: ['Administrador']
  }
];
