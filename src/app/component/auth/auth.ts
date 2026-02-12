import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  templateUrl: './auth.html',    // מחקנו את ה-'.component' כדי שיתאים לשם הקובץ
  styleUrl: './auth.scss'        // כנ"ל כאן
})
export class AuthComponent {
  isLoginMode = true; // משתנה שקובע אם אנחנו בלוגין או הרשמה

  loginData: UserLoginDTOModel = new UserLoginDTOModel();
  registerData: UserRegisterDTOModel = new UserRegisterDTOModel();

  constructor(private userService: UserService, private messageService: MessageService) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
  if (this.isLoginMode) {
    // לוגיקה של לוגין...
  } else {
    this.userService.register(this.registerData).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'נרשמת בהצלחה!' });
        // מעבר לדף הבית או לוגין
      },
      error: (err) => {
        // כאן אנחנו שואבים את ההודעה שהשרת שלח (ex.Message)
        const errorMessage = err.error?.message || "קרתה שגיאה לא צפויה";
        
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
