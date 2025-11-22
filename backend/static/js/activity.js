async function loadActivity() {
    const token = localStorage.getItem("token");
    const list = document.querySelector(".activity-list");

    if (!list) return;

    try {
        const res = await fetch("/api/v1/activities/recent", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();
        console.log("Activity API response:", data);

        if (!data.activities || !data.activities.length) {
            list.innerHTML = "<li>No recent activity</li>";
            return;
        }

        list.innerHTML = data.activities.map(a => `
            <li class="activity-item">
                <div class="activity-icon">
                    <span class="material-icons">${a.icon}</span>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${a.description}</div>
                    <div class="activity-time">${new Date(a.created_at).toUTCString()}</div>
                </div>
            </li>
        `).join("");

    } catch (error) {
        console.error("Activity load error:", error);
        list.innerHTML = "<li>Error loading activity</li>";
    }
}
