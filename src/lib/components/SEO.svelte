<script lang="ts">
  import { dev } from "$app/environment";

  const siteName = "Cloudflare Tutorial";
  const baseUrl = dev
    ? "http://localhost:5173"
    : "https://cf-tutorial.coey.dev"; // Update this when deployed
  const defaultOgImage = `${baseUrl}/api/og-image?title=${encodeURIComponent(siteName)}&description=${encodeURIComponent("Interactive Cloudflare Learning")}`;

  interface Props {
    title: string;
    description: string;
    keywords?: string;
    path?: string;
    type?: "article" | "website";
    ogImage?: string;
    author?: string;
  }

  let {
    title,
    description,
    keywords = "cloudflare, workers, d1, durable objects, pages, kv, r2, tutorial",
    path = "/",
    type = "website",
    ogImage,
    author = "Cloudflare Tutorial",
  }: Props = $props();

  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
  const ogImageUrl =
    ogImage ||
    `${baseUrl}/api/og-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/cloudflare.svg`,
    },
  };
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <link rel="canonical" href={`${baseUrl}${path}`} />
  <meta name="author" content={author} />

  <!-- Open Graph -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={`${baseUrl}${path}`} />
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:site_name" content={siteName} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImageUrl} />

  <!-- Schema.org -->
  {@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>`}
</svelte:head>
