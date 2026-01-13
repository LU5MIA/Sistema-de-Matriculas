import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { navbarData } from './nav-data';
import { INavbarData } from './helper';
import { Router } from '@angular/router';

interface SideNavToggle {
  screenWidth: number
  collapse: boolean
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
        animate('350ms',
          style({ opacity: 1 })
        )
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('350ms',
          style({ opacity: 0 })
        )
      ]),
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms',
          keyframes([
            style({ transform: 'rotate(0deg)', offset: '0' }),
            style({ transform: 'rotate(2turn)', offset: '1' }),
          ])
        )
      ])
    ])
  ]
})
export class SidenavComponent implements OnInit {

  rolUsuario: string = '';

  @Output() onTogleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  navData = navbarData;
  multiple: boolean = true;

  @HostListener('window:resize', ['$event'])

  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onTogleSideNav.emit({ collapse: this.collapsed, screenWidth: this.screenWidth })
    }
  }

  constructor(public router: Router) { }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    this.rolUsuario = localStorage.getItem('rolUsuario') || '';
    //this.navData = this.filtrarMenuPorRolOPermiso(navbarData);
  }


  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onTogleSideNav.emit({ collapse: this.collapsed, screenWidth: this.screenWidth })
  }

  closeSidenav(): void {
    this.collapsed = false
    this.onTogleSideNav.emit({ collapse: this.collapsed, screenWidth: this.screenWidth })
  }

  handleClick(item: INavbarData): void {
    this.shrinkItems(item)
    item.expanded = !item.expanded
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
}
