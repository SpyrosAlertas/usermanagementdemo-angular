import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { TokenModel } from './token-model';

// Service that stores to/loads from local storage current users info

@Injectable({
  providedIn: 'root'
})
export class UserLocalStorageService {

  // Subject with current user info
  private userSubject: Subject<TokenModel> = new Subject<TokenModel>();

  constructor(private router: Router) { }

  // When user logs in, initialize local storage with users data
  login(token: string): void {
    // Save raw token in local storage
    this.setToken(token);
    // Notify Observers about new user data
    this.userSubject.next(new TokenModel(token));
    // Navigate to homepage after successful login
    this.router.navigate(['']);
  }

  // When user logs out, clear local storage from users data
  logout(): void {
    // Remove token from local storage
    this.removeToken();
    // Notify observers current user is logged out
    this.userSubject.next();
  }

  // Get jwt from local storage - only user.service require the jwt, to send it to the server for authentication/authorization
  // also components can use this to check if users token has expired - null when token is expired
  get token(): string | null {
    return localStorage.getItem('jwt');
  }

  // Get username from jwt
  get username(): string {
    if (this.token) {
      // If there is a valid jwt in local storage
      const currentUser: TokenModel = new TokenModel(this.token);
      return currentUser.username;
    }
    // No user - no username
    return '';
  }

  get role(): string {
    if (this.token) {
      // Return users role from jwt
      const currentUser: TokenModel = new TokenModel(this.token);
      return currentUser.myRole;
    }
    // No user - no role
    return '';
  }

  get isLoggedIn(): boolean {
    // If there is not token (or token is invalid or expired), user is not logged in
    if (this.token === null)
      return false;
    // Else user is authenticated
    return true;
  }

  get isAdmin(): boolean {
    if (this.token !== null) {
      // If there is a (valid) token
      // Check if current user actually has the role of admin
      if (new TokenModel(this.token).myRole === 'ADMIN')
        return true;
    }
    // No (valid) token or current user not an admin
    return false;
  }

  getUserSubject(): Subject<TokenModel> {
    return this.userSubject;
  }

  // Call this method on any Component ngOnInit - so if user refreshes the page
  // or navigates back and forth to a page, current user data are refreshed too
  // In our case only in header component this is required
  // -- Node: The reason we need it in a method, that will be called within the
  // component that subscribes to this observable is because if we did this for
  // example in service constructor, the next method would be called first and
  // then the components would be created and subscribe to the observable and
  // thus not receiving the date from local storage --
  onPageRefresh(): void {
    if (this.token)
      this.userSubject.next(new TokenModel(this.token));
  }

  // Save jwt in local storage - when user logs in
  private setToken(token: string): void {
    localStorage.setItem('jwt', token);
  }

  // Remove jwt from local storage - when user logs out
  private removeToken(): void {
    localStorage.removeItem('jwt');
  }

}
