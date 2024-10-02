//-------------------------1. osa Ostukorv ------------------------suurendaArtikkel

"use strict";
//toote pealt vajaliku info kogumine ja lisamine ostukorvi
let korv = [];
const korviSisu = document.querySelector(".korv");
const lisaKorviNupud = document.querySelectorAll('[data-action="lisa_korvi"]');

lisaKorviNupud.forEach(lisaKorviNupp => {
    lisaKorviNupp.addEventListener('click', () => {
        const toodeInfo = lisaKorviNupp.parentNode;
        const toode = {
            nimi: toodeInfo.querySelector(".toode_nimi").innerText,
            hind: parseFloat(toodeInfo.querySelector(".toode_hind").innerText.replace('€', '').trim()), // Arvutame hinna
            kogus: 1
        };
        const onKorvis = (korv.filter(korvArtikkel => (korvArtikkel.nimi === toode.nimi)).length > 0);
        if (!onKorvis) {
            lisaArtikkel(toode); // selle funktsiooni loome allpool
            korv.push(toode);
            nupuOhjamine(lisaKorviNupp, toode); // selle funktsiooni loome allpool
        }
        arvutaSumma(); // Arvutame summa toote lisamisel
    });
});

//funktsioon toote lisamiseks
function lisaArtikkel(toode) {
    korviSisu.insertAdjacentHTML('beforeend', `
    <div class="korv_artikkel">
      <h3 class="korv_artikkel_nimi">${toode.nimi}</h3>
      <h3 class="korv_artikkel_hind">${toode.hind}€</h3>    
      <div class="korv_artikkel_buttons">  
      <button class="btn-small" data-action="vahenda_artikkel">&minus;</button>
      <h3 class="korv_artikkel_kogus">${toode.kogus}</h3>
      <button class="btn btn-small" data-action="suurenda_artikkel">&plus;</button>
      <button class="btn btn-small" data-action="eemalda_artikkel">&times;</button>
      </div>
    </div>
  `);

    lisaKorviJalus(); // selle funktsiooni lisame allpool
}

//funktsioon nupu sündmusekuulutaja jaoks
function nupuOhjamine(lisaKorviNupp, toode) {
    lisaKorviNupp.innerText = 'Ostukorvis';
    lisaKorviNupp.disabled = true;

    const korvArtiklidD = korviSisu.querySelectorAll('.korv_artikkel');
    korvArtiklidD.forEach(korvArtikkelD => {
        if (korvArtikkelD.querySelector('.korv_artikkel_nimi').innerText === toode.nimi) {
            korvArtikkelD.querySelector('[data-action="suurenda_artikkel"]').addEventListener('click', () => suurendaArtikkel(toode, korvArtikkelD));
            korvArtikkelD.querySelector('[data-action="vahenda_artikkel"]').addEventListener('click', () => vahendaArtikkel(toode, korvArtikkelD, lisaKorviNupp));
            korvArtikkelD.querySelector('[data-action="eemalda_artikkel"]').addEventListener('click', () => eemaldaArtikkel(toode, korvArtikkelD, lisaKorviNupp));
        }
    });
}

//toodete arvu suurendamine
function suurendaArtikkel(toode, korvArtikkelD) {
    korv.forEach(korvArtikkel => {
        if (korvArtikkel.nimi === toode.nimi) {
            korvArtikkelD.querySelector('.korv_artikkel_kogus').innerText = ++korvArtikkel.kogus;
            arvutaSumma(); // Uuendame summa
        }
    });
}

// funktsioon toodete hulga vähendamiseks
function vahendaArtikkel(toode, korvArtikkelD, lisaKorviNupp) {
    korv.forEach(korvArtikkel => {
        if (korvArtikkel.nimi === toode.nimi) {
            if (korvArtikkel.kogus > 1) {
                korvArtikkel.kogus--;
                korvArtikkelD.querySelector('.korv_artikkel_kogus').innerText = korvArtikkel.kogus;
            } else {
                eemaldaArtikkel(toode, korvArtikkelD, lisaKorviNupp); // Kui kogus on 1, eemaldame toote
            }
            arvutaSumma(); // Uuendame summa
        }
    });
}

