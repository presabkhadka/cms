import { Router } from "express";
import {
  deleteUser,
  editUserDetails,
  userDetails,
  userLogin,
  userSignup,
  viewAllUsers,
  viewRole,
} from "../controller/user.controller";
import userMiddleware from "../middleware/user.middleware";
import multer from "multer";
import path from "path";
import {
  addCategory,
  deleteCategory,
  fetchCategory,
  updateCategory,
} from "../controller/category.controller";
import {
  createTag,
  deleteTag,
  fetchTag,
  updateTag,
} from "../controller/tag.controller";
import {
  createContent,
  deleteContent,
  fetchContent,
  updateContent,
} from "../controller/content.controller";
import {
  fetchAllRevision,
  fetchSingleRevision,
} from "../controller/revision.controller";
import {
  approveComment,
  createComment,
  deleteComment,
  fetchCommentOfPost,
  rejectComment,
} from "../controller/comment.controller";
import {
  createSettings,
  deleteSetting,
  editSetting,
  getSettings,
} from "../controller/settings.controller";

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

// user auth routes
userRouter.post("/signup", userSignup);
userRouter.post("/login", userLogin);
userRouter.get("/details", userMiddleware, userDetails);
userRouter.patch(
  "/update-details/:userId",
  userMiddleware,
  upload.single("avatar"),
  editUserDetails
);
userRouter.delete("/delete/:userId", userMiddleware, deleteUser);

// role routes
userRouter.get("/roles", viewRole);
userRouter.get("/all-users", viewAllUsers);

// category routes
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

// tag routes
userRouter.post("/add-tag", userMiddleware, createTag);
userRouter.get("/tag", fetchTag);
userRouter.delete("/delete-tag/:tagId", userMiddleware, deleteTag);
userRouter.patch("/update-tag/:tagId", userMiddleware, updateTag);

// content routes
userRouter.get("/content", fetchContent);
userRouter.post(
  "/add-content",
  userMiddleware,
  upload.single("image"),
  createContent
);
userRouter.patch(
  "/update-content/:contentId",
  userMiddleware,
  upload.single("image"),
  updateContent
);
userRouter.delete("/delete-content/:contentId", userMiddleware, deleteContent);

// revision routes
userRouter.get(
  "/content/:contentId/revisions",
  userMiddleware,
  fetchAllRevision
);
userRouter.get("/revision/:revisionId", userMiddleware, fetchSingleRevision);

// comment routes
userRouter.post(
  "/content/:contentId/comments",
  userMiddleware,
  upload.none(),
  createComment
);
userRouter.get(
  "/content/:contentId/comments",
  userMiddleware,
  fetchCommentOfPost
);
userRouter.patch("/comment/approve/:commentId", userMiddleware, approveComment);
userRouter.patch("/comment/reject/:commentId", userMiddleware, rejectComment);
userRouter.delete("/comment/delete/:commentId", userMiddleware, deleteComment);

// settings routes
userRouter.post("/settings/create", userMiddleware, createSettings);
userRouter.patch(
  "/settings/update/:settingsId",
  userMiddleware,
  upload.none(),
  editSetting
);
userRouter.delete(
  "/settings/delete/:settingsId",
  userMiddleware,
  deleteSetting
);
userRouter.get("/settings", getSettings);

export { userRouter };
