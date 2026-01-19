import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardLayoutComponent } from "./layout/dashboard-layout/dashboard-layout.component";
import { PanelControlComponent } from "./pages/panel-control/panel-control.component";
import { BancosComponent } from "./pages/bancos/bancos.component";
import { EstudiantesComponent } from "./pages/estudiantes/estudiantes.component";
import { MatriculasComponent } from "./pages/matriculas/matriculas.component";
import { PadresComponent } from "./pages/padres/padres.component";
import { PagosComponent } from "./pages/pagos/pagos.component";

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {path:"", redirectTo: "panel-control", pathMatch: "full"},
      {
        path: "panel-control",
        component: PanelControlComponent, 
      },
      {
        path: "bancos",
        component: BancosComponent,
      },
      {
        path: "estudiantes",
        component: EstudiantesComponent,
      },
      {
        path: "matriculas",
        component: MatriculasComponent,
      },
      {
        path: "padres",
        component: PadresComponent,
      },
      {
        path: "pagos",
        component: PagosComponent,
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}