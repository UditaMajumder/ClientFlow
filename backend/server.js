
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
const Client = require("./models/Client");

const Project = require("./models/Project");

const User = require("./models/User");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const authMiddleware = require("./middleware/authMiddleware");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ClientFlow Backend is working!");
});


app.get("/test-auth", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated!",
    userId: req.userId
  });
});


app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });
    } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
  message: "Login successful",
  token,
  name: user.name
});

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


app.get("/clients", authMiddleware, async (req, res) => {
    const clients = await Client.find({ userId: req.userId });
    res.json(clients);
});

app.get("/clients/:id", authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOne({
  _id: req.params.id,
  userId: req.userId
});

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/clients", authMiddleware, async (req, res) => {
  try {
    const { name, email, company } = req.body;

    if (!name || !email || !company) {
      return res.status(400).json({
        message: "Name, email, and company are required"
      });
    }

    const newClient = new Client({
  ...req.body,
  userId: req.userId
});

    const savedClient = await newClient.save();

    res.json(savedClient);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


app.put("/clients/:id", authMiddleware, async (req, res) => {
  const updatedClient = await Client.findOneAndUpdate(
  {
    _id: req.params.id,
    userId: req.userId
  },
  {
  name: req.body.name,
  email: req.body.email,
  company: req.body.company
},
  { new: true }
);

if (!updatedClient) {
  return res.status(404).json({ message: "Client not found" });
}

  res.json(updatedClient);
});


app.delete("/clients/:id", authMiddleware, async (req, res) => {
  const deletedClient = await Client.findOneAndDelete({
  _id: req.params.id,
  userId: req.userId
});

if (!deletedClient) {
  return res.status(404).json({ message: "Client not found" });
}

  res.json(deletedClient);
});


app.get("/projects", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      userId: req.userId
    }).populate({
      path: "client",
      match: { userId: req.userId }
    });

    res.json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

app.post("/projects", authMiddleware, async (req, res) => {
  try {
    const { name, client, status, deadline, budget, currency } = req.body;

    if (!name || !client || !status || !deadline || !budget) {
      return res.status(400).json({
        message: "Name, client, status, deadline, and budget are required"
      });
    }

    
const clientExists = await Client.findOne({
  _id: client,
  userId: req.userId
});

if (!clientExists) {
  return res.status(403).json({
    message: "You cannot create a project for this client"
  });
}

const existingProject = await Project.findOne({
  name,
  client,
  userId: req.userId
});

if (existingProject) {
  return res.status(400).json({
    message: "A project with this name already exists for this client."
  });
}

const newProject = new Project({
  name,
  client,
  status,
  deadline,
  budget,
  currency: currency || "USD",
  userId: req.userId
});


    const savedProject = await newProject.save();

    res.json(savedProject);
  } catch (error) {
  console.log("PROJECT ERROR:", error);
  res.status(500).json({ message: "Server error" });
}
});


app.get("/projects/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
  _id: req.params.id,
  userId: req.userId
});

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



app.put("/projects/:id", authMiddleware, async (req, res) => {
  try {
    const { name, client, status, deadline, budget, currency, completedAt } = req.body;

const clientExists = await Client.findOne({
  _id: client,
  userId: req.userId
});

if (!clientExists) {
  return res.status(403).json({
    message: "You cannot use this client"
  });
}

const updatedProject = await Project.findOneAndUpdate(
  {
    _id: req.params.id,
    userId: req.userId
  },
  
{
  name,
  client,
  status,
  deadline,
  budget,
  currency,
  completedAt
},

  { new: true }
);
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
  console.log(error);
  res.status(500).json({ message: "Server error" });
}
});



app.delete("/projects/:id", authMiddleware, async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({
  _id: req.params.id,
  userId: req.userId
});

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(deletedProject);
    } catch (error) {
    console.log("DELETE PROJECT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});