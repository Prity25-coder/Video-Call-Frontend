import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import PeerContext from "./PeerContext";
import PropTypes from "prop-types";

export const usePeer = () => {
  return useContext(PeerContext);
}

const PeerContextProvider = ({ children }) => {
  const [remoteStream, setRemoteStream] = useState(null);

  
  // const sendStream = async (stream) => {
  //   const tracks = stream.getTracks();
  //   for (const track of tracks) {
  //     peer.addTrack(track, stream);
  //   }
  // };

  // const handleTrackEvent = useCallback((ev) => {
  //   const streams = ev.streams;
  //   setRemoteStream(streams[0]);
  // }, []);

  // useEffect(() => {
  //   peer.addEventListener("track", handleTrackEvent);

  //   return () => {
  //     peer.removeEventListener("track", handleTrackEvent);
  //   };
  // }, [handleTrackEvent, peer]);

  return (
    <PeerContext.Provider
      value={{
        remoteStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

PeerContextProvider.propTypes = {
  children: PropTypes.any,
};



export default PeerContextProvider;
