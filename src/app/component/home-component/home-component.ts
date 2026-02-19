import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '../../services/product-service';
import { UserService } from '../../services/user-service';
import { ProductCardComponent } from '../product-card-component/product-card-component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProductCardComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: any[] = [];
  currentIndex: number = 0;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentIndex = 0;
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.featuredProducts = [];
    this.currentIndex = 0;
    this.cdr.detectChanges();
    
    this.productService.getProducts([], '', null, null, null, null, 1, 6).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          this.featuredProducts = [...response.data].sort(() => 0.5 - Math.random()).slice(0, 6);
          this.currentIndex = 0;
          this.cdr.detectChanges();
          console.log('Featured products loaded:', this.featuredProducts);
        }
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  nextProduct() {
    if (this.featuredProducts && this.featuredProducts.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.featuredProducts.length;
      this.cdr.detectChanges();
    }
  }

  previousProduct() {
    if (this.featuredProducts && this.featuredProducts.length > 0) {
      this.currentIndex = this.currentIndex === 0 
        ? this.featuredProducts.length - 1 
        : this.currentIndex - 1;
      this.cdr.detectChanges();
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  getNextProduct() {
    if (!this.featuredProducts || this.featuredProducts.length === 0) return null;
    const nextIndex = (this.currentIndex + 1) % this.featuredProducts.length;
    return this.featuredProducts[nextIndex];
  }

  getPreviousProduct() {
    if (!this.featuredProducts || this.featuredProducts.length === 0) return null;
    const prevIndex = this.currentIndex === 0 
      ? this.featuredProducts.length - 1 
      : this.currentIndex - 1;
    return this.featuredProducts[prevIndex];
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  addProperty() {
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/add-product']);
    } else {
      localStorage.setItem('returnUrl', '/add-product');
      this.router.navigate(['/auth']);
    }
  }
}
