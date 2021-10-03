export class UserModel {

    public username: string | undefined;
    public password: string | undefined;
    public isEnabled: boolean | undefined;
    public isNonLocked: boolean | undefined;
    public role: string | undefined;
    public firstName: string | undefined;
    public lastName: string | undefined;
    public email: string | undefined;
    public phone: string | undefined | null;
    public country: string | undefined | null;
    public city: string | undefined | null;
    public address: string | undefined | null;
    public joinDate: string | undefined;

}
