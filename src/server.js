// Entry point: imports the app and starts listening.
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Server listening on http://localhost:${PORT}`);
=======
  console.log(`Server running at http://localhost:${PORT}`);
>>>>>>> 75debf54854a0ad3d4364b0f9d01fe04616281bb
});
