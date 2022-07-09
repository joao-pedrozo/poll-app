import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const prisma = new PrismaClient();

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.post("/poll", async (req, res) => {
  console.log(req.body);

  const options = Object.keys(req.body)
    .filter((key) => key.startsWith("option-"))
    .map((key) => {
      return {
        id: key,
        name: req.body[key],
      };
    });

  const poll = await prisma.poll.create({
    data: {
      name: req.body.pollTitle,
      options: {
        createMany: {
          data: options.map((option) => ({ name: option.name })),
        },
      },
    },
  });

  res.status(200).send(poll);
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", async (data) => {
    socket.join(data);

    const poll = await prisma.poll.findUnique({
      where: {
        id: data,
      },
      select: {
        name: true,
        options: true,
      },
    });

    socket.nsp.to(data).emit("join_room", { poll });
  });

  socket.on("vote", async (data) => {
    const updatedOption = await prisma.option.update({
      data: {
        votes: {
          increment: 1,
        },
      },
      where: {
        id: data.optionId,
      },
    });

    socket.nsp.to(data.room).emit("receive_vote", updatedOption);
  });
});

server.listen(process.env.PORT || 3001, () => {
  console.log(`listening on *:${process.env.PORT || 3001}`);
});
