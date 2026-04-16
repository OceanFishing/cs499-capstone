import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Trip } from '../models/trip';
import { AuthenticationService } from '../services/authentication.service';

@Component({
    selector: 'app-trip-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './trip-card.html',
    styleUrl: './trip-card.css'
})
export class TripCardComponent implements OnInit {

    @Input('trip') trip: any;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }

    ngOnInit(): void { }

    /* Stashes trip code in localStorage and navigates to edit-trip */
    public editTrip(trip: Trip) {
        localStorage.removeItem('tripCode');
        localStorage.setItem('tripCode', trip.code);
        this.router.navigate(['edit-trip']);
    }

    /* Delegates login state check to AuthenticationService */
    public isLoggedIn(): boolean {
        return this.authenticationService.isLoggedIn();
    }
}