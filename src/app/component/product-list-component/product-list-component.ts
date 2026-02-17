import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product-service'; 
import { ProductSummaryDTOModel } from '../../models/product/product-model'; 
import { CommonModule } from '@angular/common';
import { ProductFilterComponent } from '../product-filter-component/product-filter-component';
import { ProductCardComponent } from '../product-card-component/product-card-component';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    PaginatorModule, 
    ProductFilterComponent, 
    ProductCardComponent
  ],
  templateUrl: './product-list-component.html',
  styleUrl: './product-list-component.scss',
})

export class ProductListComponent implements OnInit {
  products: ProductSummaryDTOModel[] = [];
  totalRecords: number = 0;
  rows: number = 9; // כמות מוצרים בדף
  currentPage: number = 1; // דף נוכחי
  currentFilters: any = {};

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.handleFilter({}); // טוען את כל המוצרים עם פילטר ריק
  }

  // פונקציה המופעלת כשהבן (Filter) שולח נתוני סינון חדשים
  handleFilter(filters: any) {
    console.log('סינון חדש התקבל מהפילטר:', filters);
    this.currentFilters = filters;
    this.currentPage = 1; // תמיד חוזרים לדף הראשון בחיפוש חדש
    this.loadProducts();
  }

  loadProducts(event?: any) {
    // עדכון פרמטרי הדפדוף במידה והגיעו מה-Paginator
    if (event) {
      this.currentPage = (event.first / event.rows) + 1;
      this.rows = event.rows;
    }

    console.log('שולח בקשה ל-API עם הפרמטרים הבאים:', {
      filters: this.currentFilters,
      page: this.currentPage,
      pageSize: this.rows
    });

    this.productService.getProducts(
      this.currentFilters.categoryIds || [],
      this.currentFilters.city || '',
      this.currentFilters.minPrice || null,
      this.currentFilters.maxPrice || null,
      this.currentFilters.rooms || null,
      this.currentFilters.beds || null,
      this.currentPage,
      this.rows
    ).subscribe({
      next: (response) => {
        // הדפסת התגובה המלאה לבדיקה ב-Console
        console.log('תגובה מה-API בתוך ה-Component:', response);
        
        if (response && response.data) {
          this.products = response.data;
          this.totalRecords = response.totalItems;
          console.log('מערך המוצרים עודכן בהצלחה. כמות:', this.products.length);
        } else {
          console.warn('ה-API החזיר תשובה תקינה אך ללא נתונים במערך ה-data');
          this.products = [];
          this.totalRecords = 0;
        }
      },
      error: (err) => {
        console.error('שגיאה חמורה בשליפת נתונים מהשרת:', err);
      }
    });
  }
}