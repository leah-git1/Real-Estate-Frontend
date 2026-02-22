import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites-service';
import { ProductModel } from '../../models/product/product-model';

@Component({
  selector: 'app-favorites-sidebar',
  standalone: true,
  imports: [CommonModule, DrawerModule, ButtonModule, TooltipModule],
  templateUrl: './favorites-sidebar.component.html',
  styleUrl: './favorites-sidebar.component.scss'
})
export class FavoritesSidebarComponent implements OnInit {
  visible: boolean = false;
  favoriteItems: ProductModel[] = [];

  constructor(
    private favoritesService: FavoritesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.favoritesService.getFavoritesVisible().subscribe(visible => {
      this.visible = visible;
    });

    this.favoritesService.favorites$.subscribe(items => {
      this.favoriteItems = items;
    });
  }

  removeItem(productId: number) {
    this.favoritesService.removeFromFavorites(productId);
  }

  goToFavorites() {
    this.favoritesService.hideFavorites();
    this.router.navigate(['/favorites']);
  }

  goToProducts() {
    this.favoritesService.hideFavorites();
    this.router.navigate(['/products']);
  }

  closeSidebar() {
    this.favoritesService.hideFavorites();
  }

  getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const serverUrl = 'https://localhost:44305';
    return serverUrl + '/' + imageUrl;
  }

  getTransactionTypeLabel(type: string): string {
    switch(type) {
      case 'Sale': return 'מכירה';
      case 'Rent': return 'השכרה';
      case 'Vacation': return 'נופש';
      default: return type;
    }
  }

  viewDetails(productId: number) {
    this.favoritesService.hideFavorites();
    this.router.navigate(['/product-details', productId]);
  }

  contactOwner(item: ProductModel) {
    this.favoritesService.hideFavorites();
    this.router.navigate(['/product-details', item.productId], { 
      queryParams: { openContact: 'true' } 
    });
  }
}
