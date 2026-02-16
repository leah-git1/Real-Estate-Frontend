import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductSummaryDTOModel } from '../models/product/product-model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://localhost:44305/api/product';

  constructor(private http: HttpClient) {}

  getProducts(
    categoryIds: number[], 
    city: string | null, 
    minPrice: number | null, 
    maxPrice: number | null, 
    rooms: number | null, 
    beds: number | null, 
    position: number, 
    skip: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('position', position.toString())
      .set('skip', skip.toString());

    if (categoryIds && categoryIds.length > 0) {
      categoryIds.forEach(id => {
        params = params.append('categoryIds', id.toString());
      });
    }
    if (city) params = params.set('city', city);
    if (minPrice) params = params.set('minPrice', minPrice.toString());
    if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
    if (rooms) params = params.set('rooms', rooms.toString());
    if (beds) params = params.set('beds', beds.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

getProductById(id: number): Observable<any> {
  // לפי ה-Swagger ששלחת:
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}
}