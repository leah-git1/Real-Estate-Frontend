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
}

export class ProductUpdateDTOModel {
    title: string = '';
    description: string = '';
    price: number = 0;
    mainImageUrl: string = '';
    additionalImages: string[] = [];
    categoryID: number = 0;
    city: string = '';
    beds: number = 0;
}