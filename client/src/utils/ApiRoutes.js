export const HOST = "http://localhost:5000";

const AUTH_ROUTE = `${HOST}/api/auth`;
const MESSAGE_ROUTE = `${HOST}/api/message`;
const CHAT_ROUTE = `${HOST}/api/chat`;

export const CHECK_USER_ROUTE = `${AUTH_ROUTE}/check-user`;
export const REGISTER_USER_ROUTE = `${AUTH_ROUTE}/register-user`;
export const GET_ALL_CONTACTS = `${AUTH_ROUTE}/get-contacts`;


export const ADD_MESSAGE_ROUTE = `${MESSAGE_ROUTE}/add-message`
export const GET_MESSAGE_ROUTE = `${MESSAGE_ROUTE}/get-message`
export const ADD_IMAGE_MESSAGE_ROUTE = `${MESSAGE_ROUTE}/add-image-message`
export const ADD_AUDIO_MESSAGE_ROUTE = `${MESSAGE_ROUTE}/add-audio-message`


export const ADD_CHAT_ROUTE = `${CHAT_ROUTE}/add-chat`