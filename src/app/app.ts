import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './component/header-component/header-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, HeaderComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  title = 'RealEstateClient';
}