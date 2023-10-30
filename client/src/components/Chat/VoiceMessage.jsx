import { useStateProvider } from "@/context/StateContext";
import { HOST } from "@/utils/ApiRoutes";
import React, { useEffect, useRef, useState } from "react";
import Avatar from "../common/Avatar";
import { FaPause, FaPlay, FaStop } from "react-icons/fa";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import WaveSurfer from "wavesurfer.js";

function VoiceMessage({message}) {


  const[{userInfo,currentChatUser,socket,chatInfo},dispatch] = useStateProvider();

  const [audioMesage,setAudioMessage]= useState(null)
  const [isPlaying,setIsPlaying] = useState(false)
  const [currentPlaybackTime,setCurrentPlaybackTime] = useState(0)
  const [totalDuration,setTotalDuration] = useState(0)

  const waveFormRef= useRef(null)
  const waveForm= useRef(null)

  useEffect(()=>{
    if(waveForm.current === null){
      waveForm.current = WaveSurfer.create({
        container:waveFormRef.current,
        waveColor:"#ccc",
        progressColor:"#4a9eff",
        cursorColor:"#7ae3c3",
        barWidth:2,
        height:30,
        responsive:true
      })

      waveForm?.current.on("finish",()=>{
        setIsPlaying(false)
      })
  

    }
   
    return () =>{
      waveForm.current.destroy()
    }
  },[])

  useEffect(()=>{
    const audioUrl = `${HOST}/${message.content}`
    const audio = new Audio(audioUrl)
    setAudioMessage(audio)
    // if(waveForm?.current){
      waveForm.current.load(audioUrl)
    waveForm?.current?.on("ready",()=>{
      setTotalDuration(waveForm.current.getDuration())
    })
    // }
    
  },[message.content])

  useEffect(()=>{
    if(audioMesage){
      const updatePlayBackTime =()=>{
        setCurrentPlaybackTime(audioMesage.currentTime)
      }
      audioMesage?.addEventListener("timeupdate",updatePlayBackTime)
      return ()=>{
        audioMesage.removeEventListener("timeupdate",updatePlayBackTime)
      }
    }
  }, [audioMesage])

   const handlePlayAudio =()=>{
    if(audioMesage){
      waveForm.current.stop()
      waveForm.current.play()
      audioMesage.play()
      setIsPlaying(true)
    }
  }
  const handlePauseAudio =()=>{
      waveForm.current.stop()
      audioMesage.pause()
      setIsPlaying(false)
  }
  const formatTime =(time)=>{
    if(isNaN(time)) return "00:00";
    const minutes = Math.floor(time/60);
    const seconds = Math.floor(time%60);

    return `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
  }

  return <div className={`flex items-center gap-5 text-white px-4 pr-2 py-4 text-sm rounded-md ${message.sender===currentChatUser?._id ? " bg-incoming-background" :" bg-outgoing-background "}`}>
      <div>
        <Avatar type="lg" image={currentChatUser?.profileImage}/>
      </div>
      <div className="cursor-pointer text-xl ">
        {
          !isPlaying ? <FaPlay onClick={handlePlayAudio}/> : <FaStop onClick={handlePauseAudio}/>
        }
      </div>
      <div className="relative ">
        <div className="w-60" ref={waveFormRef} />
        <div className=" text-bubble-meta text=[11px] pt-1 flex justify-between absolute bottom-[-22px] w-full">
          <span>{formatTime(isPlaying ? currentPlaybackTime : totalDuration)}</span>
          <div className="flex gap-1">
            <span>{calculateTime(message.createdAt) }</span>
            {message.sender === userInfo._id && <MessageStatus messageStatus={message.messageStatus}/>}
          </div>
        </div>
      </div>
  </div>;
}

export default VoiceMessage;
