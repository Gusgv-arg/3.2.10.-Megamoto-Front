import React, { useState, useEffect } from 'react';
import '../components/chat.css'; 
import logo from "../assets/chat-bubble.svg"
import cross from "../assets/xmark-circle.svg"
import axios from "axios"
import { Content } from './content';

const apiUrl = process.env.REACT_APP_API_URL;
console.log("MegaBot pointing to:", apiUrl)

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false)

    // For automatic scroll in the UI
    const messagesEndRef = React.useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Open and close chat
    const toggleChat = () => setIsOpen(!isOpen);

    // Users input
    const handleUserInput = (e) => setUserInput(e.target.value);

    const sendMessage = async (e) => {
        e.preventDefault();
        //If there is a blanck return
        if (!userInput.trim()) return; 

        // Change loading state to true
        setLoading(true);

        // Add new message to chat
        const newMessage = { id: userId, text: userInput, sender: 'user' };
        setMessages([...messages, newMessage]);

        // Object expected by the API
        const messageData = {
            webUser: userId,
            webMessage: userInput,
        };        
        // Posts to MegaBot
        try {
            setIsTyping(true);
            setUserInput('')
            const response = await axios.post(apiUrl, messageData);
            const botResponse = {
                id: Date.now(),
                text: response.data.message, //API returns an object with message property
                sender: 'MegaBot',
            };
            setMessages((prevMessages) => [...prevMessages, botResponse]);
        } catch (error) {
            console.error('Error al enviar el mensaje:', error.message);
            const errorMessage = {id: Date.now(), sender: "MegaBot", text: "Lo lamento, MegaBot no pudo procesar tu mensaje. Por favor intentá más tarde. ¡Gracias!" }
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            setIsTyping(false);
            setUserInput('')
        } finally {
            setLoading(false);
            clearInterval(loading)
            setIsTyping(false);
        }
    };

    // Asign userId with Local Storage && automatic scroll when message is added
    useEffect(() => {
        let existingId = localStorage.getItem('userId');
        if (!existingId) {
            // Generate unique ID with date and hour
            const uniqueId = `webUser-${new Date().toISOString()}`;
            localStorage.setItem('userId', uniqueId); 
            setUserId(uniqueId);
        } else {
            setUserId(existingId);
        }
        scrollToBottom()
    }, [messages]);

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
            <button onClick={toggleChat} className="chatbot-toggle">
                {isOpen ? <img alt="cross" src={cross} /> : <img alt="icono" src={logo} />}
            </button>
            {isOpen && (
                <div className="chat-interface">
                    <div className="messages">
                        <Content messages={messages}/>
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={sendMessage} className="message-form">
                        <input
                            type="text"
                            className={`inputText ${isTyping ? 'typing' : ''}`}
                            value={isTyping ? "Buscando información..." : userInput}
                            onChange={handleUserInput}
                            placeholder= "Tu mensaje..."
                            disabled={loading}
                        />
                        <button type="submit">Enviar</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
