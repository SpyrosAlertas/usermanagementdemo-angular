import JWT from 'jwt-decode';

// Class of the jwt - so we can access it's information easily

export class TokenModel {

    // jwt Issuer
    private iss: string;
    // jwt Audience
    private aud: string;
    // jwt issued at date/time
    private iat: number;
    // jwt expiration date/time
    private exp: number;

    // Users role
    private role: string;
    // Users username
    private sub: string;

    // Create a Token Object from the token string stored in local storage
    constructor(token: string) {
        const decodedToken = (JWT(token) as TokenModel);
        this.iss = decodedToken.iss;
        this.aud = decodedToken.aud;
        this.iat = decodedToken.iat * 1000;
        this.exp = decodedToken.exp * 1000;
        this.role = decodedToken.role;
        this.sub = decodedToken.sub;
        // We multiply * 1000 issued at and expires at dates, because it seems jwt decodes in seconds
        // times and not in milliseconds
    }

    // Get token issuer
    get issuer(): string {
        return this.iss;
    }

    // Get token audience
    get audience(): string {
        return this.aud;
    }

    // Get token issued at date
    get issuedAt(): number {
        return this.iat;
    }

    // Get token expiration date
    get expiresAt(): number {
        return this.exp;
    }

    // Get username from token
    get username(): string {
        return this.sub;
    }

    // Get role from token
    get myRole(): string {
        return this.role;
    }

}
