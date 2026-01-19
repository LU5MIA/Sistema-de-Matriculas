import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BancosComponent } from './pages/bancos/bancos.component';
import { EstudiantesComponent } from './pages/estudiantes/estudiantes.component';
import { MatriculasComponent } from './pages/matriculas/matriculas.component';
import { PadresComponent } from './pages/padres/padres.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { PanelControlComponent } from './pages/panel-control/panel-control.component';
import { SidenavComponent } from './layout/sidenav/sidenav.component';
import { SublevelMenuComponent } from './layout/sidenav/sublevel-menu.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { BodyComponent } from './layout/body/body.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { NavbarComponent } from './layout/navbar/navbar.component';

@NgModule({
  declarations: [
    BancosComponent,
    EstudiantesComponent,
    MatriculasComponent,
    PadresComponent,
    SidenavComponent,
    SublevelMenuComponent,
    DashboardLayoutComponent,
    PanelControlComponent,
    BodyComponent,
    PagosComponent,
    NavbarComponent

  ],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    DashboardRoutingModule,
    
  ],
  exports: []
})
export class DashboardModule { }
