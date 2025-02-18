import { useState, useCallback } from "react";

import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/Socket/SocketContextProvider";
// import { useSocket } from "../../contexts";

function Home() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const { socket } = useSocket();
  const navigate = useNavigate();
  // socket.emit("join-room", { roomId: "1", emailId: "any@.com" });

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
      navigate(`/room/${room}`);
    },
    [email, room, socket,navigate]
  );

  return (
    <div className=" flex justify-center items-center">
      <form className="mt-8" onSubmit={handleSubmitForm}>
        <div className="">
          <input
            className=" border-2"
            type="email"
            placeholder="Enter your email here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mt-2">
          <input
            className="border-2"
            type="text"
            placeholder="Enter Room code"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </div>

        <div className="mt-2">
          <button
            className="rounded-lg px-2 bg-amber-300 hover:bg-amber-500 cursor-pointer"
            type="submit"
          >
            Join Room
          </button>
        </div>
      </form>
    </div>
  );
}

export default Home;
