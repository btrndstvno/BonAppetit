// 1. Ambil semua elemen HTML
const video = document.getElementById("video-feed");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture-btn");
const flipBtn = document.getElementById("flip-btn"); // Tombol baru
const downloadLink = document.getElementById("download-link");
const frame = document.querySelector(".frame-overlay");

// Variabel untuk menyimpan stream kamera saat ini
let currentStream;
// Variabel untuk melacak mode kamera (environment = belakang, user = depan)
let currentFacingMode = "environment"; // Mulai dengan kamera belakang

// 2. Fungsi untuk memulai kamera (sudah dimodifikasi)
async function startCamera(facingMode) {
  // Hentikan stream lama jika ada (penting saat membalik kamera)
  if (currentStream) {
    currentStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  // Set constraints baru
  const constraints = {
    video: {
      facingMode: { ideal: facingMode }, // Gunakan 'ideal' agar lebih fleksibel
    },
    audio: false,
  };

  try {
    // Minta stream kamera baru
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream; // Simpan stream yang sedang aktif
  } catch (err) {
    console.error("Error mengakses kamera: ", err);
    alert(
      "Tidak bisa mengakses kamera. Coba ganti ke mode lain atau cek izin browser."
    );
  }
}

// 3. Logika saat tombol "Ambil Foto" diklik (Tetap sama)
captureBtn.addEventListener("click", () => {
  // Set ukuran canvas sama dengan ukuran video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Dapatkan konteks 2D dari canvas
  const context = canvas.getContext("2d");

  // Gambar frame video saat ini ke canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Sekarang, gambar frame PNG di atasnya
  // Kita menggunakan elemen <img> frame, bukan path file-nya
  context.drawImage(frame, 0, 0, canvas.width, canvas.height);

  // 4. Proses simpan ke galeri
  // Ubah data canvas menjadi gambar (data URL)
  const dataUrl = canvas.toDataURL("image/png");

  // Set data URL ke link download
  downloadLink.href = dataUrl;

  // Beri nama file (misal: ospek-foto-timestamp.png)
  downloadLink.download = `frame-foto-${Date.now()}.png`;

  // Klik link download secara otomatis
  downloadLink.click();
});

// 4. LOGIKA BARU: Saat tombol "Balik Kamera" diklik
flipBtn.addEventListener("click", () => {
  // Ganti mode
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";

  // Mulai ulang kamera dengan mode baru
  startCamera(currentFacingMode);
});

// 5. Jalankan kamera saat halaman dimuat pertama kali
startCamera(currentFacingMode);
