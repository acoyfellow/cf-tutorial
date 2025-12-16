<script lang="ts" module>
  export type ToastType = "error" | "confirm" | "success" | "notification";

  export interface Toast {
    _id: number;
    msg: string;
    type: ToastType;
  }

  let toasts = $state<Toast[]>([]);
  let toastId = 0;

  export const alert = (
    msg = "",
    type: ToastType = "notification",
    autoHide = true,
    retainMs = type === "error" ? 8500 : 3500
  ) => {
    const _id = ++toastId;
    toasts = [...toasts, { _id, msg, type }];
    if (autoHide) setTimeout(() => removeToast(_id), retainMs);
  };

  export const removeToast = (_id: number) => {
    toasts = toasts.filter((a) => a._id !== _id);
  };

  export const getToasts = () => toasts;
</script>

<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  const toastClasses: Record<ToastType, string> = {
    error: "bg-red-600/90 text-red-100 border-red-400/30",
    confirm: "bg-blue-600/90 text-blue-100 border-blue-400/30",
    success: "bg-green-600/90 text-green-100 border-green-400/30",
    notification: "bg-yellow-500/90 text-yellow-100 border-yellow-400/30",
  };

  onMount(() => {
    (window as any).alert = alert;
  });
</script>

<div class="fixed bottom-4 right-4 z-[2147483647] space-y-2">
  {#each toasts as toast (toast._id)}
    <div
      in:fly={{ y: -10, duration: 100 }}
      out:fly={{ y: 10, duration: 100 }}
      class="min-w-64 flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl {toastClasses[toast.type]}"
    >
      <span class="flex-1">{toast.msg}</span>
      <button
        onclick={() => removeToast(toast._id)}
        aria-label="Dismiss"
        class="text-current hover:opacity-70 transition-opacity p-1 cursor-pointer"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  {/each}
</div>

