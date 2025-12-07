# 🚧 CraneOpedia
### *A Modern Crane Selection, Comparison & AR Visualization Platform*

![CraneOpedia Logo](https://img.icons8.com/?size=512&id=11219&format=png)

---

## 🖼️ Homepage Preview


![Homepage Screenshot](https://via.placeholder.com/1400x650.png?text=CraneOpedia+Homepage+Preview)

---

## 📘 Overview

CraneOpedia is an intelligent crane selection and comparison platform designed for beginners, engineers, and construction professionals.  
It simplifies complex crane specifications using:

- 🤖 AI-powered crane recommendations (Gemini API)
- 📊 Side-by-side crane comparison
- 🕶️ WebXR-based AR crane visualization
- 🏗️ Detailed crane catalogue with images and specs
- 🔍 QR code–based crane lookup system
- ⚙️ Admin panel for managing crane data
- 📡 Scalable backend using Node.js, Express, and MongoDB
- 🎨 Modern frontend built with EJS, CSS, and JavaScript allowing dark and light mode toggling

The platform helps users find the ideal crane based on load, height, working radius, terrain, and safety requirements.

---

## 🏷️ Feature Summary Table

| Feature Category | Description |
|------------------|-------------|
| 🤖 AI Assistant | Suggests the ideal crane using Gemini API |
| 📊 Comparison Tool | Side-by-side crane comparison interface |
| 🏗️ Crane Catalogue | Crane cards with images & specifications |
| 🕶️ AR Visualization | View crane models in AR using WebXR |
| ⚙️ Admin Panel | Add, edit, and delete crane models |
| 🔍 QR Code System | Scan QR codes to instantly view crane details |
| 🧠 Load Analysis | Basic physics-based load distribution |

---

## ✨ Key Features

### 🤖 AI-Based Crane Recommender (Gemini API)
The platform uses the Google Gemini API combined with custom rule-based logic to recommend the most suitable crane based on:
- Load weight  
- Lifting height  
- Working radius  
- Terrain type  
- Industry or project category  
- Safety constraints  

It provides clear explanations for each recommendation, helping users understand why a particular crane fits their requirement.

---

### 📊 Crane Comparison Engine
A clean and modern table-based comparison system that allows users to compare multiple cranes across important specifications such as:
- Maximum lifting capacity  
- Maximum radius  
- Mobility type  
- Reach and boom length  
- Suitable use-cases  

Helps beginners quickly identify differences between crane models.

---

### 🏗️ Crane Catalogue
A grid-based catalogue displaying crane cards that include:
- High-quality images  
- Model name and brand  
- Key specifications  
- Highlights (pros/limitations)  
- Type categories (mobile, crawler, tower, etc.)  

Designed using EJS templates, JavaScript logic, and custom CSS for a modern UI.

---

### 🕶️ AR Load Visualization (WebXR)
CraneOpedia integrates WebXR for interactive AR experiences, allowing users to:
- View crane models in 3D  
- Rotate and zoom around the crane  
- Understand operating radius and load reach  
- Visualize safe working zones  

Runs directly in-browser with no app installation required.

---

### 🔍 QR Code Integration
Each crane model can generate a scannable QR code which, when scanned, instantly opens:
- Crane specifications  
- Comparison options  
- AR visualization  

Useful for on-site engineers and rental companies.

---

## 🧬 System Architecture

The architecture of CraneOpedia is designed for scalability, modularity, and real-time interaction.  
It consists of a clean separation between the frontend, backend, database, AI engine, and AR system.

          ┌──────────────────────────┐
          │        Frontend          │
          │ HTML • CSS • JS • EJS    │
          └─────────────┬────────────┘
                        │
                        ▼
            ┌─────────────────────┐
            │     Backend API     │
            │  Node.js + Express  │
            └──────────┬──────────┘
                       │
                       ▼
         ┌──────────────────────────┐
         │        Database          │
         │         MongoDB          │
         └──────────────────────────┘
                       │
                       ▼
         ┌──────────────────────────┐
         │       AI Engine          │
         │      Gemini API          │
         └──────────────────────────┘
                       │
                       ▼
         ┌──────────────────────────┐
         │       AR System          │
         │     WebXR + 3D Viewer    │
         └──────────────────────────┘
---

## 🔁 User Flow

The end-to-end flow of a user interacting with CraneOpedia is simple, intuitive, and optimized for beginners.

User → Selects Project Type
     → Enters Basic Requirements (load, height, radius)
     → AI Chatbot (Gemini API) Asks Follow-up Questions
     → System Generates Crane Recommendations
     → User Compares Suggested Crane Models
     → User Opens AR Mode to Visualize Crane (WebXR)
     → User Scans QR Code for Quick Access (Optional)
     → User Proceeds to Contact / Rental Inquiry

---
## 💻 Tech Stack Breakdown

CraneOpedia is built using a combination of modern frontend, backend, database, AI, and AR technologies.
Below is a complete breakdown of the tools and their roles in the system.

---

### 🎨 Frontend Technologies

| Category | Technologies | Badges |
|----------|--------------|--------|
| **Core Frontend** | HTML, CSS, JavaScript, EJS | ![HTML](https://img.shields.io/badge/HTML-orange?style=for-the-badge) ![CSS](https://img.shields.io/badge/CSS-blue?style=for-the-badge) ![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge) ![EJS](https://img.shields.io/badge/EJS-green?style=for-the-badge) |
| **UI / Styling** | Custom CSS Components | ![CSS](https://img.shields.io/badge/CSS-blue?style=for-the-badge) |
| **AR Layer** | WebXR | ![WebXR](https://img.shields.io/badge/WebXR-purple?style=for-the-badge) |

---

### ⚙️ Backend Technologies

| Layer | Technologies | Purpose |
|-------|--------------|----------|
| **Backend Framework** | Node.js, Express | Handles API routing, requests, and server logic |
| **Database** | MongoDB | Stores crane models, specifications, and metadata |
| **AI Engine** | Gemini API | Provides intelligent crane recommendations |
| **QR System** | qrcode npm library | Generates QR codes for quick crane lookup |

Badges:

![Node.js](https://img.shields.io/badge/Node.js-green?style=for-the-badge)
![Express](https://img.shields.io/badge/Express-black?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-brightgreen?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini_API-blue?style=for-the-badge)
![QR Code](https://img.shields.io/badge/QR_Code_Generator-grey?style=for-the-badge)

---

## 🔐 Admin Panel Capabilities

The Admin Panel is designed to help manage crane data efficiently and maintain an up-to-date catalogue.

| Function | Description |
|----------|-------------|
| **Add New Crane Model** | Upload crane images, specifications, type, and metadata |
| **Edit Crane Details** | Update crane specs, capacity, radius, or model information |
| **Delete Crane Model** | Remove outdated or incorrect crane entries |
| **QR Code Generation** | Automatically generate QR codes for each crane model |
| **Dashboard Overview** | View recent activity and crane catalogue analytics |

The admin panel ensures full control over the platform's data while maintaining ease of use and scalability.

---

## 📅 Future Enhancements

CraneOpedia is designed with scalability in mind, and several advanced features are planned for future releases:

- ✔️ **Real-time Crane Availability Sync**  
  Integrate with crane rental companies to show which cranes are available instantly.

- ✔️ **3D Crane Animation Viewer**  
  Provide animated boom movements, load lifting, and rotation simulations for better visualization.

- ✔️ **Predictive Crane Failure AI**  
  Use machine learning to identify possible mechanical failures or unsafe load configurations.

- ✔️ **GIS-Based Site Scanning**  
  Analyze site layout, terrain, and obstructions using map-based tools to recommend cranes accurately.

- ✔️ **Voice-Based Crane Assistant**  
  Hands-free mode for workers and engineers to request crane information via voice commands.

- ✔️ **Advanced Safety Radius Calculator**  
  Show danger zones, collapse radius, and exclusion zones in AR.

These enhancements aim to make CraneOpedia the most advanced and user-friendly crane decision platform.

---


## 📅 Future Enhancements

CraneOpedia is designed with scalability in mind, and several advanced features are planned for future releases:

- ✔️ **Real-time Crane Availability Sync**  
  Integrate with crane rental companies to show which cranes are available instantly.

- ✔️ **3D Crane Animation Viewer**  
  Provide animated boom movements, load lifting, and rotation simulations for better visualization.

- ✔️ **Predictive Crane Failure AI**  
  Use machine learning to identify possible mechanical failures or unsafe load configurations.

- ✔️ **GIS-Based Site Scanning**  
  Analyze site layout, terrain, and obstructions using map-based tools to recommend cranes accurately.

- ✔️ **Voice-Based Crane Assistant**  
  Hands-free mode for workers and engineers to request crane information via voice commands.

- ✔️ **Advanced Safety Radius Calculator**  
  Show danger zones, collapse radius, and exclusion zones in AR.

These enhancements aim to make CraneOpedia the most advanced and user-friendly crane decision platform.

---


## 📝 License

This project is licensed under the **MIT License**, allowing both personal and commercial use.

You are free to:
- ✔️ Use  
- ✔️ Modify  
- ✔️ Distribute  
- ✔️ Integrate  

As long as you include a copy of the license in your project distribution.

---
