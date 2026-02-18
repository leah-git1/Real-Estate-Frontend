import { Routes } from '@angular/router';
import { AuthComponent } from './component/auth/auth';
import { ProductListComponent } from './component/product-list-component/product-list-component';
import { ProductDetailsComponent } from './component/product-details-component/product-details-component';
import { AddProductComponent } from './component/add-product-component/add-product-component';
import { EditProductComponent } from './component/edit-product-component/edit-product-component';
import { UserProfileComponent } from './component/user-profile-component/user-profile-component';
import { AdminDashboardComponent } from './component/admin-dashboard-component/admin-dashboard-component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'add-product', component: AddProductComponent },
  { path: 'edit-product/:id', component: EditProductComponent },
  { path: 'product-details/:id', component: ProductDetailsComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '', redirectTo: 'products', pathMatch: 'full' }, 
  { path: '**', redirectTo: 'products' } 
];