import { ProductImageModel } from '../product-image/product-image-model';
import { ProductImageUrlDTOModel } from '../product-image/product-image-model';

export class ProductModel {
  productId: number = 0;
  title: string = '';
  description: string = '';
  price: number = 0;
  imageUrl: string = '';
  categoryId?: number;
  ownerId?: number;
  isAvailable: boolean = true;
  createdDate?: Date;
  city: string = '';
  rooms?: number;
  beds?: number;
  TransactionType: string = ''; // "מכירה", "השכרה", "נופש"
  // רשימת תמונות נוספות מה-Entity
  productImages: ProductImageModel[] = [];
}

export class ProductSummaryDTOModel {
    productId: number = 0;
    title: string = '';
    price: number = 0;
    imageUrl: string = '';
    city: string = '';
    beds?: number;
    rooms?: number;
    categoryCategoryName: string = '';
    transactionType: string = '';
    categoryId?: number;
}

export class ProductDetailsDTOModel {
    productId: number = 0;
    title: string = '';
    description: string = '';
    price: number = 0;
    imageUrl: string = '';
    productImages: ProductImageUrlDTOModel[] = [];
    city: string = '';
    beds?: number;
    rooms?: number;
    categoryId?: number;
    ownerId?: number;
    transactionType: string = '';
}

export class ProductCreateDTOModel {
    ownerId: number = 0;
    title: string = '';
    description: string = '';
    price: number = 0;
    imageUrl: string = '';
    productImages: ProductImageUrlDTOModel[] = [];
    categoryId: number = 0;
    city: string = '';
    beds: number = 0;
    rooms: number = 0;
    transactionType: string = '';
}

export class ProductUpdateDTOModel {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    additionalImages?: string[];
    categoryId?: number;
    city?: string;
    beds?: number;
    rooms?: number;
    transactionType?: string;
}