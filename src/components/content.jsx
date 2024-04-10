import React, { useState, useEffect } from "react";
import chatbot from "../assets/logoMegamoto.jpg";

export const Content = (props) => {
    const [printedContent, setPrintedContent] = useState([]);
    const endOfMessagesRef = React.useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        let intervalId;

        if (props.messages) {
            const lastAssistantMessageIndex = props.messages
                .map((chatMessage, index) => (chatMessage.sender === "MegaBot" ? index : -1))
                .filter((index) => index !== -1)
                .pop();

            if (lastAssistantMessageIndex !== undefined) {
                const lastAssistantMessage = props.messages[lastAssistantMessageIndex];
                const content = lastAssistantMessage.text.split("");
                let currentIndex = 0;

                intervalId = setInterval(() => {
                    scrollToBottom()
                    setPrintedContent((prevContent) => {
                        const newContent = [...prevContent];
                        newContent[lastAssistantMessageIndex] = content.slice(0, currentIndex + 1).join("");
                        return newContent;
                    });
                    currentIndex++;
                    if (currentIndex === content.length) {
                        clearInterval(intervalId);
                    }
                    scrollToBottom()
                }, 10);
            }
        }
        return () => {
            clearInterval(intervalId);
        };
    }, [props.messages]);

    return (
        <>
            {props.messages?.map((chatMessage, index) => (
                <div className={`message ${chatMessage.sender}`}>
                    {chatMessage.sender === "user" ? "" : <img
                        src={chatbot}
                        alt="chatbot"
                        className="chatbot-image"
                    />}
                    <span>
                        {chatMessage.sender === "MegaBot" && index === props.messages.length - 1 ? printedContent[index] : chatMessage.text}
                    </span>
                </div>
            ))}
            <div ref={endOfMessagesRef} />
        </>
    );
};
