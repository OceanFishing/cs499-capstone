import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TripCardComponent } from '../trip-card/trip-card';
import { TripDataService } from '../services/trip-data';
import { AuthenticationService } from '../services/authentication.service';
import { Trip } from '../models/trip';

@Component({
    selector: 'app-trip-listing',
    standalone: true,
    imports: [CommonModule, TripCardComponent],
    templateUrl: './trip-listing.html',
    styleUrl: './trip-listing.css',
    providers: [TripDataService]
})
export class TripListingComponent implements OnInit {

    trips: Trip[] = [];
    message: string = '';

    constructor(
        private tripDataService: TripDataService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        console.log('trip-listing constructor');
    }

    /* GET trips from the API and set message based on result */
    private getStuff(): void {
        this.tripDataService.getTrips()
            .subscribe({
                next: (value: any) => {
                    this.trips = value;
                    if (value.length > 0) {
                        this.message = 'There are ' + value.length + ' trips available.';
                    } else {
                        this.message = 'No trips found.';
                    }
                    this.cdr.detectChanges();
                },
                error: (error: any) => {
                    console.log('Error: ' + error);
                }
            });
    }

    /* Navigates to the add-trip route */
    addTrip(): void {
        this.router.navigate(['add-trip']);
    }

    /* Delegates login state check to AuthenticationService */
    public isLoggedIn(): boolean {
        return this.authenticationService.isLoggedIn();
    }

    ngOnInit(): void {
        this.getStuff();
    }
}