//toodete eemaldamine ostukorvist
function eemaldaArtikkel(toode, korvArtikkelD, lisaKorviNupp) {
    korvArtikkelD.remove();
    korv = korv.filter(korvArtikkel => korvArtikkel.nimi !== toode.nimi);
    lisaKorviNupp.innerText = 'Lisa ostukorvi';
    lisaKorviNupp.disabled = false;
    if (korv.length < 1) {
        document.querySelector('.korv-jalus').remove();
    }
    arvutaSumma(); // Uuendame summa
}

//ostukorvi jaluse ehk alumiste nuppude lisamine
function lisaKorviJalus() {
    if (document.querySelector('.korv-jalus') === null) {
        korviSisu.insertAdjacentHTML('afterend', `
      <div class="korv-jalus">
        <button class="btn" data-action="tyhjenda_korv">Tühjenda ostukorv</button>
        <button class="btn" data-action="kassa">Maksma</button>
        <h3 class="kokku_summa">Kokku tasuda: 0€</h3> <!-- Kogusumma kuvamine -->
      </div>
    `);
        document.querySelector('[data-action="tyhjenda_korv"]').addEventListener('click', () => tuhjendaKorv());
        document.querySelector('[data-action="kassa"]').addEventListener('click', () => kassa());
    }
}

// ostukorvi tühjendamine
function tuhjendaKorv() {
    korviSisu.querySelectorAll('.korv_artikkel').forEach(korvArtikkelD => {
        korvArtikkelD.remove();
    });

    document.querySelector('.korv-jalus').remove();

    lisaKorviNupud.forEach(lisaOstukorviNupp => {
        lisaKorviNupp.innerText = 'Lisa ostukorvi';
        lisaKorviNupp.disabled = false;
    });

    arvutaSumma(); // Uuendame summa
}

// Funktsioon, mis arvutab ostukorvi summa kokku koos tarnehinnaga
function arvutaSumma() {
    let summa = 0;
    korv.forEach(korvArtikkel => {
        summa += korvArtikkel.hind * korvArtikkel.kogus; // Arvutame ostukorvi summa
    });
    
    const tarnehind = arvutaTarnehind(); // Arvutame tarnehinna
    const kokkuSummaElem = document.querySelector('.kokku_summa');
    kokkuSummaElem.innerText = `Kokku tasuda: ${(summa + tarnehind).toFixed(2)}€`; // Kuvame ostukorvi summa koos tarnega
}

// Funktsioon, mis arvutab valitud tarneviisi hinna
function arvutaTarnehind() {
    let tarneHind = 0;
    
    const tarne1 = document.getElementById('tarne1').checked; // Pakiautomaati (3€)
    const tarne2 = document.getElementById('tarne2').checked; // Tulen ise järgi (0€)
    
    if (tarne1) {
        tarneHind = 3; // Pakiautomaadi hind
    } else if (tarne2) {
        tarneHind = 0; // Ise järele tulemine on tasuta
    }
    
    return tarneHind;
}

//-------------------------2. osa Taimer ------------------------

// Taimeri funktsioon
function alustaTaimer(kestvus, kuva) {
    let start = Date.now(),
        vahe,
        minutid,
        sekundid;

    function taimer() {
        let vahe = kestvus - Math.floor((Date.now() - start) / 1000);
        let minutid = Math.floor(vahe / 60);
        let sekundid = Math.floor(vahe % 60);

        if (minutid < 10) {
            minutid = "0" + minutid;
        }
        if (sekundid < 10) {
            sekundid = "0" + sekundid;
        }

        kuva.textContent = minutid + ":" + sekundid;

        if (vahe < 0) {
            clearInterval(taimerInterval); 
            kuva.innerHTML = "Alusta uuesti";
        }
    }

    taimer(); // Esimene kutsumine kohe
    let taimerInterval = setInterval(taimer, 1000); // Salvestame intervali, et saaksime hiljem lõpetada
}

