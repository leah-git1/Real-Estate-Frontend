import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { CategoryService } from '../../services/category-service';
import { CategoryDTOModel } from '../../models/category/category-model';
import { UserService } from '../../services/user-service';
import { CartService } from '../../services/cart-service';
import { ProductService } from '../../services/product-service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MenubarModule, ButtonModule, BadgeModule, MenuModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss'
})
export class HeaderComponent implements OnInit {
  cartItemCount = 0;
  categories: CategoryDTOModel[] = [];
  currentUser: any = null;
  showUserMenu = false;
  
  searchQuery = '';
  searchResults: any[] = [];
  showSearchResults = false;
  isSearching = false;
  private searchSubject = new Subject<string>();

  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
    this.currentUser = this.userService.getCurrentUser();
    
    this.cartService.getCart().subscribe(items => {
      this.cartItemCount = items.length;
      this.cdr.detectChanges();
    });
    
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.performSearch(query);
    });
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showSearchResults = false;
    }
  }
  
  onSearchInput() {
    if (this.searchQuery.trim().length > 0) {
      this.showSearchResults = true;
      this.isSearching = true;
      this.searchSubject.next(this.searchQuery);
    } else {
      this.searchResults = [];
      this.showSearchResults = false;
    }
  }
  
  performSearch(query: string) {
    this.productService.searchProducts(query).subscribe({
      next: (results) => {
        this.searchResults = results.slice(0, 7);
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isSearching = false;
      }
    });
  }
  
  onSearchEnter() {
    if (this.searchQuery.trim()) {
      this.showSearchResults = false;
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
    }
  }
  
  navigateToProduct(productId: number) {
    this.showSearchResults = false;
    this.searchQuery = '';
    this.router.navigate(['/product', productId]);
  }
  
  viewAllResults() {
    this.showSearchResults = false;
    this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
  }

  isAdmin(): boolean {
    const user = this.userService.getCurrentUser();
    return user?.isAdmin || false;
  }

  trackByCategory(index: number, category: CategoryDTOModel): number {
    return category.categoryId;
  }

  isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
}
