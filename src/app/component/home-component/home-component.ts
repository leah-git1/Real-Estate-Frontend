import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '../../services/product-service';
import { UserService } from '../../services/user-service';
import { ProductCardComponent } from '../product-card-component/product-card-component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProductCardComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {
  featuredProducts: any[] = [];
  currentIndex: number = 0;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.currentIndex = 0;
    this.loadFeaturedProducts();
  }

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    const elements = this.elementRef.nativeElement.querySelectorAll('section, h1, h2, h3, p, .feature-icon, button, .grid > div');
    elements.forEach((element: Element) => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
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
