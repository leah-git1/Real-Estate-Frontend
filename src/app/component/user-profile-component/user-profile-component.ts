import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { UserService } from '../../services/user-service';
import { OrderService } from '../../services/order-service';
import { ProductService } from '../../services/product-service';
import { UserUpdateDTOModel } from '../../models/user/user-model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule, DialogModule, TimelineModule, TagModule],
  templateUrl: './user-profile-component.html',
  styleUrl: './user-profile-component.scss'
})
export class UserProfileComponent implements OnInit {
  currentUser: any = null;
  userForm: UserUpdateDTOModel = {};
  orders: any[] = [];
  myProducts: any[] = [];
  activeTab: number = 0;
  isLoadingProducts: boolean = false;
  showDeleteDialog: boolean = false;
  productToDelete: number | null = null;
  selectedOrder: any = null;
  showOrderDialog: boolean = false;

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('UserProfileComponent ngOnInit started');
    this.currentUser = this.userService.getCurrentUser();
    console.log('Current user:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('No user found, redirecting to auth');
      this.router.navigate(['/auth']);
      return;
    }
    
    // טען את הטאב מה-URL לפני הכל
    const tabParam = this.route.snapshot.queryParams['tab'];
    if (tabParam) {
      this.activeTab = +tabParam;
      console.log('Initial active tab from URL:', this.activeTab);
    }
    
    this.loadUserData();
    this.loadOrders();
    
    if (this.activeTab === 2) {
      this.loadMyProducts();
    }
  }

  loadUserData() {
    this.userForm = {
      fullName: this.currentUser.fullName,
      phone: this.currentUser.phone,
      address: this.currentUser.address
    };
  }

  loadOrders() {
    console.log('Loading orders for user:', this.currentUser.userId);
    this.orderService.getOrdersByUserId(this.currentUser.userId).subscribe({
      next: (data) => {
        console.log('Orders received:', data);
        this.orders = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.orders = [];
      }
    });
  }

  loadMyProducts() {
    this.isLoadingProducts = true;
    this.productService.getProductsByOwnerId(this.currentUser.userId).subscribe({
      next: (data) => {
        this.myProducts = data.map(product => ({
          ...product,
          imageUrl: this.getFullImageUrl(product.imageUrl)
        }));
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoadingProducts = false;
        this.myProducts = [];
        this.cdr.detectChanges();
      }
    });
  }

  getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl + '?t=' + Date.now();
    return 'https://localhost:44305' + imageUrl + '?t=' + Date.now();
  }

  updateProfile() {
    console.log('Updating user:', this.currentUser.userId, this.userForm);
    
    const updateData: UserUpdateDTOModel = {
      fullName: this.userForm.fullName,
      phone: this.userForm.phone,
      address: this.userForm.address
    };
    
    // הוסף אימייל רק אם הוזן
    if (this.userForm.email && this.userForm.email.trim().length > 0) {
      updateData.email = this.userForm.email.toLowerCase();
    }
    
    // הוסף סיסמה רק אם הוזנה
    if (this.userForm.password && this.userForm.password.trim().length > 0) {
      updateData.password = this.userForm.password;
    }
    
    console.log('Sending update data:', updateData);
    
    this.userService.updateUser(this.currentUser.userId, updateData).subscribe({
      next: (res) => {
        console.log('Update success:', res);
        alert('הפרטים עודכנו בהצלחה');
        this.currentUser.fullName = this.userForm.fullName;
        this.currentUser.phone = this.userForm.phone;
        this.currentUser.address = this.userForm.address;
        if (updateData.email) {
          this.currentUser.email = updateData.email;
        }
        this.userService.saveUserToStorage(this.currentUser);
        window.location.reload();
      },
      error: (err) => {
        console.error('Update error:', err);
        const errorMsg = err.error?.message || err.error || 'שגיאה בעדכון הפרטים';
        alert(errorMsg);
      }
    });
  }

  editProduct(productId: number) {
    this.router.navigate(['/edit-product', productId]);
  }

  viewProduct(productId: number) {
    this.router.navigate(['/product-details', productId], { 
      queryParams: { returnTo: 'profile', tab: 2 } 
    });
  }

  deleteProduct(productId: number) {
    this.productToDelete = productId;
    this.showDeleteDialog = true;
  }

  confirmDelete() {
    if (this.productToDelete) {
      const updateData = { isAvailable: false };
      this.productService.updateProduct(this.productToDelete, updateData).subscribe({
        next: () => {
          this.showDeleteDialog = false;
          this.productToDelete = null;
          this.loadMyProducts();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.showDeleteDialog = false;
          this.productToDelete = null;
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteDialog = false;
    this.productToDelete = null;
  }

  addNewProduct() {
    this.router.navigate(['/add-product']);
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }

  setActiveTab(index: number) {
    console.log('setActiveTab called with index:', index);
    this.activeTab = index;
    if (index === 2) {
      console.log('Tab 2 clicked, loading products');
      this.loadMyProducts();
    }
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

  getStatusLabel(status: string): string {
    switch(status?.toLowerCase()) {
      case 'pending': return 'התקבל';
      case 'confirmed': return 'אושר';
      case 'processing': return 'בטיפול';
      case 'delivered': return 'הסתיים';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  }

  viewOrderDetails(order: any) {
    this.selectedOrder = order;
    this.showOrderDialog = true;
  }

  closeOrderDialog() {
    this.showOrderDialog = false;
    this.selectedOrder = null;
  }

  isStepCompleted(currentStatus: string, stepStatus: string): boolean {
    const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    return currentIndex > stepIndex;
  }
}
