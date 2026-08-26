// Minimal typing over Shiprocket's REST API — only the fields we actually
// read/send. Shiprocket's API returns much more than this; extend as needed
// rather than typing their entire schema upfront.

export interface ShiprocketAuthResponse {
  token: string;
  first_name?: string;
  last_name?: string;
  company_id?: number;
}

export interface ServiceabilityCourier {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  cod: number; // 1 = COD supported, 0 = not
  estimated_delivery_days?: string;
  rating?: number;
  freight_charge?: number;
  is_surface?: boolean;
}

export interface ServiceabilityResponse {
  data: {
    available_courier_companies: ServiceabilityCourier[];
    recommended_courier_id?: number;
  };
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number;
}

// Payload for POST /orders/create/adhoc
export interface CreateForwardOrderPayload {
  order_id: string; // OUR order number/id — must be unique per Shiprocket account
  order_date: string; // "YYYY-MM-DD HH:mm"
  pickup_location: string; // nickname registered in Shiprocket dashboard
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length: number; // cm
  breadth: number; // cm
  height: number; // cm
  weight: number; // kg
}

export interface CreateForwardOrderResponse {
  order_id: number; // Shiprocket's internal order id
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code?: string | null;
  courier_company_id?: number | null;
  courier_name?: string | null;
}

export interface AssignAwbResponse {
  awb_assign_status: number;
  response: {
    data: {
      courier_company_id: number;
      courier_name: string;
      awb_code: string;
    };
  };
}

export interface GenerateLabelResponse {
  label_created: number;
  label_url: string;
}

export interface GenerateManifestResponse {
  status: number;
  manifest_url: string;
}

export interface RequestPickupResponse {
  pickup_status: number;
  response: {
    pickup_scheduled_date?: string;
    pickup_token_number?: string;
  };
}

export interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location?: string;
}

export interface TrackByAwbResponse {
  tracking_data: {
    track_status: number;
    shipment_status: number;
    current_status: string;
    shipment_track_activities?: TrackingActivity[];
  };
}
// Return-order (reverse pickup) payload. Verify these field names against
// your Shiprocket dashboard's current API docs before relying on this in
// production — return-order fields have shifted across Shiprocket API
// versions before, same caveat as the webhook secret header.
export interface CreateReturnOrderPayload {
  order_id: string; // must be unique in Shiprocket, e.g. `${orderNumber}-RET`
  order_date: string;
  channel_id?: string;
  pickup_customer_name: string; // customer's name — courier picks up FROM them
  pickup_address: string;
  pickup_city: string;
  pickup_state: string;
  pickup_country: string;
  pickup_pincode: string;
  pickup_email: string;
  pickup_phone: string;
  shipping_customer_name: string; // your warehouse — courier delivers TO you
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_pincode: string;
  shipping_email: string;
  shipping_phone: string;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface CreateReturnOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
}