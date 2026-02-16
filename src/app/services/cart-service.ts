import { Injectable } from '@angular/core';
import { ProductSummaryDTOModel } from '../models/product/product-model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: ProductSummaryDTOModel[] = [];
  private cartSubject = new BehaviorSubject<ProductSummaryDTOModel[]>([]);

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  addToCart(product: ProductSummaryDTOModel) {
    this.cartItems.push(product);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  getCart() {
    return this.cartSubject.asObservable();
  }
}