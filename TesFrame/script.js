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

// 2. Fungsi untuk memulai kamera (DIMODIFIKASI)
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

    // --- LOGIKA BARU UNTUK MEMBALIK TAMPILAN ---
    if (facingMode === 'user') {
      // Jika kamera depan, tambahkan class untuk 'mirror'
      video.classList.add('video-is-mirrored');
    } else {
      // Jika kamera belakang, hapus class
      video.classList.remove('video-is-mirrored');
    }
    // --- AKHIR LOGIKA BARU ---

  } catch (err) {
    console.error("Error mengakses kamera: ", err);
    alert(
      "Tidak bisa mengakses kamera. Coba ganti ke mode lain atau cek izin browser."
    );
  }
}

// 3. Logika saat tombol "Ambil Foto" diklik
// --- INI ADALAH BAGIAN YANG DIPERBARUI UNTUK MEMBALIK HASIL FOTO ---
captureBtn.addEventListener("click", () => {
  // Ambil dimensi asli video stream
  const canvasWidth = video.videoWidth;
  const canvasHeight = video.videoHeight;

  // Set ukuran canvas sama dengan resolusi video
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext("2d");

  // --- LOGIKA BARU UNTUK MEMBALIK GAMBAR SIMPANAN ---
  // Simpan state canvas (sebelum dibalik)
  context.save();

  // Cek jika kita di mode kamera depan
  if (currentFacingMode === 'user') {
    // Balik canvas secara horizontal
    context.translate(canvasWidth, 0);
    context.scale(-1, 1);
  }

  // Gambar video (video akan tergambar terbalik/normal sesuai state canvas)
  context.drawImage(video, 0, 0, canvasWidth, canvasHeight);

  // Kembalikan state canvas ke normal (agar frame tidak ikut terbalik)
  context.restore();
  
  // --- LOGIKA "COVER" UNTUK FRAME (TETAP SAMA) ---
  const frameNaturalWidth = frame.naturalWidth;
  const frameNaturalHeight = frame.naturalHeight;
  const frameRatio = frameNaturalWidth / frameNaturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  let drawWidth, drawHeight, x, y;
  if (frameRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * frameRatio;
    x = (canvasWidth - drawWidth) / 2;
    y = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / frameRatio;
    x = 0;
    y = (canvasHeight - drawHeight) / 2;
  }
  
  // Gambar frame (frame akan tergambar normal, tidak terbalik)
  context.drawImage(frame, x, y, drawWidth, drawHeight);

  // 4. Proses simpan ke galeri (Tetap sama)
  const dataUrl = canvas.toDataURL("image/png");
  downloadLink.href = dataUrl;
  downloadLink.download = `frame-foto-${Date.now()}.png`;
  downloadLink.click();
});
// --- AKHIR DARI BAGIAN YANG DIPERBARUI ---


// 4. Logika saat tombol "Balik Kamera" diklik (DIMODIFIKASI)
flipBtn.addEventListener("click", () => {
  currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
  // Mulai ulang kamera dengan mode baru
  startCamera(currentFacingMode);
});

// 5. Jalankan kamera saat halaman dimuat pertama kali
startCamera(currentFacingMode);
