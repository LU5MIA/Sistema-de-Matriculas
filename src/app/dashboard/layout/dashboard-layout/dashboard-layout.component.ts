import { Component } from '@angular/core';

interface SideNavToggle {
  screenWidth: number
  collapse: boolean
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {

  title = 'Sistema de Matriculas';

  isSidenavCollapse = false;
  screenWidth = 0;

  onTogleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSidenavCollapse = data.collapse
  }

}
