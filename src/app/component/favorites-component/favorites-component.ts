import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FavoritesService } from '../../services/favorites-service';
import { ProductModel } from '../../models/product/product-model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule],
  templateUrl: './favorites-component.html',
  styleUrl: './favorites-component.scss'
})
export class FavoritesComponent implements OnInit {
  favorites: ProductModel[] = [];

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
}
