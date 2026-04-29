require("dotenv").config();
const mongoose = require("mongoose");
const Profile = require("./models/Profile");

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await Profile.deleteMany();

    const sampleProfiles = [
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: "Alex Johnson",
        programme: "Computer Science",
        graduationYear: 2024,
        industrySector: "Technology",
        currentRole: "Software Developer",
        skills: ["JavaScript", "Node.js", "MongoDB"],
        certifications: ["AWS"]
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: "Maria Lopez",
        programme: "Cyber Security",
        graduationYear: 2023,
        industrySector: "Technology",
        currentRole: "Security Analyst",
        skills: ["Networking", "Python", "Security"],
        certifications: ["CompTIA Security+"]
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: "James Smith",
        programme: "Business Management",
        graduationYear: 2022,
        industrySector: "Finance",
        currentRole: "Financial Analyst",
        skills: ["Excel", "Data Analysis"],
        certifications: []
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: "Emma Brown",
        programme: "Computer Science",
        graduationYear: 2024,
        industrySector: "Technology",
        currentRole: "Frontend Developer",
        skills: ["React", "CSS", "JavaScript"],
        certifications: []
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: "Daniel White",
        programme: "Cyber Security",
        graduationYear: 2025,
        industrySector: "Government",
        currentRole: "Cyber Consultant",
        skills: ["Security", "Linux"],
        certifications: ["CEH"]
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: "Sophia Green",
        programme: "Computer Science",
        graduationYear: 2023,
        industrySector: "Technology",
        currentRole: "Backend Developer",
        skills: ["Node.js", "APIs"],
        certifications: []
      },
      {
        userId: new mongoose.Types.ObjectId(),
        fullName: "Scarlett Jones",
        programme: "Data Science",
        graduationYear: 2024,
        industrySector: "Technology",
        currentRole: "Data Analyst",
        skills: ["Python", "R", "SQL"],
        certifications: ["IBM"]
      }
    ];

    await Profile.insertMany(sampleProfiles);

    console.log("Database seeded successfully");
    process.exit();

  } catch (error) {
    console.error("SEED ERROR:", error);
    process.exit(1);
  }
}

seed();
