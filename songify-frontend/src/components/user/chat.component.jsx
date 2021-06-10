import React, { useEffect, useState } from "react";
import { countNewMessages, findChatMessages, findChatMessage } from "../../services/rest/chat.service";
import UserService from "../../services/rest/user.service";
import AuthService from "../../services/rest/auth/auth.service";
import { useRecoilState } from "recoil";
import { chatActiveContact, chatMessages } from "../../atom/globalState";
import ScrollToBottom from "react-scroll-to-bottom";

var stompClient = null;
const Chat = (props) => {
    const currentUser = AuthService.getCurrentUser();
    const [text, setText] = useState("");
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useRecoilState(chatActiveContact);
    const [messages, setMessages] = useRecoilState(chatMessages);

    useEffect(() => {
        connect();
        loadContacts();
    }, []);

    useEffect(() => {
        if (activeContact === undefined) return;
        findChatMessages(activeContact.id, currentUser.id).then((msgs) =>
            setMessages(msgs)
        );
        loadContacts();
    }, [activeContact]);

    const connect = () => {
        const Stomp = require("stompjs");
        var SockJS = require("sockjs-client");
        SockJS = new SockJS("http://localhost:8080/ws");
        stompClient = Stomp.over(SockJS);
        stompClient.connect({}, onConnected, onError);
    };

    const onConnected = () => {
        console.log("connected");
        stompClient.subscribe("/user/" + currentUser.id + "/queue/messages", onMessageReceived);
    };

    const onError = (err) => { console.log(err); };

    const onMessageReceived = (msg) => {
        const notification = JSON.parse(msg.body);
        const active = JSON.parse(sessionStorage.getItem("recoil-persist")).chatActiveContact;

        if (active.id === notification.senderId) {
            findChatMessage(notification.id).then((message) => {
                const newMessages = JSON.parse(sessionStorage.getItem("recoil-persist"))
                    .chatMessages;
                newMessages.push(message);
                setMessages(newMessages);
            });
        } else {
            alert("Received a new message from " + notification.senderName);
        }
        loadContacts();
    };

    const sendMessage = (msg) => {
        if (msg.trim() !== "") {
            const message = {
                senderId: currentUser.id,
                recipientId: activeContact.id,
                senderName: currentUser.username,
                recipientName: activeContact.username,
                content: msg,
                timestamp: new Date(),
            };
            stompClient.send("/app/chat", {}, JSON.stringify(message));

            const newMessages = [...messages];
            newMessages.push(message);
            setMessages(newMessages);
        }
    };

    const loadContacts = () => {
        const promise = UserService.getUsers().then((users) =>
            users.data.map((contact) =>
                countNewMessages(contact.id, currentUser.id).then((count) => {
                    contact.newMessages = count;
                    return contact;
                })
            )
        );

        promise.then((promises) =>
            Promise.all(promises).then((users) => {
                setContacts(users);
                if (activeContact === undefined && users.length > 0) {
                    setActiveContact(users[0]);
                }
            })
        );
    };

    return (
        <div className="row">
            <div className="col-6 col-md-4">
                <div id="profile">
                    <p>{currentUser.username}</p>
                </div>
                <div>
                    <ul class="list-group">
                        {contacts.map((contact) => (
                            <li onClick={() => setActiveContact(contact)} class={activeContact && contact.id === activeContact.id ? "list-group-item d-flex justify-content-between align-items-center active" : "list-group-item d-flex justify-content-between align-items-center list-group-item-dark"} >
                                {contact.username}
                                {contact.newMessages !== undefined && contact.newMessages > 0 && (
                                    <span class="badge badge-primary badge-pill">{contact.newMessages}</span>
                                )}

                            </li>
                        ))}

                    </ul>
                </div>

            </div>
            <div className="col-6 col-md-4">               
                <p>{activeContact && activeContact.username}</p>
                <ScrollToBottom className="messages">
                    <ul>
                        {messages.map((msg) => (
                            <li className={msg.senderId === currentUser.id ? "" : ""}>
                                {/* {msg.senderId !== currentUser.id && (
                                    <p>!!!!</p>
                                )} */}
                                <p>{msg.senderName}: {msg.content}</p>
                            </li>
                        ))}
                    </ul>
                </ScrollToBottom>

                <div class="input-group mb-3">
                    <input
                        class="form-control"
                        name="user_input"
                        size="large"
                        type="text"
                        placeholder="Write your message..."
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        onKeyPress={(event) => {
                            if (event.key === "Enter") {
                                sendMessage(text);
                                setText("");
                            }
                        }}
                    />
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" onClick={() => { sendMessage(text); setText(""); }}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;