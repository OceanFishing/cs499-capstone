import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { BROWSER_STORAGE } from '../storage';

@Injectable({
    providedIn: 'root'
})
export class TripDataService {

    constructor(
        private http: HttpClient,
        @Inject(BROWSER_STORAGE) private storage: Storage
    ) { }

    baseUrl = 'http://localhost:3000/api';

    /* GET /api/trips - returns all trips */
    getTrips(): Observable<Trip[]> {
        return this.http.get<Trip[]>(this.baseUrl + '/trips');
    }

    /* GET /api/trips/:tripCode - returns a single trip by code */
    getTrip(tripCode: string): Observable<Trip[]> {
        return this.http.get<Trip[]>(this.baseUrl + '/trips/' + tripCode);
    }

    /* POST /api/trips - adds a new trip */
    addTrip(formData: Trip): Observable<Trip> {
        return this.http.post<Trip>(this.baseUrl + '/trips', formData);
    }

    /* PUT /api/trips/:tripCode - updates an existing trip */
    updateTrip(formData: Trip): Observable<Trip> {
        return this.http.put<Trip>(this.baseUrl + '/trips/' + formData.code, formData);
    }

    /* POST /api/login - authenticates user and returns JWT */
    login(user: User, passwd: string): Observable<AuthResponse> {
        return this.handleAuthAPICall('login', user, passwd);
    }

    /* POST /api/register - creates user and returns JWT */
    register(user: User, passwd: string): Observable<AuthResponse> {
        return this.handleAuthAPICall('register', user, passwd);
    }

    /* Shared handler for login and register API calls */
    handleAuthAPICall(endpoint: string, user: User, passwd: string): Observable<AuthResponse> {
        let formData = {
            name: user.name,
            email: user.email,
            password: passwd
        };
        return this.http.post<AuthResponse>(this.baseUrl + '/' + endpoint, formData);
    }
}