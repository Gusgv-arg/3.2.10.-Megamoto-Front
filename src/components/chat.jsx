import React, { useState, useEffect } from 'react';
import '../components/chat.css'; // Asegúrate de crear este archivo para estilizar tu componente
import logo from "../assets/chat-bubble.svg"
import cross from "../assets/xmark-circle.svg"
import axios from "axios"
import ReactDOM from 'react-dom';
const apiUrl = process.env.REACT_APP_API_URL;

const ChatBot = () => {

    // Dentro de tu archivo Chat.jsx, después de definir tu componente
    window.initChatBot = function () {
        const chatBotDiv = document.createElement('div');
        document.body.appendChild(chatBotDiv);
        ReactDOM.render(<ChatBot />, chatBotDiv);
    };
    const [isOpen, setIsOpen] = useState(false); // Para controlar la visibilidad
    const [messages, setMessages] = useState([]); // Almacenar los mensajes del chat
    const [userInput, setUserInput] = useState(''); // Controlar la entrada del usuario
    const [userId, setUserId] = useState('');

    const toggleChat = () => setIsOpen(!isOpen); // Abrir/Cerrar el chat

    const handleUserInput = (e) => setUserInput(e.target.value); // Manejar cambio en la entrada de texto

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const newMessage = { id: userId, text: userInput, sender: 'user' };
        setMessages([...messages, newMessage]); // Añadir nuevo mensaje al chat

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
                id: Date.now(), // Considera usar algo más único aquí
                text: response.data.message, // Asume que la API responde con un objeto que tiene una propiedad 'message'
                sender: 'megaBot',
            };
            setMessages((prevMessages) => [...prevMessages, botResponse]);
        } catch (error) {
            console.error('Error al enviar el mensaje:', error.message);
            // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
            const errorMessage = { text: "Lo lamento, MegaBot no pudo procesar tu mensaje. Por favor intentá más tarde. ¡Gracias!" }
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            setUserInput('')
        }
    };

    // Asignar o recuperar el userId desde el Local Storage
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
    }, []);

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
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
                    </div>
                    <form onSubmit={sendMessage} className="message-form">
                        <input
                            type="text"
                            value={userInput}
                            onChange={handleUserInput}
                            placeholder="Escribe un mensaje..."
                        />
                        <button type="submit">Enviar</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
