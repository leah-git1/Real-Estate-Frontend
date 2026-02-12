import { Routes } from '@angular/router';
import { AuthComponent } from './component/auth/auth';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: 'auth', pathMatch: 'full' }, // דף הבית יהיה הלוגין
  { path: '**', redirectTo: 'auth' } // הגנה מפני נתיבים לא קיימים
];