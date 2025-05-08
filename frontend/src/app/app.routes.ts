import { Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';
import { NotasComponent } from './notas/notas.component';
import { PagosComponent } from './economia/pagos.component';
import { MatriculaComponent } from './gestion-academica/matricula.component';
import { PsiComponent } from './psi/psi.component';
import { PlanificadorComponent } from './planificador/planificador.component';
import { IncidenciasComponent } from './incidencias/incidencias.component';
import { PagoMensualComponent } from './pago-mensual/pago-mensual.component';
import { HorarioComponent } from './horario/horario.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard, GuestGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full', canActivate: [GuestGuard] },
    { path: 'login', redirectTo: '', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
    { path: 'asistencia', component: AsistenciaComponent, canActivate: [AuthGuard] },
    { path: 'notas', component: NotasComponent, canActivate: [AuthGuard] },
    { path: 'economia', component: PagosComponent, canActivate: [AuthGuard] },
    { path: 'gestion-academica', component: MatriculaComponent, canActivate: [AuthGuard] },
    { path: 'psi', component: PsiComponent, canActivate: [AuthGuard] },
    { path: 'planificador', component: PlanificadorComponent, canActivate: [AuthGuard] },
    { path: 'incidencias', component: IncidenciasComponent, canActivate: [AuthGuard] },
    { path: 'pago-mensual', component: PagoMensualComponent, canActivate: [AuthGuard] },
    { path: 'horario', component: HorarioComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'login' }
];
