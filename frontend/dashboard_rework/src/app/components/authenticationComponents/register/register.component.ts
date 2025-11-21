import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  confirmationMessage: string | null = null; // Variabile per il messaggio di conferma
  showModal: boolean = false; // Variabile per gestire la visibilità della finestra di dialogo

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      const { email, username, password } = this.registerForm.value;
      this.authService.register(email, username, password).subscribe({
        next: () => {
          this.confirmationMessage = 'Registered successfully!'; // Imposta il messaggio di conferma
          this.showModal = true; // Mostra la finestra di dialogo
        },
        error: (err) => {
          // Gestisci l'errore specifico
          if (err.code === 'auth/email-already-in-use') {
            this.confirmationMessage = 'This email is already registered. Please use a different email.';
          } else {
            this.confirmationMessage = 'Registration failed. Please try again.';
          }
          this.showModal = true; // Mostra la finestra di dialogo anche in caso di errore
        }
      });
    }
  }

  onContinue() {
    if (this.confirmationMessage === 'Registered successfully!') {
      this.router.navigate(['/home']); // Reindirizza alla home page
    } else {
      this.showModal = false;
    }
  }

  closeModal() {
    this.showModal = false; // Chiudi la finestra di dialogo
    if (this.confirmationMessage === 'Registered successfully!') {
      this.router.navigate(['/home']);
    }
  }

  async onLoginWithGoogle() {
    try {
      await this.authService.loginWithGoogle(); // Aspetta il completamento del login
      this.router.navigate(['/home']); // Reindirizza alla home page
    } catch (err: any) { // Gestisci l'errore
      console.error('Error during Login with Google:', err);
      this.confirmationMessage = 'Login with Google failed. Please try again.'; // Messaggio di errore
      this.showModal = true; // Mostra la finestra di dialogo in caso di errore
    }
  }
}
