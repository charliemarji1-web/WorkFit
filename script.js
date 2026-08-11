// ==============================
// SCROLL TO PLANNER
// ==============================

const scrollButton = document.getElementById("scrollButton");

if (scrollButton) {
    scrollButton.addEventListener("click", () => {

        const planner = document.getElementById("planner");

        if (planner) {
            planner.scrollIntoView({
                behavior: "smooth"
            });
        }

    });
}


// ==============================
// FORMAT AI RESPONSE
// ==============================

function formatAIResponse(text) {

    if (!text) {
        return "";
    }

    // Escape HTML
    let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Headings
    formatted = formatted.replace(
        /^### (.*)$/gm,
        "<h3>$1</h3>"
    );

    formatted = formatted.replace(
        /^## (.*)$/gm,
        "<h2>$1</h2>"
    );

    formatted = formatted.replace(
        /^# (.*)$/gm,
        "<h1>$1</h1>"
    );

    // Bold
    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    // Italic
    formatted = formatted.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );

    // Horizontal lines
    formatted = formatted.replace(
        /^---$/gm,
        "<hr>"
    );

    // Bullet points
    formatted = formatted.replace(
        /^\s*[-•] (.*)$/gm,
        "<li>$1</li>"
    );

    // Numbered lists
    formatted = formatted.replace(
        /^\s*\d+\.\s+(.*)$/gm,
        "<li>$1</li>"
    );

    // Wrap consecutive list items
    formatted = formatted.replace(
        /((?:<li>.*?<\/li>\s*)+)/g,
        "<ul>$1</ul>"
    );

    // Paragraph breaks
    formatted = formatted.replace(
        /\n\n+/g,
        "</p><p>"
    );

    // Remaining line breaks
    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );

    // Wrap text
    formatted = "<p>" + formatted + "</p>";

    // Remove empty paragraphs
    formatted = formatted.replace(
        /<p>\s*<\/p>/g,
        ""
    );

    // Prevent bad wrapping
    formatted = formatted
        .replace(/<p>(<h[1-3]>)/g, "$1")
        .replace(/(<\/h[1-3]>)<\/p>/g, "$1")
        .replace(/<p>(<ul>)/g, "$1")
        .replace(/(<\/ul>)<\/p>/g, "$1")
        .replace(/<p>(<hr>)<\/p>/g, "$1");

    return formatted;
}


// ==============================
// FORM SUBMISSION
// ==============================

const form = document.getElementById("planForm");
const output = document.getElementById("output");

if (form) {

    const submitBtn =
        form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        // Loading message
        output.innerHTML =
            "<p>Generating your personalized WorkFit plan... 💪</p>";

        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = "Generating...";

        // Get user information
        const userData = {

            age:
                document.getElementById("age").value,

            height:
                document.getElementById("height").value,

            weight:
                document.getElementById("weight").value,

            sex:
                document.getElementById("sex").value,

            goal:
                document.getElementById("goal").value,

            schedule:
                document.getElementById("schedule").value
        };


        try {

            // YOUR EXISTING API
            const response = await fetch(
                "https://workfit-0qd7.onrender.com/generate-plan",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(userData)
                }
            );


            const data = await response.json();


            if (response.ok) {

                output.innerHTML =
                    formatAIResponse(data.plan);

            } else {

                output.innerHTML =
                    `<p>${data.error || "Something went wrong."}</p>`;

            }


        } catch (error) {

            console.error("Error:", error);

            output.innerHTML =
                "<p>Unable to connect to WorkFit AI. Please try again.</p>";

        }


        finally {

            submitBtn.disabled = false;

            submitBtn.textContent =
                "Generate My Plan";

        }

    });

}


// ==============================
// DARK MODE
// ==============================

const darkModeBtn =
    document.getElementById("darkModeBtn");

if (darkModeBtn) {

    // Load saved theme
    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark");

        darkModeBtn.innerHTML = "☀️";

    }


    darkModeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");


        if (document.body.classList.contains("dark")) {

            darkModeBtn.innerHTML = "☀️";

            localStorage.setItem(
                "theme",
                "dark"
            );

        } else {

            darkModeBtn.innerHTML = "🌙";

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    });

}
