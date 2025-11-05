// 1. Ambil semua elemen HTML
const video = document.getElementById("video-feed");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture-btn");
const flipBtn = document.getElementById("flip-btn"); // Tombol balik kamera
const downloadLink = document.getElementById("download-link");
const frame = document.querySelector(".frame-overlay");

// Variabel untuk menyimpan stream kamera saat ini
let currentStream;
// Variabel untuk melacak mode kamera (environment = belakang, user = depan)
let currentFacingMode = "environment"; // Mulai dengan kamera belakang

// 2. Fungsi untuk memulai kamera
async function startCamera(facingMode) {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  const constraints = {
    video: {
      facingMode: { ideal: facingMode },
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream;
  } catch (err) {
    console.error("Error mengakses kamera: ", err);
    alert(
      "Tidak bisa mengakses kamera. Coba ganti ke mode lain atau cek izin browser."
    );
  }
}

// 3. Logika saat tombol "Ambil Foto" diklik
// --- INI ADALAH BAGIAN YANG DIPERBARUI UNTUK MEMPERBAIKI "GEPENG" ---
captureBtn.addEventListener("click", () => {
  // Ambil dimensi asli video stream
  const canvasWidth = video.videoWidth;
  const canvasHeight = video.videoHeight;

  // Set ukuran canvas sama dengan resolusi video
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext("2d");

  // Gambar video (mengisi seluruh canvas)
  context.drawImage(video, 0, 0, canvasWidth, canvasHeight);

  // --- LOGIKA BARU UNTUK MENGGAMBAR FRAME TANPA GEPENG ---
  
  // Dapatkan dimensi asli file frame PNG
  const frameNaturalWidth = frame.naturalWidth;
  const frameNaturalHeight = frame.naturalHeight;

  // Hitung rasio aspek
  const frameRatio = frameNaturalWidth / frameNaturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let x = 0;
  let y = 0;

  // Logika ini meniru 'object-fit: contain'
  if (frameRatio > canvasRatio) {
    // Jika frame lebih lebar dari canvas
    drawHeight = canvasWidth / frameRatio;
    y = (canvasHeight - drawHeight) / 2; // Pusatkan frame secara vertikal
  } else {
    // Jika frame lebih tinggi dari canvas (kasus umum di HP)
    drawWidth = canvasHeight * frameRatio;
    x = (canvasWidth - drawWidth) / 2; // Pusatkan frame secara horizontal
  }

  // Gambar frame di atas video dengan dimensi yang sudah dihitung (tidak akan gepeng)
  context.drawImage(frame, x, y, drawWidth, drawHeight);

  // --- AKHIR DARI LOGIKA BARU ---

  // 4. Proses simpan ke galeri (Tetap sama)
  const dataUrl = canvas.toDataURL("image/png");
  downloadLink.href = dataUrl;
  downloadLink.download = `frame-foto-${Date.now()}.png`;
  downloadLink.click();
});
// --- AKHIR DARI BAGIAN YANG DIPERBARUI ---


// 4. LOGIKA BARU: Saat tombol "Balik Kamera" diklik
flipBtn.addEventListener("click", () => {
  currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
  startCamera(currentFacingMode);
});

// 5. Jalankan kamera saat halaman dimuat pertama kali
startCamera(currentFacingMode);
