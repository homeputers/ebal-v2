import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';

import { useUploadAvatar } from '@/features/me/hooks';

type AvatarUploaderProps = {
  avatarUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (message: string) => void;
};

const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function AvatarUploader({
  avatarUrl,
  onUploadError,
  onUploadSuccess,
}: AvatarUploaderProps) {
  const { t } = useTranslation('me');
  const uploadMutation = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const imageSrc = useMemo(() => previewUrl ?? avatarUrl ?? null, [avatarUrl, previewUrl]);

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      setError(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type as (typeof ACCEPTED_FILE_TYPES)[number])) {
      const message = t('profile.avatar.errors.invalidType');
      setError(message);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      onUploadError?.(message);
      resetInput();
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const message = t('profile.avatar.errors.tooLarge');
      setError(message);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      onUploadError?.(message);
      resetInput();
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    setError(null);
    setProgress(0);

    try {
      const response = await uploadMutation.mutateAsync({
        file: selectedFile,
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const percentage = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          setProgress(percentage);
        },
      });

      onUploadSuccess?.(response.avatarUrl);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      resetInput();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? error.response?.data?.error
        : null;
      const fallbackMessage =
        message ?? t('profile.avatar.errors.uploadFailed');
      setError(fallbackMessage);
      onUploadError?.(fallbackMessage);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={t('profile.avatar.previewAlt')}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              {t('profile.avatar.emptyAlt')}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor={inputId}>
            {t('profile.avatar.title')}
          </label>
          <p className="text-sm text-gray-500">{t('profile.avatar.description')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES.join(',')}
            onChange={handleFileChange}
            className="text-sm"
            id={inputId}
            aria-describedby="avatar-error"
          />
        </div>
      </div>
      {selectedFile ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{selectedFile.name}</span>
          <button
            type="submit"
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending
              ? t('profile.avatar.uploading')
              : t('profile.avatar.upload')}
          </button>
        </div>
      ) : null}
      {uploadMutation.isPending ? (
        <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      {error ? (
        <p id="avatar-error" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export default AvatarUploader;
