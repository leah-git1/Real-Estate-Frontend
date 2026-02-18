import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '../../services/admin-service';
import { AdminStatisticsModel } from '../../models/admin/admin-model';
import { UserProfileDTOModel } from '../../models/user/user-model';
import { ProductModel } from '../../models/product/product-model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './admin-dashboard-component.html',
  styleUrl: './admin-dashboard-component.scss'
})
export class AdminDashboardComponent implements OnInit {
  statistics: AdminStatisticsModel = new AdminStatisticsModel();
  users: UserProfileDTOModel[] = [];
  products: ProductModel[] = [];
  orders: any[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.adminService.getStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading statistics:', err)
    });

    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading users:', err)
    });

    this.adminService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.adminService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  deleteUser(userId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק משתמש זה?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.adminService.deleteUser(userId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'המשתמש נמחק בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת המשתמש' });
            console.error('Error deleting user:', err);
          }
        });
      }
    });
  }

  deleteProduct(productId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק מוצר זה?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.adminService.deleteProduct(productId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'המוצר נמחק בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת המוצר' });
            console.error('Error deleting product:', err);
          }
        });
      }
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  deleteOrder(orderId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק הזמנה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.adminService.deleteOrder(orderId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'ההזמנה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת ההזמנה' });
            console.error('Error deleting order:', err);
          }
        });
      }
    });
  }
}
