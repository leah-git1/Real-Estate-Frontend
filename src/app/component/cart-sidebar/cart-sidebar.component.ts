import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { UserService } from '../../services/user-service';
import { ProductService } from '../../services/product-service';
import { OrderService } from '../../services/order-service';
import { CartItem } from '../../models/cart/cart-item.model';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, DrawerModule, ButtonModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.scss'
})
export class CartSidebarComponent implements OnInit {
  visible: boolean = false;
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.getCartVisible().subscribe(visible => {
      this.visible = visible;
    });

    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
    });
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  goToCart() {
    this.cartService.hideCart();
    this.router.navigate(['/cart']);
  }

  goToProducts() {
    this.cartService.hideCart();
    this.router.navigate(['/products']);
  }

  goToCheckout() {
    this.cartService.hideCart();
    
    if (!this.userService.isLoggedIn()) {
      localStorage.setItem('returnUrl', '/cart');
      this.router.navigate(['/auth']);
    } else {
      this.createOrder();
    }
  }

  createOrder() {
    const currentUser = this.userService.getCurrentUser();
    
    if (!currentUser) {
      alert('שגיאה: משתמש לא מחובר');
      return;
    }
    
    const invalidItems = this.cartItems.filter(item => 
      item.transactionType !== 'מכירה' && (!item.startDate || !item.endDate)
    );
    
    if (invalidItems.length > 0) {
      alert('יש מוצרים ללא תאריכים. אנא עבור לסל המלא לבחירת תאריכים.');
      this.router.navigate(['/cart']);
      return;
    }
    
    const orderItems = this.cartItems.map((item, index) => {
      if (item.transactionType === 'מכירה') {
        const futureDate = new Date('2099-12-31');
        futureDate.setHours(index, index, index, index);
        return {
          productId: item.productId,
          priceAtPurchase: item.price,
          startDate: futureDate.toISOString(),
          endDate: futureDate.toISOString()
        };
      }
      return {
        productId: item.productId,
        priceAtPurchase: item.price,
        startDate: new Date(item.startDate!).toISOString(),
        endDate: new Date(item.endDate!).toISOString()
      };
    });

    const orderData = {
      userId: currentUser.userId,
      orderItems: orderItems,
      totalAmount: this.getTotalPrice()
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        this.cartService.clearCart();
        alert('ההזמנה בוצעה בהצלחה!');
        this.router.navigate(['/profile'], { queryParams: { tab: 1 } });
      },
      error: (err) => {
        console.error('Error creating order:', err);
        const errorMsg = err.error?.message || err.error || err.message || 'שגיאה ביצירת ההזמנה';
        alert('שגיאה: ' + errorMsg);
      }
    });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  closeSidebar() {
    this.cartService.hideCart();
  }
}
