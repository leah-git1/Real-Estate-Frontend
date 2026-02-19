import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { UserService } from '../../services/user-service';
import { ProductService } from '../../services/product-service';
import { OrderService } from '../../services/order-service';
import { CartItem } from '../../models/cart/cart-item.model';

@Component({
  selector: 'app-cart-component',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, DatePickerModule, FormsModule],
  templateUrl: './cart-component.html',
  styleUrl: './cart-component.scss',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  showDateDialog: boolean = false;
  showSuccessDialog: boolean = false;
  selectedItem: CartItem | null = null;
  selectedDates: Date[] | undefined;
  minDate: Date = new Date();

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
    });
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  editDates(item: CartItem) {
    this.selectedItem = item;
    if (item.startDate && item.endDate) {
      this.selectedDates = [new Date(item.startDate), new Date(item.endDate)];
    }
    this.showDateDialog = true;
  }

  saveDates() {
    if (this.selectedItem && this.selectedDates && this.selectedDates[0] && this.selectedDates[1]) {
      // בדיקת זמינות לפני שמירה
      this.productService.checkAvailability(
        this.selectedItem.productId,
        this.selectedDates[0],
        this.selectedDates[1]
      ).subscribe({
        next: (isAvailable) => {
          if (isAvailable) {
            this.selectedItem!.startDate = this.selectedDates![0];
            this.selectedItem!.endDate = this.selectedDates![1];
            this.cartService.updateCart();
            this.closeDateDialog();
          } else {
            alert('התאריכים שבחרת כבר תפוסים. אנא בחר תאריכים אחרים.');
          }
        },
        error: (err) => {
          console.error('Error checking availability:', err);
          alert('שגיאה בבדיקת זמינות');
        }
      });
    }
  }

  closeDateDialog() {
    this.showDateDialog = false;
    this.selectedItem = null;
    this.selectedDates = undefined;
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  checkout() {
    console.log('Checkout clicked');
    console.log('Is logged in:', this.userService.isLoggedIn());
    
    if (!this.userService.isLoggedIn()) {
      console.log('User not logged in, redirecting to auth');
      localStorage.setItem('returnUrl', '/cart');
      this.router.navigate(['/auth']);
    } else {
      console.log('User logged in, creating order');
      this.createOrder();
    }
  }

  createOrder() {
    console.log('Creating order...');
    const currentUser = this.userService.getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      alert('שגיאה: משתמש לא מחובר');
      return;
    }
    
    console.log('Cart items:', this.cartItems);
    
    // בדיקה שלמוצרי השכרה/נופש יש תאריכים
    const invalidItems = this.cartItems.filter(item => 
      item.transactionType !== 'מכירה' && (!item.startDate || !item.endDate)
    );
    
    if (invalidItems.length > 0) {
      alert('יש מוצרים ללא תאריכים. אנא בחר תאריכים לכל המוצרים.');
      return;
    }
    
    const orderItems = this.cartItems.map((item, index) => {
      console.log('Processing item:', item);
      // למוצרי מכירה - תאריך עתידי מאוד רחוק
      if (item.transactionType === 'מכירה') {
        const futureDate = new Date('2099-12-31');
        futureDate.setHours(index, index, index, index);
        console.log('Sale item - using future date:', futureDate);
        return {
          productId: item.productId,
          priceAtPurchase: item.price,
          startDate: futureDate.toISOString(),
          endDate: futureDate.toISOString()
        };
      }
      // למוצרי השכרה/נופש - התאריכים שנבחרו
      console.log('Rental/Vacation item - using selected dates:', item.startDate, item.endDate);
      return {
        productId: item.productId,
        priceAtPurchase: item.price,
        startDate: new Date(item.startDate!).toISOString(),
        endDate: new Date(item.endDate!).toISOString()
      };
    });

    console.log('Order items:', orderItems);

    const orderData = {
      userId: currentUser.userId,
      orderItems: orderItems,
      totalAmount: this.getTotalPrice()
    };

    console.log('Order data:', orderData);

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('Order created successfully:', response);
        this.cartService.clearCart();
        this.showSuccessDialog = true;
      },
      error: (err) => {
        console.error('Error creating order:', err);
        const errorMsg = err.error?.message || err.error || err.message || 'שגיאה ביצירת ההזמנה';
        alert('שגיאה: ' + errorMsg);
      }
    });
  }

  goToOrders() {
    this.showSuccessDialog = false;
    this.router.navigate(['/profile'], { queryParams: { tab: 1 } });
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }
}
