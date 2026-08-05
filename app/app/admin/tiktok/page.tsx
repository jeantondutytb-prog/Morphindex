import { TikTokGenerator } from "@/components/admin/tiktok-generator";
import { AppContainer } from "@/components/app/app-container";
import { PageHeader } from "@/components/app/page-header";

export default function AdminTikTokPage() {
  return (
    <AppContainer>
      <PageHeader
        kicker="Admin"
        title="Créateur TikTok"
        subtitle="Upload une photo, ajuste les scores et télécharge une image prête pour TikTok."
        backHref="/app/admin"
        backLabel="Admin"
      />
      <TikTokGenerator />
    </AppContainer>
  );
}
