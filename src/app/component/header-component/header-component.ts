import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { CategoryService } from '../../services/category-service';
import { CategoryDTOModel } from '../../models/category/category-model';
import { UserService } from '../../services/user-service';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, ButtonModule, BadgeModule, MenuModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss'
})
export class HeaderComponent implements OnInit {
  cartItemCount = 0;
  categories: CategoryDTOModel[] = [];
  currentUser: any = null;
  showUserMenu = false;

  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private cartService: CartService,
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
