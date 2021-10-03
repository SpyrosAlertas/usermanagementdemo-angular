import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UserLocalStorageService } from './user-local-storage.service';

import { UserModel } from './user-model';

import { environment } from 'src/environments/environment';
import { FilterOptions } from '../admin-panel/filter-options';

// Service that connects to the servers rest api to fetch info from the server/database

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private serverUrl: string = environment.serverUrl + '/users';

  constructor(private http: HttpClient, private userLocalStorageService: UserLocalStorageService) { }

  // Register new user
  register(user: UserModel): Observable<UserModel> {
    return this.http.post<UserModel>(this.serverUrl, user);
  }

  // Get list of 'all' users paginated
  getUsers(page: number, sort: string, order: string, pageSize: number): Observable<UserModel[]> {
    const requestUrl: string = `${this.serverUrl}?sort=${sort}&page=${page}&order=${order}&pagesize=${pageSize}`;
    return this.http.get<UserModel[]>(requestUrl, { 'headers': this.createAuthHeader() });
  }

  // Get list of 'all' users paginated & filtered
  getUsersFiltered(page: number, sort: string, order: string, pageSize: number, filterOptions: FilterOptions): Observable<UserModel[]> {
    const requestUrl: string = `${this.serverUrl}/search?sort=${sort}&page=${page}&order=${order}&pagesize=${pageSize}`;
    return this.http.post<UserModel[]>(requestUrl, filterOptions, { 'headers': this.createAuthHeader() });
  }

  // Login/Authenticate user from server based on username and password
  login(username: string, password: string): Observable<HttpResponse<UserModel>> {
    // observe: 'response' is required to get the authorization token from the header
    return this.http.post<UserModel>(`${this.serverUrl}/login`, { username: username, password: password }, { observe: 'response' });
  }

  // Get a single user by username
  getUser(username: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.serverUrl}/${username}`, { 'headers': this.createAuthHeader() });
  }

  // Update user
  updateUser(user: UserModel): Observable<UserModel> {
    return this.http.put<UserModel>(`${this.serverUrl}/${user.username}`, user, { 'headers': this.createAuthHeader() });
  }

  // Delete user by username
  deleteUser(username: string): Observable<UserModel> {
    return this.http.delete<UserModel>(`${this.serverUrl}/${username}`, { 'headers': this.createAuthHeader() });
  }

  // Activate user by username
  activateUser(username: string): Observable<UserModel> {
    return this.http.put<UserModel>(`${this.serverUrl}/${username}/activate`, null, { 'headers': this.createAuthHeader() });
  }

  // Get profile image by username
  downloadProfileImage(username: string): Observable<Blob> {
    return this.http.get(`${this.serverUrl}/${username}/profileImage`, { 'headers': this.createAuthHeader(), responseType: 'blob' });
  }

  // Upload profile image by username
  uploadProfileImage(username: string, newPofileImage: File): Observable<void> {
    const headers: HttpHeaders | undefined = this.createAuthHeader();
    // Set the profile image in formData that will be sent to the server
    const formData = new FormData();
    formData.append('profileImage', newPofileImage);
    return this.http.put<void>(`${this.serverUrl}/${username}/profileImage`, formData, { 'headers': headers });
  }

  // Delete profile image by username
  deleteProfileImage(username: string): Observable<void> {
    return this.http.delete<void>(`${this.serverUrl}/${username}/profileImage`, { 'headers': this.createAuthHeader() });
  }

  // -- Private Helper Methods

  // Create an authorization header with the jwt stored in local storage
  private createAuthHeader(): HttpHeaders | undefined {
    const token: string | null = this.userLocalStorageService.token;
    if (token)
      // If there is a token in local storage, save it in HttHeaders as Authorization token
      return new HttpHeaders().set(environment.authHeader, token);
    else
      return undefined;
  }

}
