import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardLayoutComponent } from "./layout/dashboard-layout/dashboard-layout.component";
import { PanelControlComponent } from "./pages/panel-control/panel-control.component";
import { BancosComponent } from "./pages/bancos/bancos.component";
import { EstudiantesComponent } from "./pages/estudiantes/estudiantes.component";
import { MatriculasComponent } from "./pages/matriculas/matriculas.component";
import { PadresComponent } from "./pages/padres/padres.component";
import { PagosComponent } from "./pages/pagos/pagos.component";
import { SaludComponent } from "./pages/salud/salud.component";
import { UsuariosComponent } from "./pages/usuarios/usuarios.component";
import { AuthGuard } from "../auth/guards/auth.guard";

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {path:"", redirectTo: "panel-control", pathMatch: "full"},
      {
        path: "panel-control",
        component: PanelControlComponent, 
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Profesor', 'Secretaria', 'Tesorera'] }
      },
      {
        path: "estudiantes",
        component: EstudiantesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Profesor', 'Secretaria'] }
      },
      {
        path: "padres",
        component: PadresComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador','Profesor', 'Secretaria'] }
      },
      {
        path: "matriculas",
        component: MatriculasComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Secretaria'] }
      },
      {
        path: "pagos",
        component: PagosComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Tesorera'] }
      },
      {
        path: "salud",
        component: SaludComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador', 'Secretaria'] }
      },
      {
        path: "usuarios",
        component: UsuariosComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Administrador'] }
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
