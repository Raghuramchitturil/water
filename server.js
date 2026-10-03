const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

let complaints = [
    {
        id: "WTR-1001",
        name: "Demo Resident",
        phone: "9000000000",
        area: "Gandhi Nagar",
        type: "Low Water Pressure",
        description: "Low water pressure during morning supply.",
        status: "In Progress",
        date: new Date().toLocaleDateString()
    }
];

function generateComplaintId() {
    return "WTR-" + (1001 + complaints.length);
}

app.get("/api/complaints", (req, res) => {
    res.json(complaints);
});

app.get("/api/complaints/:id", (req, res) => {
    const id = req.params.id.toUpperCase();
    const complaint = complaints.find(c => c.id.toUpperCase() === id);

    if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
});

app.post("/api/complaints", (req, res) => {
    const { name, phone, area, type, description } = req.body;

    if (!name || !phone || !area || !type || !description) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
    }

    const complaint = {
        id: generateComplaintId(),
        name,
        phone,
        area,
        type,
        description,
        status: "Submitted",
        date: new Date().toLocaleDateString()
    };

    complaints.push(complaint);

    res.status(201).json({
        message: "Complaint submitted successfully",
        complaint
    });
});

app.put("/api/complaints/:id", (req, res) => {
    const id = req.params.id.toUpperCase();
    const { status } = req.body;

    const complaint = complaints.find(c => c.id.toUpperCase() === id);

    if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    const validStatuses = ["Submitted", "In Progress", "Resolved"];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    complaint.status = status;

    res.json({
        message: "Status updated",
        complaint
    });
});

app.get("/api/statistics", (req, res) => {
    const total = complaints.length;
    const submitted = complaints.filter(c => c.status === "Submitted").length;
    const inProgress = complaints.filter(c => c.status === "In Progress").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;

    res.json({ total, submitted, inProgress, resolved });
});

app.listen(PORT, () => {
    console.log("-----------------------------------------");
    console.log("   WATER SUPPLY COMPLAINT SYSTEM");
    console.log("-----------------------------------------");
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log("Press Ctrl + C to stop the server");
});