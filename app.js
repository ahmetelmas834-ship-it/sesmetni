(function () {
  "use strict";

  const KAYIT_ANAHTARI = "sesmetni_metin_v1";
  const HIZ_ANAHTARI = "sesmetni_hiz_v1";

  function $(id) {
    return document.getElementById(id);
  }

  const metinKutusu = $("metin");
  const kelimeEl = $("kelimeSayisi");
  const karakterEl = $("karakterSayisi");
  const paragrafEl = $("paragrafSayisi");
  const sureEl = $("sure");
  const hizEl = $("hiz");
  const kayitDurumEl = $("kayitDurum");
  const bildirimEl = $("bildirim");
  const altyaziAlani = $("altyaziAlani");
  const srtIndirBtn = $("srtIndirBtn");
  const bolumBoyutEl = $("bolumBoyut");
  const kediBtn = $("kediBtn");
  const kediMesajEl = $("kediMesaj");

  /* ---------- Küçük yardımcılar ---------- */

  let bildirimZamani;
  function mesajGoster(yazi) {
    bildirimEl.textContent = yazi;
    bildirimEl.classList.add("goster");
    clearTimeout(bildirimZamani);
    bildirimZamani = setTimeout(function () {
      bildirimEl.classList.remove("goster");
    }, 2800);
  }

  function depoOku(anahtar) {
    try {
      return localStorage.getItem(anahtar);
    } catch (e) {
      return null;
    }
  }

  function depoYaz(anahtar, deger) {
    try {
      localStorage.setItem(anahtar, deger);
      return true;
    } catch (e) {
      return false;
    }
  }

  function depoSil(anahtar) {
    try {
      localStorage.removeItem(anahtar);
    } catch (e) {
      /* önemli değil */
    }
  }

  function metinVarMi() {
    if (metinKutusu.value.trim() === "") {
      mesajGoster("Önce bir metin yaz.");
      return false;
    }
    return true;
  }

  function paragraflariAl(metin) {
    return metin.split(/\n+/).filter(function (p) {
      return p.trim() !== "";
    });
  }

  function sureYaz(saniye) {
    if (saniye < 60) {
      return saniye + " sn";
    }
    const dakika = Math.floor(saniye / 60);
    const kalan = saniye % 60;
    return dakika + " dk " + kalan + " sn";
  }

  /* ---------- Sayaç ve süre ---------- */

  function hesapla() {
    const metin = metinKutusu.value;
    const kelimeler = metin.trim() === "" ? [] : metin.trim().split(/\s+/);
    const dakikadaKelime = Number(hizEl.value);
    const saniye = Math.round((kelimeler.length / dakikadaKelime) * 60);

    kelimeEl.textContent = kelimeler.length;
    karakterEl.textContent = metin.length;
    paragrafEl.textContent = paragraflariAl(metin).length;
    sureEl.textContent = sureYaz(saniye);
  }

  /* ---------- Otomatik kayıt ---------- */

  let kayitZamani;
  function otomatikKaydet() {
    kayitDurumEl.textContent = "Kaydediliyor...";
    clearTimeout(kayitZamani);
    kayitZamani = setTimeout(function () {
      if (metinKutusu.value === "") {
        depoSil(KAYIT_ANAHTARI);
        kayitDurumEl.textContent = "Kayıtlı metin yok.";
        return;
      }
      const basarili = depoYaz(KAYIT_ANAHTARI, metinKutusu.value);
      kayitDurumEl.textContent = basarili
        ? "Otomatik kaydedildi ✓"
        : "Kaydedilemedi (tarayıcı izin vermiyor).";
    }, 500);
  }

  function kayitliMetniSil() {
    if (metinKutusu.value.trim() === "" && !depoOku(KAYIT_ANAHTARI)) {
      mesajGoster("Silinecek kayıtlı metin yok.");
      return;
    }
    if (!confirm("Kayıtlı metin silinsin mi? Bu işlem geri alınamaz.")) {
      return;
    }
    metinKutusu.value = "";
    depoSil(KAYIT_ANAHTARI);
    hesapla();
    kayitDurumEl.textContent = "Kayıtlı metin silindi.";
    mesajGoster("Kayıtlı metin silindi.");
  }

  /* ---------- Metin araçları ---------- */

  function metniDegistir(yeni, basariMesaji) {
    if (yeni === metinKutusu.value) {
      mesajGoster("Değiştirilecek bir şey bulunamadı.");
      return;
    }
    metinKutusu.value = yeni;
    hesapla();
    otomatikKaydet();
    mesajGoster(basariMesaji);
  }

  function metniTemizle() {
    if (!metinVarMi()) return;
    let metin = metinKutusu.value;
    metin = metin
      .split("\n")
      .map(function (satir) {
        return satir.replace(/[ \t]+/g, " ").trim();
      })
      .join("\n");
    metin = metin.replace(/\n{3,}/g, "\n\n").trim();
    metniDegistir(metin, "Metin temizlendi.");
  }

  function paragraflariDuzenle() {
    if (!metinVarMi()) return;
    const paragraflar = paragraflariAl(metinKutusu.value).map(function (p) {
      return p.replace(/\s+/g, " ").trim();
    });
    metniDegistir(paragraflar.join("\n\n"), "Paragraflar düzenlendi.");
  }

  function buyukHarf() {
    if (!metinVarMi()) return;
    metniDegistir(metinKutusu.value.toLocaleUpperCase("tr-TR"), "Tüm harfler büyütüldü.");
  }

  function kucukHarf() {
    if (!metinVarMi()) return;
    metniDegistir(metinKutusu.value.toLocaleLowerCase("tr-TR"), "Tüm harfler küçültüldü.");
  }

  function cumleBasiBuyut() {
    if (!metinVarMi()) return;
    const yeni = metinKutusu.value.replace(
      /(^|[.!?…]\s+|\n\s*)(\p{L})/gu,
      function (eslesme, once, harf) {
        return once + harf.toLocaleUpperCase("tr-TR");
      }
    );
    metniDegistir(yeni, "Cümle başları büyütüldü.");
  }

  function kelimeBasiBuyut() {
    if (!metinVarMi()) return;
    const yeni = metinKutusu.value.replace(
      /\p{L}+(?:['’]\p{L}+)*/gu,
      function (kelime) {
        return (
          kelime.charAt(0).toLocaleUpperCase("tr-TR") +
          kelime.slice(1).toLocaleLowerCase("tr-TR")
        );
      }
    );
    metniDegistir(yeni, "Her kelimenin ilk harfi büyütüldü.");
  }

  function noktalamaDuzelt() {
    if (!metinVarMi()) return;
    let m = metinKutusu.value;
    m = m.replace(/[ \t]+([,.;:!?…])/g, "$1");
    m = m.replace(/([,;:!?])(?=\p{L})/gu, "$1 ");
    m = m.replace(/,{2,}/g, ",");
    m = m.replace(/\.{4,}/g, "...");
    m = m.replace(/[ \t]{2,}/g, " ");
    metniDegistir(m, "Noktalama düzeltildi.");
  }

  function bolumlereAyir() {
    if (!metinVarMi()) return;
    const boyut = Number(bolumBoyutEl.value);
    const paragraflar = paragraflariAl(metinKutusu.value).filter(function (p) {
      return !/^Bölüm \d+$/.test(p.trim());
    });
    const bolumler = [];
    for (let i = 0; i < paragraflar.length; i += boyut) {
      const no = bolumler.length + 1;
      const grup = paragraflar.slice(i, i + boyut);
      bolumler.push("Bölüm " + no + "\n\n" + grup.join("\n\n"));
    }
    metniDegistir(bolumler.join("\n\n"), bolumler.length + " bölüme ayrıldı.");
  }

  /* ---------- Kopyala ve indir ---------- */

  function eskiKopyala() {
    metinKutusu.select();
    document.execCommand("copy");
    mesajGoster("Metin kopyalandı 🐱");
  }

  function kopyala() {
    if (!metinVarMi()) return;
    const metin = metinKutusu.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(metin).then(
        function () {
          mesajGoster("Metin kopyalandı 🐱");
        },
        function () {
          eskiKopyala();
        }
      );
    } else {
      eskiKopyala();
    }
  }

  function dosyaIndir(icerik, dosyaAdi, tip) {
    const dosya = new Blob([icerik], { type: tip });
    const adres = URL.createObjectURL(dosya);
    const baglanti = document.createElement("a");
    baglanti.href = adres;
    baglanti.download = dosyaAdi;
    document.body.appendChild(baglanti);
    baglanti.click();
    document.body.removeChild(baglanti);
    setTimeout(function () {
      URL.revokeObjectURL(adres);
    }, 1000);
  }

  function txtIndir() {
    if (!metinVarMi()) return;
    dosyaIndir(metinKutusu.value, "sesmetni.txt", "text/plain;charset=utf-8");
    mesajGoster("TXT dosyası indirildi.");
  }

  /* ---------- SRT altyazı ---------- */

  function cumlelereBol(metin) {
    const temiz = metin.replace(/\s+/g, " ").trim();
    if (temiz === "") return [];
    const eslesmeler = temiz.match(/[^.!?…]+[.!?…]*\s*/g) || [temiz];
    return eslesmeler
      .map(function (s) {
        return s.trim();
      })
      .filter(function (s) {
        return s !== "";
      });
  }

  function uzunuBol(cumle, azami) {
    if (cumle.length <= azami) return [cumle];
    const kelimeler = cumle.split(" ");
    const parcalar = [];
    let su = "";
    kelimeler.forEach(function (k) {
      const aday = (su + " " + k).trim();
      if (aday.length > azami && su !== "") {
        parcalar.push(su);
        su = k;
      } else {
        su = aday;
      }
    });
    if (su !== "") parcalar.push(su);
    return parcalar;
  }

  function satirlaraBol(yazi, azami) {
    if (yazi.length <= azami) return yazi;
    const orta = Math.floor(yazi.length / 2);
    let enIyi = -1;
    let enKucukFark = 100000;
    for (let i = 0; i < yazi.length; i++) {
      if (yazi.charAt(i) === " ") {
        const fark = Math.abs(i - orta);
        if (fark < enKucukFark) {
          enKucukFark = fark;
          enIyi = i;
        }
      }
    }
    if (enIyi === -1) return yazi;
    return yazi.slice(0, enIyi) + "\n" + yazi.slice(enIyi + 1);
  }

  function iki(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function uc(n) {
    if (n < 10) return "00" + n;
    if (n < 100) return "0" + n;
    return String(n);
  }

  function srtZaman(saniye) {
    const toplam = Math.round(saniye * 1000);
    const sa = Math.floor(toplam / 3600000);
    const dk = Math.floor((toplam % 3600000) / 60000);
    const sn = Math.floor((toplam % 60000) / 1000);
    const ms = toplam % 1000;
    return iki(sa) + ":" + iki(dk) + ":" + iki(sn) + "," + uc(ms);
  }

  function yuvarla(sayi) {
    return Math.round(sayi * 10) / 10;
  }

  function zamanAlani(etiket, sinif, deger) {
    const kap = document.createElement("label");
    kap.className = "zaman";
    kap.appendChild(document.createTextNode(etiket + " "));
    const giris = document.createElement("input");
    giris.type = "number";
    giris.step = "0.1";
    giris.min = "0";
    giris.className = sinif;
    giris.value = deger;
    giris.setAttribute("inputmode", "decimal");
    kap.appendChild(giris);
    return kap;
  }

  function satirEkle(no, bas, bit, yazi) {
    const satir = document.createElement("div");
    satir.className = "altyazi-satir";

    const ust = document.createElement("div");
    ust.className = "altyazi-ust";

    const noEl = document.createElement("span");
    noEl.className = "altyazi-no";
    noEl.textContent = "#" + no;

    ust.appendChild(noEl);
    ust.appendChild(zamanAlani("Başlangıç (sn)", "bas", bas));
    ust.appendChild(zamanAlani("Bitiş (sn)", "bit", bit));

    const kutu = document.createElement("textarea");
    kutu.rows = 2;
    kutu.value = yazi;

    satir.appendChild(ust);
    satir.appendChild(kutu);
    altyaziAlani.appendChild(satir);
  }

  function altyaziOlustur() {
    if (!metinVarMi()) return;
    const parcalar = [];
    cumlelereBol(metinKutusu.value).forEach(function (cumle) {
      uzunuBol(cumle, 80).forEach(function (p) {
        parcalar.push(p);
      });
    });

    const dakikadaKelime = Number(hizEl.value);
    let simdi = 0;
    altyaziAlani.innerHTML = "";

    parcalar.forEach(function (yazi, i) {
      const kelimeSayisi = yazi.split(" ").length;
      let sure = (kelimeSayisi / dakikadaKelime) * 60;
      if (sure < 1.5) sure = 1.5;
      const bas = yuvarla(simdi);
      const bit = yuvarla(simdi + sure);
      satirEkle(i + 1, bas, bit, yazi);
      simdi = bit;
    });

    srtIndirBtn.disabled = parcalar.length === 0;
    mesajGoster(parcalar.length + " altyazı parçası hazırlandı.");
  }

  function srtIndir() {
    const satirlar = altyaziAlani.querySelectorAll(".altyazi-satir");
    if (satirlar.length === 0) {
      mesajGoster("Önce altyazıları oluştur.");
      return;
    }
    let cikti = "";
    let sira = 1;
    for (let i = 0; i < satirlar.length; i++) {
      const bas = parseFloat(satirlar[i].querySelector(".bas").value);
      const bit = parseFloat(satirlar[i].querySelector(".bit").value);
      const yazi = satirlar[i]
        .querySelector("textarea")
        .value.replace(/\s+/g, " ")
        .trim();
      if (yazi === "") continue;
      if (isNaN(bas) || isNaN(bit) || bas < 0 || bit <= bas) {
        mesajGoster("#" + (i + 1) + " numaralı parçanın süreleri hatalı. Bitiş, başlangıçtan büyük olmalı.");
        return;
      }
      cikti +=
        sira + "\n" + srtZaman(bas) + " --> " + srtZaman(bit) + "\n" + satirlaraBol(yazi, 42) + "\n\n";
      sira++;
    }
    if (cikti === "") {
      mesajGoster("İndirilecek altyazı yok.");
      return;
    }
    dosyaIndir(cikti, "altyazi.srt", "application/x-subrip;charset=utf-8");
    mesajGoster("SRT dosyası indirildi.");
  }

  /* ---------- Kedi sürprizi ---------- */

  const kediSozleri = [
    "Miyav! Harika gidiyorsun 🐾",
    "Bu metin çok güzel görünüyor, mırr mırr 💜",
    "Kayıttan önce bir su iç, kedi tavsiyesi 🐱💧",
    "Patilerim klavyede ama yazan sensin 😸",
    "Miyaaav! (Çeviri: Videon harika olacak.)",
    "Seslendirmeden önce sesini ısıt 🎤🐾",
    "Bugün de güzel içerik üretiyorsun, aferin sana 😻"
  ];
  let sonKedi = -1;

  function kediSev() {
    let yeni;
    do {
      yeni = Math.floor(Math.random() * kediSozleri.length);
    } while (yeni === sonKedi);
    sonKedi = yeni;
    kediMesajEl.textContent = kediSozleri[yeni];
    kediBtn.classList.remove("zipla");
    void kediBtn.offsetWidth;
    kediBtn.classList.add("zipla");
  }

  /* ---------- Olayları bağla ---------- */

  function bagla(id, islev) {
    $(id).addEventListener("click", islev);
  }

  metinKutusu.addEventListener("input", function () {
    hesapla();
    otomatikKaydet();
  });

  hizEl.addEventListener("change", function () {
    hesapla();
    depoYaz(HIZ_ANAHTARI, hizEl.value);
  });

  bagla("temizleBtn", metniTemizle);
  bagla("duzenleBtn", paragraflariDuzenle);
  bagla("kopyalaBtn", kopyala);
  bagla("indirBtn", txtIndir);
  bagla("kayitSilBtn", kayitliMetniSil);
  bagla("buyukBtn", buyukHarf);
  bagla("kucukBtn", kucukHarf);
  bagla("cumleBtn", cumleBasiBuyut);
  bagla("kelimeBuyukBtn", kelimeBasiBuyut);
  bagla("noktalamaBtn", noktalamaDuzelt);
  bagla("bolumBtn", bolumlereAyir);
  bagla("srtOlusturBtn", altyaziOlustur);
  bagla("srtIndirBtn", srtIndir);
  bagla("kediBtn", kediSev);

  /* ---------- Açılışta kayıtlı verileri geri getir ---------- */

  const kayitliHiz = depoOku(HIZ_ANAHTARI);
  if (kayitliHiz) {
    hizEl.value = kayitliHiz;
    if (hizEl.value !== kayitliHiz) {
      hizEl.value = "140";
    }
  }

  const kayitliMetin = depoOku(KAYIT_ANAHTARI);
  if (kayitliMetin) {
    metinKutusu.value = kayitliMetin;
    kayitDurumEl.textContent = "Önceki metnin geri yüklendi ✓";
    setTimeout(function () {
      mesajGoster("Metnin geri geldi 🐱");
    }, 400);
  }

  hesapla();
})();
