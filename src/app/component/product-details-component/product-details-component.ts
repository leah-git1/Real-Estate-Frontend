import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges, Injector } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { OrderService } from '../../services/order-service';
import { CartService } from '../../services/cart-service';
import { UserService } from '../../services/user-service';
import { PropertyInquiryService } from '../../services/property-inquiry-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { calculateBuyerCommission, calculateTotalPrice } from '../../config/commission.config';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, GalleriaModule, DatePickerModule, FormsModule, DialogModule, InputTextModule],
  templateUrl: './product-details-component.html',
  styleUrl: './product-details-component.scss'
})
export class ProductDetailsComponent implements OnInit, OnChanges {
  @Input() productId: number | null = null;
  @Input() isEmbedded: boolean = false;
  
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
  
  showContactDialog: boolean = false;
  ownerDetails: any = null;
  contactForm = {
    name: '',
    phone: '',
    email: '',
    message: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
    private cartService: CartService,
    private userService: UserService,
    private propertyInquiryService: PropertyInquiryService,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {}

  ngOnInit(): void {
    if (!this.isEmbedded) {
      this.route.queryParams.subscribe(params => {
        if (params['returnTo'] === 'profile') {
          this.returnUrl = '/profile';
          this.returnTab = params['tab'] ? +params['tab'] : 0;
        }
      });
      
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    } else if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId && this.isEmbedded) {
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        this.setupGallery(data);
        if (data.transactionType !== 'Sale' && !this.isEmbedded) {
          this.loadOccupiedDates();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        this.product = null;
        this.cdr.detectChanges();
      }
    });
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
    console.log('Product transactionType:', this.product?.transactionType);
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      if (this.product && (this.product.transactionType === 'Rent' || this.product.transactionType === 'השכרה')) {
        console.log('Checking full months...');
        if (!this.isFullMonths(dates[0], dates[1])) {
          console.log('NOT full months!');
          this.availabilityMessage = '⚠️ בהשכרה ניתן להשכיר רק חודשים שלמים. בחר את אותו יום בחודש';
          this.isRangeAvailable = false;
          setTimeout(() => {
            this.rangeDates = undefined;
            this.cdr.detectChanges();
          }, 2000);
          return;
        }
      }
      console.log('בודק זמינות עבור טווח:', dates[0], 'עד', dates[1]);
      this.checkRangeAvailability(dates[0], dates[1]);
    } else {
      console.log('לא נבחר טווח מלא, מאפס הודעה');
      this.availabilityMessage = '';
      this.isRangeAvailable = false;
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
    
    let finalPrice = this.product.price;
    
    // חישוב מחיר לפי סוג עסקה
    if (this.rangeDates && this.rangeDates[0] && this.rangeDates[1]) {
      if (this.product.transactionType === 'Vacation') {
        const nights = this.calculateNights(this.rangeDates[0], this.rangeDates[1]);
        finalPrice = this.product.price * nights;
        finalPrice = calculateTotalPrice(finalPrice, 'Vacation');
      } else if (this.product.transactionType === 'Rent') {
        const months = this.calculateMonths(this.rangeDates[0], this.rangeDates[1]);
        finalPrice = this.product.price * (months + 1);
      }
    }
    
    const cartItem = {
      productId: this.product.productId,
      title: this.product.title,
      price: finalPrice,
      basePrice: this.product.price,
      imageUrl: this.product.imageUrl,
      city: this.product.city,
      transactionType: this.product.transactionType === 'Sale' ? 'מכירה' : 
                       this.product.transactionType === 'Rent' ? 'השכרה' : 'נופש',
      startDate: this.rangeDates?.[0],
      endDate: this.rangeDates?.[1],
      quantity: 1
    };
    
    this.cartService.addToCart(cartItem);
  }

  getBuyerCommission(): number {
    return calculateBuyerCommission(this.product?.price || 0, this.product?.transactionType || 'Sale');
  }

  getTotalPrice(): number {
    return calculateTotalPrice(this.product?.price || 0, this.product?.transactionType || 'Sale');
  }

  getCommissionRate(): string {
    const type = this.product?.transactionType?.toUpperCase();
    switch(type) {
      case 'SALE': return '1%';
      case 'RENT': return 'חודש שלם';
      case 'VACATION': return '3%';
      default: return '2%';
    }
  }

  isOwner(): boolean {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !this.product) return false;
    return this.product.ownerId === currentUser.userId;
  }

  openContactDialog() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.contactForm.name = currentUser.fullName || '';
      this.contactForm.phone = currentUser.phone || '';
      this.contactForm.email = currentUser.email || '';
    }
    
    if (this.product?.ownerId) {
      this.userService.getUserById(this.product.ownerId).subscribe({
        next: (owner) => {
          this.ownerDetails = owner;
          this.showContactDialog = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading owner details:', err);
          this.showContactDialog = true;
        }
      });
    } else {
      this.showContactDialog = true;
    }
  }

  submitContactForm() {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      alert('יש להתחבר כדי ליצור קשר');
      return;
    }

    const inquiry = {
      productId: this.product.productId,
      userId: currentUser.userId,
      ownerId: this.product.ownerId,
      name: this.contactForm.name,
      phone: this.contactForm.phone,
      email: this.contactForm.email,
      message: this.contactForm.message
    };

    this.propertyInquiryService.createInquiry(inquiry).subscribe({
      next: () => {
        alert('הפנייה נשלחה בהצלחה!');
        this.showContactDialog = false;
        this.contactForm = { name: '', phone: '', email: '', message: '' };
      },
      error: (err) => {
        console.error('Error sending inquiry:', err);
        alert('שגיאה בשליחת הפנייה');
      }
    });
  }
}
