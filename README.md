# 🚀 PlanPlus — Smart Study OS

PlanPlus is a **modern, SaaS-style Study Operating System** designed to help students manage courses, track progress, and collaborate through shared resources — all in one place.

---

# 🧠 Problem Statement

Students struggle to manage multiple subjects, track progress, and organize resources efficiently. Existing tools lack integration between learning, tracking, and collaboration.

---

# 💡 Solution

PlanPlus provides a **centralized platform** where users can:

* Create and manage courses
* Add topics, subtopics, and nested content
* Track learning progress and streaks
* Create structured notes (like professional editors)
* Share resources using unique tokens
* Request and manage access to shared content

---

# ⚙️ Features

## 📚 Course Management

* Add courses dynamically
* Nested topics → subtopics → sub-subtopics
* Checklist-based progress tracking

## 📝 Notes System

* Rich note editor (like OneNote / Notion)
* Add:

  * Text
  * Images
  * YouTube videos
  * Links

## 🔗 Resource Sharing

* Share resources using **unique tokens**
* Public / Private access control
* Request-based access system

## 📊 Analytics & Streaks

* Daily progress tracking
* Streak system
* Visual analytics (planned/improving)

## 👥 Multi-user System

* Each user has isolated data
* No shared UI interference
* Admin-level control (hidden)

---

# 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Zustand (state management)

### Backend (Serverless)

* Vercel API Routes

### Database

* MongoDB Atlas

---

# 🔐 Environment Variables

Create a `.env` file (DO NOT PUSH):

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=planplus
MONGODB_COLLECTION_NAME=cloud_state
```

---

# 🚀 Getting Started

## 1. Clone the repo

```bash
git clone https://github.com/AbhishekAdigatr12/PlanPlus.git
cd PlanPlus
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Run locally

```bash
npm run dev
```

---

## 4. Build for production

```bash
npm run build
```

---

# 🌐 Deployment

Deployed on Vercel.

Steps:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

---

# 🔐 Security

* `.env` is ignored using `.gitignore`
* MongoDB credentials are stored securely in Vercel
* API routes prevent direct database exposure

---

# 📌 Future Improvements

* Full authentication system (JWT)
* Role-based access control
* Advanced analytics dashboard
* Real-time collaboration
* Mobile responsiveness

---

# 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit pull requests.

---

# 📄 License

This project is for educational and personal use.

---

# 👨‍💻 Author

**Abhishek Adiga**

---
# 👨‍💻 Contributors

* **Abhishek Adiga** — Project Owner & Lead Developer
* **Nandankumar** — Co-Contributor & Developer
---

# ⭐ Acknowledgements

Inspired by:

* Striver’s DSA Sheet
* Notion / OneNote style note-taking
* SaaS learning platforms

---
