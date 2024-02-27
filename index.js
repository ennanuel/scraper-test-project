import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bp from "body-parser";

import searchRoute from "./api/routes/search.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
    cors({
        origin: '*'
    })
);

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/v1/api/search", searchRoute);

app.listen(PORT, () => {
    console.log('Server running on port %s', PORT);
})