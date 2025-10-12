// main.js: 更新版（照合結果の反映を行う）
function showLoading() { document.getElementById("loading").classList.remove("hidden"); }
function hideLoading() { document.getElementById("loading").classList.add("hidden"); }
window.addEventListener("DOMContentLoaded", hideLoading);

// 氏名入力後、出欠ページへ（GASのレスポンスを使ってフォームを事前入力する）
async function goToPage3() {
  const name = document.getElementById("name").value.trim();
  if (!name) {
    document.getElementById("errorName").innerText = "氏名を入力してください";
    return;
  }
  document.getElementById("errorName").innerText = "";

  const payload = { mode: "check", class: "3-3", name: name };

  try {
    showLoading();
    const res = await fetch("https://script.google.com/macros/s/AKfycbwf8y-ZZPoio9BFaayqei38usFgLH9T5dkJhYeNaPgL-Fwtj54xs_5BGMQJeS4Jd-NZ/exec", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    hideLoading();

    // ページ切替（氏名入力欄は残しておく）
    document.getElementById("page2").classList.add("hidden");
    document.getElementById("page3").classList.remove("hidden");

    // result.status に応じてフォームを埋める
    // success -> スプレッドの現在値を反映（注意: 保存時は convertAttendance で変換される）
    if (result.status === "success") {
      // attendance は GAS が "未回答" で保存している場合があるので
      // フロントでは "未回答" => "未定" として表示したい場合は変換する
      const attendanceVal = (result.attendance === "未回答") ? "未定" : (result.attendance || "");
      document.getElementById("attendance").value = attendanceVal;
      document.getElementById("note").value = result.note || "";
    } else {
      // nomatch / new / mismatch などは既存値は無しにする（画面は空欄）
      document.getElementById("attendance").value = "";
      document.getElementById("note").value = "";
    }

  } catch (e) {
    hideLoading();
    console.error("通信エラー:", e);
    alert("通信エラーが発生しました。もう一度お試しください。");
  }
}

// 完了ボタン押下で送信（変更不要だが念のため掲載）
async function submitForm() {
  const payload = {
    mode: "save",
    class: "3-3",
    name: document.getElementById("name").value.trim(),
    attendance: document.getElementById("attendance").value,
    note: document.getElementById("note").value
  };

  if (!payload.attendance) {
    document.getElementById("error2").innerText = "出欠を選択してください";
    return;
  }
  document.getElementById("error2").innerText = "";

  try {
    showLoading();
    const res = await fetch("https://script.google.com/macros/s/AKfycbxr1L6MzxkH-Js9_94pSJpsVS6D6vZ9rUJgZnFE_SvlOUCC_M7nknZlVtwZ5WYthsaDlA/exec", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    await res.json();
    hideLoading();

    document.getElementById("page3").classList.add("hidden");
    document.getElementById("page4").classList.remove("hidden");
    document.getElementById("thank-message").innerText = "ご協力ありがとうございました";
  } catch (e) {
    hideLoading();
    console.error("保存エラー:", e);
    alert("保存に失敗しました。もう一度お試しください。");
  }
}
