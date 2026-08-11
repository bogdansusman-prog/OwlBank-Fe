import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Home } from './home/home';
import { ResetPassword } from './reset-password/reset-password';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
  path: 'home',
  component: Home,
  canActivate: [authGuard]
},
  {
  path: 'reset-password',
  component: ResetPassword
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];