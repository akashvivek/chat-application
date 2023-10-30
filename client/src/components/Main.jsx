import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { ADD_CHAT_ROUTE, CHECK_USER_ROUTE, GET_MESSAGE_ROUTE, HOST } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import axios from "axios";
import Chat from "./Chat/Chat";
import { io } from "socket.io-client";
import SearchMessages from "./Chat/SearchMessages";

function Main() {

  const [redirectLogin, setRedirectLogin] = useState(false);
  const [{userInfo,currentChatUser,chatInfo,messageSearch},dispatch]=useStateProvider()
  const router = useRouter()

  const [socketEvent, setSocketEvent] = useState(false)

  const socket= useRef()

  useEffect(()=>{
    if(redirectLogin)router.push('/login')
  },[redirectLogin])
  // to get logged in user detail
  onAuthStateChanged(firebaseAuth,async(currentuser)=>{
    if(!currentuser) setRedirectLogin(true)
    if(!userInfo && currentuser?.email){
      const {data} = await axios.post(CHECK_USER_ROUTE,{
        email:currentuser.email
      })
      if(!data.success){
        router.push("/login")
      }else{
        const { _id, name, email,profileImage,status} = data.data;
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
              _id,name,email,profileImage,status
          }
        })
       
      }
    }
    
  })

  useEffect(()=>{
    if(userInfo){
      socket.current = io(HOST);
      socket.current.emit("add-user",userInfo?._id)
      //store socket in reducer
      dispatch({type:reducerCases.SET_SOCKET,socket})
    }
  },[userInfo])

  useEffect(()=>{
    //as !socketevent  that means runs only ones
    if(socket.current && !socketEvent){
      socket?.current.on("msg-received",(data)=>{
        console.log(data)
        dispatch({type:reducerCases.ADD_MESSAGES,
          newMessage:{
            ...data,
          }
        })
      })
      setSocketEvent(true);
    }
  },[socket.current])

  useEffect(()=>{
    const getChatId =async()=>{
      const { data :result } = await axios.post(ADD_CHAT_ROUTE, { 
        loggedInUser:userInfo?._id,
        userId:currentChatUser?._id,
        
       });
          const { _id} = result.data;
          dispatch({
            type: reducerCases.SET_CHAT_INFO,
            chatInfo: {
                _id
            }
          })

    }
    const getMessages=async()=>{
      const {data :{messages}} = await axios.get(`${GET_MESSAGE_ROUTE}/${chatInfo?._id}/${currentChatUser?._id}`)
      // console.log({messages})
      dispatch({type:reducerCases.SET_MESSAGES,messages})
    }
    if(currentChatUser?._id){
      getChatId();
      getMessages();
    }
  },[currentChatUser])
  return <>
    <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden">
        <ChatList/>
        {currentChatUser ? <div className={messageSearch ? "grid grid-cols-2" : "grid-cols-2"}> <Chat /> {messageSearch && <SearchMessages/>}  </div>: <Empty/>}
    </div>
  </>;
}

export default Main;
