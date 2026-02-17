import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, GalleriaModule, FormsModule],
  templateUrl: './product-details-component.html',
  styleUrl: './product-details-component.scss'
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  images: any[] = [];
  activeIndex: number = 0;

  // תאריכים עבור השכרה/נופש
  rangeDates: Date[] | undefined;
  minDate: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          this.setupGallery(data);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching product:', err)
      });
    }
  }

  setupGallery(data: any) {
    this.images = [{ itemImageSrc: data.imageUrl, thumbnailImageSrc: data.imageUrl }];
    if (data.productImages && data.productImages.length > 0) {
      data.productImages.forEach((img: any) => {
        this.images.push({ 
          itemImageSrc: img.additionalImageUrl, 
          thumbnailImageSrc: img.additionalImageUrl 
        });
      });
    }
  }

  onImageChange(index: number) {
    this.activeIndex = index;
    this.cdr.detectChanges();
  }

  canAddToCart(): boolean {
    if (!this.product) return false;
    // במכירה אפשר להוסיף תמיד. בנופש/השכרה חייב לבחור טווח תאריכים
    if (this.product.dealType === 'מכירה') return true;
    return !!(this.rangeDates && this.rangeDates[0] && this.rangeDates[1]);
  }

  addToCart() {
    console.log('הוספה לסל:', this.product.title, 'תאריכים:', this.rangeDates);
  }
}