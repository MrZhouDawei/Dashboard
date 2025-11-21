import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showModal: boolean = false; // Variabile per controllare la visualizzazione del modal
  confirmationMessage: string | null = null; // Messaggio di errore

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inizializza il modulo di login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          // Reindirizza l'utente dopo un login riuscito
          this.router.navigate(['/home']); // Cambia il percorso in base alla tua applicazione
        },
        error: (err) => {
          console.error('Login failed', err);
          this.handleError(err.code); // Gestisci l'errore
        }
      });
    }
  }

  async onLoginWithGoogle(): Promise<void> {
    try {
      await this.authService.loginWithGoogle(); // No need for toPromise() if it returns a Promise
      // Reindirizza l'utente dopo un login riuscito
      this.router.navigate(['/home']); // Cambia il percorso in base alla tua applicazione
    } catch (err: any) { // Explicitly typing err as any
      console.error('Google login failed', err);
      this.handleError(err.code); // Gestisci l'errore
    }
  }

  handleError(errorCode: string) {
    switch (errorCode) {
      case 'auth/wrong-password':
        this.confirmationMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/user-not-found':
        this.confirmationMessage = 'No user found with this email.';
        break;
      default:
        this.confirmationMessage = 'An unknown error occurred. Please try again.';
    }
    this.showModal = true; // Mostra il modal
  }

  closeModal() {
    this.showModal = false; // Chiudi il modal
    this.confirmationMessage = null; // Resetta il messaggio di errore
  }

  onContinue() {
    this.closeModal(); // Chiudi il modal quando si fa clic su "Continue"
  }
}
