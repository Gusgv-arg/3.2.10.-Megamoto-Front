import React, { useState, useEffect } from 'react';
import '../components/chat.css'; // Asegúrate de crear este archivo para estilizar tu componente
import logo from "../assets/chat-bubble.svg"
import cross from "../assets/xmark-circle.svg"
import axios from "axios"
const apiUrl = process.env.REACT_APP_API_URL;

const ChatBot = () => {

    console.log("MegaBot pointing to:", apiUrl)

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLoadingText, setShowLoadingText] = useState(false);

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
        if (!userInput.trim()) return;

        // Change loading state to true
        setLoading(true);
        setShowLoadingText(true)

        // Appearing and disappearing Effect
        let loadingInterval = setInterval(() => {
            setShowLoadingText(show => !show);
        }, 500);

        const newMessage = { id: userId, text: userInput, sender: 'user' };
        // Add new message to chat
        setMessages([...messages, newMessage]);

        const messageData = {
            webUser: userId,
            webMessage: userInput,
        };

        //Clean user input
        setUserInput('')

        // Posts to MegaBot
        try {
            const response = await axios.post(apiUrl, messageData);
            const botResponse = {
                id: Date.now(),
                text: response.data.message,
                sender: 'megaBot',
            };
            setMessages((prevMessages) => [...prevMessages, botResponse]);
        } catch (error) {
            console.error('Error al enviar el mensaje:', error.message);
            const errorMessage = { text: "Lo lamento, MegaBot no pudo procesar tu mensaje. Por favor intentá más tarde. ¡Gracias!" }
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            setUserInput('')
        } finally {
            setLoading(false);
            setShowLoadingText(false);
            clearInterval(loadingInterval)
        }
    };

    // Asign userId with Local Storage && automatic scroll when message is added
    useEffect(() => {
        let existingId = localStorage.getItem('userId');
        if (!existingId) {
            // Generamos un ID único basado en la fecha y hora actual
            const uniqueId = `webUser-${new Date().toISOString()}`;
            localStorage.setItem('userId', uniqueId); // Guardamos el ID en el Local Storage
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
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={sendMessage} className="message-form">
                        <input
                            type="text"
                            value={userInput}
                            onChange={handleUserInput}
                            //placeholder={showLoadingText ? "Procesando tu consulta..." : "Escribe un mensaje..."}
                            placeholder={loading ? (showLoadingText ? "Procesando tu consulta..." : "") : "Escribe un mensaje..."}

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
