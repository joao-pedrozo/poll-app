import type { NextPage } from "next";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../components/ProgressBar";
import ReturnToHome from "../components/ReturnToHome";

const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");

interface Option {
  id: string;
  name: string;
  pollId: string;
  votes: number;
}

interface Poll {
  name: string;
  options: Option[];
}

const PollPage: NextPage = () => {
  const [poll, setPoll] = useState<Poll>(null);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query.id) {
      socket.emit("join_room", router.query.id);
      socket.once("join_room", (data) => {
        setPoll(data.poll);

        if (!data.poll) {
          setNotFound(true);
        }
      });
    }
  }, [router.query.id]);

  useEffect(() => {
    socket.on("receive_vote", (data) => {
      const newOptions = poll?.options?.map((option) => {
        if (option.id === data.id) {
          return {
            ...option,
            votes: data.votes,
          };
        }
        return option;
      });

      setPoll({
        ...poll,
        options: newOptions,
      });
    });

    return () => {
      socket.off("receive_vote");
    };
  }, [poll]);

  const handleOnOptionClick = (optionId) => {
    socket.emit("vote", { room: router.query.id, optionId });

    const votedPolls = JSON.parse(localStorage.getItem("votedPolls")) || [];

    localStorage.setItem(
      "votedPolls",
      JSON.stringify(votedPolls.concat(router.query.id as string))
    );
  };

  const getOptionVotePercentage = (optionId: string) => {
    const totalVotes = poll.options.reduce((acc, option) => {
      return acc + option.votes;
    }, 0);

    const optionVotes = poll.options.find(
      (option) => option.id === optionId
    ).votes;

    if (optionVotes) {
      return parseInt(((optionVotes / totalVotes) * 100).toFixed(0));
    }

    return 0;
  };

  const hasCreatedPoll = () => {
    const createdPolls = JSON.parse(localStorage.getItem("createdPolls")) || [];

    return !!createdPolls.find(
      (createdPollId) => createdPollId === router.query.id
    );
  };

  const hasAlreadyVoted = () => {
    const votedPolls = JSON.parse(localStorage.getItem("votedPolls")) || [];

    return !!votedPolls.find((votedPollId) => votedPollId === router.query.id);
  };

  const sortedOptions = () => {
    return poll.options.sort((option1, option2) =>
      option1.votes > option2.votes ? -1 : 1
    );
  };

  return (
    <div className="mx-10">
      {poll && (
        <>
          <ReturnToHome />
          <h1 className="mx-auto font-bold text-center text-6xl text-purple-700">
            {poll.name}
          </h1>
          <b className="block w-full mx-auto mb-4 text-center text-blue-600 cursor-pointer">
            copy link
          </b>
          {!hasCreatedPoll() && !hasAlreadyVoted() && (
            <ul className="flex items-center mx-auto gap-4 flex-col">
              {poll.options.map((option) => (
                <li
                  key={option.id}
                  className="flex w-full p-2 max-w-md bg-slate-200 hover:bg-slate-300 transition-all cursor-pointer rounded-md"
                  onClick={() => handleOnOptionClick(option.id)}
                >
                  <span className="break-all">{option.name}</span>
                </li>
              ))}
            </ul>
          )}
          {(hasAlreadyVoted() || hasCreatedPoll()) && (
            <ul className="flex items-center mx-auto gap-4 flex-col">
              {sortedOptions().map((option) => (
                <li key={option.id} className="w-full max-w-md">
                  <div className="flex justify-between">
                    <span>{option.name}</span>
                    <span>{`${getOptionVotePercentage(option.id)}%`}</span>
                  </div>
                  <ProgressBar
                    percentage={getOptionVotePercentage(option.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {notFound && (
        <div>
          <ReturnToHome />
          <h1 className="mx-auto font-bold text-center text-6xl text-purple-700">
            Poll not found
          </h1>
        </div>
      )}
    </div>
  );
};

export default PollPage;
