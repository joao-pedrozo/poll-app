import { render } from "@testing-library/react";
import PollPage from "./[id]";
import "@testing-library/jest-dom/extend-expect";

const mockPoll = {
  name: "Test Poll",
  options: [
    { id: "1", name: "Option 1", pollId: "poll_1", votes: 2 },
    { id: "2", name: "Option 2", pollId: "poll_1", votes: 3 },
  ],
};

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn(() => ({
      query: { id: "poll_1" },
    })),
  };
});

jest.mock("socket.io-client", () => {
  return {
    io: jest.fn(() => {
      return {
        emit: jest.fn(),
        once: jest.fn((event, callback) => {
          if (event === "join_room") {
            callback({ poll: mockPoll });
          }
        }),
        on: jest.fn((event, callback) => {
          // if (event === 'receive_vote') {
          //   callback({ id: '1', votes: 3 });
          // }
        }),
        off: jest.fn(),
      };
    }),
  };
});

describe("PollPage", () => {
  it.only("should display the correct poll data", async () => {
    const { getByText } = render(<PollPage />);

    expect(getByText(mockPoll.name)).toBeInTheDocument();

    mockPoll.options.forEach((option) => {
      const optionTitle = getByText(option.name);

      expect(optionTitle).toBeInTheDocument();
    });
  });

  it("should display the correct vote percentage", async () => {
    const { getByText, container } = render(<PollPage />);

    getByText(mockPoll.options[0].name).click();

    // mockPoll.options.forEach(option => {
    //   const optionTitle = getByText('asdas');

    //   expect(optionTitle).toBeInTheDocument();
    // });
  });
});
