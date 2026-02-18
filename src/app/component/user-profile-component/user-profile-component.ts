import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { UserService } from '../../services/user-service';
import { OrderService } from '../../services/order-service';
import { ProductService } from '../../services/product-service';
import { UserUpdateDTOModel } from '../../models/user/user-model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule],
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
    
    this.loadUserData();
    this.loadOrders();
    
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      if (params['tab']) {
        this.activeTab = +params['tab'];
        console.log('Active tab set to:', this.activeTab);
        if (this.activeTab === 2) {
          console.log('Tab 2 selected, loading products');
          this.loadMyProducts();
        }
      }
    });
  }

  loadUserData() {
    this.userForm = {
      fullName: this.currentUser.fullName,
      phone: this.currentUser.phone,
      address: this.currentUser.address
    };
  }

  loadOrders() {
    this.orderService.getOrdersByUserId(this.currentUser.userId).subscribe({
      next: (data) => this.orders = data,
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  loadMyProducts() {
    console.log('Loading products for user:', this.currentUser.userId);
    this.isLoadingProducts = true;
    this.productService.getProductsByOwnerId(this.currentUser.userId).subscribe({
      next: (data) => {
        console.log('Products loaded successfully:', data);
        console.log('Number of products:', data.length);
        this.myProducts = data.map(product => ({
          ...product,
          imageUrl: this.getFullImageUrl(product.imageUrl)
        }));
        console.log('Products with fixed URLs:', this.myProducts);
        this.isLoadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products - Full error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
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

  setActiveTab(index: number) {
    console.log('setActiveTab called with index:', index);
    this.activeTab = index;
    if (index === 2) {
      console.log('Tab 2 clicked, loading products');
      this.loadMyProducts();
    }
  }
}
