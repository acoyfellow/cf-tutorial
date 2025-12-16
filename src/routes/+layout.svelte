<script lang="ts">
  import "../app.css";
  import PreloadingIndicator from "$lib/components/PreloadingIndicator.svelte";
  import Alert from "$lib/components/Alert.svelte";
  import { navigating } from "$app/state";

  let { children } = $props();
</script>

{#if navigating.to}
  <PreloadingIndicator />
{/if}

{@render children()}

<Alert />
