const metinKutusu = document.getElementById("metin");
const kelimeEl = document.getElementById("kelimeSayisi");
const karakterEl = document.getElementById("karakterSayisi");
const paragrafEl = document.getElementById("paragrafSayisi");
const sureEl = document.getElementById("sure");
const hizEl = document.getElementById("hiz");
const mesajEl = document.getElementById("mesaj");

function mesajGoster(yazi) {
  mesajEl.textContent = yazi;
  setTimeout(function () {
    mesajEl.textContent = "";
  }, 2500);
}

function sureYaz(saniye) {
  if (saniye < 60) {
    return saniye + " sn";
  }
  const dakika = Math.floor(saniye / 60);
  const kalan = saniye % 60;
  return dakika + " dk " + kalan + " sn";
}

function hesapla() {
  const metin = metinKutusu.value;
  const kelimeler = metin.trim() === "" ? [] : metin.trim().split(/\s+/);
  const paragraflar = metin
    .split(/\n+/)
    .filter(function (p) {
      return p.trim() !== "";
    });

  const dakikadaKelime = Number(hizEl.value);
  const saniye = Math.round((kelimeler.length / dakikadaKelime) * 60);

  kelimeEl.textContent = kelimeler.length;
  karakterEl.textContent = metin.length;
  paragrafEl.textContent = paragraflar.length;
  sureEl.textContent = sureYaz(saniye);
}

function metniTemizle() {
  let metin = metinKutusu.value;
  metin = metin
    .split("\n")
    .map(function (satir) {
      return satir.replace(/[ \t]+/g, " ").trim();
    })
    .join("\n");
  metin = metin.replace(/\n{3,}/g, "\n\n").trim();
  metinKutusu.value = metin;
  hesapla();
  mesajGoster("Metin temizlendi.");
}

function paragraflariDuzenle() {
  const paragraflar = metinKutusu.value
    .split(/\n+/)
    .map(function (p) {
      return p.replace(/\s+/g, " ").trim();
    })
    .filter(function (p) {
      return p !== "";
    });
  metinKutusu.value = paragraflar.join("\n\n");
  hesapla();
  mesajGoster("Paragraflar düzenlendi.");
}

function kopyala() {
  const metin = metinKutusu.value;
  if (metin.trim() === "") {
    mesajGoster("Kopyalanacak metin yok.");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(metin).then(
      function () {
        mesajGoster("Metin kopyalandı.");
      },
      function () {
        eskiKopyala();
      }
    );
  } else {
    eskiKopyala();
  }
}

function eskiKopyala() {
  metinKutusu.select();
  document.execCommand("copy");
  mesajGoster("Metin kopyalandı.");
}

function txtIndir() {
  const metin = metinKutusu.value;
  if (metin.trim() === "") {
    mesajGoster("İndirilecek metin yok.");
    return;
  }
  const dosya = new Blob([metin], { type: "text/plain;charset=utf-8" });
  const adres = URL.createObjectURL(dosya);
  const baglanti = document.createElement("a");
  baglanti.href = adres;
  baglanti.download = "sesmetni.txt";
  document.body.appendChild(baglanti);
  baglanti.click();
  document.body.removeChild(baglanti);
  URL.revokeObjectURL(adres);
  mesajGoster("Dosya indirildi.");
}

metinKutusu.addEventListener("input", hesapla);
hizEl.addEventListener("change", hesapla);
document.getElementById("temizleBtn").addEventListener("click", metniTemizle);
document.getElementById("duzenleBtn").addEventListener("click", paragraflariDuzenle);
document.getElementById("kopyalaBtn").addEventListener("click", kopyala);
document.getElementById("indirBtn").addEventListener("click", txtIndir);

hesapla();
