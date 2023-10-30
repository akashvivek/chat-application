import Image from "next/image";
import React, { useEffect, useState } from "react";
import {FaCamera } from "react-icons/fa" 
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage }) {
  const[hover,setHover] = useState(false)
  const[isContextMenuVisible, setIsContextMenuVisible]  =useState(false);
  const [contextMenuCoordinates,setContextMenuCoordinates] = useState({
    x:0,y:0
  });
  const [grabPic, setGrabPic]=useState(false);
  const [showPhotoLib, setShowPhotoLib]=useState(false);
  const [showCapturPic, setShowCapturePic]=useState(false);


  const showContextMenu =(e)=>{
    e.preventDefault();
    setContextMenuCoordinates({
      x:e.pageX,
      y:e.pageY
    })
    setIsContextMenuVisible(true);
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

  const contextMenuOptions=[
    {name:"Take Photo", callback:()=>{
      setShowCapturePic(true)
    }},
    {name:"Choose from library", callback:()=>{
      setShowPhotoLib(true)
    }},
    {name:"Upload Photo", callback:()=>{
      setGrabPic(true)
    }},
    {name:"Remove Photo", callback:()=>{
      setImage("/default_avatar.png")
    }}
  ]

  const photoPickerChange=async(e)=>{
    const file = e.target.files[0];
    //by this we can store image in database instead of any other server
    const reader = new FileReader();
    const data = document.createElement("img");
    reader.onload=function(event){
      data.src = event.target.result;
      data.setAttribute("data-src", event.target.result)// this store image in base64
    }
    reader.readAsDataURL(file);
    setTimeout(()=>{
      setImage(data.src)
    },100)
  }
  return <>
    <div className="flex items-center justify-center">
      
      {
        type === "sm" && (
          <div className="relative h-10 w-10">
            <Image
             src={image}
             alt="avatar"
             className="rounded-full"
             fill
            />
          </div>
        )
      }
      {
        type === "lg" && (
          <div className="relative h-14 w-14 ">
            <Image
             src={image}
             alt="avatar"
             className="rounded-full"
             fill
            />
          </div>
        )
      }
      {
        type === "xl" && (
          <div className="relative z-0 cursor-pointer" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
            <div className={`z-10 bg-photopicker-overlay-background h-60 w-60 absolute top-0 left-0 flex items-center rounded-full justify-center flex-col text-center gap-2 ${hover?"visible":"hidden"}`} onClick={(e)=>showContextMenu(e)} id="context-opener">
              {/*  id because when ever i click on camera i wanna open context menu */}
              <FaCamera className="text-2xl" id="context-opener"/>
              <span id="context-opener">Change Profile Photo</span>
            </div>
            <div className="flex items-center justify-center h-60 w-60 ">
              <Image
                src={image}
                alt="avatar"
                className="rounded-full"
                fill
              />
           </div>  
          </div>
          
        )
      }
      
    </div>

    {
      isContextMenuVisible && <ContextMenu 
        options={contextMenuOptions}
        coordinates={contextMenuCoordinates}
        contextMenu={isContextMenuVisible}
        setContextMenu={setIsContextMenuVisible}
      />
    }
    {
      grabPic && <PhotoPicker 
        onChange={photoPickerChange}
      />
    }
    {
      showPhotoLib && <PhotoLibrary 
        setImage={setImage}
        hidePhotoLibrary={setShowPhotoLib}
      />
    }
    {
      showCapturPic && <CapturePhoto 
        setImage={setImage}
        hideCapturePic={setShowCapturePic}
      />
    }
  </>;
}

export default Avatar;
