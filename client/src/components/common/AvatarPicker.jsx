import React, { useState } from 'react';
import { AVATAR_OPTIONS } from '../../constants/emojis';
import { Check, UploadCloud, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/uploadService';

export const AvatarPicker = ({ value, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await uploadService.uploadAvatar(reader.result);
        if (res.avatarUrl) {
          onChange(res.avatarUrl);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to upload photo to Cloudinary');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const isCustomUrl = value && value.startsWith('http');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {AVATAR_OPTIONS.map((avatar) => {
          const isSelected = value === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onChange(avatar.id)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-sm scale-105'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${avatar.bg}`}
              >
                {avatar.emoji}
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-2 truncate w-full text-center">
                {avatar.label}
              </span>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}

        {/* Cloudinary Custom Photo Upload Card */}
        <label
          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isCustomUrl
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-sm'
              : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50 dark:bg-slate-900/60'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={handleFileUpload}
          />
          {isUploading ? (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : isCustomUrl ? (
            <img
              src={value}
              alt="Custom Avatar"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-brand-500" />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 truncate w-full text-center">
            {isUploading ? 'Uploading...' : isCustomUrl ? 'Cloud Photo' : 'Upload'}
          </span>
          {isCustomUrl && !isUploading && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}
        </label>
      </div>
      <p className="text-[11px] text-slate-400">
        Choose a preset lifestyle avatar or upload your personal profile picture securely to Cloudinary.
      </p>
    </div>
  );
};
