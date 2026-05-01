const express = require("express");
const app = express();
require("dotenv").config();
const TaskRoute = require("./routes/task.js");
const userRoute = require("./routes/user.js");
const ProjectRoute = require("./routes/project.js");
const port = process.env.PORT || 8000;
const MongodbConnection = require("./connectDB.js");
const url = process.env.MONGO_URL;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

MongodbConnection(url);

app.use(cookieParser());
// ✅ Allow frontend to send/receive cookies
const allowedOrigins = [
  "http://localhost:5173",
  "https://team-task-manager-ivory.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API is running successfully 🚀");
});
// ✅ Routes
app.use("/user", userRoute);
app.use("/project", ProjectRoute);
app.use("/task", TaskRoute);

app.listen(port, () => console.log(`Server is running on ${port}`));
