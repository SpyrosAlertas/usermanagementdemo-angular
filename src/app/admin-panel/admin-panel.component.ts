import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { UserService } from '../shared/user.service';

import { UserModel } from '../shared/user-model';
import { Notification } from '../shared/notification';
import { FilterOptions } from './filter-options';

import { environment } from 'src/environments/environment';

// We store pagination, sorting, etc options in query params, so if user refreshes the page
// we can remember exactly 'where' he was. We could use local storage but these feel better
// as query params, so if someone wants he can also browse with particular options through
// the url

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, OnDestroy {

  // How many rows/users exist in db
  // If we don't initialize collectionSize to Inifinty it considers it has 0 elements
  // and if we refresh the page it resets page of pagination to 1
  collectionSize: number | undefined;
  // Page we request to view from the list of all available users
  page: number = 1;
  // Field upon which we sort the results in the table
  sort: string = 'username';
  // Order - ascending or descending
  order: string = 'asc';
  // How many pages we have based on collection size and
  pageSize: number = 10;

  pageSizeOptions: number[] = [5, 10, 15];

  alert: Notification | undefined;

  // Paginated users array
  users: UserModel[] | null = null;

  serverConnectionError: boolean = false;

  filterOptions: FilterOptions = new FilterOptions();

  constructor(
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit(): void {

    // Load filter options from local storage (will have when user refreshes the page)
    const filterOptionsLS: string | null = localStorage.getItem('filterOptions');
    if (filterOptionsLS) {
      // If there were filter options in local storage
      this.filterOptions = JSON.parse(filterOptionsLS);
    }

    this.titleService.setTitle(`Admins Panel | ${environment.appTitle}`);

    let tmpQueryParam: string | null;

    // Try to get page from Query Params
    tmpQueryParam = this.activatedRoute.snapshot.queryParamMap.get('page');
    if (tmpQueryParam && !isNaN(Number(tmpQueryParam)))
      this.page = Number(tmpQueryParam);
    if (this.page < 1)
      this.page = 1;
    // Try to get pageSize from Query Params
    tmpQueryParam = this.activatedRoute.snapshot.queryParamMap.get('pageSize');
    if (tmpQueryParam && !isNaN(Number(tmpQueryParam)))
      this.pageSize = Number(tmpQueryParam);
    if (this.pageSize < 5 || this.pageSize > 15)
      this.pageSize = 10;
    // Try to get sort from Query Params
    const fields: string[] = ['username', 'isEnabled', 'isNonLocked', 'role', 'joinDate'];
    tmpQueryParam = this.activatedRoute.snapshot.queryParamMap.get('sort');
    if (tmpQueryParam && fields.indexOf(tmpQueryParam) !== -1)
      this.sort = tmpQueryParam;
    // Try to get order from Query Params
    tmpQueryParam = this.activatedRoute.snapshot.queryParamMap.get('order');
    if (tmpQueryParam === 'asc' || tmpQueryParam === 'desc')
      this.order = tmpQueryParam;

    // Update Query Params in url
    this.updateQueryParams();
    // Fetch user from server/database
    this.fetchUsers();

  }

  ngOnDestroy(): void {
    // Remove filter options from local storage when component is destroyed (user navigates away)
    localStorage.removeItem('filterOptions');
  }

  // When user clicks to change page of results of users
  changePage(): void {
    // Update Query Params in url
    this.updateQueryParams();
    // Fetch user from server/database
    this.fetchUsers();
  }

  // Change the field upon which results are sorted and fetch updated results
  changeSort(updatedSort: string): void {
    if (this.sort === updatedSort) {
      // If user clicked on the field that is already the sort, reverse order of results
      this.order === 'asc' ? this.order = 'desc' : this.order = 'asc';
    } else {
      // If user clicked on a different field for sorting, set order as 'asc'
      this.sort = updatedSort;
      this.order = 'asc';
    }
    this.page = 1;
    // Update Query Params in url
    this.updateQueryParams();
    // Fetch user from server/database
    this.fetchUsers();
  }

  // Update page size
  pageSizeChange(pageSizeUpdated: number): void {
    if (this.pageSize === pageSizeUpdated) return;
    this.pageSize = pageSizeUpdated;
    this.page = 1;
    // Update Query Params in url
    this.updateQueryParams();
    // Fetch user from server/database
    this.fetchUsers();
  }

  // When user clicks the 'Activate' button
  activateUser(username: string | undefined): void {
    this.alert = { message: `Please wait while activating '${username}' account.`, type: 'warning' };
    if (username) {
      this.userService.activateUser(username)
        .subscribe(() => {
          // If user successfully activated reload users
          this.fetchUsers();
          this.alert = { message: `'${username}' account successfully activated.`, type: 'success' };
        }, () => {
          // If there was an error and user was not activated
          this.alert = { message: `'${username}' account was not activated. Please try again later.`, type: 'danger' };
        });
    }
  }

  // When user clicks the 'Remove' button
  deleteUser(username: string | undefined): void {
    this.alert = { message: `Please wait while deleting '${username}' account.`, type: 'warning' };
    if (username) {
      this.userService.deleteUser(username)
        .subscribe(() => {
          // If user successfully deleted reload users
          this.fetchUsers();
          this.alert = { message: `'${username}' account successfully deleted.`, type: 'success' };
        }, () => {
          // If there was an error and user was not deleted
          this.alert = { message: `'${username}' account was not deleted. Please try again later.`, type: 'danger' };
        });
    }
  }

  // Private helper methods

  // Fetch paginated users from server/database
  fetchUsers(): void {
    if (!this.alert)
      this.alert = { message: `Please wait while fetching users from the server.`, type: 'warning' };
    let usersObservable: Observable<UserModel[]>;
    if (this.hasAnyFilter())
      // If there is at least one filter - request filtered results
      usersObservable = this.userService.getUsersFiltered(this.page - 1, this.sort, this.order, this.pageSize, this.filterOptions)
    else
      // Else if there is no filter applied - request just paginated results
      usersObservable = this.userService.getUsers(this.page - 1, this.sort, this.order, this.pageSize);
    // Fetch new page from server
    usersObservable.subscribe(
      (results: any) => {
        // NodeJS returns number of users as results.count and Spring Boot as results.totalElements
        // We could change it in either Spring Boot or NodeJS to haave same name (easier to do in NodeJS)
        // but i ignored this one and handled it here in Client
        this.collectionSize = results.count || results.totalElements;
        this.users = results.rows || results.content;
        if (this.alert?.type === 'warning') {
          this.alert = undefined;
        }
      }, () => {
        this.serverConnectionError = true;
        this.alert = { message: `Error establishing connection with the server. Please try again later.`, type: 'danger' };
      }
    );
  }

  // When SearchBox component emits event that one of the filters value was updated - we apply filter update and fetch updated results
  filterOptionsUpdate(event: any): void {
    // Check which filter option was changed - event is an array with values of filters changed
    event.forEach((e: any) => {
      if (e.filterName === 'username') {
        this.filterOptions.username = e.value;
      } else if (e.filterName === 'isEnabled') {
        this.filterOptions.isEnabled = e.value;
      } else if (e.filterName === 'isNotLocked') {
        this.filterOptions.isNonLocked = e.value;
      } else if (e.filterName === 'role') {
        this.filterOptions.role = e.value;
      } else if (e.filterName === 'startDate') {
        this.filterOptions.startDate = e.value;
      } else if (e.filterName === 'endDate') {
        this.filterOptions.endDate = e.value;
      }
    });
    // Update filter options in local storage
    localStorage.setItem('filterOptions', JSON.stringify(this.filterOptions));
    // Fetch updated results from the server
    this.fetchUsers();
  }

  // Update url query paramaters
  private updateQueryParams(): void {
    const queryParams: Params = { 'page': this.page, 'pageSize': this.pageSize, 'sort': this.sort, 'order': this.order };
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  // Scans each property of the FilterOptions Model, if there is at least one non null value, returns true, else false
  private hasAnyFilter(): boolean {
    let hasFilter: boolean = false;
    Object.keys(this.filterOptions).forEach(p => { if (p !== null) hasFilter = true; });
    return hasFilter;
  }

}
