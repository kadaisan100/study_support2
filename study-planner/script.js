// ============================
// タブ切り替え処理
// ============================

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const targetTab = button.dataset.tab;

        // すべて非アクティブに
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));

        // 押されたタブだけ有効化
        button.classList.add("active");
        document.getElementById(targetTab).classList.add("active");
    });
});
