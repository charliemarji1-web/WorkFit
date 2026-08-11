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
// MARKDOWN TO HTML
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


    // Consecutive bullet points
    formatted = formatted.replace(
        /(<li>.*<\/li>\n?)+/g,
        function (match) {
            return "<ul>" + match + "</ul>";
        }
    );


    // Numbered lists
    formatted = formatted.replace(
        /^\s*\d+\.\s+(.*)$/gm,
        "<li>$1</li>"
    );


    // Paragraph spacing
    formatted = formatted.replace(
        /\n\n+/g,
        "</p><p>"
    );


    // Remaining line breaks
    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );


    // Wrap text in paragraphs
    formatted = "<p>" + formatted + "</p>";


    // Remove empty paragraphs
    formatted = formatted.replace(
        /<p>\s*<\/p>/g,
        ""
    );


    // Prevent headings/lists from being wrapped incorrectly
    formatted = formatted
        .replace(/<p>(<h[1-3]>)/g, "$1")
        .replace(/(<\/h[1-3]>)<\/p>/g, "$1")
        .replace(/<p>(<ul>)/g, "$1")
        .replace(/(<\/ul>)<\/p>/g, "$1")
        .replace(/<p>(<hr>)<\/p>/g, "$1");


    return formatted;
}


// ==============================
// LOADING SCREEN
// ==============================

const loadingScreen =
    document.getElementById("loadingScreen");

const loadingText =
    document.getElementById("loadingText");

let loadingInterval;

let loadingIndex = 0;

const loadingMessages = [

    "Building your personalized workout... 💪",

    "Planning your meals... 🥗",

    "Matching your plan to your schedule... 📅",

    "Creating your personalized routine... ✨",

    "Almost finished... 🚀"

];


function showLoadingScreen() {

    if (!loadingScreen) {
        return;
    }

    loadingScreen.classList.add("active");

    loadingIndex = 0;

    if (loadingText) {

        loadingText.textContent =
            loadingMessages[0];

    }


    loadingInterval = setInterval(() => {

        loadingIndex++;

        if (
            loadingIndex >=
            loadingMessages.length
        ) {

            loadingIndex = 0;

        }


        if (loadingText) {

            loadingText.textContent =
                loadingMessages[loadingIndex];

        }

    }, 1800);

}


function hideLoadingScreen() {

    if (!loadingScreen) {
        return;
    }

    loadingScreen.classList.remove("active");

    clearInterval(loadingInterval);

}


// ==============================
// FORM SUBMISSION
// ==============================

const form =
    document.getElementById("planForm");

const output =
    document.getElementById("output");


if (form) {

    const submitBtn =
        form.querySelector(
            "button[type='submit']"
        );


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // Show loading screen
            showLoadingScreen();


            // Loading message underneath
            if (output) {

                output.innerHTML =
                    "<p>Generating your personalized WorkFit plan... 💪</p>";

            }


            // Disable button
            if (submitBtn) {

                submitBtn.disabled = true;

                submitBtn.textContent =
                    "Generating...";

            }


            // Collect user information
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

                // Your existing API
                const response = await fetch(
                    "https://workfit-0qd7.onrender.com/generate-plan",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(userData)

                    }
                );


                const data =
                    await response.json();


                if (response.ok) {

                    // Convert AI Markdown
                    // into styled HTML
                    output.innerHTML =
                        formatAIResponse(
                            data.plan
                        );

                }

                else {

                    output.innerHTML =
                        `<p>${
                            data.error ||
                            "Something went wrong."
                        }</p>`;

                }


            }

            catch (error) {

                console.error(
                    "Error:",
                    error
                );


                output.innerHTML =
                    "<p>Unable to connect to WorkFit AI. Make sure the server is running.</p>";

            }


            finally {

                // Hide loading screen
                hideLoadingScreen();


                // Re-enable button
                if (submitBtn) {

                    submitBtn.disabled = false;

                    submitBtn.textContent =
                        "Generate My Plan";

                }

            }

        }
    );

}


// ==============================
// DARK MODE
// ==============================

const darkModeBtn =
    document.getElementById(
        "darkModeBtn"
    );


if (darkModeBtn) {

    // Load saved theme
    if (
        localStorage.getItem("theme") ===
        "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

        darkModeBtn.innerHTML =
            "☀️";

    }


    darkModeBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            if (
                document.body.classList.contains(
                    "dark"
                )
            ) {

                darkModeBtn.innerHTML =
                    "☀️";

                localStorage.setItem(
                    "theme",
                    "dark"
                );

            }

            else {

                darkModeBtn.innerHTML =
                    "🌙";

                localStorage.setItem(
                    "theme",
                    "light"
                );

            }

        }
    );

}
