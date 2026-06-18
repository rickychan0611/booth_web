export type EventStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type TicketStatus = "waiting" | "active" | "skipped" | "cancelled" | "used";
export type PaymentMethod =
  | "manual_cash"
  | "manual_card"
  | "manual_etransfer"
  | "manual_other"
  | "stripe";
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed";
export type PhotoKind = "original" | "layout" | "thumbnail" | "video";

export type EventRow = {
  id: string;
  name: string;
  slug: string | null;
  event_date: string | null;
  status: EventStatus;
  current_queue_number: number;
  next_queue_number: number;
  branding: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type TicketRow = {
  id: string;
  event_id: string;
  queue_number: number;
  access_code: string | null;
  access_code_hash: string;
  access_code_last4: string;
  name: string | null;
  gallery_token_hash: string;
  gallery_token_lookup: string;
  status: TicketStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  stripe_checkout_session_id: string | null;
  phone_number: string | null;
  used_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PhotoAssetRow = {
  id: string;
  event_id: string;
  ticket_id: string;
  kind: PhotoKind;
  r2_key: string;
  content_type: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type BookingInquiryRow = {
  id: string;
  name: string;
  email: string;
  event_date: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
};

export type LandingContent = {
  businessName: string;
  headline: string;
  subheadline?: string;
  ctaText: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
  };
  sections: {
    howItWorks?: string[];
    packages?: { name: string; price?: string; description: string }[];
    galleryAssetIds?: string[];
    eventDetails?: Record<string, string>;
    faq?: { question: string; answer: string }[];
  };
};

export type Database = {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: Partial<EventRow> & Pick<EventRow, "name">;
        Update: Partial<EventRow>;
      };
      tickets: {
        Row: TicketRow;
        Insert: Partial<TicketRow> &
          Pick<
            TicketRow,
            | "event_id"
            | "queue_number"
            | "access_code"
            | "access_code_hash"
            | "access_code_last4"
            | "gallery_token_hash"
            | "gallery_token_lookup"
            | "payment_method"
          >;
        Update: Partial<TicketRow>;
      };
      photo_assets: {
        Row: PhotoAssetRow;
        Insert: Omit<PhotoAssetRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<PhotoAssetRow>;
      };
      booking_inquiries: {
        Row: BookingInquiryRow;
        Insert: Pick<BookingInquiryRow, "name" | "email"> &
          Partial<Pick<BookingInquiryRow, "event_date" | "city" | "notes">>;
        Update: Partial<BookingInquiryRow>;
      };
      landing_pages: {
        Row: {
          id: string;
          event_id: string | null;
          slug: string;
          content_json: LandingContent;
          source_poster_r2_key: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          event_id?: string | null;
          slug: string;
          content_json: LandingContent;
          source_poster_r2_key?: string | null;
          published_at?: string | null;
        };
        Update: Partial<{
          event_id: string | null;
          slug: string;
          content_json: LandingContent;
          source_poster_r2_key: string | null;
          published_at: string | null;
        }>;
      };
    };
    Functions: {
      create_manual_ticket: {
        Args: {
          p_event_id: string;
          p_access_code: string;
          p_access_code_hash: string;
          p_access_code_last4: string;
          p_gallery_token_hash: string;
          p_gallery_token_lookup: string;
          p_payment_method: PaymentMethod;
        };
        Returns: TicketRow;
      };
      advance_event_queue: {
        Args: {
          p_event_id: string;
        };
        Returns: EventRow;
      };
    };
  };
};
