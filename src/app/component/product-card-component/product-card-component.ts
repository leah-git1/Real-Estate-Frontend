import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router'; // <--- ייבוא הנתב
import { ProductSummaryDTOModel } from '../../models/product/product-model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './product-card-component.html',
  styleUrl: './product-card-component.scss'
})
export class ProductCardComponent {
  @Input() product!: ProductSummaryDTOModel;

  // הזרקת ה-Router בבנאי (Constructor)
  constructor(private router: Router) {}

  // פונקציה להוספה לסל (כרגע רק מדפיסה לקונסול)
  addToCart(product: any) {
    console.log('מוצר נוסף לסל:', product.title);
    alert(`הנכס "${product.title}" נוסף לרשימה שלך`);
  }

  // פונקציית המעבר לדף פרטים נוספים
  viewDetails(productId: number) {
    console.log('מעבר לדף פרטים עבור מוצר מספר:', productId);
    
    // הפקודה שמעבירה לדף החדש. 
    // ודאי שיש לך נתיב (Route) מוגדר ב-app.routes.ts עבור 'product-details'
    this.router.navigate(['/product-details', productId]);
  }
}