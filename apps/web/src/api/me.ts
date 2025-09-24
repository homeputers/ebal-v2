import type { AxiosRequestConfig, AxiosProgressEvent } from 'axios';

import apiClient from './client';
import type { paths } from './types';
import {
  RequestBodyOf,
  ResponseOf,
} from './type-helpers';

type MePath = keyof paths & '/me';
type AvatarPath = keyof paths & '/me/avatar';
type ChangePasswordPath = keyof paths & '/me/change-password';
type ChangeEmailPath = keyof paths & '/me/change-email';
type ConfirmEmailPath = keyof paths & '/me/confirm-email';

export type MyProfileResponse = ResponseOf<MePath, 'get', 200>;
export type UpdateMyProfileBody = RequestBodyOf<MePath, 'patch'>;
export type UploadAvatarResponse = ResponseOf<AvatarPath, 'post', 200>;
export type ChangeMyPasswordBody = RequestBodyOf<ChangePasswordPath, 'post'>;
export type ChangeMyEmailBody = RequestBodyOf<ChangeEmailPath, 'post'>;
export type ConfirmMyEmailBody = RequestBodyOf<ConfirmEmailPath, 'post'>;

export type UploadAvatarVariables = {
  file: File;
  config?: AxiosRequestConfig;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
};

export async function getMyProfile() {
  const { data } = await apiClient.get<MyProfileResponse>('/me');
  return data;
}

export async function updateMyProfile(body: UpdateMyProfileBody) {
  const { data } = await apiClient.patch<MyProfileResponse>('/me', body);
  return data;
}

export async function uploadAvatar({
  file,
  config,
  onUploadProgress,
}: UploadAvatarVariables) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadAvatarResponse>(
    '/me/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
      ...config,
    },
  );
  return data;
}

export async function deleteAvatar() {
  await apiClient.delete<void>('/me/avatar');
}

export async function changeMyPassword(body: ChangeMyPasswordBody) {
  await apiClient.post<void>('/me/change-password', body);
}

export async function changeMyEmail(body: ChangeMyEmailBody) {
  await apiClient.post<void>('/me/change-email', body);
}

export async function confirmMyEmail(body: ConfirmMyEmailBody) {
  await apiClient.post<void>('/me/confirm-email', body);
}
