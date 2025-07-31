export interface ProfileFormData {
  address: string
  name: string
  description: string
  image: File | null
  imagePreview?: string
  banner: File | null
  bannerPreview?: string
  farcasterHandle?: string
  twitterHandle?: string
  website?: string
}
