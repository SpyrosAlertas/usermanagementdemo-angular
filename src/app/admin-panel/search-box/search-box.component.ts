import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { NgbDate, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

import { FilterOptions } from '../filter-options';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit, OnDestroy {

  public isFilterOptionsCollapsed = true;

  // Event emitter to parent component (admin-panel) for filter options changes
  @Output() filterOptionsChangeEvent: EventEmitter<{ filterName: string, value: string | null }[]> = new EventEmitter();

  // Subscriptions for each of our filters, so we can listen to any change to one of them
  private usernameSubscription: Subscription | undefined;
  private isEnabledSubscription: Subscription | undefined;
  private isNonLockedSubscription: Subscription | undefined;
  private hasRoleSubscription: Subscription | undefined;
  private startDateSubscription: Subscription | undefined;
  private endDateSubscription: Subscription | undefined;

  // Receives filter options from parent component (admin-panel) if there are any
  // so we can maintain filter options when user refreshes page
  @Input() filterOptions: FilterOptions = new FilterOptions();
  @Input() testString: string = '';

  filterOptionsForm: FormGroup;

  constructor(private datepickerConfigService: NgbDatepickerConfig) {
    // Initialize filter options form from filter options from admin-panel
    // either null values or the ones loaded from local storage
    this.filterOptionsForm = new FormGroup({
      username: new FormControl(null),
      isEnabled: new FormControl(null),
      isNotLocked: new FormControl(null),
      role: new FormControl(null),
      startDate: new FormControl(null),
      endDate: new FormControl(null)
    });
  }

  ngOnInit(): void {

    // Convert start/end dates to NgbDate and load them from local storage if there are there
    let startDate: NgbDate | null = null;
    let endDate: NgbDate | null = null;
    if (this.filterOptions.startDate) {
      startDate = new NgbDate(+this.filterOptions.startDate.split('-')[0], +this.filterOptions.startDate.split('-')[1], +this.filterOptions.startDate.split('-')[2]);
    }
    if (this.filterOptions.endDate) {
      endDate = new NgbDate(+this.filterOptions.endDate.split('-')[0], +this.filterOptions.endDate.split('-')[1], +this.filterOptions.endDate.split('-')[2]);
    }

    this.filterOptionsForm = new FormGroup({
      username: new FormControl(this.filterOptions?.username),
      isEnabled: new FormControl(this.filterOptions?.isEnabled),
      isNotLocked: new FormControl(this.filterOptions?.isNonLocked),
      role: new FormControl(this.filterOptions?.role),
      startDate: new FormControl(startDate),
      endDate: new FormControl(endDate),
      // startDate: new FormControl((this.filterOptions?.startDate ? (this.filterOptions.startDate as NgbDate) : null)),
      // endDate: new FormControl(this.filterOptions?.endDate)
    });

    const today = new Date();
    this.datepickerConfigService.minDate = new NgbDate(2021, 1, 1);
    this.datepickerConfigService.maxDate = new NgbDate(today.getFullYear(), today.getMonth() + 1, today.getUTCDate());

    // When user deletes start date, end date is deleted too, as a result we get a second event
    // when end date gets changed as well, but we don't need this. We use this boolean to prevent
    // sending second request to the server in this case
    let preventDoubleEmission: boolean = false;

    // Username Subscription
    this.usernameSubscription = this.filterOptionsForm.get('username')?.valueChanges
      .subscribe(newValue => {
        this.filterOptionsChangeEvent.emit([{ filterName: 'username', value: newValue }]);
      });
    // isEnabled Subscription
    this.isEnabledSubscription = this.filterOptionsForm.get('isEnabled')?.valueChanges
      .subscribe(newValue => {
        this.filterOptionsChangeEvent.emit([{ filterName: 'isEnabled', value: newValue }]);
      });
    // isNonLocked Subscription
    this.isNonLockedSubscription = this.filterOptionsForm.get('isNotLocked')?.valueChanges
      .subscribe(newValue => {
        this.filterOptionsChangeEvent.emit([{ filterName: 'isNotLocked', value: newValue }]);
      });
    // hasRole Subscription
    this.hasRoleSubscription = this.filterOptionsForm.get('role')?.valueChanges
      .subscribe(newValue => {
        this.filterOptionsChangeEvent.emit([{ filterName: 'role', value: newValue }]);
      });
    // startDate Subscription
    this.startDateSubscription = this.filterOptionsForm.get('startDate')?.valueChanges
      .subscribe(newValue => {
        if (newValue === null) {
          // If start date was removed - remove end date as well if there is one
          this.filterOptionsChangeEvent.emit([{ filterName: 'startDate', value: null }, { filterName: 'endDate', value: null }]);
          preventDoubleEmission = true;
          if (this.filterOptionsForm.get('endDate')?.value) {
            this.filterOptionsForm.get('endDate')?.setValue(null);
          }
          return;
        } else if (!(new Date(newValue) instanceof Date)) {
          // If new start date isn't a valid date - remove both start and end date filters
          this.filterOptionsChangeEvent.emit([{ filterName: 'startDate', value: null }, { filterName: 'endDate', value: null }]);
          preventDoubleEmission = true;
          if (this.filterOptionsForm.get('endDate')?.value) {
            this.filterOptionsForm.get('endDate')?.setValue(null);
          }
        } else {
          // If all is ok and there is change only in start date - send only start date to parent component
          this.filterOptionsChangeEvent.emit([{ filterName: 'startDate', value: `${newValue.year}-${newValue.month}-${newValue.day}` }]);
        }
      });
    // endDate Subscription
    this.endDateSubscription = this.filterOptionsForm.get('endDate')?.valueChanges
      .subscribe(newValue => {
        if (preventDoubleEmission) {
          preventDoubleEmission = false;
          return;
        }
        if (newValue === null) {
          // If end date was removed
          this.filterOptionsChangeEvent.emit([{ filterName: 'endDate', value: null }]);
          return;
        } else if (!(new Date(newValue) instanceof Date)) {
          // If new end date isn't a valid date - remove end date
          this.filterOptionsChangeEvent.emit([{ filterName: 'endDate', value: null }]);
        } else {
          // If all is ok and there is change only in end date - send only end date to parent component
          this.filterOptionsChangeEvent.emit([{ filterName: 'endDate', value: `${newValue.year}-${newValue.month}-${newValue.day}` }]);
        }
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from our subscriptions before component gets destroyed
    this.usernameSubscription?.unsubscribe();
    this.isEnabledSubscription?.unsubscribe();
    this.isNonLockedSubscription?.unsubscribe();
    this.hasRoleSubscription?.unsubscribe();
    this.startDateSubscription?.unsubscribe();
    this.endDateSubscription?.unsubscribe();
  }

  hasAnyFilter(): boolean {
    if (this.filterOptionsForm.get('username')?.value !== null
      || this.filterOptionsForm.get('isEnabled')?.value !== null
      || this.filterOptionsForm.get('isNotLocked')?.value !== null
      || this.filterOptionsForm.get('role')?.value !== null
      || this.filterOptionsForm.get('startDate')?.value !== null
      || this.filterOptionsForm.get('endDate')?.value !== null)
      return true;
    return false;
  }

  // printFilterSettings(): void {
  //   console.log(this.filterOptionsForm.get('username')?.value);
  //   console.log(this.filterOptionsForm.get('isEnabled')?.value);
  //   console.log(this.filterOptionsForm.get('isNotLocked')?.value);
  //   console.log(this.filterOptionsForm.get('role')?.value);
  //   console.log(this.filterOptionsForm.get('startDate')?.value);
  //   console.log(this.filterOptionsForm.get('endDate')?.value);
  // }

}
