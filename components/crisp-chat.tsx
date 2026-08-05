import Script from "next/script";

const CRISP_WEBSITE_ID =
  process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ?? "cc6f95a6-c992-4040-9b8b-510a3738bf97";

export function CrispChat() {
  if (!CRISP_WEBSITE_ID) return null;

  return (
    <>
      <Script id="crisp-init" strategy="afterInteractive">
        {`window.$crisp=[];window.CRISP_WEBSITE_ID="${CRISP_WEBSITE_ID}";`}
      </Script>
      <Script src="https://client.crisp.chat/l.js" strategy="afterInteractive" />
    </>
  );
}
