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
// MARKDOWN PATTERNS
// ==============================

const RULE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;

const HEADING = /^\s*(#{1,6})\s+(.*)$/;

const BULLET = /^(\s*)(?:[-*•+])\s+(.*)$/;

const ORDERED = /^(\s*)\d+[.)]\s+(.*)$/;

const TABLE_ROW = /^\s*\|.*\|\s*$/;

const TABLE_DIVIDER = /^\s*\|[\s:|-]+\|\s*$/;

// "**Label**", "**Label:**" or "**Label**: text"
const BOLD_LABEL = /^\s*\*\*([^*]{1,45}?)\*\*\s*(.*)$/;

const DAY =
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;


// ==============================
// INLINE FORMATTING
// ==============================

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


function formatInline(text) {

    return text
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

}


// ==============================
// LISTS
// ==============================

function renderItems(items) {

    if (!items.length) {
        return "";
    }


    let html = "";

    let openTag = "";


    items.forEach((item) => {

        if (item.tag !== openTag) {

            if (openTag) {
                html += "</" + openTag + ">";
            }

            html += "<" + item.tag + ">";

            openTag = item.tag;

        }


        html +=
            "<li>" +
            formatInline(item.text) +
            renderItems(item.children) +
            "</li>";

    });


    return html + "</" + openTag + ">";

}


function renderList(lines) {

    // Build a tree first so nested lists land inside their parent item
    const root = { indent: -1, children: [] };

    const stack = [root];


    lines.forEach((line) => {

        const bullet = line.match(BULLET);

        const ordered = bullet ? null : line.match(ORDERED);

        const match = bullet || ordered;

        const item = {

            indent:
                match[1].replace(/\t/g, "    ").length,

            tag: bullet ? "ul" : "ol",

            text: match[2],

            children: []

        };


        while (
            stack.length > 1 &&
            item.indent <= stack[stack.length - 1].indent
        ) {

            stack.pop();

        }


        stack[stack.length - 1].children.push(item);

        stack.push(item);

    });


    return renderItems(root.children);

}


// ==============================
// TABLES
// ==============================

function splitRow(line) {

    return line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => formatInline(cell.trim()));

}


function renderTable(lines) {

    const hasHeader =
        lines.length > 1 && TABLE_DIVIDER.test(lines[1]);

    const rows = lines
        .filter((line) => !TABLE_DIVIDER.test(line))
        .map(splitRow);

    if (!rows.length) {
        return "";
    }


    let html = "<div class='plan-table'><table>";

    let start = 0;


    if (hasHeader) {

        html +=
            "<thead><tr>" +
            rows[0]
                .map((cell) => "<th>" + cell + "</th>")
                .join("") +
            "</tr></thead>";

        start = 1;

    }


    html += "<tbody>";

    for (let i = start; i < rows.length; i++) {

        html +=
            "<tr>" +
            rows[i]
                .map((cell) => "<td>" + cell + "</td>")
                .join("") +
            "</tr>";

    }

    return html + "</tbody></table></div>";

}


// ==============================
// MARKDOWN TO TOKENS
// ==============================

function isBlockStart(line) {

    return (
        !line.trim() ||
        RULE.test(line) ||
        HEADING.test(line) ||
        BULLET.test(line) ||
        ORDERED.test(line) ||
        TABLE_ROW.test(line) ||
        BOLD_LABEL.test(line)
    );

}


