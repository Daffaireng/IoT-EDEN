// ==========================================
// 1. NAVIGASI HALAMAN & DROPDOWN
// ==========================================
function bukaMenu(idHalaman, dariDropdown = false) {
  document.querySelectorAll('.halaman').forEach(el => el.classList.remove('aktif'));
  document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('aktif'));

  const target = document.getElementById(idHalaman);
  if (target) target.classList.add('aktif');

  if (dariDropdown) {
    document.getElementById('btn-about')?.classList.add('aktif');
    const dropdown = document.getElementById('menuDropdownAbout');
    if (dropdown) dropdown.style.display = 'none';
  } else {
    document.getElementById('btn-' + idHalaman)?.classList.add('aktif');
  }

  if (idHalaman === 'dashboard' && map) {
    setTimeout(() => map.invalidateSize(), 150);
  }
}

function toggleDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('menuDropdownAbout');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }
}

window.addEventListener('click', () => {
  const dropdown = document.getElementById('menuDropdownAbout');
  if (dropdown) dropdown.style.display = 'none';
});

// ==========================================
// 2. PENGATURAN TAMPILAN (TEMA, HURUF, IKON)
// ==========================================
let modeGelap = localStorage.getItem('eden_dark') === 'true';

function terapkanTema() {
  document.body.classList.toggle('gelap', modeGelap);
  document.body.classList.toggle('dark', modeGelap);
  document.documentElement.setAttribute('data-tema', modeGelap ? 'gelap' : 'terang');

  const btn = document.getElementById('btnTema');
  if (btn) {
    btn.textContent = modeGelap ? '☀️ Aktifkan Mode Terang' : '🌙 Aktifkan Mode Gelap';
  }

  if (tileLayerTerang && tileLayerGelap && map) {
    if (modeGelap) {
      map.removeLayer(tileLayerTerang);
      tileLayerGelap.addTo(map);
    } else {
      map.removeLayer(tileLayerGelap);
      tileLayerTerang.addTo(map);
    }
  }
}

function gantiTema() {
  modeGelap = !modeGelap;
  localStorage.setItem('eden_dark', modeGelap);
  terapkanTema();
}

function aturHuruf(nilai) {
  document.documentElement.style.setProperty('--ukuran-huruf', nilai + 'px');
  document.documentElement.style.fontSize = nilai + 'px';
  const label = document.getElementById('labelHuruf');
  if (label) label.textContent = nilai + 'px';
  localStorage.setItem('eden_font', nilai);
}

function aturIkon(nilai) {
  document.documentElement.style.setProperty('--ukuran-ikon', nilai + 'px');
  const label = document.getElementById('labelIkon');
  if (label) label.textContent = nilai + 'px';
  localStorage.setItem('eden_icon', nilai);
}

function resetPengaturan() {
  modeGelap = false;
  localStorage.removeItem('eden_dark');
  localStorage.removeItem('eden_font');
  localStorage.removeItem('eden_icon');
  terapkanTema();
  document.getElementById('sliderHuruf').value = 16;
  document.getElementById('sliderIkon').value = 20;
  aturHuruf(16);
  aturIkon(20);
}

// ==========================================
// 3. PETA LEAFLET HEATMAP (BEBAS BLOKIR FILE://)
// ==========================================
const KOORDINAT_ZONA = [-7.4626, 110.2163];
let map, heatLayer, zonaCircle, tileLayerTerang, tileLayerGelap;
let dataTerkini = { diDalam: 0, masuk: 0, keluar: 0 };
let riwayatLog = JSON.parse(localStorage.getItem('eden_history') || '[]');

function initPetaHeatmap() {
  if (typeof L === 'undefined') {
    console.error('Leaflet gagal dimuat. Pastikan koneksi internet aktif.');
    return;
  }

  map = L.map('map').setView(KOORDINAT_ZONA, 18);

  tileLayerTerang = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri &copy; OpenStreetMap',
    maxZoom: 19
  });

  tileLayerGelap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 19
  });

  if (modeGelap) {
    tileLayerGelap.addTo(map);
  } else {
    tileLayerTerang.addTo(map);
  }

  heatLayer = L.heatLayer([], {
    radius: 38,
    blur: 24,
    maxZoom: 19,
    gradient: {
      0.2: '#16a34a',
      0.5: '#eab308',
      0.85: '#dc2626'
    }
  }).addTo(map);

  zonaCircle = L.circle(KOORDINAT_ZONA, {
    color: '#16a34a',
    fillColor: '#16a34a',
    fillOpacity: 0.25,
    radius: 22
  }).addTo(map);

  perbaruiTampilanDashboard(0, 0, 0, null);
}

// ==========================================
// 4. UPDATE DASHBOARD, HEATMAP & HISTORY
// ==========================================
function getInfoStatus(jumlah) {
  if (jumlah < 5) {
    return { teks: 'Lancar', warna: '#16a34a', bg: '#dcfce7', intensitas: 0.3 };
  } else if (jumlah < 10) {
    return { teks: 'Mulai Ramai', warna: '#d97706', bg: '#fef3c7', intensitas: 0.65 };
  } else {
    return { teks: 'Padat', warna: '#dc2626', bg: '#fee2e2', intensitas: 1.0 };
  }
}

