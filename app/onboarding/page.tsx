import { redirect } from "next/navigation";

// Old onboarding route → redirect to new ARIA-powered onboarding
export default function OnboardingPage() {
  redirect("/onboarding/aria");
}
