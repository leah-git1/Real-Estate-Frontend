import { Routes } from '@angular/router';
import { AuthComponent } from './component/auth/auth';
import { ProductListComponent } from './component/product-list-component/product-list-component';
import { ProductDetailsComponent } from './component/product-details-component/product-details-component';
import { AddProductComponent } from './component/add-product-component/add-product-component';

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'add-product', component: AddProductComponent },
  { path: 'product-details/:id', component: ProductDetailsComponent }, 
  { path: '', redirectTo: 'products', pathMatch: 'full' }, 
  { path: '**', redirectTo: 'products' } 
];