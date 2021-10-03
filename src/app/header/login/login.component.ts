import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { UserLocalStorageService } from 'src/app/shared/user-local-storage.service';
import { UserService } from 'src/app/shared/user.service';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Event to toggle off login box when user clicks outside register box
  @Output() toggleLoginBoxEvent: EventEmitter<void> = new EventEmitter();

  // Event to notify header component that user has logged in successfully
  @Output() loginSuccessEvent: EventEmitter<void> = new EventEmitter();

  private wasInside: boolean = true;

  errorMessage: string | undefined;

  loginForm: FormGroup = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private userService: UserService, private userLocalStorageService: UserLocalStorageService) { }

  ngOnInit(): void { }

  // Catch click inside form box only
  clickInside(): void {
    this.wasInside = true;
  }

  // Catch click anywhere in our page (in and out of form box)
  @HostListener('document:click')
  clickOutside(): void {
    if (!this.wasInside) {
      // If click was outside, emit event to header  to close login box
      this.toggleLoginBoxEvent.emit();
    }
    // Else click was inside and we keep login box open
    this.wasInside = false;
  }

  // Try to login user with the credentials he gave
  login(): void {
    const username: string = this.loginForm.get('username')?.value;
    const password: string = this.loginForm.get('password')?.value;
    if (!username || !password) {
      // If user didn't type username or password,
      // just show an error message and don't even send http request to server
      this.errorMessage = 'Missing Username or password';
      return;
    }
    this.userService.login(username, password)
      .subscribe(response => {
        // Get Authentication token from header and save it (in local storage)
        const authToken = response.headers.get(environment.authHeader);
        if (authToken) {
          // Normally we should always receive a token (and a user) from the server at this point
          this.userLocalStorageService.login(authToken);
        }
        // Upon Successfull login, close login box too
        this.toggleLoginBoxEvent.emit();
        // and notify header (parent) component that user logged in successfully
        this.loginSuccessEvent.emit();
      }, (err) => {
        // In case of error
        if (err.error.message) {
          // Set errorMessage to dislay to the user
          this.errorMessage = err.error.message;
        }
        else {
          // If there was an error but no error.message it means client couldn't reach server
          this.errorMessage = 'Error establishing connection with the server. Please try again later.';
        }
      }); // http observable subscriptions complete, so there is not need to unsubscribe in ngOnDestroy to avoid memory leaks
  }

  // Close error message
  close(): void {
    this.errorMessage = undefined;
  }

}
