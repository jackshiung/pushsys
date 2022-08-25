<script lang="ts">
  import { onMount } from "svelte";
  import liff from "@line/liff";
  import sweetalert from "sweetalert2";
  import { managementService } from "../services";
  import { tryGetInteger } from "../utils";
  export let code: string = "";

  const urlParams = new URLSearchParams(window.location.search);
  const trace: number = tryGetInteger(urlParams.get("trace"), 0);

  onMount(async () => {
    const liffId = process.env.LIFF_ID;

    // try to get code from query string
    if (!code) {
      code = urlParams.get("code");
    }

    console.log({ liffId, code });

    await liff.init({
      liffId,
    });

    if (!liff.isInClient()) {
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }
    }

    if (!code) {
      await sweetalert.fire({
        icon: "error",
        title: "錯誤",
        text: "無法查看此頁面",
      });
      return;
    }

    const result = await managementService.share.getTemplateByShareCode(
      code,
      trace
    );

    if (!result.success) {
      
      await sweetalert.fire({
        icon: "error",
        title: "訊息已刪除，故無法分享",
      });

      try {
        await liff.closeWindow();
      } catch (error) {}

      return;
    }

    const message = result.item.data;
    const filteredMessages = message.filter((item) => item.type !== "imagemap");

    try {
      await liff.shareTargetPicker(filteredMessages, { isMultiple: true });
    } catch (error) {
      const errorObject = {
        errorMessage: error.message,
        template: result.item.data,
        filteredMessages,
      };
      await sweetalert.fire({
        icon: "error",
        title: "回傳訊息錯誤",
        text: JSON.stringify(errorObject),
      });
      return;
    }

    try {
      await liff.closeWindow();
    } catch (error) {}
  });
</script>

<div class="text-center py-5">
  <div class="mb-4 text-muted">請使用 LINE 開啟此頁面</div>

  <div class="mb-4">
    <div class="spinner-border text-secondary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div class="text-muted">開啟分享選單中</div>
  <div class="text-muted fw-lighter mt-2">
    ({code})
  </div>
</div>
