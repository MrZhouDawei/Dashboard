import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import {map, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UrlCheckerService {
  constructor(private http: HttpClient) {}

  checkUrl(url: string): Observable<boolean> {
    return this.http.get(url, { observe: 'response', responseType: 'text' }).pipe(
      map((response) => response.status === 200), // Ritorna true se la risposta è 200
      catchError((error) => {
        console.error('URL Check Error:', error);
        return of(false); // Ritorna false in caso di errore
      })
    );
  }
}
