export const API_URL = import.meta.env.VITE_API_URL
export const APP_NAME = 'Fashion Store'
export const PAGINATION_LIMIT = 12

export const ORDER_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  SHIPPING:  'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED:  'returned',
}

export const PAYMENT_METHODS = {
  COD:  'cod',
  MOMO: 'momo',
  VNPAY:'vnpay',
  CARD: 'card',
}
