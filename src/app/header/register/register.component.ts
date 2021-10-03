import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UserService } from 'src/app/shared/user.service';

import { UserModel } from 'src/app/shared/user-model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  // Event to toggle off register box when user clicks outside register box
  @Output() toggleRegisterBoxEvent: EventEmitter<void> = new EventEmitter();
  // Event to inform parent component (navbar) that user has registered successfully
  @Output() registerSuccessEvent: EventEmitter<UserModel> = new EventEmitter();

  private wasInside: boolean = true;

  errorMessage: string | undefined;

  // Register Reactive Form & Validations/Constraints
  registerForm: FormGroup = new FormGroup({
    username: new FormControl(undefined, [Validators.required, Validators.pattern('^[a-zA-Z0-9,.&\\-\']{2,50}$')]),
    password: new FormControl(undefined, [Validators.required]),
    firstName: new FormControl(undefined, [Validators.required, Validators.pattern('^[a-zA-Zα-ωΑ-Ω.,\\-\' ]{2,50}$')]),
    lastName: new FormControl(undefined, [Validators.required, Validators.pattern('^[a-zA-Zα-ωΑ-Ω.,\\-\' ]{2,50}$')]),
    email: new FormControl(undefined, [Validators.required, Validators.email, Validators.maxLength(50)]),
    phone: new FormControl(undefined, [Validators.pattern('^[+ 0-9]{10,15}$')]),
    country: new FormControl(undefined, [Validators.pattern('^[a-zA-Zα-ωΑ-Ω.,&()\\-\' ]{3,100}$')]),
    city: new FormControl(undefined, [Validators.pattern('^[a-zA-Zα-ωΑ-Ω.,&()\\-\' ]{3,50}$')]),
    address: new FormControl(undefined, [Validators.pattern('^[a-zA-Zα-ωΑ-Ω0-9.,&()\\-\' ]{3,50}$')])
  });

  constructor(private userService: UserService) { }

  ngOnInit(): void { }

  // Catch click inside form box only
  clickInside(): void {
    this.wasInside = true;
  }

  // Catch click anywhere in our page (in and out of form box)
  @HostListener('document:click')
  clickOutside(): void {
    if (!this.wasInside) {
      // If click wasn't inside
      // Emit event to header to close register pop up box
      this.toggleRegisterBoxEvent.emit();
    }
    // Actually wasInside always holds the false value when the user doesn't
    // click inside it will be already false from previous inside click and
    // trigger the event to close the pop up box
    this.wasInside = false;
  }

  // Return controls of the register form so we have a cleaner access to them in html
  get registerFormControl(): FormGroup['controls'] {
    return this.registerForm.controls;
  }

  // Register user
  register(): void {
    this.wasInside = false;

    const user: UserModel = new UserModel();
    // Take all values from the form and save them in a UserModel Object
    user.username = this.registerForm.get('username')?.value;
    user.password = this.registerForm.get('password')?.value;
    user.firstName = this.registerForm.get('firstName')?.value;
    user.lastName = this.registerForm.get('lastName')?.value;
    user.email = this.registerForm.get('email')?.value;
    user.phone = this.registerForm.get('phone')?.value;
    user.country = this.registerForm.get('country')?.value;
    user.city = this.registerForm.get('city')?.value;
    user.address = this.registerForm.get('address')?.value;
    user.joinDate = this.registerForm.get('joinDate')?.value;

    this.userService.register(user)
      .subscribe(() => {
        // Do nothing here, we don't care about returned data
      }, err => {
        // In case of an error
        if (err.error.message) {
          // Show error message sent by the server to the user or we could
          // check the err.error.code and provide a more customized by the
          // client message (could be usefull in a localized app for example)
          this.errorMessage = err.error.message;
        } else
          // If we got no error message from the server, it means there was
          // error communicating with the server
          this.errorMessage = 'Error establishing connection with the server. Please try again later.';
      }, () => {
        // Once register request is complete emit the events
        // One: to toggle off the register box
        this.toggleRegisterBoxEvent.emit();
        // Two: regiser success to inform the user that his account is created and pending activation by admins
        this.registerSuccessEvent.emit();
      });
  }

  // Close error message
  close(): void {
    this.errorMessage = undefined;
  }

}
