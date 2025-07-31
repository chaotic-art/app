import type { ProfileFormData } from '@/components/profile/types'
import type {
  CreateProfileRequest,
  UpdateProfileRequest,
} from '@/services/profile'
import type { SignaturePair } from '@/types'
import {
  constructSocials,
  getBioWithLinks,
  uploadProfileImage,
} from '@/components/profile/create/utils'
import {
  createProfile,
  updateProfile,
} from '@/services/profile'

export default async ({
  profileData,
  signaturePair,
  hasProfile,
  useFarcaster,
}: {
  profileData: ProfileFormData
  signaturePair: SignaturePair
  hasProfile: boolean
  useFarcaster: boolean
}) => {
  const [imageUrl, bannerUrl] = await Promise.all([
    profileData.image
      ? uploadProfileImage({
          file: profileData.image,
          type: 'image',
          signaturePair,
        })
      : Promise.resolve(profileData.imagePreview),
    profileData.banner
      ? uploadProfileImage({
          file: profileData.banner,
          type: 'banner',
          signaturePair,
        })
      : Promise.resolve(profileData.bannerPreview),
  ])

  const profileBody: CreateProfileRequest | UpdateProfileRequest = {
    address: profileData.address,
    name: profileData.name,
    description: useFarcaster
      ? getBioWithLinks(profileData.description)
      : profileData.description,
    image: imageUrl,
    banner: hasProfile ? (bannerUrl ?? null) : bannerUrl!,
    socials: constructSocials(profileData),
    signature: signaturePair.signature,
    message: signaturePair.message,
  }

  return hasProfile
    ? updateProfile(profileBody as UpdateProfileRequest)
    : createProfile(profileBody as CreateProfileRequest)
}
