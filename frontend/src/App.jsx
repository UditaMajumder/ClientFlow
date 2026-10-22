import { useState, useEffect, useRef } from "react";
import axios from "axios";
import api from "./api";
import "./App.css";



function DeleteConfirmModal({
  deleteConfirm,
  setDeleteConfirm,
  confirmDeleteItem,
}) {
  if (!deleteConfirm.isOpen) return null;

  const isClient = deleteConfirm.type === "client";

  const closeModal = () => {
    setDeleteConfirm({
      isOpen: false,
      type: "",
      id: null,
      name: "",
    });
  };

  return (
    <div
      className="delete-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div
        className="delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="delete-modal-header">
          <div className="delete-modal-icon">🗑️</div>

          <button
            type="button"
            className="delete-modal-close"
            onClick={closeModal}
            aria-label="Close confirmation"
          >
            ×
          </button>
        </div>

        <div className="delete-modal-body">
          <h2 id="delete-modal-title">Are you sure?</h2>

          <p>
            <strong>{deleteConfirm.name}</strong> will be
            permanently removed from your{" "}
            {isClient ? "clients" : "projects"}.
          </p>

          <div className="delete-modal-actions">
            <button
              type="button"
              className="delete-cancel-btn"
              onClick={closeModal}
            >
              {isClient ? "Keep client" : "Keep project"}
            </button>

            <button
              type="button"
              className="delete-confirm-btn"
              onClick={confirmDeleteItem}
            >
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

  const handleLogin = (token, name) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userName", name);
  setUserName(name);
  setToken(token);
};

 const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  setUserName("");
  setLoginEmail("");
  setLoginPassword("");
  setToken(null);
};

const [loginPassword, setLoginPassword] = useState("");
const [loginEmail, setLoginEmail] = useState("");

const [showSignup, setShowSignup] = useState(false);
const [signupName, setSignupName] = useState("");
const [signupEmail, setSignupEmail] = useState("");
const [signupPassword, setSignupPassword] = useState("");


const handleLoginSubmit = () => {
  api.post("/login", {
    email: loginEmail,
    password: loginPassword
  })
  .then((response) => {
    handleLogin(response.data.token, response.data.name);
  })
  .catch((error) => {
    console.log(error);
    alert(error.response?.data?.message || "Login failed.");
  });
};

