<script lang="ts">
    export let id: string = "";
</script>

<div class="py-3">
    <div class="row">
        <div class="col-auto">
            <div class="card card-preview" />
        </div>
        <div class="col">
            <div style="max-width: 800px;">
                <div class="row mb-4">
                    <div class="col-3">
                        <input id="checkbox-flex-add-last-{id}" type="checkbox" class="form-check-input" />
                        <label class="form-check-label" for="checkbox-flex-add-last-{id}">加入結尾頁</label>
                    </div>

                    <div class="col" />
                </div>

                <div class="row mb-2">
                    <div class="col-3">
                        <span class="span-field"> 版型 </span>
                    </div>
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" name="last-flex-layout" id="radio-last-flex-layout-none" type="radio" />
                            <label class="form-check-label" for="radio-last-flex-layout-none">無圖</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" name="last-flex-layout" id="radio-last-flex-layout-image" type="radio" />
                            <label class="form-check-label" for="radio-last-flex-layout-image">有圖</label>
                        </div>
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-3">
                        <span class="span-field"> 圖片 </span>
                    </div>
                    <div class="col">上傳圖片</div>
                </div>
                <div class="row mb-2">
                    <div class="col-3">
                        <span class="span-field"> 動作 </span>
                    </div>
                    <div class="col">
                        <input type="text" class="form-control" placeholder="請輸入動作標籤" />
                    </div>
                </div>

                <div class="row mb-2">
                    <div class="col-3">
                        <span class="span-field"> 類型 </span>
                    </div>
                    <div class="col">
                        <select class="form-select">
                            <option value="text">文字</option>
                            <option value="link">連結</option>
                        </select>

                        <textarea class="form-control mt-2" rows="5" placeholder="於此輸入的文字將會傳送聊天室" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .span-field {
        margin-left: 20px;
    }
</style>
