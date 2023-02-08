import express from "express";
import { expressErrorHandler } from "@appsignal/nodejs";
import morgan from "morgan";
import bodyParser from "body-parser";
import catchAsync from "./catchAsync.mjs";
import globalErrorHandler from "./globalErrorHandler.mjs";
import AppError from "./appError.mjs";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const mentors = [
  {
    name: "Smith",
    expertise: "Software Engineer",
    available: true,
  },
  {
    name: "Bob",
    expertise: "UX Designer",
    available: false,
  },
];

const funcThree = async () => {
  await Promise.resolve();
  throw new Error("Oops");
};

const funcTwo = async () => {
  await Promise.resolve();
  await funcThree();
};

const funcOne = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  await funcTwo();
};

app.get(
  "/mentors",
  catchAsync(async (req, res) => {
    res.status(200).json({
      statusbar: "success",
      data: {
        mentors,
      },
    });
  })
);

app.get(
  "/trigger_error",
  catchAsync(async (req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    await funcOne();

    res.status(200).json({
      statusbar: "success",
      data: {
        mentors,
      },
    });
  })
);

app.get("/", (_, res) => {
  res.status(200).json({ message: "Welcome." });
});

app.all("*", (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(expressErrorHandler());

app.use(globalErrorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on port ${port}`));
