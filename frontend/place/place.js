document.addEventListener("DOMContentLoaded", () => {
  // ปุ่มหัวใจ (จะเห็นก็ต่อเมื่อมีข้อมูลและตัว content โผล่)
  const favBtn = document.querySelector(".place-detail-fav");
  if (favBtn) {
    favBtn.addEventListener("click", () => {
      favBtn.classList.toggle("is-active");

      const icon = favBtn.querySelector(".material-icons");
      if (icon) {
        icon.textContent = favBtn.classList.contains("is-active")
          ? "favorite"
          : "favorite_border";
      }
    });
  }

  // ปุ่มย้อนกลับ
  const backBtn = document.querySelector(".place-detail-back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
      // หรือถ้าอยาก fix ให้กลับหน้า home:
      // location.href = "../index/index.html";
    });
  }
});