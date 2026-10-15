import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, LoaderCircle, Eye, EyeOff } from "lucide-react";

import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Aurevia Bank" },
      {
        name: "description",
        content: "Manage your Aurevia Bank profile and preferences.",
      },
      { property: "og:title", content: "Settings — Aurevia Bank" },
      {
        property: "og:description",
        content: "Manage your Aurevia Bank profile and preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

type Profile = {
  name: string;
  email: string;
  date_of_birth: string | null;
  phone_number: string | null;
  residential_address: string | null;
  has_transfer_pin: boolean;
};

type ProfileResponse = {
  profile: Profile;
};

function PinInput({
  id,
  label,
  value,
  onChange,
  visible,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        type={visible ? "text" : "password"}
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]{4}"
        maxLength={4}
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, 4))
        }
        placeholder="Enter 4-digit PIN"
        className="rounded-xl"
        required
      />
    </div>
  );
}

function TransferPinSection({
  hasTransferPin,
  onPinUpdated,
}: {
  hasTransferPin: boolean;
  onPinUpdated: () => void;
}) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPins, setShowPins] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submitPin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("aurevia_api_token");

    if (!token) {
      toast.error("Please sign in again.");
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      toast.error("Your new PIN must contain exactly four digits.");
      return;
    }

    if (newPin !== confirmPin) {
      toast.error("The PINs do not match.");
      return;
    }

    if (hasTransferPin && !/^\d{4}$/.test(currentPin)) {
      toast.error("Enter your current four-digit PIN.");
      return;
    }

    if (hasTransferPin && currentPin === newPin) {
      toast.error("Your new PIN must be different from your current PIN.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest("/transfer-pin", {
        method: hasTransferPin ? "PUT" : "POST",
        token,
        body: JSON.stringify(
          hasTransferPin
            ? {
                current_pin: currentPin,
                new_pin: newPin,
              }
            : {
                pin: newPin,
              },
        ),
      });

      toast.success(
        hasTransferPin
          ? "Transfer PIN changed successfully."
          : "Transfer PIN created successfully.",
      );

      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");

      onPinUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your transfer PIN.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Transfer PIN</h3>

          <p className="mt-1 text-xs text-muted-foreground">
            {hasTransferPin
              ? "Your transfer PIN is configured. You can change it below."
              : "Create a four-digit PIN to authorize transfers."}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={showPins ? "Hide PINs" : "Show PINs"}
          onClick={() => setShowPins((value) => !value)}
        >
          {showPins ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      <form onSubmit={submitPin} className="mt-4 space-y-4">
        {hasTransferPin && (
          <PinInput
            id="current-transfer-pin"
            label="Current PIN"
            value={currentPin}
            onChange={setCurrentPin}
            visible={showPins}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <PinInput
            id="new-transfer-pin"
            label="New four-digit PIN"
            value={newPin}
            onChange={setNewPin}
            visible={showPins}
          />

          <PinInput
            id="confirm-transfer-pin"
            label="Confirm new PIN"
            value={confirmPin}
            onChange={setConfirmPin}
            visible={showPins}
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Saving PIN...
            </>
          ) : hasTransferPin ? (
            "Change Transfer PIN"
          ) : (
            "Create Transfer PIN"
          )}
        </Button>
      </form>
    </div>
  );
}

function Settings() {
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("aurevia_api_token");

    if (!token) {
      setLoadError("Please sign in again to manage your profile.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const data = await apiRequest<ProfileResponse>("/profile", {
        method: "GET",
        token,
      });

      setProfile(data.profile);
      setName(data.profile.name ?? "");
      setDateOfBirth(data.profile.date_of_birth?.slice(0, 10) ?? "");
      setPhoneNumber(data.profile.phone_number ?? "");
      setResidentialAddress(data.profile.residential_address ?? "");
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load your profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("aurevia_api_token");

    if (!token) {
      toast.error("Please sign in again before saving your profile.");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const data = await apiRequest<ProfileResponse>("/profile", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name: name.trim(),
          date_of_birth: dateOfBirth || null,
          phone_number: phoneNumber.trim() || null,
          residential_address: residentialAddress.trim() || null,
        }),
      });

      setProfile(data.profile);
      setName(data.profile.name);
      setDateOfBirth(data.profile.date_of_birth?.slice(0, 10) ?? "");
      setPhoneNumber(data.profile.phone_number ?? "");
      setResidentialAddress(data.profile.residential_address ?? "");

      toast.success("Personal information updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save your personal information.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle
        title="Settings"
        subtitle="Manage your profile and preferences."
      />

      <DashboardCard title="Personal Information">
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading your personal information...
          </div>
        ) : loadError ? (
          <div className="space-y-3 py-4">
            <p className="text-sm text-destructive">{loadError}</p>

            <Button
              type="button"
              variant="outline"
              onClick={() => void loadProfile()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
              <ProfileAvatar
                email={profile?.email ?? ""}
                name={name || profile?.name || "User"}
                size="lg"
                editable
              />

              <div className="flex-1">
                <h3 className="text-sm font-semibold">Profile photo</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a photo to personalize your Aurevia Bank profile.
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, or WebP. Maximum file size: 2 MB.
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Camera className="h-3.5 w-3.5" />
                  <span>
                    Click your profile picture to upload or change it.
                  </span>
                </div>
              </div>
            </div>

            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={saveProfile}
            >
              <div>
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  maxLength={80}
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="profile-email">Email address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profile?.email ?? ""}
                  readOnly
                  className="mt-2 rounded-xl"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Your email address cannot be changed here.
                </p>
              </div>

              <div>
                <Label htmlFor="profile-dob">Date of birth</Label>
                <Input
                  id="profile-dob"
                  type="date"
                  value={dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="mt-2 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="profile-phone">Phone number</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-2 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="profile-address">Residential address</Label>
                <textarea
                  id="profile-address"
                  autoComplete="street-address"
                  maxLength={2000}
                  value={residentialAddress}
                  onChange={(event) =>
                    setResidentialAddress(event.target.value)
                  }
                  placeholder="Enter your residential address"
                  rows={3}
                  className="mt-2 flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                className="sm:col-span-2 sm:w-fit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </form>
          </>
        )}
      </DashboardCard>

      <DashboardCard title="Security">
        <TransferPinSection
          hasTransferPin={profile?.has_transfer_pin ?? false}
          onPinUpdated={() => {
            void loadProfile();
          }}
        />
      </DashboardCard>

      <DashboardCard title="Preferences">
        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <Label htmlFor="dark">Dark Mode</Label>
            <p className="text-xs text-muted-foreground">
              Switch the whole site to a dark colour scheme.
            </p>
          </div>

          <Switch
            id="dark"
            checked={theme === "dark"}
            onCheckedChange={(value) =>
              setTheme(value ? "dark" : "light")
            }
          />
        </div>
      </DashboardCard>
    </div>
  );
}
