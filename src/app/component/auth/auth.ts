import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { UserLoginDTOModel, UserRegisterDTOModel } from '../../models/user/user-model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, PasswordModule, ToastModule],
  providers: [MessageService],
  templateUrl: './auth.html',
  styleUrl: './auth.scss'
})
export class AuthComponent {
  isLoginMode = true;

  loginData: UserLoginDTOModel = new UserLoginDTOModel();
  registerData: UserRegisterDTOModel = new UserRegisterDTOModel();

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
    if (this.isLoginMode) {
      console.log('Login attempt:', this.loginData);
      const loginPayload = {
        ...this.loginData,
        email: this.loginData.email.toLowerCase()
      };
      this.userService.login(loginPayload).subscribe({
        next: (user) => {
          console.log('Login success:', user);
          this.userService.saveUserToStorage(user);
          this.messageService.add({ severity: 'success', summary: 'התחברות', detail: `שלום ${user.fullName}!` });
          setTimeout(() => {
            const returnUrl = localStorage.getItem('returnUrl') || '/';
            localStorage.removeItem('returnUrl');
            this.router.navigate([returnUrl]).then(() => {
              window.location.reload();
            });
          }, 1000);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'אימייל או סיסמה שגויים' });
        }
      });
    } else {
      console.log('Register attempt:', this.registerData);
      const registerPayload = {
        ...this.registerData,
        email: this.registerData.email.toLowerCase()
      };
      this.userService.register(registerPayload).subscribe({
        next: (res) => {
          console.log('Register success:', res);
          this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'נרשמת בהצלחה! עבור להתחברות' });
          setTimeout(() => {
            this.isLoginMode = true;
            this.registerData = new UserRegisterDTOModel();
          }, 1500);
        },
        error: (err) => {
          console.error('Register error:', err);
          const errorMessage = err.error?.message || err.error || "קרתה שגיאה לא צפויה";
          this.messageService.add({ 
            severity: 'error', 
            summary: 'שגיאת רישום', 
            detail: errorMessage 
          });
        }
      });
    }
  }
}
