import { type Request, type Response } from "express";
import { PrismaClient } from "../generated/prisma";

let client = new PrismaClient();

export async function fetchAllRevision(req: Request, res: Response) {
  try {
    let contentId = Number(req.params.contentId);
    if (!contentId) {
      res.status(400).json({
        msg: "No content id provided in the params",
      });
      return;
    }

    let revisions = await client.revisions.findMany({
      where: {
        content_id: contentId,
      },
    });

    if (!revisions) {
      res.status(404).json({
        msg: "No any revision found, Try updating the content to create a revision of it",
      });
      return;
    }

    res.status(200).json({
      revisions,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong witht the server",
    });
  }
}

export async function fetchSingleRevision(req: Request, res: Response) {
  try {
    let revisionId = Number(req.params.revisionId);
    if (!revisionId) {
      res.status(400).json({
        msg: "No revision id found in the params",
      });
      return;
    }

    let revisions = await client.revisions.findFirst({
      where: {
        id: revisionId,
      },
    });

    if (!revisions) {
      res.status(404).json({
        msg: "No revision found with that id",
      });
      return;
    }

    res.status(200).json({
      revisions,
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
