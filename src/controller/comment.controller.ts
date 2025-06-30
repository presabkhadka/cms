import { type Request, type Response } from "express";
import { PrismaClient } from "../generated/prisma";
let client = new PrismaClient();

export async function createComment(req: Request, res: Response) {
  try {
    let contentId = Number(req.params.contentId);
    if (!contentId) {
      res.status(400).json({
        msg: "No content id found in params",
      });
      return;
    }

    // @ts-ignore
    let user = req.user;

    let userDetails = await client.users.findFirst({
      where: {
        email: user,
      },
      select: {
        id: true,
      },
    });

    let userId = userDetails!.id;

    let comment = req.body.comment;

    if (!comment) {
      res.status(400).json({
        msg: "Input fields cannot be left empty",
      });
      return;
    }

    await client.comments.create({
      data: {
        content_id: contentId,
        user_id: userId,
        comment,
        status: "PENDING",
      },
    });

    res.status(200).json({
      msg: "Comment created",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function fetchCommentOfPost(req: Request, res: Response) {
  try {
    let contentId = Number(req.params.contentId);
    if (!contentId) {
      res.status(400).json({
        msg: "No content id found in params",
      });
      return;
    }

    let commentsExists = await client.comments.findMany({
      where: {
        content_id: contentId,
        status: "APPROVED",
      },
    });

    if (!commentsExists) {
      res.status(404).json({
        msg: "No comments found for this content",
      });
    }

    res.status(200).json({
      commentsExists,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function approveComment(req: Request, res: Response) {
  try {
    let commentId = Number(req.params.commentId);
    if (!commentId) {
      res.status(400).json({
        msg: "No comment id found in the params",
      });
      return;
    }

    let commentExists = await client.comments.findFirst({
      where: {
        id: commentId,
      },
    });

    if (!commentExists) {
      res.status(404).json({
        msg: "Comment with this id doesnt exists",
      });
      return;
    }

    if (commentExists.status === "APPROVED") {
      res.status(400).json({
        msg: "The comment is already approved",
      });
      return;
    }

    await client.comments.update({
      where: {
        id: commentId,
      },
      data: {
        status: "APPROVED",
      },
    });

    res.status(200).json({
      msg: "Comment approved successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function rejectComment(req: Request, res: Response) {
  try {
    let commentId = Number(req.params.commentId);
    if (!commentId) {
      res.status(400).json({
        msg: "No comment id found in params",
      });
      return;
    }

    let commentExists = await client.comments.findFirst({
      where: {
        id: commentId,
      },
    });

    if (!commentExists) {
      res.status(404).json({
        msg: "No comment with such id found",
      });
      return;
    }

    if (commentExists.status === "REJECTED") {
      res.status(400).json({
        msg: "Comment is already rejected",
      });
      return;
    }

    await client.comments.update({
      where: {
        id: commentId,
      },
      data: {
        status: "REJECTED",
      },
    });

    res.status(200).json({
      msg: "Comment rejected successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    let commentId = Number(req.params.commentId);
    if (!commentId) {
      res.status(400).json({
        msg: "No comment id found in the params",
      });
      return;
    }

    let commentExists = await client.comments.findFirst({
      where: {
        id: commentId,
      },
    });

    if (!commentExists) {
      res.status(404).json({
        msg: "No comments with such id found",
      });
      return;
    }

    await client.comments.delete({
      where: {
        id: commentId,
      },
    });

    res.status(200).json({
      msg: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}
