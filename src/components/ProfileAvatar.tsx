import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, UserRound } from "lucide-react";
import { toast } from "sonner";

type ProfileAvatarProps = {
email: string;
name: string;
size?: "sm" | "lg";
editable?: boolean;
};

const PHOTO_EVENT = "aurevia-profile-photo-changed";

export function ProfileAvatar({
email,
name,
size = "sm",
editable = false,
}: ProfileAvatarProps) {
const inputRef = useRef<HTMLInputElement>(null);
const [photo, setPhoto] = useState<string | null>(null);

const storageKey = `aurevia-profile-photo:${email.toLowerCase()}`;

useEffect(() => {
try {
setPhoto(localStorage.getItem(storageKey));
} catch {
setPhoto(null);
}

function handlePhotoUpdate(event: Event) {
  const customEvent = event as CustomEvent<{
    key: string;
    photo: string;
  }>;

  if (customEvent.detail?.key === storageKey) {
    setPhoto(customEvent.detail.photo);
  }
}

window.addEventListener(PHOTO_EVENT, handlePhotoUpdate);

return () => {
  window.removeEventListener(PHOTO_EVENT, handlePhotoUpdate);
};


}, [storageKey]);

function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
const file = event.target.files?.[0];


if (!file) return;

if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
  toast.error("Please choose a JPG, PNG, or WebP image.");
  event.target.value = "";
  return;
}

if (file.size > 2 * 1024 * 1024) {
  toast.error("Your photo must be smaller than 2 MB.");
  event.target.value = "";
  return;
}

const reader = new FileReader();

reader.onload = () => {
  if (typeof reader.result !== "string") {
    toast.error("Unable to load this photo.");
    return;
  }

  try {
    localStorage.setItem(storageKey, reader.result);
    setPhoto(reader.result);

    window.dispatchEvent(
      new CustomEvent(PHOTO_EVENT, {
        detail: {
          key: storageKey,
          photo: reader.result,
        },
      }),
    );

    toast.success("Profile photo updated.");
  } catch {
    toast.error("Unable to save this photo. Try a smaller image.");
  }
};

reader.onerror = () => toast.error("Unable to read this photo.");

reader.readAsDataURL(file);
event.target.value = "";


}

const sizeClass =
size === "lg" ? "h-11 w-11 text-sm" : "h-9 w-9 text-sm";

return (
<>
<button
type="button"
disabled={!editable}
onClick={() => inputRef.current?.click()}
aria-label={
editable ? "Upload or change profile photo" : `${name}'s profile photo`
}
title={editable ? "Change profile photo" : name}
className={`group relative grid ${sizeClass} shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-primary font-semibold text-primary-foreground ${
          editable ? "cursor-pointer" : "cursor-default"
        }`}
>
{photo ? (
<img
src={photo}
alt={`${name}'s profile`}
className="h-full w-full object-cover"
/>
) : ( <span>
{name.trim().charAt(0).toUpperCase() || <UserRound />} </span>
)}


    {editable && (
      <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <Camera className="h-4 w-4" />
      </span>
    )}
  </button>

  {editable && (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handlePhotoChange}
      className="hidden"
      aria-label="Choose profile photo"
    />
  )}
</>


);
}
