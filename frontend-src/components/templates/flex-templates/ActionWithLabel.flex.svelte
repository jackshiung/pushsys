<script lang="ts">
    import type { TemplateActionWithLabel } from "../../../models/template.model";
    export let enabledAction: boolean = false;
    export let action: TemplateActionWithLabel;
    
    function changeType(
        e: Event & { currentTarget: EventTarget & HTMLSelectElement }
    ) {
        action.type = e.currentTarget.value as any;
        if (e.currentTarget.value === "share" && action.label !== "分享") {
            action.label = "分享";
        } 
        // else {
        //     action.label = "";
        // }
    }    
</script>

<select
    on:blur={(e) => {
        changeType(e);
    }}
    on:change={(e) => {
        changeType(e);
    }}
    disabled={!enabledAction}
    bind:value={action.type}
    class="form-select"
>
    <option value="url">連結</option>
    <option value="text">文字</option>
    <option value="share">分享</option>
</select>

{#if action.type === "text"}
    <textarea
        disabled={!enabledAction}
        bind:value={action.text}
        class="form-control mt-2"
        maxlength="500"
        rows="5"
    />
    <div class="text-end text-black-50">
        {action.text ? action.text.length : 0}/{500}
    </div>
{:else if action.type === "url"}
    <input
        disabled={!enabledAction}
        bind:value={action.url}
        type="url"
        class="form-control mt-2"
    />
{/if}
