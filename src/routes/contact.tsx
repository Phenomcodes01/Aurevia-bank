import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Headphones, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Reveal, Section } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Contact Us — Aurevia Bank" },
      { name: "description", content: "Contact Aurevia Bank customer support for assistance." },
      { property: "og:title", content: "Contact Us — Aurevia Bank" },
      { property: "og:description", content: "Send a message to the Aurevia Bank support team." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(3, "Add a subject").max(150),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(2000),
});
type Form = z.infer<typeof schema>;

function ContactForm() {
  const [v, setV] = useState<Form>({ name: "", email: "", subject: "", message: "" });
  const [err, setErr] = useState<Partial<Record<keyof Form, string>>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(v);
    if (!r.success) {
      setErr(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErr({});
    setV({ name: "", email: "", subject: "", message: "" });
    toast.success("Message form completed", { description: "Your message has been cleared from this form." });
  };
  const field = (k: keyof Form, label: string, type = "text") => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      {k === "message" ? (
        <Textarea id={k} rows={5} className="mt-2 rounded-xl" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!err[k]} />
      ) : (
        <Input id={k} type={type} className="mt-2 h-11 rounded-xl" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!err[k]} />
      )}
      {err[k] && <p className="mt-1 text-xs text-destructive">{err[k]}</p>}
    </div>
  );
  return (
    <form onSubmit={submit} className="card-surface space-y-5 p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">{field("name", "Full Name")}{field("email", "Email Address", "email")}</div>
      {field("subject", "Subject")}
      {field("message", "Message")}
      <Button type="submit" variant="hero" size="xl" className="w-full">Send Message</Button>
    </form>
  );
}

function Contact() {
return ( <SiteLayout> <PageHero
     eyebrow="Get in touch"
     title="Contact Us"
     subtitle="Contact our customer support team for assistance."
   />

  <Section className="pt-8">
    <div className="grid gap-10 lg:grid-cols-5">
      <Reveal className="lg:col-span-3">
        <ContactForm />
      </Reveal>

      <div className="space-y-4 lg:col-span-2">
        {/* Customer Support */}
        <Reveal className="card-surface flex gap-4 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Headphones className="h-5 w-5" />
          </span>

          <div>
            <h3 className="font-semibold">Customer Support</h3>
            <p className="text-sm text-muted-foreground">
              support@aurevia.example
            </p>
            <p className="text-sm text-muted-foreground">
              (555) 010-0100
            </p>
          </div>
        </Reveal>

        {/* Aurevia Bank Headquarters */}
        <Reveal className="relative h-48 overflow-hidden rounded-3xl bg-gradient-navy">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(var(--navy-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--navy-foreground) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden
          />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-navy-foreground">
            <MapPin className="mx-auto h-8 w-8 text-primary-glow" />
            <p className="mt-2 text-sm font-semibold">
              Aurevia Bank HQ
            </p>
            <p className="text-xs opacity-60">Head office</p>
            <p className="text-xs opacity-50">21 Bank Street, Financial District, Quincy, WA 98848, United States</p>
          </div>
        </Reveal>
      </div>
    </div>
  </Section>
</SiteLayout>


);
}

