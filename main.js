// Google Apps Script のURL
const GAS_URL = "https://script.google.com/macros/s/AKfycbyRYqUJFqwscjIjDOU62V6LSn9sgV9rPIK1u8vMG2kPpQ6fm0e0sDzCrEwHpDhNFjNtXg/exec";

/* ロード中の表示・非表示を切り替える関数 */
function showLoading() { document.getElementById("loading").classList.remove("hidden"); }
function hideLoading() { document.getElementById("loading").classList.add("hidden"); }
window.addEventListener("DOMContentLoaded", hideLoading);

/* 氏名入力 → スプレッドシート照合 → 出欠ページ表示 */
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
    // Content-Typeをtext/plainにすることでApps Scriptで確実に受信できる
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    const result = JSON.parse(text);
    hideLoading();

    console.log("GAS check result:", result);

    // ページ切り替え
    document.getElementById("page2").classList.add("hidden");
    document.getElementById("page3").classList.remove("hidden");

    // スプレッドシートのデータをフォームに反映
    if (result.status === "success") {
      const v = result.attendance || "";
      document.getElementById("attendance").value = v;
      document.getElementById("note").value = result.note || "";
    } else {
      // 氏名が見つからない場合は空欄のまま
      document.getElementById("attendance").value = "";
      document.getElementById("note").value = "";
    }

  } catch (err) {
    hideLoading();
    alert("通信エラーが発生しました。再読み込みしてやり直してください。");
    console.error(err);
  }
}

/* 「完了」ボタンを押したときの保存処理 */
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
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    const result = JSON.parse(text);
    hideLoading();

    console.log("GAS save result:", result);

    // 完了画面を表示
    document.getElementById("page3").classList.add("hidden");
    document.getElementById("page4").classList.remove("hidden");
    document.getElementById("thank-message").innerText = "ご協力ありがとうございました";
  } catch (err) {
    hideLoading();
    alert("保存に失敗しました。もう一度お試しください。");
    console.error(err);
  }
}
