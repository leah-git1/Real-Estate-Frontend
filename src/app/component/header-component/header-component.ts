import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { CategoryService } from '../../services/category-service';
import { CategoryDTOModel } from '../../models/category/category-model';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, ButtonModule, BadgeModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss'
})
export class HeaderComponent implements OnInit {
  cartItemCount = 0;
  categories: CategoryDTOModel[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error fetching categories:', err)
    });
  }
}
