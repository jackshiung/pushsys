<script lang="ts">
    import Modal from "sv-bootstrap-modal";
    import Cropper from "cropperjs";
    import { afterUpdate } from "svelte";
    import { managementService } from "../../../services";
    import { dataURLtoFile } from "../../../utils";

    export let croppedImage: string;
    export let isModalOpen: boolean = false;
    export let confirmCrop: (croppedImage: string) => void = (croppedImage: string) => {};
    let isSaving: boolean = false;

    let cropper: Cropper;
    async function cropImage() {
        isSaving = true;

        try {
            const canvas = cropper.getCroppedCanvas({
                maxHeight: 1040,
                maxWidth: 1040,
            });

            const croppedImage = canvas.toDataURL();
            const cropImage = dataURLtoFile(croppedImage, `croppedImage`);

            const uploadResult = await managementService.file.uploadImage({
                image: cropImage,
            });
            isModalOpen = false;
            confirmCrop(uploadResult.item.location);
        } catch (error) {
        } finally {
            isSaving = false;
        }
    }

    function onModalOpened() {
        const imageCropped = document.getElementById("img-cropped") as HTMLImageElement;
        cropper = new Cropper(imageCropped, {
            aspectRatio: 1,
            zoomable: true,
            crop(event) {},
        });
    }

    function onModalClosed() {
        cropper.destroy();
        cropper = null;
    }

    afterUpdate(() => {});
</script>

<Modal dialogClasses="modal-lg" ignoreBackdrop={true} bind:open={isModalOpen} onOpened={onModalOpened} onClosed={onModalClosed}>
    <div class="modal-header">
        <h5 class="modal-title">請裁切成適合的大小</h5>
        <button type="button" class="btn-close" on:click={() => (isModalOpen = false)} />
    </div>
    <div class="modal-body">
        <div class="img-container">
            <img class="d-block mw-100" id="img-cropped" src={croppedImage} alt="croppedImage" />
        </div>
    </div>
    <div class="modal-footer">
        <button
            disabled={isSaving}
            type="button"
            class="btn btn-secondary"
            on:click={() => {
                isModalOpen = false;
            }}>取消</button
        >
        <button disabled={isSaving} type="button" class="btn btn-primary" on:click={cropImage}>{isSaving ? "圖片處理中" : "確定"}</button>
    </div>
</Modal>
