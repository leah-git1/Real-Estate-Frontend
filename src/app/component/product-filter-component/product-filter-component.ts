import { Component, EventEmitter, Output  } from '@angular/core';
import { FormsModule } from '@angular/forms'; // חובה עבור [(ngModel)]
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [
    FormsModule, 
    InputTextModule, 
    InputNumberModule, 
    ButtonModule
  ],
  templateUrl: './product-filter-component.html',
  styleUrl: './product-filter-component.scss',
})

export class ProductFilterComponent {
  // הגדרת משתנים התואמים לפרמטרים של ה-API
  filterData = {
    city: '',
    minPrice: null,
    maxPrice: null,
    rooms: null,
    beds: null,
    categoryIds: []
  };

  @Output() onFilter = new EventEmitter<any>();

  search() {
    // שליחת הנתונים לאבא
    this.onFilter.emit(this.filterData);
  }

  clear() {
    this.filterData = { city: '', minPrice: null, maxPrice: null, rooms: null, beds: null, categoryIds: [] };
    this.search();
  }
}
