import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from './trip-data';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    constructor(
        @Inject(BROWSER_STORAGE) private storage: Storage,
        private tripDataService: TripDataService
    ) { }

    /* Holds the current authentication response including the JWT */
    authResp: AuthResponse = new AuthResponse();

    /* Retrieves the stored JWT from local storage */
    public getToken(): string {
        let out: any;
        out = this.storage.getItem('travlr-token');
        if (!out) {
            return '';
        }
        return out;
    }

    /* Saves the JWT to local storage */
    public saveToken(token: string): void {
        this.storage.setItem('travlr-token', token);
    }

    /* Removes the JWT from local storage, effectively logging out */
    public logout(): void {
        this.storage.removeItem('travlr-token');
    }

    /* Returns true if a valid, unexpired JWT exists in local storage */
    public isLoggedIn(): boolean {
        const token: string = this.getToken();
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > (Date.now() / 1000);
        }
        return false;
    }

    /* Returns the current user decoded from the JWT payload */
    public getCurrentUser(): User {
        const token: string = this.getToken();
        const { email, name } = JSON.parse(atob(token.split('.')[1]));
        return { email, name } as User;
    }

    /* Calls the login endpoint via TripDataService and stores the returned JWT */
    public login(user: User, passwd: string): void {
        this.tripDataService.login(user, passwd)
            .subscribe({
                next: (value: any) => {
                    if (value) {
                        this.authResp = value;
                        this.saveToken(this.authResp.token);
                    }
                },
                error: (error: any) => {
                    console.log('Error: ' + error);
                }
            });
    }

    /* Calls the register endpoint via TripDataService and stores the returned JWT */
    public register(user: User, passwd: string): void {
        this.tripDataService.register(user, passwd)
            .subscribe({
                next: (value: any) => {
                    if (value) {
                        this.authResp = value;
                        this.saveToken(this.authResp.token);
                    }
                },
                error: (error: any) => {
                    console.log('Error: ' + error);
                }
            });
    }
}