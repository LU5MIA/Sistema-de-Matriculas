import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardLayoutComponent } from "./dashboard-layout/dashboard-layout.component";
import { PanelControlComponent } from "./panel-control/panel-control.component";
import { BancosComponent } from "./bancos/bancos.component";
import { EstudiantesComponent } from "./estudiantes/estudiantes.component";
import { MatriculasComponent } from "./matriculas/matriculas.component";
import { PadresComponent } from "./padres/padres.component";

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
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}