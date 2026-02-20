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
      localStorage.setItem('returnUrl', '/checkout');
      this.router.navigate(['/auth']);
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
    
    this.router.navigate(['/checkout']);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  closeSidebar() {
    this.cartService.hideCart();
  }
}
