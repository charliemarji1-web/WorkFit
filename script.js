// Scroll to the planner section
const scrollButton = document.getElementById("scrollButton");

if (scrollButton) {

    scrollButton.addEventListener("click", () => {

        document.getElementById("planner").scrollIntoView({
            behavior: "smooth"
        });

    });

}


// Form submission
const form = document.getElementById("planForm");
const output = document.getElementById("output");
const submitBtn = form.querySelector("button[type='submit']");


form.addEventListener("submit", async (event) => {

    event.preventDefault();


    // Show loading message
    output.textContent = "Generating your personalized WorkFit plan... 💪";

    // Disable button while request is in flight
    submitBtn.disabled = true;
    submitBtn.textContent = "Generating...";


    const userData = {

        age: document.getElementById("age").value,

        height: document.getElementById("height").value,

        weight: document.getElementById("weight").value,

        sex: document.getElementById("sex").value,

        goal: document.getElementById("goal").value,

        schedule: document.getElementById("schedule").value

    };


    try {

        const response = await fetch(
            "http://localhost:3000/generate-plan",
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

            // Displays Gemini response from server.js
            output.textContent = data.plan;

        } 
        
        else {

            output.textContent =
                data.error || "Something went wrong.";

        }


    } 
    
    catch (error) {

        console.error("Error:", error);


        output.textContent =
            "Unable to connect to WorkFit AI. Make sure the server is running.";

    }

    finally {

        // Re-enable button whether it succeeded or failed
        submitBtn.disabled = false;
        submitBtn.textContent = "Generate My Plan";

    }


});

// Dark Mode Toggle

const darkModeBtn = document.getElementById("darkModeBtn");

// On page load, apply saved preference
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");
    darkModeBtn.innerHTML = "☀️";

}

darkModeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        darkModeBtn.innerHTML = "☀️";
        localStorage.setItem("theme", "dark");

    } else {

        darkModeBtn.innerHTML = "🌙";
        localStorage.setItem("theme", "light");

    }

});