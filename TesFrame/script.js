// 1. Ambil semua elemen HTML
const video = document.getElementById("video-feed");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture-btn");
const flipBtn = document.getElementById("flip-btn"); // Boleh null jika tombol tidak ada
const downloadLink = document.getElementById("download-link"); // Sekarang akan ditemukan
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
    currentFacingMode = facingMode; // Simpan mode yang berhasil
    if (facingMode === 'user') {
      video.classList.add('video-is-mirrored');
    } else {
      video.classList.remove('video-is-mirrored');
    }
  } catch (err) {
    console.error("Gagal mengakses kamera utama: ", err);
    // --- LOGIKA FALLBACK (BACKUP PLAN) ---
    const fallbackFacingMode = (facingMode === 'environment') ? 'user' : 'environment';
    constraints.video.facingMode = { ideal: fallbackFacingMode };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      currentStream = stream;
      currentFacingMode = fallbackFacingMode; // Simpan mode yang berhasil
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
    
    // --- INI LOGIKA BARU UNTUK 'CONTAIN' (FRAME UTUH) ---
    const canvasWidth = video.videoWidth;
    const canvasHeight = video.videoHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d");

    // Logika mirroring
    context.save();
    if (currentFacingMode === 'user') {
      context.translate(canvasWidth, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
    context.restore(); 
    
    // Logika 'contain' untuk frame (frame utuh, tidak gepeng)
    const frameNaturalWidth = frame.naturalWidth;
    const frameNaturalHeight = frame.naturalHeight;
    const frameRatio = frameNaturalWidth / frameNaturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let x = 0;
    let y = 0;

    if (frameRatio > canvasRatio) {
      drawHeight = canvasWidth / frameRatio;
      y = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * frameRatio;
      x = (canvasWidth - drawWidth) / 2;
    }
    // Gambar frame di atas video
    context.drawImage(frame, x, y, drawWidth, drawHeight);
    // --- AKHIR LOGIKA 'CONTAIN' ---

    // Proses simpan (Sekarang akan berhasil karena downloadLink ada)
    const dataUrl = canvas.toDataURL("image/png");
    downloadLink.href = dataUrl;
    downloadLink.download = `frame-foto-${Date.now()}.png`;
    downloadLink.click();
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
