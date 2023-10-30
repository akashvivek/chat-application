import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPauseCircle, FaPlay, FaStop, FaTrash } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({hide}) {

  const[{userInfo,currentChatUser,socket,chatInfo},dispatch] = useStateProvider();

  const [isRecording,setIsRecording] = useState(false)
  const [isPlaying,setIsPlaying] = useState(false)
  const [recordedAudio,setRecordedAudio] = useState(null)
  const [waveForm,setWaveForm] = useState(null)
  const [renderedAudio,setRenderedAudio] = useState(null)
  const [recordingDuration,setRecordingDuration] = useState(0)
  const [currentPlaybackTime,setCurrentPlaybackTime] = useState(0)
  const [totalDuration,setTotalDuration] = useState(0)

  const AudioRef= useRef(null)
  const mediaRecorderRef= useRef(null)
  const waveFormRef= useRef(null)

  useEffect(()=>{
    let interval;
    if(isRecording){
      interval = setInterval(()=>{
        setRecordingDuration((prevDuration)=>{
          setTotalDuration(prevDuration+1)
          return prevDuration+1;
        })
      },1000)
    }
    return ()=>{
      clearInterval(interval)
    }
  },[isRecording])

  useEffect(()=>{
    //for waveforms wavesurfer library is used
    const waveSurfer = WaveSurfer.create({
      container:waveFormRef.current,
      waveColor:"#ccc",
      progressColor:"#4a9eff",
      cursorColor:"#7ae3c3",
      barWidth:2,
      height:30,
      responsive:true
    })
    setWaveForm(waveSurfer)

    waveSurfer.on("finish",()=>{
      setIsPlaying(false)
    })

    return () =>{
      waveSurfer.destroy()
    }
  },[])


  useEffect(()=>{
    if(waveForm) handleStartRecording();
  },[waveForm])


  const formatTime =(time)=>{
    if(isNaN(time)) return "00:00";
    const minutes = Math.floor(time/60);
    const seconds = Math.floor(time%60);

    return `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
  }

  const handleStartRecording =()=>{
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    // setRecordedAudio(null)
    navigator.mediaDevices.getUserMedia({audio:true}).then((stream)=>{
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current= mediaRecorder
      AudioRef.current.srcObject=stream;

      const chunks=[];
      mediaRecorder.ondataavailable=(e)=>chunks.push(e.data)
      mediaRecorder.onstop=()=>{
        const blob = new Blob(chunks,{type:"audio/ogg ; codecs=opus"})
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        setRecordedAudio(audio)

        waveForm.load(audio)
      }
      mediaRecorder.start();

    }).catch(error=>{
      console.log(error)
    })

  }
  const handleStopRecording =()=>{
    if(mediaRecorderRef?.current && isRecording){
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      waveForm.stop()

      const audioChunks=[];
      mediaRecorderRef.current?.addEventListener("dataavailable",(event)=>{
        audioChunks.push(event.data)
      })
      mediaRecorderRef.current?.addEventListener("stop",()=>{
        const audioBlob = new Blob(audioChunks,{type:"audio/mp3"})
        const audioFile = new File([audioBlob],"recording.mp3")
        setRenderedAudio(audioFile)
      })
      
    }
  }

  useEffect(()=>{
    if(recordedAudio){
      const updatePlayBackTime =()=>{
        setCurrentPlaybackTime(recordedAudio.currentTime)
      }
      recordedAudio?.addEventListener("timeupdate",updatePlayBackTime)
      return ()=>{
        recordedAudio.removeEventListener("timeupdate",updatePlayBackTime)
      }
    }
  }, [recordedAudio])

  const handlePlayRecording =()=>{
    if(recordedAudio){
      waveForm.stop()
      waveForm.play()
      recordedAudio.play()
      setIsPlaying(true)
    }
  }
  const handlePauseRecording =()=>{
      waveForm.stop()
      recordedAudio.pause()
      setIsPlaying(false)
  }
  
  const sendRecording = async ()=>{
    try {
      const formData = new FormData();
      formData.append("audio",renderedAudio);
      formData.append("to",currentChatUser?._id);
      formData.append("from",userInfo?._id);
      formData.append("chatId",chatInfo?._id);
      const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE,formData,{
          headers :{
            "Content-Type":"multipart/form-data"
          },
    })
    if(response.status===201){
      socket.current.emit("send-msg",{
        to:currentChatUser?._id,
        from:userInfo?._id,
        content:response.data.data.content,
        chatType:response.data.data.chatType,
        createdAt:response.data.data.createdAt,
        messageStatus:response.data.data.messageStatus,
        chatId:chatInfo?._id
      })
      dispatch({type:reducerCases.ADD_MESSAGES,
        newMessage:{
          ...response.data.data,
        },
        fromSelf:true
      })
    }

    } catch (error) {
      console.log(error)
    }
    
  }


  return <div className="flex text-2xl w-full justify-end items-center ">
    <div className="pt-1">
      <FaTrash className=" text-panel-header-icon cursor-pointer" onClick={()=>hide()}/>
    </div>
    <div className="mx-4 py-2 px-4 text-white text-lg flex gap-3 justify-center items-center bg-search-input-container-background rounded-full drop-shadow-lg">
      {isRecording ?
        <div className="text-red-500 animate-pulse 2-60 text-center ">
          Recording 
          <span>
            {recordingDuration}s
          </span>
        </div>
        :
        <div>
          {
            recordedAudio && 
            <>
              {!isPlaying ?
                <FaPlay onClick={handlePlayRecording}/> 
                :
                <FaStop onClick={handlePauseRecording}/>
              }
            </>
          }
          </div>
      }
          <div className="w-60" ref={waveFormRef} hidden={isRecording} />
          {
            recordedAudio && isPlaying && ( 
              <span>
                {formatTime(currentPlaybackTime)}
              </span>
          )}
          {
            recordedAudio && !isPlaying && (
              <span>
                {formatTime(totalDuration)}
              </span>
          )}
          <audio ref={AudioRef} hidden/>
      </div>
          <div className="mr-4">
            {
              !isRecording ? <FaMicrophone className="text-red-500" onClick={handleStartRecording}/> : <FaPauseCircle className="text-red-500" onClick={handleStopRecording}/> 
            }
          </div>
          <div>
          <MdSend className=" text-panel-header-icon cursor-pointer mr-4" title="send" onClick={sendRecording}/>
          </div>
        </div>
}

export default CaptureAudio;
