<script lang="ts">
    import type { TemplateItem, TemplateText } from "../../models/template.model";

    export let text: TemplateText = { text: "" };
    export let isUpdated: boolean = false;
    let totalLength = 0;
    const maxLength = 500;

    $: {
        totalLength = text.text.length;
    }
</script>

<textarea
    maxlength={maxLength}
    on:change={() => {
        isUpdated = true;
    }}
    bind:value={text.text}
    placeholder="輸入文字"
    class="form-control"
    cols="30"
    rows="10"
/>
<div class="text-end text-black-50">{totalLength}/{maxLength}</div>
