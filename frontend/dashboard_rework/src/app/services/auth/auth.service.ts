import { Injectable, inject, signal, Inject, PLATFORM_ID } from '@angular/core';
import {Auth, user, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail} from '@angular/fire/auth';
import { Observable, from, throwError, catchError } from 'rxjs';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { User_interface } from '../../interfaces/user_interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<User_interface | null>(null); // Initialize as null

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check if the user is authenticated on startup
    this.user$.subscribe((user: User_interface) => {
      if (user) {
        this.currentUserSig.set({
          uid: user.uid,
          email: user.email || '',
          username: user.username|| '' // Use displayName instead of username
        });
      } else {
        this.currentUserSig.set(null);
      }
    });
  }

  register(email: string, username: string, password: string): Observable<void> {
    // Validate email and password length
    if (email.length < 4) {
      return throwError(() => new Error('Specify a valid E-Mail'));
    }
    if (password.length < 6) {
      return throwError(() => new Error('Password too short'));
    }

    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((response) => {
        return updateProfile(response.user, { displayName: username });
      });

    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    // Validate email and password length
    if (email.length < 4) {
      return throwError(() => new Error('Specify a valid E-Mail'));
    }
    if (password.length < 6) {
      return throwError(() => new Error('Password too short'));
    }

    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(() => {});

    return from(promise);
  }

  async loginWithGoogle(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Google login is not supported in this environment.');
    }

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.firebaseAuth, provider);
      const user = result.user;

      await updateProfile(user, { displayName: user.displayName || 'User' });
      this.currentUserSig.set({
        uid: user.uid,
        email: user.email || '',
        username: user.displayName || ''
      });
    } catch (error) {
      console.error('Error during Google login:', error);
      throw new Error('Error during Google login.');
    }
  }

  resetPassword(email: string): Observable<void> {
    if (email.trim().length < 4) {
      return throwError(() => new Error('Specify a valid E-Mail'));
    }

    const promise = sendPasswordResetEmail(this.firebaseAuth, email)
      .then(() => {
      });

    return from(promise).pipe(
      catchError((error) => {
        console.error('Error sending password reset email:', error);
        return throwError(() => error); // Propagate the error
      })
    );
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  // Method to check if the user is authenticated
  isLoggedIn(): boolean {
    return this.currentUserSig() != null;
  }
}
