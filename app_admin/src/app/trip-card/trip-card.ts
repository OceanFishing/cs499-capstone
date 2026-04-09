import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css'
})
export class TripCardComponent implements OnInit {

  @Input('trip') trip: any;

  constructor(private router: Router) {}

  ngOnInit(): void {}

public editTrip(trip: Trip) {
  localStorage.removeItem('tripCode');
  localStorage.setItem('tripCode', trip.code); // stash trip code for edit-trip component to retrieve
  this.router.navigate(['edit-trip']);
}
}