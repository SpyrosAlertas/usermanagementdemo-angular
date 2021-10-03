import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

import { ErrorModel } from './error-model';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit, OnDestroy {

  error: ErrorModel | undefined;

  // True when user types on his own the error-page url to change the color from red to green
  funnyMessage: boolean = false;

  constructor(private titleService: Title, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    const errorTmp: string | null = localStorage.getItem('error');
    if (errorTmp) {
      // If user refreshes the error page we fetch the last error status from local storage
      this.error = JSON.parse(errorTmp);
      this.titleService.setTitle(`${this.error?.title} | ${environment.appTitle}`);
    } else {
      // Else check the error message the component that threw the error sent here
      this.activatedRoute.paramMap
        .pipe(map(() => window.history.state))
        .subscribe((error: ErrorModel) => {
          // error will always have a value here - so we check if it has title, which is a
          // field only set by us or if we have something stored in local storage as 'error'
          if (error.title) {
            // If an error was caused by client - app
            this.error = new ErrorModel(error.title, error.briefDescription, error.briefDescription, error.type);
            // Store error in local storage - in case user refreshes the page we want error message to persist
            localStorage.setItem('error', JSON.stringify(this.error));
          } else {
            // Else if user just typed this address, show a funny message (or if we forgot to send a real error message when redirecting here)
            // or we could redirect him to the homepage when he wasn't really redirected here by a caused error
            const time: any = new Date().getHours();
            let timeText: string | undefined;
            if (time > 6 && time < 17) timeText = 'day';
            else if (time > 6 && time < 20) timeText = 'evening';
            else timeText = ' night owly person';
            this.error = new ErrorModel('Oopsies!', '⚆_⚆ Oh Well!', 'Now why would you do that? Nonetheless have a beautiful ' + timeText + '! ¯\\_(ツ)_/¯', 'success');
            this.funnyMessage = true;
          }
          this.titleService.setTitle(`${this.error.title} | ${environment.appTitle}`);
        }).unsubscribe(); // At the end we have to unsubscribe
    }
  }

  ngOnDestroy(): void {
    // When this component is destroyed, remove useless error message from local storage
    localStorage.removeItem('error');
  }

}
