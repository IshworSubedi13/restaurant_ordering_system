const translations = {
    en: {
        logo: "Espoo Restaurant",
        home: "Home",
        menu: "Menu",
        contact: "Contact",
        welcome: "Welcome to Espoo Restaurant",
        today_menu: "Today's Menu",
        find_us: "Find Us",
        why_choose: "Why Choose Our Restaurant",
        unique_menu_title: "Unique & Authentic Menu",
        unique_menu_text: "Discover unique dishes prepared with passion. Our chefs use only the finest ingredients to create authentic flavors that will transport you to the heart of Finnish cuisine.",
        memorable_title: "Memorable Experiences",
        memorable_text: "We offer memorable dining experiences for everyone. From intimate dinners to family celebrations, our restaurant provides the perfect setting for any occasion.",
        atmosphere_title: "Inviting Atmosphere",
        atmosphere_text: "Enjoy a warm and welcoming environment. Our restaurant combines modern design with cozy elements to create a space where you can relax and enjoy your meal.",
        footer: "Copyright © 2025. All rights reserved."
    },
    fi: {
        logo: "Espoo Ravintola",
        home: "Koti",
        menu: "Menu",
        contact: "Yhteystiedot",
        welcome: "Tervetuloa Espoo Ravintolaan",
        today_menu: "Päivän Menu",
        find_us: "Löydä Meidät",
        why_choose: "Miksi Valita Ravintolamme",
        unique_menu_title: "Uniikki & Aito Menu",
        unique_menu_text: "Tutustu ainutlaatuisiin annoksiin, jotka on valmistettu intohimolla. Kokkimme käyttävät vain parhaita raaka-aineita luodakseen aitoja makuja, jotka vievät sinut suomalaisen keittiön sydämeen.",
        memorable_title: "Unohtumattomat Kokemukset",
        memorable_text: "Tarjoamme unohtumattomia ruokaelämyksiä kaikille. Yksityisistä illallisista perhejuhliin, ravintolamme tarjoaa täydellisen ympäristön kaikkiin tilaisuuksiin.",
        atmosphere_title: "Kutsuva Tunnelma",
        atmosphere_text: "Nauti lämpimästä ja viihtyisästä ilmapiiristä. Ravintolamme yhdistää modernin muotoilun kodikkaisiin elementteihin luodakseen tilan, jossa voit rentoutua ja nauttia ateriastasi.",
        footer: "Tekijänoikeus © 2025. Kaikki oikeudet pidätetään."
    }
};

// Apply translations to elements
function applyTranslations(lang) {
    document.querySelectorAll("[data-key]").forEach(el => {
        const key = el.dataset.key;
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

function setLanguage(lang) {
    localStorage.setItem("lang", lang);
    applyTranslations(lang);
    document.querySelectorAll('.lang-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLanguage(savedLang);
    document.querySelectorAll("[data-lang]").forEach(btn => {
        btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
    });

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
});
