// Fungsi membuka/menutup menu dropdown About
function toggleDropdown(event) {
  event.stopPropagation();
  document.getElementById('menuDropdownAbout').classList.toggle('tampil');
}

// Tutup dropdown otomatis jika klik di luar menu About
window.onclick = function() {
  const dropdown = document.getElementById('menuDropdownAbout');
  if (dropdown.classList.contains('tampil')) {
    dropdown.classList.remove('tampil');
  }
};

// Fungsi membuka halaman sesuai tombol navbar yang diklik
function bukaMenu(namaMenu, dariSubAbout = false) {
  // Sembunyikan semua halaman
  document.querySelectorAll('.halaman').forEach(halaman => {
    halaman.classList.remove('aktif');
  });

  // Hapus status aktif di semua tombol navbar
  document.querySelectorAll('.menu-btn').forEach(tombol => {
    tombol.classList.remove('aktif');
  });

  // Tampilkan halaman yang dipilih
  document.getElementById(namaMenu).classList.add('aktif');

  // Tandai tombol aktif (jika dari sub-menu About, nyalakan tombol About)
  if (dariSubAbout) {
    document.getElementById('btn-about').classList.add('aktif');
  } else {
    document.getElementById('btn-' + namaMenu).classList.add('aktif');
  }

  // Tutup dropdown setelah dipilih
  document.getElementById('menuDropdownAbout').classList.remove('tampil');

  // Catat otomatis ke halaman History
  catatRiwayat('Membuka halaman ' + namaMenu.replace('-', ' ').toUpperCase());
}

// Fungsi mencatat aktivitas ke menu History
function catatRiwayat(pesan) {
  const daftar = document.getElementById('listRiwayat');
  const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const itemBaru = document.createElement('li');
  
  itemBaru.textContent = `[${waktu}] ${pesan}`;
  daftar.prepend(itemBaru);
}

// Fungsi Mode Terang / Gelap
function gantiTema() {
  document.body.classList.toggle('mode-gelap');
  const tombol = document.getElementById('btnTema');
  
  if (document.body.classList.contains('mode-gelap')) {
    tombol.textContent = '☀️ Aktifkan Mode Terang';
    catatRiwayat('Mengubah tema ke Mode Gelap');
  } else {
    tombol.textContent = '🌙 Aktifkan Mode Gelap';
    catatRiwayat('Mengubah tema ke Mode Terang');
  }
}

// Fungsi Ubah Ukuran Huruf
function aturHuruf(ukuran) {
  document.documentElement.style.setProperty('--ukuran-huruf', ukuran + 'px');
  document.getElementById('labelHuruf').textContent = ukuran + 'px';
}

// Fungsi Ubah Ukuran Ikon
function aturIkon(ukuran) {
  document.documentElement.style.setProperty('--ukuran-ikon', ukuran + 'px');
  document.getElementById('labelIkon').textContent = ukuran + 'px';
}

// Fungsi Reset ke Awal
function resetPengaturan() {
  aturHuruf(16);
  aturIkon(20);
  document.getElementById('sliderHuruf').value = 16;
  document.getElementById('sliderIkon').value = 20;
  
  document.body.classList.remove('mode-gelap');
  document.getElementById('btnTema').textContent = '🌙 Aktifkan Mode Gelap';
  
  catatRiwayat('Mereset pengaturan ke default');
}
