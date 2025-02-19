function loadPage(page) {
    const content = document.getElementById("content");
    content.style.opacity = 0; // Start fade-out effect

    fetch(`pages/${page}`)
        .then(response => response.text())
        .then(data => {
            setTimeout(() => {
                content.innerHTML = data;
                content.style.opacity = 1; // Fade-in effect
            }, 300); // Wait for fade-out before replacing content
        })
        .catch(error => console.error("Error loading page:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    loadPage("home.html");
    applyDarkMode();
});


// Dark Mode Toggle
const darkModeToggle = document.getElementById("darkModeToggle");

darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
    darkModeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

function applyDarkMode() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark-mode");
        darkModeToggle.textContent = "☀️ Light Mode";
    }
}
