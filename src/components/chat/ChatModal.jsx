import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../context/UserContext";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

const ChatModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const { user } = useUser();
  const adminId = 1;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    let client;
    const setupWebSocket = () => {
      if (isOpen && user) {
        const socket = new SockJS("http://localhost:8080/ws");
        client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            "Access-Control-Allow-Origin": "*",
          },
          debug: function (str) {
            console.log("[WebSocket Debug] User:", str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log("[WebSocket] User Connected Successfully");

            // Chỉ subscribe vào 1 destination chính xác
            const userDestination = `/user/${user.id}/queue/messages`;
            console.log(`[WebSocket] Subscribing to ${userDestination}`);

            client.subscribe(userDestination, (message) => {
              console.log(
                `[WebSocket] Received message on ${userDestination}:`,
                message
              );
              onMessageReceived(message);
            });

            // Thêm subscription đến topic chung nếu cần
            client.subscribe("/topic/public", (message) => {
              console.log("[WebSocket] Received public message:", message);
              onMessageReceived(message);
            });

            loadMessages();
          },
          onDisconnect: () => {
            console.log(
              "[WebSocket] User Disconnected - Attempting immediate reconnection"
            );
            if (isOpen && user) {
              console.log(
                "[WebSocket] Chat is open and user exists, reconnecting..."
              );
              client.activate();
            }
          },
          onStompError: (frame) => {
            console.error("[WebSocket Error] User STOMP error:", frame);
            console.log(
              "[WebSocket] Attempting to reconnect after STOMP error"
            );
            if (isOpen && user) {
              client.deactivate();
              setTimeout(() => {
                console.log("[WebSocket] Reconnecting after error...");
                client.activate();
              }, 1000);
            }
          },
        });

        try {
          console.log("[WebSocket] Attempting to activate connection...");
          client.activate();
          console.log("[WebSocket] Connection activated successfully");
          setStompClient(client);
        } catch (error) {
          console.error(
            "[WebSocket Error] Failed to activate connection:",
            error
          );
          setTimeout(setupWebSocket, 5000);
        }
      }
    };

    setupWebSocket();

    return () => {
      if (client) {
        try {
          if (client.connected) {
            client.unsubscribe(`/user/${user?.id}/queue/messages`);
            client.unsubscribe("/topic/messages");
            client.deactivate();
          }
        } catch (error) {
          console.error("Error cleaning up WebSocket:", error);
        }
      }
    };
  }, [isOpen, user]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      const response = await axios.get(
        `http://localhost:8080/api/chat/messages/${user.id}/${adminId}`
      );
      if (response.data && Array.isArray(response.data)) {
        setMessages(response.data);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const onMessageReceived = (payload) => {
    try {
      console.log("[Message] Raw payload received:", payload);
      console.log("[Message] Destination:", payload.headers.destination); // Thêm dòng này

      const receivedMessage = JSON.parse(payload.body);
      console.log("[Message] Parsed message:", receivedMessage);

      // Xử lý mọi tin nhắn đến mà không kiểm tra adminId
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.id === receivedMessage.id ||
            (m.localId && m.localId === receivedMessage.localId)
        );
        if (!exists) {
          console.log("[Message] Adding new message to chat");
          const newMessages = [...prev, receivedMessage];
          return newMessages.sort(
            (a, b) =>
              new Date(a.sentAt || Date.now()) -
              new Date(b.sentAt || Date.now())
          );
        }
        return prev;
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("[Message Error] Failed to process message:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !stompClient) {
      console.log("[Send] Missing requirements:", {
        hasMessage: !!message.trim(),
        hasUser: !!user,
        hasStompClient: !!stompClient,
      });
      return;
    }

    try {
      const localId = Date.now().toString();
      const messageData = {
        senderId: user.id,
        receiverId: adminId,
        senderName: user.username,
        receiverName: "Admin",
        message: message.trim(),
        sentAt: new Date().toISOString(),
        localId: localId,
        isRead: false,
      };

      console.log("[Send] Preparing to send message:", messageData);

      // Check WebSocket connection
      console.log("[Send] WebSocket connected?", stompClient.connected); // Send message via WebSocket
      console.log("[Send] Sending to destination /app/chat.sendMessage");
      stompClient.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(messageData),
        headers: {
          "content-type": "application/json",
          "sender-id": user.id.toString(),
          "receiver-id": adminId.toString(),
        },
      });
      console.log("[Send] Message published to WebSocket");

      // Add to local state
      setMessages((prev) => {
        const newMessages = [...prev, messageData];
        console.log("[Send] Updated local messages:", newMessages);
        return newMessages;
      });
      setMessage("");

      // Scroll down
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("[Send Error] Failed to send message:", error);
    }
  };
const checkConnection = () => {
  if (stompClient) {
    console.log('WebSocket connected:', stompClient.connected);
    console.log('WebSocket state:', stompClient.state);
  }
};

// Gọi hàm này khi cần kiểm tra
useEffect(() => {
  const interval = setInterval(checkConnection, 5000);
  return () => clearInterval(interval);
}, [stompClient]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 z-50">
      <div className="absolute bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-blue-500 text-white rounded-t-lg">
          <h2 className="text-lg font-semibold">Chat với Admin</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id || Date.now() + Math.random()}
              className={`flex ${
                msg.senderId === user?.id ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.senderId === user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800 shadow-sm"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.sentAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
