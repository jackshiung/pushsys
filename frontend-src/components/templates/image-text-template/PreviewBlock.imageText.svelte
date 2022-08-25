<script lang="ts">
    import { afterUpdate, onMount } from "svelte";
    import { ImageTextType } from "../../../models/template.model";
    export let imageTextType: ImageTextType;

    interface TableTdConfig {
        text: string;
        colSpan: number;
        height: number;
        width: number;
    }

    interface TableTrConfig {
        tds: TableTdConfig[];
    }

    let currentTableConfig: TableTrConfig[] = [];

    const imageTextTypePreviewConfig: Record<string, TableTrConfig[]> = {
        "text-image-custom": [{ tds: [{ text: "A", colSpan: 1, height: 100, width: 100 }] }],
        "text-image-1": [
            {
                tds: [{ text: "A", colSpan: 1, height: 100, width: 100 }],
            },
        ],
        "text-image-4": [
            {
                tds: [
                    { text: "A", colSpan: 1, height: 50, width: 50 },
                    { text: "B", colSpan: 1, height: 50, width: 50 },
                ],
            },
            {
                tds: [
                    { text: "C", colSpan: 1, height: 50, width: 50 },
                    { text: "D", colSpan: 1, height: 50, width: 50 },
                ],
            },
        ],
        "text-image-vertical-2": [
            {
                tds: [
                    { text: "A", colSpan: 1, height: 100, width: 50 },
                    { text: "B", colSpan: 1, height: 100, width: 50 },
                ],
            },
        ],
        "text-image-cover-3": [
            {
                tds: [
                    {
                        text: "A",
                        colSpan: 2,
                        height: 50,
                        width: 100,
                    },
                ],
            },
            {
                tds: [
                    {
                        text: "B",
                        colSpan: 1,
                        height: 50,
                        width: 50,
                    },
                    {
                        text: "C",
                        colSpan: 1,
                        height: 50,
                        width: 50,
                    },
                ],
            },
        ],
        "text-image-horizon-2": [
            {
                tds: [{ text: "A", width: 100, height: 50, colSpan: 1 }],
            },
            {
                tds: [{ text: "B", width: 100, height: 50, colSpan: 1 }],
            },
        ],
        "text-image-horizon-cover-3": [
            {
                tds: [{ text: "A", width: 100, height: 50, colSpan: 1 }],
            },
            {
                tds: [{ text: "B", width: 100, height: 25, colSpan: 1 }],
            },
            {
                tds: [{ text: "c", width: 100, height: 25, colSpan: 1 }],
            },
        ],
        "text-image-horizon-3": [
            {
                tds: [{ text: "A", width: 100, height: 100 / 3, colSpan: 1 }],
            },
            {
                tds: [{ text: "B", width: 100, height: 100 / 3, colSpan: 1 }],
            },
            {
                tds: [{ text: "c", width: 100, height: 100 / 3, colSpan: 1 }],
            },
        ],
        "text-image-rectangle-6": [
            {
                tds: [
                    { text: "A", width: 100 / 3, height: 50, colSpan: 1 },
                    { text: "B", width: 100 / 3, height: 50, colSpan: 1 },
                    { text: "C", width: 100 / 3, height: 50, colSpan: 1 },
                ],
            },
            {
                tds: [
                    { text: "D", width: 100 / 3, height: 50, colSpan: 1 },
                    { text: "E", width: 100 / 3, height: 50, colSpan: 1 },
                    { text: "F", width: 100 / 3, height: 50, colSpan: 1 },
                ],
            },
        ],
    };

    onMount(() => {
        console.log({ name, imageTextTypePreviewConfig, imageTextType });
        if (imageTextTypePreviewConfig[imageTextType]) {
            currentTableConfig = imageTextTypePreviewConfig[imageTextType];
        } else {
            currentTableConfig = [];
        }
    });

    afterUpdate(() => {
        if (imageTextTypePreviewConfig[imageTextType]) {
            currentTableConfig = imageTextTypePreviewConfig[imageTextType];
        } else {
            currentTableConfig = [];
        }
    });
</script>

{#if currentTableConfig.length > 0}
    <table class="table-select w-100 h-100 position-absolute">
        <tbody>
            {#each currentTableConfig as tr}
                <tr>
                    {#each tr.tds as td}
                        <td colspan={td.colSpan} style="width:{td.width}%;">
                            {td.text}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    .table-select {
        border-collapse: collapse;
    }

    .table-select td {
        border: 2px solid #0e6dfd;
        text-align: center;
    }
</style>
