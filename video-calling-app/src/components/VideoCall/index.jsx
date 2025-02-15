// import { useEffect, useRef, useState } from "react";
// import { FiMic, FiMicOff, FiPhone, FiVideo, FiVideoOff } from "react-icons/fi";
// import io from "socket.io-client";

// const SOCKET_SERVER_URL = "http://localhost:5000"; // Change as needed
// const ROOM_ID = "my-video-room"; // This could be dynamic from a shared link or URL param

// const VideoCall = () => {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [peerConnection, setPeerConnection] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);

//   useEffect(() => {
//     // Connect to signaling server
//     const socketClient = io(SOCKET_SERVER_URL);
//     setSocket(socketClient);

//     // Get local media stream (video and audio)
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setLocalStream(stream);
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }

//         // Emit join event to signaling server
//         socketClient.emit("join-room", ROOM_ID);

//         // Create peer connection and add local stream tracks
//         const pc = createPeerConnection(socketClient, stream);
//         setPeerConnection(pc);
//       })
//       .catch((error) => {
//         console.error("Error accessing media devices.", error);
//       });

//     // Clean up on unmount
//     return () => {
//       if (socketClient) socketClient.disconnect();
//       if (localStream) localStream.getTracks().forEach((track) => track.stop());
//       if (peerConnection) peerConnection.close();
//     };
//   }, []);

//   // Create RTCPeerConnection and set up signaling event handlers
//   const createPeerConnection = (socketClient, stream) => {
//     const pc = new RTCPeerConnection({
//       iceServers: [
//         { urls: "stun:stun.l.google.com:19302" }, // public STUN server
//       ],
//     });

//     // Add local stream tracks to the connection
//     stream.getTracks().forEach((track) => {
//       pc.addTrack(track, stream);
//     });

//     // Handle remote tracks
//     const remoteStream = new MediaStream();
//     pc.ontrack = (event) => {
//       event.streams[0].getTracks().forEach((track) => {
//         remoteStream.addTrack(track);
//       });
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = remoteStream;
//       }
//     };

//     // When ICE candidates are generated, send them to the other peer
//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         // Here, we assume that there is only one other participant.
//         // You might store the remote peer's socket id on "user-connected"
//         socketClient.emit("ice-candidate", {
//           target: remoteSocketId, // defined below when the other user connects
//           candidate: event.candidate,
//         });
//       }
//     };

//     // Listen for signaling messages

//     // When receiving an offer, set remote description, create an answer, and send it back.
//     socketClient.on("offer", async (data) => {
//       await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       socketClient.emit("answer", {
//         target: data.caller,
//         sdp: pc.localDescription,
//       });
//     });

//     // When receiving an answer, set it as the remote description.
//     socketClient.on("answer", async (data) => {
//       await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
//     });

//     // When receiving an ICE candidate from remote peer.
//     socketClient.on("ice-candidate", async (data) => {
//       try {
//         await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//       } catch (e) {
//         console.error("Error adding received ice candidate", e);
//       }
//     });

//     // When a new user connects, create an offer to connect.
//     let remoteSocketId = null; // store remote user id for sending messages
//     socketClient.on("user-connected", async (userId) => {
//       remoteSocketId = userId;
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       socketClient.emit("offer", {
//         target: userId,
//         sdp: pc.localDescription,
//       });
//     });

//     return pc;
//   };

//   // Toggle audio (mute/unmute)
//   const toggleAudio = () => {
//     if (localStream) {
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !track.enabled;
//       });
//       setIsAudioMuted(!isAudioMuted);
//     }
//   };

//   // Toggle video (on/off)
//   const toggleVideo = () => {
//     if (localStream) {
//       localStream.getVideoTracks().forEach((track) => {
//         track.enabled = !track.enabled;
//       });
//       setIsVideoOff(!isVideoOff);
//     }
//   };

//   // Leave the call
//   const leaveCall = () => {
//     if (socket) socket.disconnect();
//     if (localStream) localStream.getTracks().forEach((track) => track.stop());
//     if (peerConnection) peerConnection.close();
//     // For simplicity, reload the page or redirect the user.
//     window.location.reload();
//   };

//   return (
//     <div style={{ textAlign: "center", padding: "20px" }}>
//       <h2>Video Call Room: {ROOM_ID}</h2>
//       <div
//         style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}
//       >
//         {/* Local video */}
//         <div style={{ margin: "10px" }}>
//           <p>You</p>
//           <video
//             ref={localVideoRef}
//             autoPlay
//             playsInline
//             muted
//             style={{ width: "300px", border: "1px solid #333" }}
//           />
//         </div>
//         {/* Remote video */}
//         <div style={{ margin: "10px" }}>
//           <p>Remote Participant</p>
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             style={{ width: "300px", border: "1px solid #333" }}
//           />
//         </div>
//       </div>
//       {/* Controls */}
//       <div style={{ marginTop: "20px" }}>
//         <button onClick={toggleAudio}>
//           {isAudioMuted ? <FiMic /> : <FiMicOff />}
//         </button>
//         <button onClick={toggleVideo} style={{ marginLeft: "10px" }}>
//           {isVideoOff ? <FiVideoOff /> : <FiVideo />}
//         </button>
//         <button onClick={leaveCall} className="" style={{ marginLeft: "10px" }}>
//         <FiPhone />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default VideoCall;
