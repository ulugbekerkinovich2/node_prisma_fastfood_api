const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const authRoute = require("./routes/auth.route");
const categoryRoute = require("./routes/category.route");
const productRoute = require("./routes/product.route");
const app = express();

app.use(express.json());
app.use(cors());
app.use(fileUpload());

app.use("/auth", authRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
})