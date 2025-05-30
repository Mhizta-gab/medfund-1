export interface TestimonialMetadata {
  version: string;
  authorName: string;
  authorImageCID?: string;
  testimonialText: string;
  rating?: number; // 1-5 stars
  campaignId?: string; // Related campaign ID
  campaignTitle?: string;
  created: number; // Timestamp
  location?: string;
  verified: boolean;
  supportingImageCID?: string; // Optional image related to the testimonial
  status: 'pending' | 'approved' | 'rejected';
} 