export interface CartItem {
  productId: number;
  title: string;
  price: number;
  imageUrl: string;
  city: string;
  transactionType: string;
  startDate?: Date;
  endDate?: Date;
  quantity: number;
}
