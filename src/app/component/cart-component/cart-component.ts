import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-component.html',
  styleUrl: './cart-component.scss',
})
export class CartComponent {
  product: any = null;

  viewDetails(productId: number) {
    console.log('View product:', productId);
  }
}
