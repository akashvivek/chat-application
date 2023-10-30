import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {BsEmojiSmile} from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import {ImAttachment} from "react-icons/im";
import { MdSend } from "react-icons/md";
import EmojiPicker from "emoji-picker-react"
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";
// import CaptureAudio from "../common/CaptureAudio";

const CaptureAudio = dynamic(()=>import("../common/CaptureAudio"),{
  ssr:false
})

function MessageBar() {

  const [{userInfo,currentChatUser,chatInfo,socket},dispatch]=useStateProvider();

  const [image,setImage]=useState();

  const [message,setMessage] = useState("");
  const[showEmojiPicker,setShowEmojiPicker] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)


  const emojiPickerRef=useRef(null);

  const [grabPic, setGrabPic]=useState(false);

  useEffect(() => {
    const handleOutsideCLick = (e)=>{
      if(e.target.id!="emoji-open"){
        if(emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)){
          setShowEmojiPicker(false)
        }
      }
    }
    document.addEventListener("click", handleOutsideCLick)
    return()=>{
      document.removeEventListener("click", handleOutsideCLick)
    }
  }, [])
  
  const handleEmojiModal=()=>{
    setShowEmojiPicker(!showEmojiPicker)
  }
  const handleEmojiClick=(emoji)=>{
    setMessage((prevMessage)=>prevMessage+=emoji.emoji)
  }

  const handleSendMessage = async()=>{
    try {
      const {data} = await axios.post(ADD_MESSAGE_ROUTE,{
        to:currentChatUser?._id,
        from:userInfo?._id,
        content:message,
        chatId:chatInfo?._id
      })
      socket.current.emit("send-msg",{
        to:currentChatUser?._id,
        from:userInfo?._id,
        content:data.data.content,
        chatType:data.data.chatType,
        createdAt:data.data.createdAt,
        messageStatus:data.data.messageStatus,
        chatId:chatInfo?._id
      })
      dispatch({type:reducerCases.ADD_MESSAGES,
        newMessage:{
          ...data.data,
        },
        fromSelf:true
      })
      setMessage("")
    } catch (error) {
      console.log(error)
    }
  }

  const photoPickerChange=async(e)=>{
    const file = e.target.files[0];

    try {
      const formData = new FormData();
      formData.append("image",file);
      formData.append("to",currentChatUser?._id);
      formData.append("from",userInfo?._id);
      formData.append("chatId",chatInfo?._id);
      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE,formData,{
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

  useEffect(()=>{
    if(grabPic){
      const data = document.getElementById("photo-picker");
      //this will open a folder for uploading image
      data.click();
      document.body.onfocus=(e)=>{
        setTimeout(()=>{
          setGrabPic(false)
        },1000)
        
      }
    }
  },[grabPic])


  return <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
    {
        !showAudioRecorder &&
    <>
      
      <div className="flex gap-6">
        <BsEmojiSmile className="text-panel-header-icon cursor-pointer text-xl" title="Emoji" id="emoji-open" onClick={handleEmojiModal}/>
        {showEmojiPicker && 
          <div className="absolute bottom-24 left-16 z-40" ref={emojiPickerRef}>
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark"/>

          </div>
        }
        <ImAttachment className="text-panel-header-icon cursor-pointer text-xl" title="Attach file" onClick={()=>setGrabPic(true)}/>
      </div>
      <div className="w-full rounded-lg h-10 flex items-center">
        <input type="text" placeholder="Type a message" className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full" onChange={(e)=>setMessage(e.target.value)} value={message}/>

      </div>
      <div className="flex w-10 items-center justify-center">

        <button>
        {message.length ?           
          <MdSend className="text-panel-header-icon cursor-pointer text-xl" title="Send message" onClick={handleSendMessage}/>
          :
          <FaMicrophone className="text-panel-header-icon cursor-pointer text-xl" title="Record " onClick={()=>setShowAudioRecorder(true)}/>
        }  
        </button>
      </div>
      
    </>
      }
    {
      grabPic && <PhotoPicker 
        onChange={photoPickerChange}
      />
    }
    {
      showAudioRecorder && <CaptureAudio 
        hide={setShowAudioRecorder}
      />
    }
  </div>;
}

export default MessageBar;
