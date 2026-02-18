import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProductService } from '../../services/product-service';
import { CategoryService } from '../../services/category-service';
import { ProductUpdateDTOModel } from '../../models/product/product-model';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, InputNumberModule, ButtonModule, SelectModule],
  templateUrl: './edit-product-component.html',
  styleUrl: './edit-product-component.scss'
})
export class EditProductComponent implements OnInit {
  productId: number = 0;
  product: ProductUpdateDTOModel = {};
  categories: any[] = [];
  transactionTypes = [
    { label: 'מכירה', value: 'Sale' },
    { label: 'השכרה', value: 'Rent' },
    { label: 'נופש', value: 'Vacation' }
  ];
  showImageSection: boolean = false;
  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    this.loadProduct();
    this.loadCategories();
  }

  loadProduct() {
    this.productService.getProductById(this.productId).subscribe({
      next: (data) => {
        this.product = {
          title: data.title,
          description: data.description,
          price: data.price,
          city: data.city,
          rooms: data.rooms,
          beds: data.beds,
          categoryId: data.categoryId,
          transactionType: data.transactionType
        };
      },
      error: (err) => console.error('Error loading product:', err)
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  onSubmit() {
    console.log('onSubmit called');
    console.log('mainImageFile:', this.mainImageFile);
    if (this.mainImageFile) {
      const formData = new FormData();
      formData.append('file', this.mainImageFile);
      console.log('Uploading image...');
      this.productService.uploadImage(formData).subscribe({
        next: (imageUrl) => {
          console.log('Image uploaded successfully, URL:', imageUrl);
          this.product.imageUrl = imageUrl;
          console.log('Product before update:', this.product);
          this.updateProduct();
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          alert('שגיאה בהעלאת התמונה');
        }
      });
    } else {
      console.log('No image file, updating product without image');
      this.updateProduct();
    }
  }

  updateProduct() {
    console.log('updateProduct called with:', this.product);
    console.log('Product ID:', this.productId);
    this.productService.updateProduct(this.productId, this.product).subscribe({
      next: (response) => {
        console.log('Update response:', response);
        alert('המוצר עודכן בהצלחה!');
        this.router.navigate(['/profile'], { queryParams: { tab: 2 } });
      },
      error: (err) => {
        console.error('Error updating product:', err);
        alert('שגיאה בעדכון המוצר');
      }
    });
  }

  onMainImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.mainImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.mainImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleImageSection() {
    this.showImageSection = !this.showImageSection;
  }

  cancel() {
    this.router.navigate(['/profile'], { queryParams: { tab: 2 } });
  }
}
