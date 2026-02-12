import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserLoginDTOModel, UserRegisterDTOModel, UserProfileDTOModel } from '../models/user/user-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://localhost:44305/api/users'; // כתובת ה-API שלך

  constructor(private http: HttpClient) { }

  /**
   * פונקציית הרשמה - שולחת את פרטי המשתמש החדש לשרת
   * תואם ל-UserRegisterDTO ב-C#
   */
  register(userData: UserRegisterDTOModel): Observable<any> {
    return this.http.post(`${this.apiUrl}`, userData);
  }

  /**
   * פונקציית התחברות - שולחת מייל וסיסמה
   * תואם ל-UserLoginDTO ב-C#
   */
  login(credentials: UserLoginDTOModel): Observable<UserProfileDTOModel> {
    return this.http.post<UserProfileDTOModel>(`${this.apiUrl}/login`, credentials);
  }

  /**
   *  שמירת נתוני המשתמש ב-Local Storage לאחר התחברות מוצלחת
   */
  saveUserToStorage(user: UserProfileDTOModel): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   *  בדיקה אם המשתמש מחובר
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('currentUser') !== null;
  }

  /**
   * התנתקות
   */
  logout(): void {
    localStorage.removeItem('currentUser');
  }
}