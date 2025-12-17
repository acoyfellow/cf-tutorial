<script lang="ts">
  import { marked } from "marked";

  type Props = {
    content: string;
  };

  let { content }: Props = $props();

  const html = $derived(marked.parse(content) as string);
</script>

{@html html}



