<script lang="ts">
    import { afterUpdate } from "svelte";
    import { SloganColorType, sloganConfigs } from "../../../models/template.model";
    import type { SloganColor } from "../../../models/template.model";
    export let currentSloganType: SloganColorType = null;
    export let disabled: boolean = true;

    function onSelect(color: SloganColor) {
        if (disabled) {
            return;
        }

        currentSloganType = color.type;
    }
    afterUpdate(() => {
        if (disabled) {
            currentSloganType = null;
        }
    });
</script>

<div class="mt-2">
    {#each sloganConfigs as sloganConfig}
        <div class="d-inline-block block-btn-outer ms-2">
            <div
                on:click={() => {
                    onSelect(sloganConfig);
                }}
                class:disabled
                class:selected={currentSloganType === sloganConfig.type}
                class="btn-circle row"
                style="color: {sloganConfig.text};
                background-color:{sloganConfig.background};
                "
            >
                <span class="col align-self-center align-items-center">
                    {#if currentSloganType === sloganConfig.type}
                        <i class="bi bi-check2" />
                    {:else}
                        A
                    {/if}
                </span>
            </div>
        </div>
    {/each}
</div>

<style>
    .block-btn-outer {
        width: 40px;
        height: 40px;
    }

    .btn-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        text-align: center;
        border: 1px solid rgb(134, 134, 134);
        cursor: pointer;
    }

    .btn-circle.selected {
        border: 1px solid rgb(134, 134, 134);
    }

    .btn-circle.disabled {
        opacity: 0.8;
    }
</style>
