import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class LoginComponent implements OnInit {

    public formError: string = '';
    submitted = false;

    credentials = {
        name: '',
        email: '',
        password: ''
    };

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }

    ngOnInit(): void { }

    /* Validates form fields before attempting login */
    public onLoginSubmit(): void {
        this.formError = '';
        if (!this.credentials.email || !this.credentials.password ||
            !this.credentials.name) {
            this.formError = 'All fields are required, please try again';
            return;
        } else {
            this.doLogin();
        }
    }

    /* Builds user object and delegates to AuthenticationService, redirects on success */
    private doLogin(): void {
        let newUser = {
            name: this.credentials.name,
            email: this.credentials.email
        } as User;

        this.authenticationService.login(newUser, this.credentials.password);

        var timer = setTimeout(() => {
            if (this.authenticationService.isLoggedIn()) {
                this.router.navigate(['']);
            } else {
                this.formError = 'Could not log in, please try again';
            }
        }, 1500);
    }
}