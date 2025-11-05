// 1. Ambil semua elemen HTML
const video = document.getElementById("video-feed");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture-btn");
const flipBtn = document.getElementById("flip-btn");
const downloadLink = document.getElementById("download-link");
const frame = document.querySelector(".frame-overlay");

// Variabel untuk menyimpan stream kamera saat ini
let currentStream;
// Variabel untuk melacak mode kamera (environment = belakang, user = depan)
let currentFacingMode = "environment"; // Mulai dengan kamera belakang

// 2. Fungsi untuk memulai kamera (Dengan Fallback)
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
    currentFacingMode = facingMode;
    if (facingMode === 'user') {
      video.classList.add('video-is-mirrored');
    } else {
      video.classList.remove('video-is-mirrored');
    }
  } catch (err) {
    console.error("Gagal mengakses kamera utama: ", err);
    const fallbackFacingMode = (facingMode === 'environment') ? 'user' : 'environment';
    constraints.video.facingMode = { ideal: fallbackFacingMode };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      currentStream = stream;
      currentFacingMode = fallbackFacingMode;
      if (fallbackFacingMode === 'user') {
        video.classList.add('video-is-mirrored');
      } else {
        video.classList.remove('video-is-mirrored');
      }
    } catch (fallbackErr) {
      console.error("Gagal mengakses kamera fallback: ", fallbackErr);
      alert("Tidak bisa mengakses kamera. Cek izin browser Anda.");
    }
  }
}

// 3. Logika saat tombol "Ambil Foto" diklik
if (captureBtn) {
  captureBtn.addEventListener("click", () => {
    
    // Cek kesiapan
    if (!video.videoWidth || video.videoWidth === 0 || !frame.naturalWidth || frame.naturalWidth === 0) {
      console.error("Video atau frame belum siap.");
      return; 
    }
    
    // --- INI LOGIKA BARU UNTUK MENGHASILKAN GAMBAR TANPA BAR HITAM ---
    // Ukuran akhir gambar adalah ukuran frame itu sendiri
    const outputWidth = frame.naturalWidth;
    const outputHeight = frame.naturalHeight;

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");

    // --- Pertama, gambar video ke canvas agar sesuai dengan frame (object-fit: cover) ---
    const videoRatio = video.videoWidth / video.videoHeight;
    const outputRatio = outputWidth / outputHeight;

    let videoDrawWidth, videoDrawHeight, videoDrawX, videoDrawY;

    if (videoRatio > outputRatio) {
      // Video lebih lebar dari output canvas, pangkas samping
      videoDrawHeight = outputHeight;
      videoDrawWidth = outputHeight * videoRatio;
      videoDrawX = (outputWidth - videoDrawWidth) / 2;
      videoDrawY = 0;
    } else {
      // Video lebih tinggi dari output canvas, pangkas atas/bawah
      videoDrawWidth = outputWidth;
      videoDrawHeight = outputWidth / videoRatio;
      videoDrawX = 0;
      videoDrawY = (outputHeight - videoDrawHeight) / 2;
    }

    // Logika mirroring saat menggambar video
    context.save();
    if (currentFacingMode === 'user') {
      context.translate(outputWidth, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, videoDrawX, videoDrawY, videoDrawWidth, videoDrawHeight);
    context.restore(); // Kembalikan canvas agar frame tidak terbalik

    // --- Kedua, gambar frame di atasnya (pas ke ukuran output) ---
    context.drawImage(frame, 0, 0, outputWidth, outputHeight);
    // --- AKHIR LOGIKA BARU ---

    // Proses simpan
    const dataUrl = canvas.toDataURL("image/png");
    
    if (downloadLink) {
        downloadLink.href = dataUrl;
        downloadLink.download = `frame-foto-${Date.now()}.png`;
        downloadLink.click();
    } else {
        console.error("Elemen Download Link tidak ditemukan!");
        alert("Terjadi error, link download tidak ditemukan.");
    }
  });
} else {
  console.error("Tombol Capture (#capture-btn) tidak ditemukan!");
}

// 4. Logika saat tombol "Balik Kamera" diklik
if (flipBtn) {
  flipBtn.addEventListener("click", () => {
    const newFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
    startCamera(newFacingMode);
  });
}

// 5. Jalankan kamera saat halaman dimuat pertama kali
startCamera("environment");
