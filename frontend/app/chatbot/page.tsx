"use client";

import { AppLayout } from "@/app/components/app-layout";
import AIChatbot from "./components/AIChatbot";

export default function ChatbotPage() {
  return (
    <AppLayout showFooter={false}>
      <AIChatbot />
    </AppLayout>
  );
}
