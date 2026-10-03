const API = "/api";

function showPage(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    if (page === "dashboard") {
        loadDashboard();
    }
}

async function loadDashboard() {
    try {
        const statsResponse = await fetch(`${API}/statistics`);
        const stats = await statsResponse.json();

        document.getElementById("totalComplaints").textContent = stats.total;
        document.getElementById("submittedComplaints").textContent = stats.submitted;
        document.getElementById("progressComplaints").textContent = stats.inProgress;
        document.getElementById("resolvedComplaints").textContent = stats.resolved;

        const response = await fetch(`${API}/complaints`);
        const complaints = await response.json();

        displayRecentComplaints(complaints);
    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
}

function displayRecentComplaints(complaints) {
    const container = document.getElementById("recentComplaints");

    if (complaints.length === 0) {
        container.innerHTML = "<p>No complaints available.</p>";
        return;
    }

    const recent = complaints.slice(-5).reverse();

    container.innerHTML = recent.map(c => `
        <div class="complaint">
            <div class="complaint-header">
                <strong>${escapeHtml(c.id)}</strong>
                <span class="badge">${escapeHtml(c.status)}</span>
            </div>
            <p><strong>Problem:</strong> ${escapeHtml(c.type)}</p>
            <p><strong>Area:</strong> ${escapeHtml(c.area)}</p>
            <p>${escapeHtml(c.description)}</p>
            <p><strong>Date:</strong> ${escapeHtml(c.date)}</p>
        </div>
    `).join("");
}

document.getElementById("complaintForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const complaint = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        area: document.getElementById("area").value.trim(),
        type: document.getElementById("type").value,
        description: document.getElementById("description").value.trim()
    };

    try {
        const response = await fetch(`${API}/complaints`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(complaint)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        document.getElementById("successMessage").innerHTML = `
            ✅ Complaint submitted successfully!
            <br><br>
            Your Complaint ID:
            <strong>${escapeHtml(data.complaint.id)}</strong>
            <br>
            Save this ID to track your complaint.
        `;

        document.getElementById("complaintForm").reset();
        loadDashboard();
    } catch (error) {
        console.error(error);
        alert("Server connection failed.");
    }
});

async function trackComplaint() {
    const id = document.getElementById("complaintId").value.trim();

    if (!id) {
        alert("Please enter Complaint ID.");
        return;
    }

    try {
        const response = await fetch(`${API}/complaints/${encodeURIComponent(id)}`);
        const data = await response.json();
        const result = document.getElementById("trackingResult");

        if (!response.ok) {
            result.innerHTML = `
                <div class="complaint">
                    ❌ Complaint not found.
                    <br><br>
                    Please check your Complaint ID.
                </div>
            `;
            return;
        }

        result.innerHTML = `
            <div class="complaint">
                <div class="complaint-header">
                    <h3>${escapeHtml(data.id)}</h3>
                    <span class="badge">${escapeHtml(data.status)}</span>
                </div>
                <p><strong>Resident:</strong> ${escapeHtml(data.name)}</p>
                <p><strong>Area:</strong> ${escapeHtml(data.area)}</p>
                <p><strong>Problem:</strong> ${escapeHtml(data.type)}</p>
                <p><strong>Description:</strong> ${escapeHtml(data.description)}</p>
                <p><strong>Date:</strong> ${escapeHtml(data.date)}</p>
                <hr style="margin:15px 0">
                <p>📥 Submitted → 🔧 In Progress → ✅ Resolved</p>
            </div>
        `;
    } catch (error) {
        console.error(error);
        alert("Unable to connect to server.");
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadDashboard();