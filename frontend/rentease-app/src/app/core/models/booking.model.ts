// booking status
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

// guest info
export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  age?: number;
}

// booking interface
export interface Booking {
  _id?: string;
  property_id: string;
  property_title?: string;
  property_image?: string;
  user_id: string;
  user_name?: string;
  check_in_date: Date;
  check_out_date: Date;
  guests: GuestInfo[];
  total_guests?: number;
  number_of_guests: number;
  total_price: number;
  status: BookingStatus;
  special_requests?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at?: Date;
  updated_at?: Date;
}

// create booking payload
export interface BookingPayload {
  property_id: string;
  check_in_date: Date | string;
  check_out_date: Date | string;
  guests: GuestInfo[];
  number_of_guests: number;
  special_requests?: string;
}

// availability check
export interface AvailabilityCheck {
  property_id: string;
  check_in_date: Date | string;
  check_out_date: Date | string;
}

// availability response
export interface AvailabilityResponse {
  available: boolean;
  is_available: boolean;
  conflicting_bookings?: string[];
  suggested_dates?: {
    check_in: Date;
    check_out: Date;
  }[];
}
