import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../../service/peer";
import { useSocket } from "../../contexts/Socket/SocketContextProvider";
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";

// import { usePeer, useSocket } from "../../contexts";

function VideoCall() {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState("");
  const [remoteStream, setRemoteStream] = useState("");

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // const {
  //   peer,
  //   createOffer,
  //   createAnswer,
  //   setRemoteAns,
  //   sendStream,
  //   remoteStream,
  // } = usePeer();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: WebTransportDatagramDuplexStream, // true
      });

      setMyStream(stream);

      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    console.log("Peer", peer.peer);

    for (const track of myStream.getTracks()) {
      console.log({ track, myStream });

      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    // console.log("Opps! Neg. Needed");
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [socket, remoteSocketId]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
      console.log("RemoteStream", remoteStream);
    });
  }, [setRemoteStream, remoteStream]);

  useEffect(() => {
    console.log();

    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  // for mick mute and unmute, video and leave button function

  const toggleMic = () => {
    if (myStream) {
      myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsMicOn((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOn((prev) => !prev);
    }
  };

  const leaveCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
    }
    setRemoteStream(null);
    setRemoteSocketId(null);
    socket.emit("user:left", { to: remoteSocketId }); // Notify other user
  };

  return (
    <div>
      <h1 className="text-amber-600 text-2xl text-center font-bold bg-emerald-200 px-12 py-4">
        VideoCall Room
      </h1>

      <h4 className="text-center font-bold text-2xl my-4">
        {remoteSocketId ? "Connected" : "No one in room"}
      </h4>

      <div className="text-center">
        {myStream && (
          <button
            className="cursor-pointer border-2 rounded-sm px-2"
            onClick={sendStreams}
          >
            Send Stream
          </button>
        )}

        {remoteSocketId && (
          <button
            className="cursor-pointer mx-2 border-2 rounded-sm px-2"
            onClick={handleCallUser}
          >
            CALL
          </button>
        )}

        <div className="flex justify-center mt-4">
          {myStream && (
            <>
              <h1 className="text-xl font-bold">My Stream</h1>
              <ReactPlayer
                playing
                height="100px"
                width="200px"
                url={myStream}
              />
            </>
          )}
          {remoteStream && (
            <>
              <h1 className="text-xl font-bold">Remote Stream</h1>
              <ReactPlayer
                playing
                height="100px"
                width="200px"
                url={remoteStream}
                // playIcon={<FiVideo />}
              />
            </>
          )}
        </div>

        {/* <ReactPlayer url={myStream} playing muted />
      <ReactPlayer url={remoteStream} playing /> */}

        <div className="flex justify-center gap-4 mt-4">
          <button
            className="border-2 rounded-sm px-4 py-2 bg-gray-200"
            onClick={toggleMic}
          >
            {isMicOn ? <FiMic /> : <FiMicOff className="text-red-500" />}
          </button>

          <button
            className="border-2 rounded-sm px-4 py-2 bg-gray-200"
            onClick={toggleVideo}
          >
            {isVideoOn ? <FiVideo /> : <FiVideoOff className="text-red-500" />}
          </button>

          <button
            className="border-2 rounded-sm px-4 py-2 bg-red-500 text-white"
            onClick={leaveCall}
          >
            Leave Call
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default VideoCall;
