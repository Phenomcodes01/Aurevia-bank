import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";

import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { demoAuth } from "@/lib/demo-data";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/dashboard/settings")({
head: () => ({
meta: [
{ title: "Settings — Aurevia Bank" },
{
name: "description",
content: "Settings for your Aurevia Bank account.",
},
{ property: "og:title", content: "Settings — Aurevia Bank" },
{
property: "og:description",
content: "Settings for your Aurevia Bank account.",
},
{ property: "og:type", content: "website" },
{ name: "twitter:card", content: "summary" },
],
}),
component: Settings,
});

function Toggle({
id,
label,
desc,
def = false,
}: {
id: string;
label: string;
desc: string;
def?: boolean;
}) {
const [on, setOn] = useState(def);

return ( <div className="flex items-center justify-between gap-4 py-3"> <div> <Label htmlFor={id}>{label}</Label> <p className="text-xs text-muted-foreground">{desc}</p> </div>

  <Switch id={id} checked={on} onCheckedChange={setOn} />
</div>


);
}

function Settings() {
const { theme, setTheme } = useTheme();
const u = demoAuth.get();

const [name, setName] = useState(u?.name ?? "");

return ( <div className="max-w-3xl space-y-6"> <PageTitle
     title="Settings"
     subtitle="Manage your profile and preferences."
   />


  <DashboardCard title="Profile">
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
      <ProfileAvatar
        email={u?.email ?? ""}
        name={name || u?.name || "User"}
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
          <span>Click your profile picture to upload or change it.</span>
        </div>
      </div>
    </div>

    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();

        if (u && name.trim()) {
          demoAuth.set({ ...u, name: name.trim() });
          toast.success("Profile saved");
        }
      }}
    >
      <div>
        <Label htmlFor="n">Full name</Label>
        <Input
          id="n"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 rounded-xl"
        />
      </div>

      <div>
        <Label htmlFor="e">Email</Label>
        <Input
          id="e"
          value={u?.email ?? ""}
          disabled
          className="mt-2 rounded-xl"
        />
      </div>

      <Button type="submit" variant="hero" className="sm:col-span-2 sm:w-fit">
        Save changes
      </Button>
    </form>
  </DashboardCard>

  <DashboardCard title="Security">
    <div className="divide-y divide-border">
      <Toggle
        id="2fa"
        label="Two-factor authentication"
        desc="An additional sign-in step."
        def
      />

      <Toggle
        id="bio"
        label="Biometric login"
        desc="Use device biometrics."
      />
    </div>
  </DashboardCard>

  <DashboardCard title="Notifications">
    <div className="divide-y divide-border">
      <Toggle
        id="email"
        label="Email Notifications"
        desc="Account summaries by email."
        def
      />

      <Toggle
        id="txn"
        label="Transaction Alerts"
        desc="Instant alerts for every transaction."
        def
      />

      <Toggle
        id="mkt"
        label="Marketing Notifications"
        desc="Product news and offers."
      />
    </div>
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
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
      />
    </div>
  </DashboardCard>
</div>


);
}
