import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { OrderService } from '../../services/order-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, GalleriaModule, DatePickerModule, FormsModule],
  templateUrl: './product-details-component.html',
  styleUrl: './product-details-component.scss'
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  images: any[] = [];
  activeIndex: number = 0;

  rangeDates: Date[] | undefined;
  minDate: Date = new Date();
  disabledDates: Date[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  availabilityMessage: string = '';
  isRangeAvailable: boolean = false;
  returnUrl: string = '/products';
  returnTab: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // קרא query params לחזרה
    this.route.queryParams.subscribe(params => {
      if (params['returnTo'] === 'profile') {
        this.returnUrl = '/profile';
        this.returnTab = params['tab'] ? +params['tab'] : 0;
      }
    });
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          this.setupGallery(data);
          if (data.transactionType !== 'Sale') {
            console.log('מוצר לא למכירה, טוען תאריכים תפוסים');
            this.loadOccupiedDates();
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching product:', err)
      });
    }
  }

  goBack() {
    if (this.returnUrl === '/profile') {
      this.router.navigate([this.returnUrl], { queryParams: { tab: this.returnTab } });
    } else {
      this.router.navigate([this.returnUrl]);
    }
  }

  setupGallery(data: any) {
    const serverUrl = 'https://localhost:44305';
    const timestamp = '?t=' + Date.now();
    const mainImageUrl = data.imageUrl.startsWith('http') ? data.imageUrl + timestamp : serverUrl + data.imageUrl + timestamp;
    
    this.images = [{ itemImageSrc: mainImageUrl, thumbnailImageSrc: mainImageUrl }];
    if (data.productImages && data.productImages.length > 0) {
      data.productImages.forEach((img: any) => {
        const additionalImageUrl = img.additionalImageUrl.startsWith('http') ? img.additionalImageUrl + timestamp : serverUrl + img.additionalImageUrl + timestamp;
        this.images.push({ 
          itemImageSrc: additionalImageUrl, 
          thumbnailImageSrc: additionalImageUrl 
        });
      });
    }
  }

  loadOccupiedDates(month?: number, year?: number) {
    const targetMonth = month || this.currentMonth + 1;
    const targetYear = year || this.currentYear;
    
    console.log('קורא ל-loadOccupiedDates עבור חודש:', targetMonth, 'שנה:', targetYear);
    
    this.orderService.getOccupiedDates(this.product.productId, targetMonth, targetYear)
      .subscribe({
        next: (data) => {
          console.log('תאריכים תפוסים שהתקבלו:', data.occupiedDates);
          this.disabledDates = data.occupiedDates.map(dateStr => {
            const date = new Date(dateStr);
            console.log('ממיר תאריך:', dateStr, 'ל-', date);
            return date;
          });
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching occupied dates:', err)
      });
  }

  onMonthChange(event: any) {
    console.log('שינוי חודש:', event);
    this.currentMonth = event.month;
    this.currentYear = event.year;
    this.loadOccupiedDates(event.month + 1, event.year);
  }

  onDateChange(dates: Date[] | undefined) {
    console.log('onDateChange נקרא עם:', dates);
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      console.log('בודק זמינות עבור טווח:', dates[0], 'עד', dates[1]);
      this.checkRangeAvailability(dates[0], dates[1]);
    } else {
      console.log('לא נבחר טווח מלא, מאפס הודעה');
      this.availabilityMessage = '';
      this.isRangeAvailable = false;
    }
  }

  checkRangeAvailability(startDate: Date, endDate: Date) {
    console.log('קורא ל-API לבדיקת זמינות:', startDate, endDate);
    this.productService.checkAvailability(this.product.productId, startDate, endDate)
      .subscribe({
        next: (isAvailable) => {
          console.log('תשובה מה-API:', isAvailable);
          this.isRangeAvailable = isAvailable;
          if (isAvailable) {
            this.availabilityMessage = '✓ התאריכים זמינים להזמנה!';
            console.log('הטווח זמין');
          } else {
            this.availabilityMessage = '✗ התאריכים לא זמינים - יש חפיפה עם תאריכים תפוסים';
            console.log('הטווח לא זמין, מאפס בחירה');
            // מאפס את הבחירה אם הטווח לא זמין
            setTimeout(() => {
              this.rangeDates = undefined;
              this.cdr.detectChanges();
            }, 100);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('שגיאה בבדיקת זמינות:', err);
          this.availabilityMessage = 'שגיאה בבדיקת זמינות';
          this.isRangeAvailable = false;
          this.rangeDates = undefined;
        }
      });
  }

  onImageChange(index: number) {
    this.activeIndex = index;
    this.cdr.detectChanges();
  }

  nextImage() {
    this.activeIndex = (this.activeIndex + 1) % this.images.length;
    this.cdr.detectChanges();
  }

  previousImage() {
    this.activeIndex = this.activeIndex === 0 ? this.images.length - 1 : this.activeIndex - 1;
    this.cdr.detectChanges();
  }

  canAddToCart(): boolean {
    console.log('בודק אם ניתן להוסיף לסל:', {
      product: !!this.product,
      transactionType: this.product?.transactionType,
      rangeDates: this.rangeDates,
      isRangeAvailable: this.isRangeAvailable
    });
    
    if (!this.product) {
      console.log('אין מוצר');
      return false;
    }
    
    if (this.product.transactionType === 'Sale') {
      console.log('מוצר למכירה - מותר');
      return true;
    }
    
    const canAdd = !!(this.rangeDates && this.rangeDates[0] && this.rangeDates[1] && this.isRangeAvailable);
    console.log('תוצאה סופית:', canAdd);
    return canAdd;
  }

  addToCart() {
    console.log('הוספה לסל:', this.product.title, 'תאריכים:', this.rangeDates);
  }
}
