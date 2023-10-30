import React from "react";
import ReactDOM from "react-dom"

function PhotoPicker({onChange}) {
  const component = <input type="file" hidden id="photo-picker" onChange={onChange}/>
  //see on document.jsx
  //  As of now in page there is no section of input file id photo picker but when we click on upload photo this will trigger and a input ill be formed
  return ReactDOM.createPortal(component,document.getElementById("photo-picker-element"))
}

export default PhotoPicker;
