import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { AIAssistant } from "@/components/AIAssistant";
import { BottomNav } from "@/components/BottomNav";
import { useCartSync } from "@/hooks/useCartSync";
import { WelcomeModal } from "@/components/WelcomeModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gradient-gold">404</h1>
        <h2 className="mt-3 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-ink text-white px-4 py-2 text-sm">
          Back to home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head back home.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-ink text-white px-4 py-2 text-sm"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NEXA TRADE MART — Shop More. Save More. Get Rewarded." },
      { name: "description", content: "Premium online retail in Port Elizabeth / Gqeberha. Clothing, shoes, electronics, phones, household & beauty — fast WhatsApp ordering and reliable local delivery." },
      { name: "author", content: "NEXA TRADE MART" },
      { name: "google-site-verification", content: "1brDULYwe-6HsBRfMY7m5jfzMf1z4KPw89gQlPWSWX8" },
      { name: "theme-color", content: "#0c0c0c" },
      { property: "og:title", content: "NEXA TRADE MART — Shop More. Save More. Get Rewarded." },
      { property: "og:description", content: "Premium online retail in Port Elizabeth / Gqeberha. Clothing, shoes, electronics, phones, household & beauty — fast WhatsApp ordering and reliable local delivery." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "NEXA TRADE MART" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NEXA TRADE MART — Shop More. Save More. Get Rewarded." },
      { name: "twitter:description", content: "Premium online retail in Port Elizabeth / Gqeberha. Clothing, shoes, electronics, phones, household & beauty — fast WhatsApp ordering and reliable local delivery." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/454e1274-c5ba-410e-b07a-4c52e94bf2d2/id-preview-6b658a2f--f4f367f7-d0cc-4f0c-b10e-6a54a47db48f.lovable.app-1779425537285.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/454e1274-c5ba-410e-b07a-4c52e94bf2d2/id-preview-6b658a2f--f4f367f7-d0cc-4f0c-b10e-6a54a47db48f.lovable.app-1779425537285.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppShell() {
  useCartSync();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminLogin = pathname === "/admin/login";
  if (isAdminLogin) {
    return (
      <>
        <Outlet />
        <Toaster richColors position="top-center" />
      </>
    );
  }
  return (
    <>
      <Header />
      <main className="min-h-[60vh] pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
      <AIAssistant />
      <WelcomeModal />
      <BottomNav />
      <Toaster richColors position="top-center" />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
