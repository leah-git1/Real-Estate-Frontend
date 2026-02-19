import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category-service';
import { CategoryDTOModel } from '../../models/category/category-model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.scss'
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  categories: CategoryDTOModel[] = [];

  constructor(
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        console.log('Categories loaded in footer:', data);
        this.categories = data.slice(0, 4);
      },
      error: (err) => console.error('Error loading categories in footer:', err)
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  navigateToCategory(categoryId: number) {
    this.router.navigate(['/products'], { queryParams: { categoryIds: categoryId } });
  }
}
