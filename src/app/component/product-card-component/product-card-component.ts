import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ProductSummaryDTOModel } from '../../models/product/product-model';
import { UserService } from '../../services/user-service';
import { CartService } from '../../services/cart-service';
import { CartItem } from '../../models/cart/cart-item.model';
import { DialogModule } from 'primeng/dialog';
import { ProductService } from '../../services/product-service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { calculateBuyerCommission, calculateTotalPrice } from '../../config/commission.config';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, DatePickerModule, FormsModule],
  templateUrl: './product-card-component.html',
  styleUrl: './product-card-component.scss'
})
export class ProductCardComponent implements OnInit, OnChanges {
  @Input() product!: ProductSummaryDTOModel;
  imageUrl: string = '';
  showDetailsDialog: boolean = false;
  productDetails: any = null;
  selectedDates: Date[] | undefined;
  minDate: Date = new Date();

  constructor(
    private router: Router, 
    private userService: UserService,
    private cartService: CartService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.updateImageUrl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && this.product) {
      this.updateImageUrl();
      this.cdr.detectChanges();
    }
  }

  updateImageUrl() {
    if (this.product && this.product.imageUrl) {
      this.imageUrl = this.getFullImageUrl(this.product.imageUrl);
    }
  }

  get isMyProduct(): boolean {
    const currentUser = this.userService.getCurrentUser();
    return !!(currentUser && this.product.ownerId === currentUser.userId);
  }

  // פונקציה להוספה לסל
  addToCart(product: any) {
    if (product.transactionType === 'מכירה') {
      // מוצר למכירה - הוסף ישירות לסל
      const cartItem: CartItem = {
        productId: product.productId,
        title: product.title,
        price: calculateTotalPrice(product.price, 'Sale'),
        imageUrl: this.imageUrl,
        city: product.city,
        transactionType: product.transactionType,
        quantity: 1
      };
      this.cartService.addToCart(cartItem);
    } else {
      // מוצר להשכרה/נופש - טען פרטים ופתח דיאלוג
      this.loadProductDetails();
    }
  }

  loadProductDetails() {
    this.productService.getProductById(this.product.productId).subscribe({
      next: (data) => {
        this.productDetails = data;
        this.showDetailsDialog = true;
      },
      error: (err) => console.error('Error loading product:', err)
    });
  }

  addToCartWithDates() {
    if (this.selectedDates && this.selectedDates[0] && this.selectedDates[1]) {
      // בדיקה להשכרה - רק חודשים שלמים
      if (this.product.transactionType === 'השכרה') {
        if (!this.isFullMonths(this.selectedDates[0], this.selectedDates[1])) {
          alert('⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים.\nלדוגמה: 12.02 - 12.03 (חודש אחד)');
          this.selectedDates = undefined;
          return;
        }
      }
      
      // בדיקת זמינות לפני הוספה לסל
      this.productService.checkAvailability(
        this.product.productId,
        this.selectedDates[0],
        this.selectedDates[1]
      ).subscribe({
        next: (isAvailable) => {
          if (isAvailable) {
            const transactionType = this.product.transactionType === 'השכרה' ? 'Rent' : 'Vacation';
            
            let finalPrice = this.product.price;
            // חישוב מחיר לפי תקופה
            if (this.product.transactionType === 'נופש') {
              const nights = this.calculateNights(this.selectedDates![0], this.selectedDates![1]);
              finalPrice = this.product.price * nights;
            } else if (this.product.transactionType === 'השכרה') {
              const months = this.calculateMonths(this.selectedDates![0], this.selectedDates![1]);
              finalPrice = this.product.price * months;
            }
            
            const totalWithCommission = calculateTotalPrice(finalPrice, transactionType);
            
            const cartItem: CartItem = {
              productId: this.product.productId,
              title: this.product.title,
              price: totalWithCommission,
              imageUrl: this.imageUrl,
              city: this.product.city,
              transactionType: this.product.transactionType,
              startDate: this.selectedDates![0],
              endDate: this.selectedDates![1],
              quantity: 1
            };
            this.cartService.addToCart(cartItem);
            this.onDialogHide();
          } else {
            alert('התאריכים שבחרת כבר תפוסים. אנא בחר תאריכים אחרים.');
          }
        },
        error: (err) => {
          console.error('Error checking availability:', err);
          alert('שגיאה בבדיקת זמינות');
        }
      });
    }
  }

  isFullMonths(start: Date, end: Date): boolean {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth());
    
    return monthsDiff >= 1 && startDate.getDate() === endDate.getDate();
  }

  calculateMonths(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months += endDate.getMonth() - startDate.getMonth();
    
    if (startDate.getDate() === endDate.getDate()) {
      months++;
    }
    
    return months;
  }

  calculateNights(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  onDialogHide() {
    this.showDetailsDialog = false;
    this.selectedDates = undefined;
    this.productDetails = null;
  }

  editProduct() {
    this.router.navigate(['/edit-product', this.product.productId]);
  }

  // פונקציית המעבר לדף פרטים נוספים
  viewDetails(productId: number) {
    console.log('מעבר לדף פרטים עבור מוצר מספר:', productId);
    this.router.navigate(['/product-details', productId]);
  }

  getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    // אם זה כבר URL מלא
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // אם זה נתיב יחסי, הוסף את כתובת השרת
    const serverUrl = 'https://localhost:44305';
    return serverUrl + '/' + imageUrl;
  }

  getCommissionRate(): string {
    const type = this.product?.transactionType;
    switch(type) {
      case 'מכירה': return '1%';
      case 'השכרה': return 'חודש שלם';
      case 'נופש': return '3%';
      default: return '2%';
    }
  }

  getBuyerCommission(): number {
    if (!this.productDetails) return 0;
    const type = this.productDetails.transactionType === 'מכירה' ? 'Sale' : 
                 this.productDetails.transactionType === 'השכרה' ? 'Rent' : 'Vacation';
    return calculateBuyerCommission(this.productDetails.price, type);
  }

  getTotalPrice(): number {
    if (!this.productDetails) return 0;
    const type = this.productDetails.transactionType === 'מכירה' ? 'Sale' : 
                 this.productDetails.transactionType === 'השכרה' ? 'Rent' : 'Vacation';
    return calculateTotalPrice(this.productDetails.price, type);
  }
}