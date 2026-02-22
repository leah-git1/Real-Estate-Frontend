import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminInquiryService } from '../../services/admin-inquiry-service';
import { UserService } from '../../services/user-service';

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

  constructor(
    private messageService: MessageService,
    private adminInquiryService: AdminInquiryService,
    private userService: UserService
  ) {}

  onSubmit() {
    if (this.isFormValid()) {
      const currentUser = this.userService.getCurrentUser();
      const inquiry = {
        userId: currentUser?.userId,
        name: this.contactForm.name,
        email: this.contactForm.email,
        phone: this.contactForm.phone,
        subject: this.contactForm.subject,
        message: this.contactForm.message
      };
      
      this.adminInquiryService.createInquiry(inquiry).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'הפנייה נשלחה בהצלחה',
            detail: 'ניצור איתך קשר בהקדם האפשרי'
          });
          this.resetForm();
        },
        error: (err) => {
          console.error('Error sending message:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'שגיאה',
            detail: 'שגיאה בשליחת הפנייה'
          });
        }
      });
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
