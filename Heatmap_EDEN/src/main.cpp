#include <Arduino.h>

#define TRIG_PIN 27
#define ECHO_PIN 14
#define LED_HIJAU 32
#define LED_KUNING 33
#define LED_MERAH 25

int jumlahOrang = 0;
bool sedangLewat = false;
int batasJarak = 100; // Jangkauan deteksi 100 cm (1 meter)

void updateLED();

void setup() {
  // Samakan baud rate ini dengan yang ada di Serial Monitor VS Code nanti
  Serial.begin(115200); 
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  pinMode(LED_HIJAU, OUTPUT);
  pinMode(LED_KUNING, OUTPUT);
  pinMode(LED_MERAH, OUTPUT);

  Serial.println("\n--- Sistem EDEN Aktif! ---");
  Serial.println("Silakan ayunkan tangan di depan sensor...");
  updateLED();
}

void loop() {
  // Tembakkan gelombang ultrasonik
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Hitung waktu pantulan dan konversi ke CM
  long durasi = pulseIn(ECHO_PIN, HIGH);
  int jarak = durasi * 0.034 / 2;

  // Logika State Change & Debouncing
  if (jarak > 0 && jarak < batasJarak && !sedangLewat) {
    // Fase 1: Ada tangan/orang masuk ke area sensor
    sedangLewat = true;
  } 
  else if (jarak >= batasJarak && sedangLewat) {
    // Fase 2: Tangan/orang sudah menjauh dari sensor
    jumlahOrang++;
    sedangLewat = false;
    
    Serial.print("Pejalan kaki terdeteksi! Total: ");
    Serial.println(jumlahOrang);
    
    updateLED();
    delay(1000); // Cooldown 1 detik biar nggak dobel hitung
  }
  delay(50); // Jeda kecil untuk menstabilkan pembacaan sensor
}

void updateLED() {
  // Matikan semua lampu dulu
  digitalWrite(LED_HIJAU, LOW);
  digitalWrite(LED_KUNING, LOW);
  digitalWrite(LED_MERAH, LOW);

  // Nyalakan sesuai kepadatan
  if (jumlahOrang < 5) {
    digitalWrite(LED_HIJAU, HIGH); 
  } else if (jumlahOrang >= 5 && jumlahOrang < 10) {
    digitalWrite(LED_KUNING, HIGH); 
  } else {
    digitalWrite(LED_MERAH, HIGH); 
  }
}