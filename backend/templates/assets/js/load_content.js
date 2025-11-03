document.querySelectorAll("aside.sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll("aside.sidebar a").forEach(a => a.classList.remove("active"));
        link.classList.add("active");

        const section = link.dataset.section;
        document.getElementById("section-title").innerText = section.charAt(0).toUpperCase() + section.slice(1);
        loadContent(section);
    });
});

async function loadContent(section){
    const html = await fetch(`pages/${section}.html`).then(r => r.text());
    document.getElementById("content").innerHTML = html;
}