function perbaruiTampilanDashboard(diDalam, masuk, keluar, eventArah) {
  dataTerkini = { diDalam, masuk, keluar };

  document.getElementById('valDiDalam').textContent = diDalam;
  document.getElementById('valMasuk').textContent = masuk;
  document.getElementById('valKeluar').textContent = keluar;

  const info = getInfoStatus(diDalam);
  const elStatus = document.getElementById('valStatus');
  elStatus.textContent = info.teks;
  elStatus.style.color = info.warna;

  if (zonaCircle) {
    zonaCircle.setStyle({
      color: info.warna,
      fillColor: info.warna
    });
  }

  if (heatLayer) {
    const titikHeat = [];
    const jumlahTitik = Math.max(1, diDalam);
    for (let i = 0; i < jumlahTitik; i++) {
      const offsetLat = (Math.sin(i * 1.7) * 0.00008);
      const offsetLng = (Math.cos(i * 1.7) * 0.00008);
      titikHeat.push([
        KOORDINAT_ZONA[0] + offsetLat,
        KOORDINAT_ZONA[1] + offsetLng,
        info.intensitas
      ]);
    }
    heatLayer.setLatLngs(titikHeat);
  }

  if (eventArah === 'MASUK' || eventArah === 'KELUAR') {
    tambahRiwayat(eventArah, diDalam, masuk, keluar, info);
  }
}

function simulasiGerak(arah) {
  let { diDalam, masuk, keluar } = dataTerkini;
  if (arah === 'MASUK') {
    diDalam++;
    masuk++;
  } else if (arah === 'KELUAR') {
    if (diDalam > 0) diDalam--;
    keluar++;
  }
  perbaruiTampilanDashboard(diDalam, masuk, keluar, arah);
}

function tambahRiwayat(aktivitas, okupansi, masuk, keluar, info) {
  const waktu = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  riwayatLog.unshift({
    waktu,
    aktivitas,
    okupansi,
    total: `${masuk} / ${keluar}`,
    status: info.teks,
    warna: info.warna,
    bg: info.bg
  });

  if (riwayatLog.length > 50) riwayatLog.pop();
  localStorage.setItem('eden_history', JSON.stringify(riwayatLog));
  renderTabelHistory();
}

function renderTabelHistory() {
  const tbody = document.getElementById('tabelBodyHistory');
  if (!tbody) return;

  if (riwayatLog.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; opacity:0.7;">Belum ada riwayat pergerakan tercatat.</td></tr>';
    return;
  }

  tbody.innerHTML = riwayatLog.map(item => `
    <tr>
      <td>${item.waktu}</td>
      <td><strong>${item.aktivitas === 'MASUK' ? '🟢 Masuk' : '🟠 Keluar'}</strong></td>
      <td>${item.okupansi} orang</td>
      <td>${item.total}</td>
      <td><span class="pill-status" style="background:${item.bg}; color:${item.warna};">${item.status}</span></td>
    </tr>
  `).join('');
}

function hapusRiwayatData() {
  riwayatLog = [];
  localStorage.removeItem('eden_history');
  renderTabelHistory();
}

// ==========================================
// 5. KONEKSI MQTT REAL-TIME KE ESP32
// ==========================================
function initMQTT() {
  const badge = document.getElementById('statusMqtt');
  if (typeof mqtt === 'undefined') {
    if (badge) badge.textContent = 'Library MQTT gagal dimuat';
    return;
  }

  const brokerUrl = 'wss://broker.hivemq.com:8884/mqtt';
  const topic = 'eden/magelang/untidar/lorong1';
  const clientId = 'EDEN-WEB-' + Math.random().toString(16).substring(2, 8);

  const client = mqtt.connect(brokerUrl, {
    clientId,
    clean: true,
    reconnectPeriod: 3000
  });

  client.on('connect', () => {
    if (badge) {
      badge.textContent = 'Broker Terhubung (Menunggu ESP32...)';
      badge.className = 'badge-koneksi waiting';
    }
    client.subscribe(topic);
  });

  client.on('message', (tpc, message) => {
    try {
      const data = JSON.parse(message.toString());
      if (badge) {
        badge.textContent = '🟢 ESP32 Terhubung (Live)';
        badge.className = 'badge-koneksi online';
      }
      perbaruiTampilanDashboard(
        Number(data.diDalam || 0),
        Number(data.masuk || 0),
        Number(data.keluar || 0),
        data.event || null
      );
    } catch (err) {
      console.error('Format JSON MQTT tidak valid:', err);
    }
  });

  client.on('offline', () => {
    if (badge) {
      badge.textContent = 'Koneksi Terputus...';
      badge.className = 'badge-koneksi offline';
    }
  });
}

// ==========================================
// 6. INISIALISASI SAAT HALAMAN DIBUKA
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const savedFont = localStorage.getItem('eden_font');
  const savedIcon = localStorage.getItem('eden_icon');

  if (savedFont) {
    document.getElementById('sliderHuruf').value = savedFont;
    aturHuruf(savedFont);
  }
  if (savedIcon) {
    document.getElementById('sliderIkon').value = savedIcon;
    aturIkon(savedIcon);
  }

  terapkanTema();
  initPetaHeatmap();
  renderTabelHistory();
  initMQTT();
});