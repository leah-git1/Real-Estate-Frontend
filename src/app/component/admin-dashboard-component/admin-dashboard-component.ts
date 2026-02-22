import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '../../services/admin-service';
import { AdminStatisticsModel } from '../../models/admin/admin-model';
import { UserProfileDTOModel } from '../../models/user/user-model';
import { ProductModel } from '../../models/product/product-model';
import { UserService } from '../../services/user-service';
import { OrderService } from '../../services/order-service';
import { ContactService } from '../../services/contact-service';
import { PropertyInquiryService } from '../../services/property-inquiry-service';
import { AdminInquiryService } from '../../services/admin-inquiry-service';
import { ProductDetailsComponent } from '../product-details-component/product-details-component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, TableModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule, DialogModule, SelectModule, ProductDetailsComponent],
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

  displayUserDialog = false;
  displayProductDialog = false;
  displayOrderDialog = false;
  selectedUser: any = null;
  selectedProductId: number | null = null;
  selectedOrder: any = null;
  
  contactMessages: any[] = [];
  displayMessageDialog = false;
  selectedMessage: any = null;
  
  propertyInquiries: any[] = [];
  displayInquiryDialog = false;
  selectedInquiry: any = null;
  
  adminInquiries: any[] = [];
  displayAdminInquiryDialog = false;
  selectedAdminInquiry: any = null;
  
  inquiryStatusOptions = [
    { label: 'חדש', value: 'New' },
    { label: 'בטיפול', value: 'InProgress' },
    { label: 'טופל', value: 'Resolved' }
  ];
  
  messageStatusOptions = [
    { label: 'חדש', value: 'New' },
    { label: 'בטיפול', value: 'InProgress' },
    { label: 'טופל', value: 'Resolved' }
  ];
  
  statusOptions = [
    { label: 'התקבל', value: 'Pending' },
    { label: 'אושר', value: 'Confirmed' },
    { label: 'בטיפול', value: 'Processing' },
    { label: 'הסתיים', value: 'Delivered' },
    { label: 'בוטל', value: 'Cancelled' }
  ];

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private orderService: OrderService,
    private contactService: ContactService,
    private propertyInquiryService: PropertyInquiryService,
    private adminInquiryService: AdminInquiryService,
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
    
    this.contactService.getAllMessages().subscribe({
      next: (data) => {
        this.contactMessages = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading messages:', err)
    });
    
    this.propertyInquiryService.getAllInquiries().subscribe({
      next: (data) => {
        this.propertyInquiries = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading inquiries:', err)
    });
    
    this.adminInquiryService.getAllInquiries().subscribe({
      next: (data) => {
        this.adminInquiries = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading admin inquiries:', err)
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
        this.orderService.deleteOrder(orderId).subscribe({
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
  
  updateOrderStatus(order: any, newStatus: string): void {
    this.orderService.updateOrderStatus(order.orderId, { status: newStatus }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'סטטוס ההזמנה עודכן' });
        this.loadData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הסטטוס' });
        console.error('Error updating order status:', err);
      }
    });
  }
  
  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch(status?.toLowerCase()) {
      case 'pending': return 'warn';
      case 'confirmed': return 'info';
      case 'processing': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }
  
  calculateCommission(order: any): number {
    if (!order.orderItems || order.orderItems.length === 0) return 0;
    
    let commission = 0;
    order.orderItems.forEach((item: any) => {
      const transactionType = item.product?.transactionType;
      const price = item.priceAtPurchase || 0;
      
      if (transactionType === 'Vacation') {
        commission += price * 0.03;
      } else if (transactionType === 'Rent') {
        const months = this.calculateMonths(item.startDate, item.endDate);
        if (months > 0) {
          commission += price / (months + 1);
        }
      }
    });
    return commission;
  }
  
  calculateMonths(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }
  
  getTotalCommissions(): number {
    const total = this.orders.reduce((sum, order) => {
      const commission = this.calculateCommission(order);
      console.log(`Order ${order.orderId} commission:`, commission);
      return sum + commission;
    }, 0);
    console.log('Total commissions:', total);
    return total;
  }

  viewUserDetails(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        this.selectedUser = data;
        setTimeout(() => {
          this.displayUserDialog = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בטעינת פרטי המשתמש' });
        console.error('Error loading user details:', err);
      }
    });
  }

  viewProductDetails(productId: number): void {
    if (!productId || productId <= 0) {
      this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'מזהה מוצר לא תקין' });
      return;
    }
    setTimeout(() => {
      this.selectedProductId = productId;
      this.displayProductDialog = true;
      this.cdr.detectChanges();
    });
  }

  viewOrderDetails(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (data) => {
        this.selectedOrder = data;
        setTimeout(() => {
          this.displayOrderDialog = true;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בטעינת פרטי ההזמנה' });
        console.error('Error loading order details:', err);
      }
    });
  }
  
  viewMessageDetails(message: any): void {
    this.selectedMessage = message;
    this.displayMessageDialog = true;
  }
  
  updateMessageStatus(message: any, newStatus: string): void {
    this.contactService.updateMessageStatus(message.id, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'סטטוס הפנייה עודכן' });
        this.loadData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הסטטוס' });
        console.error('Error updating message status:', err);
      }
    });
  }
  
  deleteMessage(messageId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק פנייה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.contactService.deleteMessage(messageId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הפנייה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת הפנייה' });
            console.error('Error deleting message:', err);
          }
        });
      }
    });
  }
  
  getMessageStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch(status?.toLowerCase()) {
      case 'new': return 'info';
      case 'inprogress': return 'warn';
      case 'resolved': return 'success';
      default: return 'secondary';
    }
  }
  
  viewInquiryDetails(inquiry: any): void {
    this.selectedInquiry = inquiry;
    this.displayInquiryDialog = true;
  }
  
  updateInquiryStatus(inquiry: any, newStatus: string): void {
    this.propertyInquiryService.updateInquiryStatus(inquiry.inquiryId, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'סטטוס הפנייה עודכן' });
        this.loadData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הסטטוס' });
        console.error('Error updating inquiry status:', err);
      }
    });
  }
  
  deleteInquiry(inquiryId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק פנייה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.propertyInquiryService.deleteInquiry(inquiryId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הפנייה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת הפנייה' });
            console.error('Error deleting inquiry:', err);
          }
        });
      }
    });
  }
  
  viewAdminInquiryDetails(inquiry: any): void {
    this.selectedAdminInquiry = inquiry;
    this.displayAdminInquiryDialog = true;
  }
  
  updateAdminInquiryStatus(inquiry: any, newStatus: string): void {
    this.adminInquiryService.updateInquiryStatus(inquiry.inquiryId, newStatus).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'סטטוס הפנייה עודכן' });
        this.loadData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה בעדכון הסטטוס' });
        console.error('Error updating admin inquiry status:', err);
      }
    });
  }
  
  deleteAdminInquiry(inquiryId: number): void {
    this.confirmationService.confirm({
      message: 'האם אתה בטוח שברצונך למחוק פנייה זו?',
      header: 'אישור מחיקה',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'כן',
      rejectLabel: 'לא',
      accept: () => {
        this.adminInquiryService.deleteInquiry(inquiryId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'הצלחה', detail: 'הפנייה נמחקה בהצלחה' });
            this.loadData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'שגיאה במחיקת הפנייה' });
            console.error('Error deleting admin inquiry:', err);
          }
        });
      }
    });
  }
}