function tokenize(text) {

    const lines = escapeHTML(text)
        .replace(/\r\n/g, "\n")
        .split("\n");

    const tokens = [];

    let i = 0;


    while (i < lines.length) {

        const line = lines[i];


        // Blank lines and dividers: the cards provide the spacing
        if (!line.trim() || RULE.test(line)) {

            i++;
            continue;

        }


        // Headings
        const heading = line.match(HEADING);

        if (heading) {

            tokens.push({
                type: "heading",
                level: Math.min(heading[1].length, 3),
                text: heading[2].replace(/:\s*$/, "")
            });

            i++;
            continue;

        }


        // Lists
        if (BULLET.test(line) || ORDERED.test(line)) {

            const block = [];

            while (
                i < lines.length &&
                (BULLET.test(lines[i]) || ORDERED.test(lines[i]))
            ) {

                block.push(lines[i]);
                i++;

            }

            tokens.push({
                type: "html",
                html: renderList(block)
            });

            continue;

        }


        // Tables
        if (TABLE_ROW.test(line)) {

            const block = [];

            while (
                i < lines.length &&
                TABLE_ROW.test(lines[i])
            ) {

                block.push(lines[i]);
                i++;

            }

            tokens.push({
                type: "html",
                wide: true,
                html: renderTable(block)
            });

            continue;

        }


        // A bolded label on its own line acts as a sub-heading
        const label = line.match(BOLD_LABEL);

        if (label) {

            const rest = label[2].replace(/^:\s*/, "").trim();

            tokens.push({
                type: "heading",
                level: 3,
                text: label[1].replace(/:\s*$/, "")
            });

            if (rest) {

                tokens.push({
                    type: "html",
                    html: "<p>" + formatInline(rest) + "</p>"
                });

            }

            i++;
            continue;

        }


        // Paragraph
        const paragraph = [];

        while (
            i < lines.length &&
            !isBlockStart(lines[i])
        ) {

            paragraph.push(lines[i].trim());
            i++;

        }

        tokens.push({
            type: "html",
            html:
                "<p>" +
                formatInline(paragraph.join(" ")) +
                "</p>"
        });

    }


    return tokens;

}


// ==============================
// TOKENS TO PLAN LAYOUT
// ==============================

function formatAIResponse(text) {

    if (!text || !String(text).trim()) {
        return "";
    }


    const tokens = tokenize(String(text));

    let html = "";

    let cardOpen = false;

    let gridOpen = false;

    let blockOpen = false;


    function closeBlock() {

        if (blockOpen) {

            html += "</div></div>";
            blockOpen = false;

        }

    }


    function closeGrid() {

        closeBlock();

        if (gridOpen) {

            html += "</div>";
            gridOpen = false;

        }

    }


    function closeCard() {

        closeGrid();

        if (cardOpen) {

            html += "</div></div>";
            cardOpen = false;

        }

    }


    function openCard(title) {

        closeCard();

        html += "<div class='plan-card'>";

        if (title) {

            html += "<h2>" + formatInline(title) + "</h2>";

        }

        html += "<div class='plan-card-body'>";

        cardOpen = true;

    }


    tokens.forEach((token) => {

        if (token.type === "heading" && token.level === 1) {

            closeCard();

            html +=
                "<h1 class='plan-title'>" +
                formatInline(token.text) +
                "</h1>";

            return;

        }


        if (token.type === "heading" && token.level === 2) {

            openCard(token.text);

            return;

        }


        if (token.type === "heading") {

            if (!cardOpen) {
                openCard("");
            }

            closeBlock();

            if (!gridOpen) {

                html += "<div class='plan-grid'>";
                gridOpen = true;

            }

            const dayClass =
                DAY.test(token.text) ? " plan-block-day" : "";

            html +=
                "<div class='plan-block" + dayClass + "'>" +
                "<h3>" + formatInline(token.text) + "</h3>" +
                "<div class='plan-block-body'>";

            blockOpen = true;

            return;

        }


        if (!cardOpen) {
            openCard("");
        }

        // Tables need the full width of the card
        if (token.wide) {
            closeGrid();
        }

        html += token.html;

    });


    closeCard();


    return html;

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

    "Building your personalized workout...",

    "Planning your meals...",

    "Matching your plan to your schedule...",

    "Creating your personalized routine...",

    "Almost finished..."

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
                    "<p>Generating your personalized WorkFit plan...</p>";

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


            let generated = false;


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
                    // into a structured plan layout
                    output.innerHTML =
                        formatAIResponse(data.plan) ||
                        "<p>No plan was returned. Please try again.</p>";

                    generated = true;

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


                // Bring the finished plan into view
                if (generated) {

                    document
                        .getElementById("result")
                        .scrollIntoView({
                            behavior: "smooth"
                        });

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