// Kontrollime, kas tarneviis on valitud ja uuendame summat
document.querySelectorAll('input[name="tarne"]').forEach(tarne => {
    tarne.addEventListener('change', arvutaSumma); // Uuendame summat, kui tarneviis muutub
});

// Uuendame kassa funktsiooni
function kassa() {
    const taimerElem = document.getElementById("time");
    let taimeriAeg = 60 * 2; // 2 minutit
    alustaTaimer(taimeriAeg, taimerElem); // Käivitame taimeri
}

//-------------------------3. osa Tarne vorm ------------------------
document.getElementById('form').addEventListener('submit', function (event) {
    event.preventDefault(); // Peatab vormi esitamise, kuni kõik on korras

    let errorMessage = '';
    const eesnimi = document.getElementById('eesnimi').value.trim();
    const perenimi = document.getElementById('perenimi').value.trim();
    const epost = document.getElementById('epost').value.trim();
    const telefon = document.getElementById('telefon').value.trim();
    const aadress = document.getElementById('aadress').value.trim();
    const kinnitus = document.getElementById('kinnitus').checked;
    const tarneviis1 = document.getElementById('tarne1').checked;
    const tarneviis2 = document.getElementById('tarne2').checked;

    // Kontrollib, kas ees- ja perenimi ei sisalda numbreid
    if (eesnimi === '' || /\d/.test(eesnimi)) {
        errorMessage += 'Eesnimi ei tohi sisaldada numbreid ja peab olema täidetud.<br>';
    }
    if (perenimi === '' || /\d/.test(perenimi)) {
        errorMessage += 'Perenimi ei tohi sisaldada numbreid ja peab olema täidetud.<br>';
    }

    // Kontrollib, kas e-post on täidetud ja õigel kujul
    if (epost === '') {
        errorMessage += 'E-post on täitmata.<br>';
    } else if (!validateEmail(epost)) {
        errorMessage += 'E-posti formaat on vale.<br>';
    }

    // Kontrollib, kas telefoninumbris on vähemalt 6 sümbolit
    if (telefon === '' || telefon.length < 6 || !/^\d+$/.test(telefon)) {
        errorMessage += 'Telefoninumber peab sisaldama vähemalt 6 numbrit.<br>';
    }

    // Kontrollib, kas aadress on täidetud. MINU KOOD
    if (aadress === '') {
        errorMessage += 'Aadress on täitmata.<br>';
    }

    // Kontrollib, kas tingimustega nõustumise kast on märgitud
    if (!kinnitus) {
        errorMessage += 'Peate nõustuma tingimustega.<br>';
    }

    // Kontrollib, kas vähemalt üks tarneviis on valitud
    if (!tarneviis1 && !tarneviis2) {
        errorMessage += 'Palun valige tarneviis.<br>';
    }

    // Kuvab veateateid, kui need on olemas
    const errorDiv = document.getElementById('errorMessage');
    if (errorMessage) {
        errorDiv.innerHTML = errorMessage;
        errorDiv.style.color = 'red'; // Veateade punaseks
    } else {
        errorDiv.innerHTML = ''; // Kustutab veateate, kui kõik on korras
        alert('Ost kinnitatud!');
        this.submit(); // Kui kõik on korras, vorm esitatakse
    }
});

// Funktsioon e-posti valideerimiseks
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/* Ülesanne 5.3: täienda vormi sisendi kontrolli:
- eesnime ja perenime väljal ei tohi olla numbreid;
- telefoni väli ei tohi olla lühem kui 6 sümbolit ning peab sisaldama ainult numbreid;
- üks raadionuppudest tarneviisi korral peab olema valitud;
- lisa oma valikul üks lisaväli ning sellele kontroll: aadressi rida ja kontrollib täitmist. Märgi see nii HTML kui JavaScripti
  koodis "minu kood" kommentaariga. */
