import Link from "next/link";
import { ArrowRight, FileSearch, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "AI-assisted ID verification",
    description:
      "Upload a photo of your Tennessee driver's license and get verified in seconds instead of waiting on manual review.",
  },
  {
    icon: Sparkles,
    title: "Smart request routing",
    description:
      "Describe what you need in plain English — we suggest the right department and priority automatically.",
  },
  {
    icon: Timer,
    title: "Real-time status updates",
    description:
      "Track every request from submission to fulfillment, with email notifications the moment something changes.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" render={<Link href="/login">Sign in</Link>} />
            <Button render={<Link href="/signup">Create account</Link>} />
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <FileSearch className="size-3.5" />
            Public Records Portal
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Public records requests,
            <br />
            without the runaround.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Submit a request, verify your identity, and track fulfillment
            end-to-end — with AI helping route and prioritize every request
            behind the scenes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button
              size="lg"
              render={
                <Link href="/signup">
                  Get started <ArrowRight className="size-4" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/login">I already have an account</Link>}
            />
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-none bg-transparent shadow-none">
                <CardContent className="flex flex-col items-start gap-3 px-0">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        KnoxRecords — a modern public records request portal.
      </footer>
    </div>
  );
}
