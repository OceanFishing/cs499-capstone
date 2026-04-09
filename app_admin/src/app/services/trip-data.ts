import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip';

@Injectable({
  providedIn: 'root'
})
export class TripDataService {

  constructor(private http: HttpClient) {}

  url = 'http://localhost:3000/api/trips';

  /* GET /api/trips -- returns all trips */
  getTrips() : Observable<Trip[]> {
    return this.http.get<Trip[]>(this.url);
  }

  /* POST /api/trips -- adds a new trip */
  addTrip(formData: Trip) : Observable<Trip> {
    return this.http.post<Trip>(this.url, formData);
  }

  /* GET /api/trips/:tripCode -- returns a single trip */
  getTrip(tripCode: string) : Observable<Trip[]> {
    return this.http.get<Trip[]>(this.url + '/' + tripCode);
  }

  /* PUT /api/trips/:tripCode -- updates a single trip */
  updateTrip(formData: Trip) : Observable<Trip> {
    return this.http.put<Trip>(this.url + '/' + formData.code, formData);
  }
}