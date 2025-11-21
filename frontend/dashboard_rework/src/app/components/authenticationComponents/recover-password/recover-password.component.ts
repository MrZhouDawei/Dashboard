import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  templateUrl: './recover-password.component.html',
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent {
  email: string = ''; // Two-way binding for email input
  errorMessage: string | null = null; // Error message
  successMessage: string | null = null; // Success message
  showModal: boolean = false; // To control modal visibility
  modalMessage: string | null = null; // Modal content

  constructor(private authService: AuthService) {}

  onResetPassword() {
    // Reset messages
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.email || !this.email.includes('@')) {
      this.modalMessage = 'Please enter a valid email address.';
      this.showModal = true;
      return;
    }

    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        this.successMessage = 'Password reset email sent successfully!';
        this.email = ''; // Clear the input
      },
      error: (error) => {
        this.handleError(error.code || error.message); // Handle specific Firebase error codes
      }
    });
  }

  handleError(errorCode: string) {
    switch (errorCode) {
      case 'auth/user-not-found':
        this.modalMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        this.modalMessage = 'The email address format is invalid.';
        break;
      case 'auth/network-request-failed':
        this.modalMessage = 'Network error. Please check your internet connection and try again.';
        break;
      default:
        this.modalMessage = 'An unexpected error occurred. Please try again later.';
    }
    this.showModal = true; // Show the modal
  }
}
