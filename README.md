# usermanagementdemo-angular

Angular project to demonstrate basic user authentication/authorization with JSON Web Tokens (jwt).
This Client App may use either the usermanamgentdemo-nodejs or the usermanagementdemo-springboot as server.

## Keywords

1. **Angular**
2. **TypeScript**
3. **JavaScript**
4. **HTML5, CSS3, SCSS/SASS**
5. **Bootstrap/ng-bootstrap**
5. **JWT**
6. **Authentication**
7. **Authorization**
9. **File Upload**
10. **RESTful API**
11. **Pagination**

## Brief Description
Client that uses either the usermanagementdemo-nodejs or usermanagementdemo-springboot as back-end/server. JWTs use the same secret so a token created by either of them is valid for both.
  
There are 3 roles. Guests can login or register. Newly registered accounts can't login, an admin has to activate their accounts first so they can login. Users can login, view their profiles, edit their profiles or delete their accounts. Users can also upload a profile image or delete it. Admins can do anything guests and users can do. They can also view a list of all users, activate new accounts or remove anyones account. They can also delete profile images from users. If someone tries to login many times in a short period with wrong password his account get temporarily locked for a short period before user can try to login again.

## Pages

*By default pages start with http://localhost:4200* when you run the *ng serve* command

### url: /
Homepage. Shows a generic welcome message to **Guests** or a more personalized message to authenticated users.

### url: /admin-panel?page=1&pageSize=10&sort=username&order=asc
A page accessible only to users who have the role of **Admin**. There they can view a list of all users and activate or delete their accounts. Also they can view any users profile.

### url: /profile/:username
Page visible to authenticated users. A simple **User** can view his profile, edit it, upload a profile image, delete his profile image or delete his whole account. **Admins** though can view other users profiles as well, activate or delete their accounts, or delete their profile images.

### url: /error-page
This page shows users the error messages, for example when they try to visit a page they are not authenticated/authorized to view.

### url: /**
The rest of the urls, the 404 pages are handled by the PageNotFoundComponent

## Other info
The benefit of **jwts** is that they allow us to have a stateless server. However they open some issues, for example if a user deletes his account, but keeps his jwt. he can still authenticate in our app even though he has his account deleted.  
(One simple solution for this though would be to hit the database on each request and check if his username exists in our database, if not he has his account deleted so fail authentication on any request he may send.)

Another "issue" is that users role is stored in jwt, which gets updated only when user logs in. This means if a users role is changed, he has to logout and login again for the update to take effect.
(One possible solution would be to return the users role in every response from the server and store it in local storage seperately from the jwt.)

# Versions used
* Angular 12.2.0
* Node 14.17.3
* Bootstrap 4.5.0
* HTML5, CSS3
* TypeScript 4.3.5
