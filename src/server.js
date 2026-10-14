<<<<<<< HEAD
// Entry point: imports the app and starts listening.
=======
>>>>>>> 9eda3b9fbd17ea6cb1a28d6bf045855c73526414
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Server running at http://localhost:${PORT}`);
=======
  console.log(`Server listening on http://localhost:${PORT}`);
>>>>>>> 9eda3b9fbd17ea6cb1a28d6bf045855c73526414
});
