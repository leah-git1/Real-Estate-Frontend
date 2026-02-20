import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './order-success-component.html',
  styleUrl: './order-success-component.scss'
})
export class OrderSuccessComponent implements OnInit {
  orderId: number = 0;
  orderSuccess: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderId = +params['orderId'] || 0;
      this.orderSuccess = params['success'] !== 'false';
    });
  }

  goToOrders() {
    this.router.navigate(['/profile'], { queryParams: { tab: 1 } });
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }
}
