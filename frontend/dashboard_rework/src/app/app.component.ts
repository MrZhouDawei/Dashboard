import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from './components/mainComponents/navbar/navbar.component';
import {FooterComponent} from './components/mainComponents/footer/footer.component';
import { GridstackModule} from 'gridstack/dist/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NavbarComponent,FooterComponent,GridstackModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{

}
