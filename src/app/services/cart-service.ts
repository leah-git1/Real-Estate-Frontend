import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartVisibleSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  addToCart(cartItem: CartItem) {
    // בדיקה אם מוצר למכירה כבר קיים בסל
    if (cartItem.transactionType === 'מכירה') {
      const exists = this.cartItems.find(item => 
        item.productId === cartItem.productId && item.transactionType === 'מכירה'
      );
      if (exists) {
        alert('מוצר זה כבר קיים בסל');
        return;
      }
    }
    this.cartItems.push(cartItem);
    this.saveCart();
    this.showCart();
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.saveCart();
  }

  getCart() {
    return this.cartSubject.asObservable();
  }

  getCartVisible() {
    return this.cartVisibleSubject.asObservable();
  }

  showCart() {
    this.cartVisibleSubject.next(true);
  }

  hideCart() {
    this.cartVisibleSubject.next(false);
  }

  getCartCount(): number {
    return this.cartItems.length;
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  updateCart() {
    this.saveCart();
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }
}