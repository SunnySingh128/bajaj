# Chitkara Full Stack Engineering Challenge - Tree & Cycle Hierarchy Parser

A complete, production-ready full-stack application built for the Chitkara Full Stack Engineering Challenge. The project features a Node.js + Express REST API on the backend and a React + Vite frontend with Tailwind CSS. It parses, validates, and processes lists of directed edges (e.g., `A->B`) into hierarchies, automatically resolving duplicates, enforcing multi-parent rules, and executing cycle detection.

---

## 🚀 Features

### Backend (Node.js + Express)
* **API Route**: `POST /bfhl` accepts a JSON object with a list of edge strings:
  ```json
  {
    "data": ["A->B", "A->C", "B->D"]
  }
  ```
* **Validation**: Checks edge format (`X->Y` with single uppercase letters, no self-loops, trims spaces) and filters out malformed edges.
* **Duplicate Detection**: First edge is accepted, subsequent identical edges are recorded as duplicates.
* **Multi-Parent Resolution**: Enforces the first-parent-wins rule, ignoring any future parent assignments for a node.
* **Cycle Detection**: Identifies cycles within connected components. Components with cycles return the lexicographically smallest node as the root, empty the tree, and set `has_cycle: true`.
* **Tree Building & Metrics**: Computes nested JSON hierarchies, tree depths (max root-to-leaf path node counts), total trees, total cycles, and identifies the largest tree root.

### Frontend (React + Vite + Tailwind CSS)
* **Modern Premium UI**: Sleek dark dashboard with CSS glassmorphism, glowing accents, and micro-animations.
* **Textarea Input**: Automatically splits inputs by line breaks and handles formatting.
* **Preset Loaders**: Instantly loads sample data for standard trees, pure cycles, multi-parent conflicts, or complex combinations to demonstrate application robustness.
* **Responsive Visualizer**: Dynamically renders organizational-chart trees with perfect branch connectors.
* **Raw JSON Explorer**: Features syntax-highlighted responses and a one-click copy helper.
* **Detailed Logs**: Clearly reports duplicate edges, invalid entries, and validation details.

---

## 📁 Project Structure

```text
bajaj/
├── backend/
│   ├── routes/
│   │   └── bfhl.js          # REST API endpoints (GET/POST /bfhl)
│   ├── utils/
│   │   └── treeBuilder.js   # Tree building, cycle detection, & validation logic
│   ├── package.json         # Backend dependencies & dev scripts
│   └── server.js            # Main Express server entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # React dashboard & TreeVisualizer component
│   │   ├── main.jsx         # React application entrypoint
│   │   └── index.css        # Main stylesheet (Tailwind directives)
│   ├── index.html           # Document structure
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies & build commands
│
└── README.md                # Project documentation & deployment guides
```

---

## 🛠️ Local Installation & Development

### 1. Backend Server Setup
From the project root:
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Run the backend in development mode (with nodemon auto-restart)
npm run dev
# The backend will start on http://localhost:5000
```

### 2. Frontend React Client Setup
Open a new terminal window at the project root:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the Vite development server
npm run dev
# The frontend will start on http://localhost:5173
```

---

## ⚡ API Endpoints

### 1. `POST /bfhl`
Processes the edges array and returns the parsed hierarchies.

* **Payload**:
  ```json
  {
    "data": [
      "A->B",
      "A->C",
      "B->D",
      "hello",
      "A->B",
      "B->A"
    ]
  }
  ```
* **Response**:
  ```json
  {
    "user_id": "sunny_singh_24062026",
    "email_id": "sunny1524.be23@chitkarauniversity.edu.in",
    "college_roll_number": "2311981524",
    "hierarchies": [
      {
        "root": "A",
        "tree": {
          "A": {
            "B": {
              "D": {}
            },
            "C": {}
          }
        },
        "depth": 3
      }
    ],
    "invalid_entries": [
      "hello"
    ],
    "duplicate_edges": [
      "A->B"
    ],
    "summary": {
      "total_trees": 1,
      "total_cycles": 0,
      "largest_tree_root": "A"
    }
  }
  ```

### 2. `GET /bfhl`
* **Response**:
  ```json
  {
    "operation_code": 1,
    "status": "active",
    "message": "Chitkara Full Stack Challenge API is running."
  }
  ```

---

## ☁️ Production Deployment Guide

### Deployment on Render (Backend)
1. Log in to [Render](https://render.com) and click **New** -> **Web Service**.
2. Connect your Git repository.
3. Configure the following settings:
   * **Name**: `chitkara-challenge-api`
   * **Runtime**: `Node`
   * **Build Command**: `cd backend && npm install`
   * **Start Command**: `cd backend && npm start`
   * **Instance Type**: `Free`
4. In **Environment Variables**, add:
   * `PORT`: `5000`
5. Click **Deploy Web Service**. Render will build and host your API. Note down your deployed URL (e.g. `https://chitkara-challenge-api.onrender.com`).

### Deployment on Vercel (Frontend)
1. Open `frontend/src/App.jsx` and change the API fetch URL from `http://localhost:5000` to your deployed Render URL (e.g., `https://chitkara-challenge-api.onrender.com`).
2. Install the Vercel CLI globally or use the dashboard:
   ```bash
   npm install -g vercel
   ```
3. Run `vercel` from the `frontend/` directory to deploy:
   ```bash
   cd frontend
   vercel
   ```
4. Follow the setup prompts:
   * **Link to existing project?** No
   * **Project Name**: `chitkara-challenge-frontend`
   * **Directory**: `./`
   * **Framework**: Vite
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Vercel will build and deploy the React bundle, generating a live production link.
