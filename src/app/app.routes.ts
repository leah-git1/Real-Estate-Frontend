import { Routes } from '@angular/router';
import { AuthComponent } from './component/auth/auth';
import { ProductListComponent } from './component/product-list-component/product-list-component';
import { ProductDetailsComponent } from './component/product-details-component/product-details-component'; // וודאי שהנתיב לקומפוננטה החדשה נכון

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'auth', component: AuthComponent },
  
  // הוספת הנתיב לפרטי מוצר עם פרמטר ID
  // ה-':id' אומר לאנגולר שזה חלק משתנה בכתובת
  { path: 'product-details/:id', component: ProductDetailsComponent }, 

  // ניתוב ברירת מחדל לדף המוצרים
  { path: '', redirectTo: 'products', pathMatch: 'full' }, 
  
  // תפיסת כל נתיב לא קיים והפניה למוצרים
  { path: '**', redirectTo: 'products' } 
];