import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDTOModel } from '../models/category/category-model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://localhost:44305/api/category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryDTOModel[]> {
    return this.http.get<CategoryDTOModel[]>(this.apiUrl);
  }
}
