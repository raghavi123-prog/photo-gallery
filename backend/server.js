const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Initialize Express app
const app = express();

// Enable CORS for cross-origin requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve uploaded files from the 'uploads' folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Helper functions to read and write JSON database
const readDatabase = () => {
    try {
        const data = fs.readFileSync("database.json", "utf-8");
        return JSON.parse(data || "[]");
    } catch (error) {
        return [];
    }
};

const writeDatabase = (data) => {
    fs.writeFileSync("database.json", JSON.stringify(data, null, 2));
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir); // Create the 'uploads' folder if it doesn't exist
        }
        cb(null, uploadsDir); // Store files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Define Routes

// Root route to check if the backend is working
app.get("/", (req, res) => {
    res.send("Photo Gallery Backend");
});

// Upload route to handle photo uploads
app.post("/upload", upload.single("photo"), (req, res) => {
    console.log("Upload request received:", req.body, req.file);

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded!" });
    }

    const photos = readDatabase();
    const newPhoto = {
        id: Date.now(),
        title: req.body.title,
        imageUrl: `/uploads/${req.file.filename}`,
        uploadDate: new Date(),
    };
    photos.push(newPhoto);
    writeDatabase(photos);

    res.status(201).json(newPhoto);
});

// New GET route to fetch all photos
app.get("/photos", (req, res) => {
    const photos = readDatabase();
    res.json(photos); // Send the list of uploaded photos
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});

