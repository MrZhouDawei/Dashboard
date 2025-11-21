  import { Injectable } from '@angular/core';
  import * as CryptoJS from 'crypto-js';
  import {environment} from '../../../environments/environment';

  @Injectable({
    providedIn: 'root'
  })
  export class HtmlcontextService {


    private encryptionKey = environment.ENCRYPTION_KEY// Chiave di crittografia (personalizzala)

    constructor() { }

    // 1. Funzione per criptare una stringa
    encrypt(data: string): string {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    }

    // 2. Funzione per unire 3 stringhe e criptarle
    combineAndEncrypt(html: string, css: string, js: string): string {
      const combined = JSON.stringify({ html, css, js }); // Combina le stringhe in formato JSON
      return this.encrypt(combined); // Cripta il JSON combinato
    }

    // 3. Funzione per decriptare una stringa e dividerla in HTML, CSS e JS
    decryptAndSplit(encryptedData: string): { html: string, css: string, js: string } | null {
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedText); // Ritorna l'oggetto decriptato come { html, css, js }
      } catch (error) {
        console.error('Decryption failed:', error);
        return null; // Ritorna null in caso di errore
      }
    }
  }