const handleSignupSubmit = () => {
  if (!signupName || !signupEmail || !signupPassword) {
    alert("Please fill in all fields.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(signupEmail)) {
    alert("Please enter a valid email address.");
    return;
  }

  api.post("/register", {
    name: signupName,
    email: signupEmail,
    password: signupPassword
  })
  .then(() => {
    alert("Account created successfully. Please log in.");

    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setShowSignup(false);
  })
  .catch((error) => {
    console.log(error);
    alert(
      error.response?.data?.message || "Signup failed."
    );
  });
};

  const [showForm, setShowForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);

  const clientFormRef = useRef(null);
  const projectFormRef = useRef(null);

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [company, setCompany] = useState("");

const [projects, setProjects] = useState([]);
const [projectName, setProjectName] = useState("");
const [projectClient, setProjectClient] = useState("");
const [projectStatus, setProjectStatus] = useState("");
const [projectDeadline, setProjectDeadline] = useState("");
const [projectBudget, setProjectBudget] = useState("");
const [projectCurrency, setProjectCurrency] = useState("USD");

const [editingProject, setEditingProject] = useState(null);

const [showCompletedHistory, setShowCompletedHistory] = useState(false);
const [showActiveProjects, setShowActiveProjects] = useState(false);
const [showClients, setShowClients] = useState(false);

const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
const [projectToComplete, setProjectToComplete] = useState(null);

const [deleteConfirm, setDeleteConfirm] = useState({
  isOpen: false,
  type: "",
  id: null,
  name: "",
});

useEffect(() => {
  window.history.replaceState(
    { clientFlow: true, page: "dashboard" },
    "",
    window.location.pathname
  );

  const handlePopState = (event) => {
    const page = event.state?.page || "dashboard";

    setShowClients(page === "clients");
    setShowActiveProjects(page === "active");
    setShowCompletedHistory(page === "completed");
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);


const navigateTo = (page) => {
  window.history.pushState(
    { clientFlow: true, page },
    "",
    window.location.pathname
  );

  setShowClients(page === "clients");
  setShowActiveProjects(page === "active");
  setShowCompletedHistory(page === "completed");
};


useEffect(() => {
  if (!token) return;
  api.get("/clients", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
    .then((response) => {
      setClients(response.data);
    })
    .catch((error) => {
  if (error.response && error.response.status === 401) {
    handleLogout();
    return;
  }

  alert("Unable to load clients. Please make sure the server is running.");
});

  api.get("/projects", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
    .then((response) => {
      setProjects(response.data);
    })
    .catch((error) => {
  if (error.response && error.response.status === 401) {
    handleLogout();
    return;
  }

  alert("Unable to load projects. Please make sure the server is running.");
});
}, [token]);



const handleSaveClient = () => {
  if (!name || !email || !company) {
    alert("Please fill in all fields.");
    return;
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  alert("Please enter a valid email address.");
  return;
}

  if (editingClient) {
  api.put(
  `/clients/${editingClient._id}`,
  {
    name: name,
    email: email,
    company: company,
  },
  {
    headers: {
  Authorization: `Bearer ${token}`
}
  }
)
    .then((response) => {
      const updatedClients = clients.map((client) =>
        client._id === editingClient._id
          ? response.data
          : client
      );

      setClients(updatedClients);
      setEditingClient(null);
    })
    .catch((error) => {
  console.log(error.response);
  alert("Failed to update client.");
});
} else {
  const newClient = {
    name: name,
    email: email,
    company: company,
  };

  api.post("/clients", newClient, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
    .then((response) => {
      setClients([...clients, response.data]);
    })
    .catch((error) => {
      console.log(error);
      alert("Failed to save client.");
    });
}

  setName("");
  setEmail("");
  setCompany("");

  setShowForm(false);
};


const handleDeleteClient = (id) => {
  const clientToDelete = clients.find(
    (client) => client._id === id
  );

  if (!clientToDelete) return;

  setDeleteConfirm({
    isOpen: true,
    type: "client",
    id: id,
    name: clientToDelete.name,
  });
};


const handleSaveProject = () => {
  if (
    !projectName ||
    !projectClient ||
    !projectStatus ||
    !projectDeadline ||
    !projectBudget
  ) {
    alert("Please fill in all project fields.");
    return;
  }

  const newProject = {
  name: projectName,
  client: projectClient,
  status: projectStatus,
  deadline: projectDeadline,
  budget: Number(projectBudget),
  currency: projectCurrency,
};

  api.post("/projects", newProject, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
    .then((response) => {
      const selectedClient = clients.find(
  (client) => client._id === projectClient
);

setProjects([...projects, { ...response.data, client: selectedClient }]);

      setProjectName("");
      setProjectClient("");
      setProjectStatus("");
      setProjectDeadline("");
      setProjectBudget("");

      setShowProjectForm(false);
    })
    .catch((error) => {
  console.log(error);
  alert(error.response?.data?.message || "Failed to save project.");
});
};


const handleUpdateProject = () => {
  const updatedProject = {
  name: projectName || editingProject.name,
  client: projectClient || editingProject.client._id,
  status: projectStatus || editingProject.status,
  deadline: projectDeadline || editingProject.deadline.slice(0, 10),
  budget: Number(projectBudget || editingProject.budget),
  currency: projectCurrency,
};
  
  api.put(
  `/projects/${editingProject._id}`,
  updatedProject,
  {
   headers: {
  Authorization: `Bearer ${token}`
}
  }
)
    
.then((response) => {
  const updatedProjects = projects.map((project) =>
    project._id === editingProject._id
      ? { ...response.data, client: editingProject.client }
      : project
  );

  setProjects(updatedProjects);
  setEditingProject(null);
  setShowProjectForm(false);



setProjectName("");
setProjectClient("");
setProjectStatus("");
setProjectDeadline("");
setProjectBudget("");
})

    .catch((error) => {
      console.log(error);
      alert("Failed to update project.");
    });
};


const handleAddProject = () => {
  setEditingProject(null);
  setProjectName("");
  setProjectClient("");
  setProjectStatus("");
  setProjectDeadline("");
  setProjectBudget("");
  setProjectCurrency("USD");
  setShowProjectForm(true);
};



const handleDeleteProject = (id) => {
  const projectToDelete = projects.find(
    (project) => project._id === id
  );

  if (!projectToDelete) return;

  setDeleteConfirm({
    isOpen: true,
    type: "project",
    id: id,
    name: projectToDelete.name,
  });
};


const confirmDeleteItem = () => {
  const { type, id } = deleteConfirm;

  if (!id || !type) return;

  const endpoint =
    type === "client"
      ? `/clients/${id}`
      : `/projects/${id}`;

  api.delete(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(() => {
      if (type === "client") {
        setClients((current) =>
          current.filter((client) => client._id !== id)
        );
      } else {
        setProjects((current) =>
          current.filter((project) => project._id !== id)
        );
      }

      setDeleteConfirm({
        isOpen: false,
        type: "",
        id: null,
        name: "",
      });
    })
    .catch((error) => {
      console.log(error);

      alert(
        type === "client"
          ? "Failed to delete client."
          : "Failed to delete project."
      );

      setDeleteConfirm({
        isOpen: false,
        type: "",
        id: null,
        name: "",
      });
    });
};

const handleCompleteProject = (project) => {

  
  const completedProject = {
  name: project.name,
  client: project.client._id,
  status: "Completed",
  deadline: project.deadline.slice(0, 10),
  budget: project.budget,
  currency: project.currency,
  completedAt: new Date().toISOString()
};

 api.put(
  `/projects/${project._id}`,
    completedProject,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then((response) => {
      const updatedProjects = projects.map((item) =>
        item._id === project._id
          ? { ...response.data, client: project.client }
          : item
      );

      setProjects(updatedProjects);
    })
    .catch((error) => {
      console.log(error);
      alert("Failed to complete project.");
    });
};


const projectCurrencies = [...new Set(projects.map((project) => project.currency))];

let projectValue = "₹0";

if (projectCurrencies.length === 1) {
  const total = projects.reduce(
    (sum, project) => sum + Number(project.budget),
    0
  );

  const symbol =
    projectCurrencies[0] === "USD"
      ? "$"
      : projectCurrencies[0] === "EUR"
      ? "€"
      : projectCurrencies[0] === "GBP"
      ? "£"
      : "₹";

  projectValue = `${symbol}${total}`;
} else if (projectCurrencies.length > 1) {
  projectValue = "Multiple currencies";
}


 if (!token) {
  return (
    <div className="auth-page">
      <div className="auth-card">

        {!showSignup ? (
          <>
            <h2>Login to ClientFlow</h2>

            <p className="auth-subtitle">
              Manage your clients and projects in one place.
            </p>

            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              autoComplete="off"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              autoComplete="new-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button
              className="auth-button"
              onClick={handleLoginSubmit}
            >
              Login
            </button>

            <p className="auth-switch">
              Don't have an account?{" "}
              <button
                className="auth-link"
                onClick={() => setShowSignup(true)}
              >
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            <h2>Create your ClientFlow account</h2>

            <p className="auth-subtitle">
              Start managing your clients and projects in one place.
            </p>

            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />

            <button
              className="auth-button"
              onClick={handleSignupSubmit}
            >
              Create Account
            </button>

            <p className="auth-switch">
              Already have an account?{" "}
              <button
                className="auth-link"
                onClick={() => setShowSignup(false)}
              >
                Log in
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

if (showActiveProjects) {
  return (
    <div className="app">
      <header className="navbar">
        <h1 className="logo">ClientFlow</h1>

        <button
          className="back-btn"
          onClick={() => setShowActiveProjects(false)}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="completed-history">
        <div className="completed-history-header">
          <h2>Active Projects</h2>
          <p>Manage the projects you're currently working on.</p>
        </div>

        {projects.filter((project) => project.status !== "Completed").length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <h4>No active projects</h4>
            <p>Your active projects will appear here.</p>
          </div>
        ) : (
          projects
            .filter((project) => project.status !== "Completed")
            .map((project) => (
              <div className="project-card" key={project._id}>
                <h4>🚀 {project.name}</h4>

                <p>Client: {project.client.name}</p>

                <p>Status: {project.status}</p>

                <p>
                  Deadline:{" "}
                  {new Date(project.deadline).toLocaleDateString()}
                </p>

                <p>
                  Budget:{" "}
                  {project.currency === "USD"
                    ? "$"
                    : project.currency === "EUR"
                    ? "€"
                    : project.currency === "GBP"
                    ? "£"
                    : "₹"}
                  {project.budget}
                </p>

               <button
               onClick={() => {
    setShowActiveProjects(false);
    setEditingProject(project);
    setProjectName(project.name);
    setProjectClient(project.client._id);
    setProjectStatus(project.status);
    setProjectDeadline(project.deadline.slice(0, 10));
    setProjectBudget(String(project.budget));
    setProjectCurrency(project.currency || "USD");
    setShowProjectForm(true);
  }}
>
  Edit
</button>

                <button onClick={() => handleDeleteProject(project._id)}>
                  Delete
                </button>

                <button
  onClick={() => {
    setProjectToComplete(project);
    setShowCompleteConfirm(true);
  }}
>
                  Complete
                </button>
              </div>
            ))
        )}
      
        </main>

      {showCompleteConfirm && (
        <div className="complete-modal-overlay">
          <div className="complete-modal">
            <div className="complete-modal-icon">🏆</div>

            <h2>Complete this project?</h2>

            <p>
              This will move the project from Active Projects to your
              Completed Work history.
            </p>

            <div className="complete-modal-actions">
              <button
                className="complete-cancel-btn"
                onClick={() => {
                  setShowCompleteConfirm(false);
                  setProjectToComplete(null);
                }}
              >
                Cancel
              </button>

              <button
                className="complete-confirm-btn"
                onClick={() => {
                  handleCompleteProject(projectToComplete);
                  setShowCompleteConfirm(false);
                  setProjectToComplete(null);
                }}
              >
                Complete Project
              </button>
            </div>
          </div>
        </div>
      )}

<DeleteConfirmModal
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        confirmDeleteItem={confirmDeleteItem}
      />

    </div>
  );
}

if (showClients) {
  return (
    <div className="app">
      <header className="navbar">
        <h1 className="logo">ClientFlow</h1>

        <button
          className="back-btn"
          onClick={() => setShowClients(false)}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="completed-history">
        <div className="completed-history-header">
          <h2>All Clients</h2>
          <p>Manage all your clients in one place.</p>
        </div>

        {clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h4>No clients yet</h4>
            <p>Add your first client to get started.</p>
          </div>
        ) : (
          clients.map((client) => (
            <div className="client-card" key={client._id}>
              <h4>👤 {client.name}</h4>
              <p>Email: {client.email}</p>
              <p>Company: {client.company}</p>

              <button
                onClick={() => {
                  setShowClients(false);
                  setEditingClient(client);
                  setName(client.name);
                  setEmail(client.email);
                  setCompany(client.company);
                  setShowForm(true);
                }}
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteClient(client._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </main>

<DeleteConfirmModal
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        confirmDeleteItem={confirmDeleteItem}
      />

    </div>
  );
}

if (showCompletedHistory) {
  return (
    <div className="app">
      <header className="navbar">
        <h1 className="logo">ClientFlow</h1>
        <button
         className="back-btn"
         onClick={() => setShowCompletedHistory(false)}
        >
          ← Back to Dashboard
        </button>
      </header>

      <main className="completed-history">
  <div className="completed-history-header">
    <h2>Completed Work History 🏆</h2>
    <p>All your completed projects will appear here.</p>
  </div>

  {projects.filter((project) => project.status === "Completed").length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">🏆</div>
      <h4>No completed work yet</h4>
      <p>Projects you complete will appear here.</p>
    </div>
  ) : (
    projects
      .filter((project) => project.status === "Completed")
      .map((project) => (
        <div className="completed-project-card" key={project._id}>
          <h4>{project.name}</h4>

          <p>Client: {project.client.name}</p>

          <p>
            Completed: {project.completedAt
            ? new Date(project.completedAt).toLocaleDateString()
            : "Date unavailable"}
          </p>

          <p>
            Amount:{" "}
            {project.currency === "USD"
              ? "$"
              : project.currency === "EUR"
              ? "€"
              : project.currency === "GBP"
              ? "£"
              : "₹"}
            {project.budget} {project.currency}
          </p>

          <button
           className="delete-btn"
           onClick={() => handleDeleteProject(project._id)}
          >
             Delete
          </button>
        </div>
      ))
  )}
</main>

 <DeleteConfirmModal
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          confirmDeleteItem={confirmDeleteItem}
        />

    </div>
  );
}


return (
    <div className="app">
      {/* Top navigation */}
      <header className="navbar">
        <h1 className="logo">ClientFlow</h1>

        <button
  className="add-client-btn"
  onClick={() => setShowForm(true)}
>
  + Add Client
</button>


<button
  className="add-client-btn"
  onClick={handleAddProject}
>
  + Add Project
</button>

<button
  className="add-client-btn"
  onClick={handleLogout}
>
  Logout
</button>

      </header>

      {/* Main content */}
      <main className="dashboard">
        {(showForm || editingClient) && (
         <section ref={clientFormRef} className="client-form">
          <h3>{editingClient ? "Edit Client" : "Add New Client"}</h3>

    <input
  type="text"
  placeholder="Client name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<input
  type="email"
  placeholder="Email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<input
  type="text"
  placeholder="Company"
  value={company}
  onChange={(e) => setCompany(e.target.value)}
/>
    <div>
      <button
  className="save-btn"
  onClick={handleSaveClient}
>
  Save Client
</button>

      <button
  className="cancel-btn"
  onClick={() => {
    setShowForm(false);
    setEditingClient(null);
    setName("");
    setEmail("");
    setCompany("");
  }}
>
  Cancel
</button>
    </div>
  </section>
)}



{(showProjectForm || editingProject) && (
  <section ref={projectFormRef} className="client-form">
    <h3>{editingProject ? "Edit Project" : "Add New Project"}</h3>

    <input
      type="text"
      placeholder="Project name"
      value={projectName || (editingProject ? editingProject.name : "")}
      onChange={(e) => setProjectName(e.target.value)}
    />

    <select
      value={projectClient || (editingProject ? editingProject.client._id : "")}
      onChange={(e) => setProjectClient(e.target.value)}
    >
      <option value="">Select Client</option>

      {clients.map((client) => (
        <option key={client._id} value={client._id}>
          {client.name}
        </option>
      ))}
    </select>

    <select
      value={projectStatus || (editingProject ? editingProject.status : "")}
      onChange={(e) => setProjectStatus(e.target.value)}
    >
      <option value="">Select Status</option>
      <option value="Not Started">Not Started</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>

    <input
      type="date"
      value={projectDeadline || (editingProject?.deadline ? editingProject.deadline.slice(0, 10) : "")}
      onChange={(e) => setProjectDeadline(e.target.value)}
    />

    <select
  value={projectCurrency}
  onChange={(e) => setProjectCurrency(e.target.value)}
>
  <option value="USD">USD ($)</option>
  <option value="INR">INR (₹)</option>
  <option value="EUR">EUR (€)</option>
  <option value="GBP">GBP (£)</option>
</select>

<input
  type="number"
  placeholder="Budget"
  value={projectBudget}
  onChange={(e) => setProjectBudget(e.target.value)}
/>

    <div>
      <button
  className="save-btn"
  onClick={editingProject ? handleUpdateProject : handleSaveProject}
>
  {editingProject ? "Update Project" : "Save Project"}
</button>

      <button
        className="cancel-btn"
        onClick={() => {
         setShowProjectForm(false);
         setEditingProject(null);
}}
      >
        Cancel
      </button>
    </div>
  </section>
)}



        <section className="welcome">
          <p className="eyebrow">DASHBOARD</p>
          <h2>
  {new Date().getHours() < 12
    ? "Good morning"
    : new Date().getHours() < 17
    ? "Good afternoon"
    : "Good evening"}{userName ? `, ${userName}` : ""}{" "}
  👋
</h2>
          <p>Manage your clients and projects in one place.</p>
        </section>

        {/* Overview cards */}
        <section className="overview">
          <h3>Overview</h3>

          <div className="stats">

          <div
  className="stat-card"
  onClick={() => navigateTo("clients")}
  style={{ cursor: "pointer" }}
>
  <span>👥 Clients</span>
<strong>{clients.length}</strong>
<small className="stat-link">See all clients →</small>
</div>
            <div
            className="stat-card"
            onClick={() => navigateTo("active")}
            >
            <span>🚀 Active Projects</span>
<strong>{projects.filter((project) => project.status !== "Completed").length}</strong>
<small className="stat-link">See all projects →</small>
            </div>

            <div
              className="stat-card"
              onClick={() => navigateTo("completed")}
              style={{ cursor: "pointer" }}
             >
          <span>🏆 Completed Work</span>
<strong>{projects.filter((project) => project.status === "Completed").length}</strong>
<small className="stat-link">View completed work →</small>
          
</div>

</div>

</section>

        {/* Recent clients */}
 <section className="recent-clients">
          <div className="section-header">
            <h3>Recent Clients</h3>
            <span>{clients.length} clients</span>
          </div>

  {clients.length === 0 && (
     <div className="empty-state">
       <div className="empty-icon">👥</div>
        <h4>No clients yet</h4>
        <p>Add your first client to get started.</p>

       <button
  className="empty-btn"
  onClick={() => {
    setShowForm(true);

    setTimeout(() => {
      clientFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 100);
  }}
>
  + Add Your First Client
</button>
      </div>
  )}
  {clients.map((client) => (
  <div className="client-card" key={client.email}>
    <h4>{client.name}</h4>
    <p>{client.email}</p>
    <p>{client.company}</p>

    <button onClick={() => {
  setEditingClient(client);
  setName(client.name);
  setEmail(client.email);
  setCompany(client.company);
  window.scrollTo({ top: 0, behavior: "smooth" });
}}>
  Edit
</button>

<button onClick={() => handleDeleteClient(client._id)}>
  Delete
</button>
  </div>
))}
        </section>


{/* Projects */}
<section className="recent-clients">
  <div className="section-header">
    <h3>Active Projects</h3>
    <span>{projects.filter((project) => project.status !== "Completed").length} projects</span>
  </div>


{projects.length === 0 && (
  <div className="empty-state">
    <div className="empty-icon">📋</div>
    <h4>No projects yet</h4>
    <p>Add your first project to get started.</p>

    <button
  className="empty-btn"
  onClick={() => {
    setShowProjectForm(true);

    setTimeout(() => {
      projectFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 100);
  }}
>
  + Add Your First Project
</button>
  </div>
)}


{projects.filter((project) => project.status !== "Completed").map((project) => (
  <div className="project-card" key={project._id}>
    <h4>{project.name}</h4>
    <p>Client: {project.client.name}</p>
    <p>Status: {project.status}</p>
    <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
    <p>
  Budget:{" "}
  {project.currency === "USD"
    ? "$"
    : project.currency === "EUR"
    ? "€"
    : project.currency === "GBP"
    ? "£"
    : "₹"}
  {project.budget}
</p>

  <button onClick={() => {
  setEditingProject(project);
  setProjectName(project.name);
  setProjectClient(project.client._id);
  setProjectStatus(project.status);
  setProjectDeadline(project.deadline.slice(0, 10));
  setProjectBudget(String(project.budget));
  setProjectCurrency(project.currency || "USD");
  window.scrollTo({ top: 0, behavior: "smooth" });
}}>
  Edit
</button>

<button onClick={() => handleDeleteProject(project._id)}>
  Delete
</button>

<button
  onClick={() => {
    setProjectToComplete(project);
    setShowCompleteConfirm(true);
  }}
>
  Complete
</button>


  </div>
))}


  </section>

  

       </main>

{showCompleteConfirm && (
  <div className="complete-modal-overlay">
    <div className="complete-modal">
      <div className="complete-modal-icon">🏆</div>

      <h2>Complete this project?</h2>

      <p>
        This will move the project from Active Projects to your
        Completed Work history.
      </p>

      <div className="complete-modal-actions">
        <button
          className="complete-cancel-btn"
          onClick={() => {
            setShowCompleteConfirm(false);
            setProjectToComplete(null);
          }}
        >
          Cancel
        </button>

        <button
          className="complete-confirm-btn"
          onClick={() => {
            handleCompleteProject(projectToComplete);
            setShowCompleteConfirm(false);
            setProjectToComplete(null);
          }}
        >
          Complete Project
        </button>
      </div>
    </div>
  </div>
)}


      <DeleteConfirmModal
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        confirmDeleteItem={confirmDeleteItem}
      />


</div>
  );
}

export default App;