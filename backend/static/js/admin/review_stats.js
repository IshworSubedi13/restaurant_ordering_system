async function loadReviewStats() {
    const ratingDiv = document.getElementById("average-rating");
    const reviewsCard = document.querySelector('.card:nth-child(4)');
    const changeDiv = reviewsCard ? reviewsCard.querySelector('.card-change') : null;

    if (!ratingDiv) {
        console.error("Element with id 'average-rating' not found");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No token found in localStorage");
        ratingDiv.innerText = "Login required";
        if (changeDiv) changeDiv.innerText = "Login to see stats";
        return;
    }

    try {
        const response = await fetch("/api/v1/reviews/review_stats", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("Review stats API response:", data);

        if (response.ok && data.average_rating !== undefined) {
            // Update rating
            ratingDiv.innerText = `${data.average_rating}/5`;

            // Update change text with number of users who reviewed
            if (changeDiv) {
                changeDiv.innerText = `${data.total_users} users reviewed`;
                changeDiv.classList.remove("negative", "positive");
                changeDiv.classList.add("neutral");
            }
        } else if (data.error) {
            ratingDiv.innerText = "Error loading";
            if (changeDiv) {
                changeDiv.innerText = data.error;
                changeDiv.classList.remove("negative", "positive");
            }
            console.error("API Error:", data.error);
        } else {
            ratingDiv.innerText = "No data";
            if (changeDiv) {
                changeDiv.innerText = "No reviews yet";
                changeDiv.classList.remove("negative", "positive");
                changeDiv.classList.add("neutral");
            }
        }
    } catch (err) {
        console.error("Network error:", err);
        ratingDiv.innerText = "Network error";
        if (changeDiv) {
            changeDiv.innerText = "Try again";
            changeDiv.classList.remove("negative", "positive");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadReviewStats();
});