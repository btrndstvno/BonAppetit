// 1. Ambil semua elemen HTML
const video = document.getElementById("video-feed");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture-btn");
const flipBtn = document.getElementById("flip-btn"); // Dapat 'null' jika tidak ada, TAPI ITU OKE
const downloadLink = document.getElementById("download-link");
const frame = document.querySelector(".frame-overlay");

// Variabel untuk menyimpan stream kamera saat ini
let currentStream;
// Variabel untuk melacak mode kamera (environment = belakang, user = depan)
let currentFacingMode = "environment"; // Mulai dengan kamera belakang

// 2. Fungsi untuk memulai kamera (Dengan Fallback)
async function startCamera(facingMode) {
  // Hentikan stream lama jika ada
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
    // Coba minta kamera yang diinginkan
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream;
    currentFacingMode = facingMode; // Simpan mode yang berhasil

    // Atur mirroring
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
      // Coba lagi dengan kamera fallback
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      currentStream = stream;
      currentFacingMode = fallbackFacingMode; // Simpan mode yang berhasil

      // Atur mirroring untuk fallback
      if (fallbackFacingMode === 'user') {
        video.classList.add('video-is-mirrored');
      } else {
        video.classList.remove('video-is-mirrored');
      }

    } catch (fallbackErr) {
      // Jika keduanya gagal, baru tampilkan error
      console.error("Gagal mengakses kamera fallback: ", fallbackErr);
      alert(
        "Tidak bisa mengakses kamera. Cek izin browser Anda."
      );
    }
  }
}

// 3. Logika saat tombol "Ambil Foto" diklik
// Pastikan ini ditambahkan MESKIPUN tombol flip tidak ada
captureBtn.addEventListener("click", () => {
  // Pastikan video sudah siap
  if (!video.videoWidth || video.videoWidth === 0) {
    console.error("Video data belum siap.");
    return; // Hentikan jika video belum ada datanya
  }

  const canvasWidth = video.videoWidth;
  const canvasHeight = video.videoHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");

  // Logika mirroring saat simpan
  context.save();
  if (currentFacingMode === 'user') {
    context.translate(canvasWidth, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
  context.restore(); // Kembalikan canvas agar frame tidak terbalik
  
  // Logika 'cover' untuk frame
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
  context.drawImage(frame, x, y, drawWidth, drawHeight);

  // Proses simpan
  const dataUrl = canvas.toDataURL("image/png");
  downloadLink.href = dataUrl;
  downloadLink.download = `frame-foto-${Date.now()}.png`;
  downloadLink.click();
});

// 4. Logika saat tombol "Balik Kamera" diklik
// --- INI PERBAIKANNYA ---
// Hanya tambahkan listener JIKA tombol 'flipBtn' ada
if (flipBtn) {
  flipBtn.addEventListener("click", () => {
    // Ganti ke mode sebaliknya dari yang SEKARANG AKTIF
    const newFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
    startCamera(newFacingMode);
  });
}

// 5. Jalankan kamera saat halaman dimuat pertama kali
// (Script akan sampai di sini karena tidak crash di atas)
startCamera("environment");
