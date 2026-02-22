import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { FavoritesService } from '../../services/favorites-service';
import { ProductModel } from '../../models/product/product-model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, DialogModule, TooltipModule],
  templateUrl: './favorites-component.html',
  styleUrl: './favorites-component.scss'
})
export class FavoritesComponent implements OnInit {
  favorites: ProductModel[] = [];
  showEditRatingDialog: boolean = false;
  editingProduct: ProductModel | null = null;
  selectedRating: number = 0;
  hoverRating: number = 0;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.favoritesService.favorites$.subscribe(() => {
      this.loadFavorites();
    });
  }

  loadFavorites(): void {
    this.favorites = this.favoritesService.getFavorites();
  }

  removeFromFavorites(productId: number): void {
    this.favoritesService.removeFromFavorites(productId);
  }

  getImageUrl(imageUrl: string): string {
    const serverUrl = 'https://localhost:44305';
    return imageUrl.startsWith('http') ? imageUrl : serverUrl + imageUrl;
  }

  editRating(product: ProductModel) {
    this.editingProduct = product;
    this.selectedRating = product.rating || 0;
    this.hoverRating = 0;
    this.showEditRatingDialog = true;
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  setHoverRating(rating: number) {
    this.hoverRating = rating;
  }

  saveRating() {
    if (this.editingProduct && this.selectedRating > 0) {
      this.favoritesService.updateRating(this.editingProduct.productId, this.selectedRating);
      this.showEditRatingDialog = false;
      this.editingProduct = null;
      this.loadFavorites();
    }
  }
}
