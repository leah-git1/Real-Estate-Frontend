import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserLoginDTOModel, UserRegisterDTOModel, UserProfileDTOModel, UserUpdateDTOModel } from '../models/user/user-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://localhost:44305/api/users';

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
    const user = this.getCurrentUser();
    return user !== null && user.userId > 0;
  }

  /**
   * קבלת המשתמש המחובר
   */
  getCurrentUser(): UserProfileDTOModel | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * התנתקות
   */
  logout(): void {
    localStorage.removeItem('currentUser');
  }

  /**
   * עדכון פרטי משתמש
   */
  updateUser(id: number, userData: UserUpdateDTOModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  /**
   * קבלת פרטי משתמש לפי ID
   */
  getUserById(id: number): Observable<UserProfileDTOModel> {
    return this.http.get<UserProfileDTOModel>(`${this.apiUrl}/${id}`);
  }
}