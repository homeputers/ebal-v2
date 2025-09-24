import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changeMyEmail,
  changeMyPassword,
  confirmMyEmail,
  deleteAvatar,
  getMyProfile,
  type MyProfileResponse,
  type UpdateMyProfileBody,
  updateMyProfile,
  uploadAvatar,
  type UploadAvatarVariables,
} from '@/api/me';

const meRootKey = ['me'] as const;

export const meQueryKeys = {
  all: meRootKey,
  profile: () => [...meRootKey, 'profile'] as const,
} as const;

export function useMyProfile() {
  return useQuery({
    queryKey: meQueryKeys.profile(),
    queryFn: () => getMyProfile(),
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation<MyProfileResponse, unknown, UpdateMyProfileBody>({
    mutationFn: (body) => updateMyProfile(body),
    onSuccess: (data) => {
      queryClient.setQueryData(meQueryKeys.profile(), data);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UploadAvatarVariables) => uploadAvatar(variables),
    onSuccess: (data) => {
      queryClient.setQueryData<MyProfileResponse | undefined>(
        meQueryKeys.profile(),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            avatarUrl: data.avatarUrl,
          } satisfies MyProfileResponse;
        },
      );
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAvatar(),
    onSuccess: () => {
      queryClient.setQueryData<MyProfileResponse | undefined>(
        meQueryKeys.profile(),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            avatarUrl: undefined,
          } satisfies MyProfileResponse;
        },
      );
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changeMyPassword,
  });
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: changeMyEmail,
  });
}

export function useConfirmEmail() {
  return useMutation({
    mutationFn: confirmMyEmail,
  });
}
