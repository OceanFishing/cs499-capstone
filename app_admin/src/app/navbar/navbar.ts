import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {

    constructor(
        private authenticationService: AuthenticationService
    ) { }

    ngOnInit() { }

    /* Delegates login state check to AuthenticationService */
    public isLoggedIn(): boolean {
        return this.authenticationService.isLoggedIn();
    }

    /* Delegates logout to AuthenticationService */
    public onLogout(): void {
        return this.authenticationService.logout();
    }
}