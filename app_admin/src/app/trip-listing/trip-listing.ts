import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TripCardComponent } from '../trip-card/trip-card';
import { TripDataService } from '../services/trip-data';
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    console.log('trip-listing constructor');
  }

  private getStuff(): void {
    this.tripDataService.getTrips()
      .subscribe({
        next: (value: any) => {
          this.trips = value;
          if(value.length > 0) {
            this.message = 'There are ' + value.length + ' trips available.';
          } else {
            this.message = 'There were no trips retrieved from the database';
          }
          console.log(this.message);
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.log('Error: ' + error);
        }
      });
  }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    this.getStuff();
  }
}