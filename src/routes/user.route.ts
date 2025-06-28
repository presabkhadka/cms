import e, { Router } from "express";
import {
  addCategory,
  createContent,
  createTag,
  deleteCategory,
  deleteContent,
  deleteTag,
  deleteUser,
  editUserDetails,
  fetchCategory,
  fetchContent,
  fetchTag,
  updateCategory,
  updateContent,
  updateTag,
  userDetails,
  userLogin,
  userSignup,
  viewAllUsers,
  viewRole,
} from "../controller/user.controller";
import userMiddleware from "../middleware/user.middleware";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files and pdf files are allowed!"));
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

const userRouter = Router();

userRouter.post("/signup", userSignup);
userRouter.post("/login", userLogin);
userRouter.get("/details", userMiddleware, userDetails);
userRouter.patch(
  "/update-details/:userId",
  userMiddleware,
  upload.single("avatar"),
  editUserDetails
);
userRouter.delete("/delete/:userId", deleteUser);
userRouter.get("/roles", viewRole);
userRouter.get("/all-users", viewAllUsers);
userRouter.post("/add-category", userMiddleware, addCategory);
userRouter.get("/category", fetchCategory);
userRouter.delete(
  "/delete-category/:categoryId",
  userMiddleware,
  deleteCategory
);
userRouter.patch(
  "/update-category/:categoryId",
  userMiddleware,
  updateCategory
);
userRouter.post("/add-tag", userMiddleware, createTag);
userRouter.get("/tag", fetchTag);
userRouter.delete("/delete-tag/:tagId", userMiddleware, deleteTag);
userRouter.patch("/update-tag/:tagId", userMiddleware, updateTag);
userRouter.get("/content", fetchContent);
userRouter.post("/add-content", userMiddleware, upload.single("image"),createContent)
userRouter.patch("/update-content/:contentId", userMiddleware, upload.single("image"), updateContent)
userRouter.delete("/delete-content/:contentId", userMiddleware, deleteContent)

export { userRouter };
