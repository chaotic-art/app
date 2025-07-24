import type { FetchError } from 'ofetch'
import { encodeAddress, isEvmAddress } from 'dedot/utils'
import { $fetch } from 'ofetch'
import { isProduction } from '@/utils/env'

const BASE_URL = isProduction
  ? 'https://profile.kodadot.workers.dev/'
  : 'https://profile-beta.kodadot.workers.dev/'

const api = $fetch.create({
  baseURL: BASE_URL,
})

// Types for API request and response objects
export interface Profile {
  address: string
  name: string
  description: string
  image: string
  banner: string | null
  socials: SocialLink[]
}

export interface Follower {
  address: string
  name: string
  description: string
  image: string
}

export interface SocialLink {
  handle?: string
  platform: string
  link: string
}

export interface ProfileResponse {
  success: boolean
  message: string
  data?: Profile
  profileId?: string
}

export interface CreateProfileRequest {
  signature: string
  message: string
  address: string
  name: string
  description: string
  image: string
  banner: string | undefined
  socials: SocialLink[]
}

export interface UpdateProfileRequest {
  signature: string
  message: string
  address: string
  name?: string
  description?: string
  image?: string
  banner: string | null
  socials: SocialLink[]
}

export interface FollowRequest {
  initiatorAddress: string
  targetAddress: string
  signature: string
  message: string
}

function invalidSignatureErrorHandler(error: FetchError) {
  if (error.status === 401) {
    // TODO: handle wallet message
    // useWalletStore().setSignedMessage(undefined)
    throw new Error((error as FetchError)?.data?.message)
  }
}

export function toSubstrateAddress(address: string) {
  if (!address) {
    return ''
  }

  return isEvmAddress(address) ? address : encodeAddress(address, 42)
}

function convertToSubstrateAddress(body: FollowRequest): FollowRequest {
  return {
    initiatorAddress: toSubstrateAddress(body.initiatorAddress),
    targetAddress: toSubstrateAddress(body.targetAddress),
    signature: body.signature,
    message: body.message,
  }
}

// API methods

export function fetchProfilesByIds(ids?: string[]) {
  return api<Profile[]>('/profiles', {
    method: 'GET',
    query: { ids: ids?.map(toSubstrateAddress).join(',') },
  })
}

export function fetchProfileByAddress(address: string) {
  return api<Profile>(`/profiles/${toSubstrateAddress(address)}`, {
    method: 'GET',
  })
}

export function searchProfiles(query: string, limit = 5, offset = 0) {
  return api<{ data: Profile[] }>('/profiles/search', {
    method: 'GET',
    query: { q: query, limit, offset },
  })
}

export function fetchFollowersOf(address: string, options?: { limit?: number, offset?: number, exclude?: string[] }) {
  return api<{ followers: Follower[], totalCount: number }>(
    `/follow/${toSubstrateAddress(address)}/followers`,
    {
      method: 'GET',
      query: {
        limit: options?.limit,
        offset: options?.offset,
        exclude: options?.exclude?.map(toSubstrateAddress).join(','),
      },
    },
  )
}

export function fetchFollowing(address: string, options?: { limit?: number, offset?: number }) {
  return api<{ following: Follower[], totalCount: number }>(
    `/follow/${toSubstrateAddress(address)}/following`,
    {
      method: 'GET',
      query: { limit: options?.limit, offset: options?.offset },
    },
  )
}

export async function createProfile(profileData: CreateProfileRequest) {
  try {
    const response = await api<ProfileResponse>('/profiles', {
      method: 'POST',
      body: profileData,
    })
    return response
  }
  catch (error) {
    invalidSignatureErrorHandler(error as FetchError)
    throw new Error(
      `[PROFILE::CREATE] ERROR: ${(error as FetchError)?.data?.error?.issues[0]?.message}`,
    )
  }
}

export async function updateProfile(updates: UpdateProfileRequest) {
  try {
    const response = await api<ProfileResponse>(
      `/profiles/${updates.address}`,
      {
        method: 'PATCH',
        body: updates,
      },
    )
    return response
  }
  catch (error) {
    invalidSignatureErrorHandler(error as FetchError)
    throw new Error(
      `[PROFILE::UPDATE] ERROR: ${(error as FetchError)?.data?.error?.issues[0]?.message}`,
    )
  }
}

interface DeleteProfile {
  message: string
  signature: string
  address: string
}

export async function deleteProfile({
  address,
  message,
  signature,
}: DeleteProfile) {
  try {
    const response = await api<ProfileResponse>(`/profiles/${address}`, {
      method: 'DELETE',
      body: {
        message,
        signature,
        address,
      },
    })
    return response
  }
  catch (error) {
    throw new Error(
      `[PROFILE::DELETE] ERROR: ${(error as FetchError)?.data?.error?.issues[0]?.message}`,
    )
  }
}

export async function follow(followRequest: FollowRequest) {
  try {
    const response = await api<ProfileResponse>('/follow', {
      method: 'POST',
      body: convertToSubstrateAddress(followRequest),
    })
    return response
  }
  catch (error) {
    invalidSignatureErrorHandler(error as FetchError)

    throw new Error(`[PROFILE::FOLLOW] ERROR: ${(error as FetchError).data}`)
  }
}

export async function unfollow(unFollowRequest: FollowRequest) {
  try {
    const response = await api<ProfileResponse>('/follow', {
      method: 'DELETE',
      body: convertToSubstrateAddress(unFollowRequest),
    })
    return response
  }
  catch (error) {
    invalidSignatureErrorHandler(error as FetchError)

    throw new Error(`[PROFILE::UNFOLLOW] ERROR: ${(error as FetchError).data}`)
  }
}

export async function isFollowing(follower: string, target: string): Promise<boolean> {
  try {
    const response = await api<{ isFollowing: boolean }>(
      `/follow/${toSubstrateAddress(follower)}/follows/${toSubstrateAddress(target)}`,
      {
        method: 'GET',
      },
    )
    return response.isFollowing
  }
  catch (error) {
    throw new Error(
      `[PROFILE::IS_FOLLOWING] ERROR: ${(error as FetchError).data}`,
    )
  }
}

interface UploadImage {
  file: File
  type: string
  address: string
  signature: string
  message: string
}

export async function uploadImage({
  file,
  type,
  address,
  signature,
  message,
}: UploadImage) {
  try {
    address = toSubstrateAddress(address)

    const form = new FormData()
    form.append('file', file)
    form.append('address', address)
    form.append('type', type)
    form.append('signature', signature)
    form.append('message', message)

    const response = await api<{ url: string }>(`/profiles/${address}/image`, {
      method: 'POST',
      body: form,
    })

    return response
  }
  catch (error) {
    throw new Error(
      `[PROFILE::UPLOAD_IMAGE] ERROR: ${(error as FetchError).data}`,
    )
  }
}
