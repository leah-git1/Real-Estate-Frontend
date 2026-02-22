import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ProductSummaryDTOModel } from '../../models/product/product-model';
import { UserService } from '../../services/user-service';
import { CartService } from '../../services/cart-service';
import { FavoritesService } from '../../services/favorites-service';
import { OrderService } from '../../services/order-service';
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
  showRatingDialog: boolean = false;
  selectedRating: number = 0;
  hoverRating: number = 0;
  productDetails: any = null;
  selectedDates: Date[] | undefined;
  minDate: Date = new Date();
  disabledDates: Date[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  availabilityMessage: string = '';
  isRangeAvailable: boolean = false;

  constructor(
    private router: Router, 
    private userService: UserService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private productService: ProductService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.updateImageUrl();
    console.log('Product data:', this.product);
    console.log('TransactionType:', this.product?.transactionType);
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
        this.loadOccupiedDates();
      },
      error: (err) => console.error('Error loading product:', err)
    });
  }

  loadOccupiedDates(month?: number, year?: number) {
    const targetMonth = month || this.currentMonth + 1;
    const targetYear = year || this.currentYear;
    
    this.orderService.getOccupiedDates(this.product.productId, targetMonth, targetYear)
      .subscribe({
        next: (data) => {
          this.disabledDates = data.occupiedDates.map(dateStr => new Date(dateStr));
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching occupied dates:', err)
      });
  }

  onMonthChange(event: any) {
    this.currentMonth = event.month;
    this.currentYear = event.year;
    this.loadOccupiedDates(event.month + 1, event.year);
  }

  onDateChange(dates: Date[] | undefined) {
    console.log('onDateChange called with:', dates);
    console.log('Product transactionType:', this.product.transactionType);
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      if (this.product.transactionType === 'השכרה' || this.product.transactionType === 'Rent') {
        console.log('Checking full months...');
        if (!this.isFullMonths(dates[0], dates[1])) {
          console.log('NOT full months!');
          this.availabilityMessage = '⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים. בחר את אותו יום בחודש';
          this.isRangeAvailable = false;
          setTimeout(() => {
            this.selectedDates = undefined;
            this.cdr.detectChanges();
          }, 2000);
          return;
        }
      }
      this.checkRangeAvailability(dates[0], dates[1]);
    } else {
      this.availabilityMessage = '';
      this.isRangeAvailable = false;
    }
  }

  checkRangeAvailability(startDate: Date, endDate: Date) {
    if (this.product.transactionType === 'השכרה' || this.product.transactionType === 'Rent') {
      if (!this.isFullMonths(startDate, endDate)) {
        this.availabilityMessage = '⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים. בחר את אותו יום בחודש';
        this.isRangeAvailable = false;
        setTimeout(() => {
          this.selectedDates = undefined;
          this.cdr.detectChanges();
        }, 2000);
        return;
      }
    }
    
    this.productService.checkAvailability(this.product.productId, startDate, endDate)
      .subscribe({
        next: (isAvailable) => {
          this.isRangeAvailable = isAvailable;
          if (isAvailable) {
            this.availabilityMessage = '✓ התאריכים זמינים להזמנה!';
          } else {
            this.availabilityMessage = '✗ התאריכים לא זמינים - יש חפיפה עם תאריכים תפוסים';
            setTimeout(() => {
              this.selectedDates = undefined;
              this.cdr.detectChanges();
            }, 100);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('שגיאה בבדיקת זמינות:', err);
          this.availabilityMessage = 'שגיאה בבדיקת זמינות';
          this.isRangeAvailable = false;
          this.selectedDates = undefined;
        }
      });
  }

  addToCartWithDates() {
    if (this.selectedDates && this.selectedDates[0] && this.selectedDates[1] && this.isRangeAvailable) {
      let finalPrice = this.product.price;
      
      if (this.product.transactionType === 'נופש') {
        const nights = this.calculateNights(this.selectedDates[0], this.selectedDates[1]);
        finalPrice = this.product.price * nights;
        finalPrice = calculateTotalPrice(finalPrice, 'Vacation');
      } else if (this.product.transactionType === 'השכרה') {
        const months = this.calculateMonths(this.selectedDates[0], this.selectedDates[1]);
        finalPrice = this.product.price * (months + 1);
      }
      
      const cartItem: CartItem = {
        productId: this.product.productId,
        title: this.product.title,
        price: finalPrice,
        basePrice: this.product.price,
        imageUrl: this.imageUrl,
        city: this.product.city,
        transactionType: this.product.transactionType,
        startDate: this.selectedDates[0],
        endDate: this.selectedDates[1],
        quantity: 1
      };
      this.cartService.addToCart(cartItem);
      this.onDialogHide();
    }
  }

  isFullMonths(start: Date, end: Date): boolean {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // בדיקה שהיום בחודש זהה
    if (startDate.getDate() !== endDate.getDate()) {
      return false;
    }
    
    // חישוב הפרש בחודשים
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth());
    
    return monthsDiff >= 1;
  }

  calculateMonths(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months += endDate.getMonth() - startDate.getMonth();
    
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
    this.disabledDates = [];
    this.availabilityMessage = '';
    this.isRangeAvailable = false;
  }

  editProduct() {
    this.router.navigate(['/edit-product', this.product.productId], { queryParams: { returnTo: 'products' } });
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
      case 'Sale': 
      case 'מכירה': return '1%';
      case 'Rent':
      case 'השכרה': return 'חודש שלם';
      case 'Vacation':
      case 'נופש': return '3%';
      default: return '2%';
    }
  }

  getBuyerCommission(): number {
    if (!this.productDetails) return 0;
    const type = this.productDetails.transactionType === 'Sale' || this.productDetails.transactionType === 'מכירה' ? 'Sale' : 
                 this.productDetails.transactionType === 'Rent' || this.productDetails.transactionType === 'השכרה' ? 'Rent' : 'Vacation';
    return calculateBuyerCommission(this.productDetails.price, type);
  }

  getTotalPrice(): number {
    if (!this.productDetails) return 0;
    const type = this.productDetails.transactionType === 'Sale' || this.productDetails.transactionType === 'מכירה' ? 'Sale' : 
                 this.productDetails.transactionType === 'Rent' || this.productDetails.transactionType === 'השכרה' ? 'Rent' : 'Vacation';
    return calculateTotalPrice(this.productDetails.price, type);
  }

  getTransactionTypeLabel(type: string): string {
    switch(type) {
      case 'Sale': return 'מכירה';
      case 'Rent': return 'השכרה';
      case 'Vacation': return 'נופש';
      default: return type;
    }
  }

  isSaleType(): boolean {
    return this.product?.transactionType === 'Sale' || this.product?.transactionType === 'מכירה';
  }

  isVacationType(): boolean {
    return this.product?.transactionType === 'Vacation' || this.product?.transactionType === 'נופש';
  }

  addToFavorites(product: any) {
    this.selectedRating = 0;
    this.hoverRating = 0;
    this.showRatingDialog = true;
  }

  submitRating() {
    if (this.selectedRating === 0) {
      return;
    }
    
    const wasAdded = this.favoritesService.addToFavorites({
      productId: this.product.productId,
      title: this.product.title,
      price: this.product.price,
      imageUrl: this.imageUrl,
      city: this.product.city,
      TransactionType: this.product.transactionType,
      description: '',
      categoryId: this.product.categoryId,
      ownerId: this.product.ownerId,
      isAvailable: true,
      productImages: [],
      rating: this.selectedRating
    });
    
    this.showRatingDialog = false;
    
    if (wasAdded) {
      this.favoritesService.showFavorites();
    } else {
      alert('המוצר כבר נמצא במועדפים!');
    }
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }
}