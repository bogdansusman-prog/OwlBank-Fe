import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Home } from './home/home';
import { Transfer } from './transfer/transfer';
import { ResetPassword } from './reset-password/reset-password';
import { authGuard } from './guards/auth.guard';
import { Statements } from './statements/statements';

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
    path: 'transfer',
    component: Transfer,
    canActivate: [authGuard]
  },
  {
  path: 'reset-password',
  component: ResetPassword
  },
  {
  path: 'statements',
  component: Statements,
  canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];