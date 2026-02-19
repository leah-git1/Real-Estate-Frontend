import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './contact-component.html',
  styleUrl: './contact-component.scss'
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  constructor(private messageService: MessageService) {}

  onSubmit() {
    if (this.isFormValid()) {
      // כאן תוכלי להוסיף שליחה לשרת בעתיד
      console.log('Contact form submitted:', this.contactForm);
      
      this.messageService.add({
        severity: 'success',
        summary: 'הפנייה נשלחה בהצלחה',
        detail: 'ניצור איתך קשר בהקדם האפשרי'
      });
      
      this.resetForm();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'שגיאה',
        detail: 'אנא מלא את כל השדות הנדרשים'
      });
    }
  }

  isFormValid(): boolean {
    return !!(
      this.contactForm.name &&
      this.contactForm.email &&
      this.contactForm.subject &&
      this.contactForm.message
    );
  }

  resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  }
}
