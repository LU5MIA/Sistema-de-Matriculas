import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BancosComponent } from './bancos/bancos.component';
import { EstudiantesComponent } from './estudiantes/estudiantes.component';
import { MatriculasComponent } from './matriculas/matriculas.component';
import { PadresComponent } from './padres/padres.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { PanelControlComponent } from './panel-control/panel-control.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SublevelMenuComponent } from './sidenav/sublevel-menu.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { BodyComponent } from './body/body.component';
import { PagosComponent } from './pagos/pagos.component';
import { NavbarComponent } from './navbar/navbar.component';

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
