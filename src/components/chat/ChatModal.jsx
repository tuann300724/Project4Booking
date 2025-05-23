import React, { useState, useEffect, useRef, useCallback } from "react";
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
            console.log("🔄 [User WebSocket]:", str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log("✅ [User] Connected Successfully");

            // Subscribe to all relevant channels
            const subscriptions = [
              // Private channel cho user
              {
                destination: `/user/${user.id}/queue/private`,
                callback: (message) => {
                  console.log("📨 [User] Private message received:", message);
                  onMessageReceived(message);
                },
              },
              // Private channel cho admin
              {
                destination: `/user/1/queue/private`,
                callback: (message) => {
                  console.log("📨 [User] Admin message received:", message);
                  onMessageReceived(message);
                },
              },
              // Public channel
              {
                destination: "/topic/messages",
                callback: (message) => {
                  console.log("📨 [User] Public message received:", message);
                  onMessageReceived(message);
                },
              },
            ];

            // Subscribe to all channels
            subscriptions.forEach((sub) => {
              try {
                const subscription = client.subscribe(
                  sub.destination,
                  sub.callback
                );
                console.log(
                  `✅ [User] Subscribed to ${sub.destination}`,
                  subscription
                );
              } catch (error) {
                console.error(
                  `❌ [User] Failed to subscribe to ${sub.destination}:`,
                  error
                );
              }
            });

            // After connection is established, load existing messages
            loadMessages();
          },
          onDisconnect: () => {
            console.log("❌ [User] Disconnected");
            if (isOpen && user) {
              setTimeout(() => {
                console.log("🔄 [User] Reconnecting...");
                setupWebSocket();
              }, 5000);
            }
          },
          onStompError: (frame) => {
            console.error("❌ [User] STOMP error:", frame);
            if (isOpen && user) {
              setTimeout(() => {
                console.log("🔄 [User] Reconnecting after error...");
                setupWebSocket();
              }, 5000);
            }
          },
        });

        try {
          console.log("🔄 [User] Activating connection...");
          client.activate();
          setStompClient(client);
        } catch (error) {
          console.error("❌ [User] Activation failed:", error);
          setTimeout(setupWebSocket, 5000);
        }
      }
    };

    setupWebSocket();

    return () => {
      if (client && client.connected) {
        try {
          // Cleanup all subscriptions
          [
            `/user/${user?.id}/queue/private`,
            `/user/1/queue/private`,
            "/topic/messages",
          ].forEach((destination) => {
            try {
              client.unsubscribe(destination);
              console.log(`✅ [User] Unsubscribed from ${destination}`);
            } catch (error) {
              console.error(
                `❌ [User] Error unsubscribing from ${destination}:`,
                error
              );
            }
          });
          client.deactivate();
          console.log("✅ [User] Connection cleaned up");
        } catch (error) {
          console.error("❌ [User] Cleanup error:", error);
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

  const onMessageReceived = useCallback(
    (payload) => {
      try {
        console.log("🔵 [Message Received] Raw payload:", payload);
        const message = JSON.parse(payload.body);
        console.log("🔵 [Message Received] Parsed message:", message);

        // A message is relevant to this chat if:
        // 1. The current user sent it to admin (senderId === user.id && receiverId === adminId)
        // 2. The admin sent it to current user (senderId === adminId && receiverId === user.id)
        const isMessageForThisChat = (
          (message.senderId === user.id && message.receiverId === adminId) ||
          (message.senderId === adminId && message.receiverId === user.id)
        );

        console.log("🔍 [Message Check] Relevance:", {
          isMessageForThisChat,
          messageDetails: {
            senderId: message.senderId,
            receiverId: message.receiverId,
            userId: user.id,
            adminId: adminId
          }
        });

        if (!isMessageForThisChat) {
          console.log("ℹ️ [Message Skipped] Not related to this chat:", message);
          return;
        }

        setMessages((prevMessages) => {
          // Check for duplicate based on ID or localId
          const isDuplicate = prevMessages.some(
            (msg) =>
              (message.id && msg.id === message.id) ||
              (message.localId && msg.localId === message.localId)
          );

          if (isDuplicate) {
            console.log("🔴 [Message Duplicate] Already exists:", message);
            return prevMessages;
          }

          // Add new message and sort by time
          const newMessages = [...prevMessages, message].sort((a, b) => {
            const timeA = new Date(a.sentAt).getTime();
            const timeB = new Date(b.sentAt).getTime();
            return timeA - timeB;
          });

          console.log("✅ [Message Added] New message in chat:", message);
          
          // If it's an admin message, mark it as read
          if (message.senderId === adminId) {
            // You could call an API here to mark the message as read
            console.log("✅ [Message Status] Marking admin message as read");
          }

          return newMessages;
        });

        // Scroll after adding message
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("❌ [Message Error] Failed to process:", error, error.stack);
      }
    },
    [user, scrollToBottom]
  );
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      console.log("🟡 [Send Attempt] Starting send process...");

      if (!message.trim() || !user || !stompClient) {
        console.log("🔴 [Send Blocked] Missing requirements:", {
          hasMessage: !!message.trim(),
          messageContent: message,
          hasUser: !!user,
          userData: user,
          hasStompClient: !!stompClient,
          stompState: stompClient?.state,
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

        console.log("🟡 [Send Prepare] Message data:", messageData);

        // Kiểm tra kết nối
        if (!stompClient.connected) {
          throw new Error("WebSocket not connected");
        }

        // Gửi tin nhắn
        stompClient.publish({
          destination: "/app/chat.sendMessage",
          body: JSON.stringify(messageData),
          headers: {
            "content-type": "application/json",
            "sender-id": user.id.toString(),
            "receiver-id": adminId.toString(),
            "message-type": "chat",
            "correlation-id": localId,
          },
        });
        console.log("✅ [Send Success] Message published to WebSocket");

        // Thêm tin nhắn vào state local
        setMessages((prev) => {
          const newMessages = [...prev, { ...messageData, pending: true }];
          console.log("✅ [Send Update] Local messages updated:", newMessages);
          return newMessages;
        });

        // Clear input
        setMessage("");
        console.log("✅ [Send Cleanup] Input cleared");

        // Scroll to bottom
        setTimeout(() => {
          scrollToBottom();
          console.log("✅ [Send UI] Scrolled to bottom");
        }, 100);
      } catch (error) {
        console.error("❌ [Send Error] Failed to send message:", error);
        console.error("❌ [Send Error] Stack trace:", error.stack);
        // TODO: Thêm logic retry hoặc thông báo lỗi cho user
      }
    },
    [message, stompClient, user]
  );
  const checkConnection = useCallback(() => {
    if (stompClient) {
      console.log("🔄 [Connection Check]", {
        connected: stompClient.connected,
        state: stompClient.state,
        subscriptions: stompClient.subscriptions,
        connectionHeaders: stompClient.connectHeaders,
      });
    } else {
      console.log("⚠️ [Connection Check] No STOMP client available");
    }
  }, [stompClient]);

  useEffect(() => {
    const interval = setInterval(checkConnection, 5000);
    console.log("🔄 [Connection Monitor] Started connection checking");
    return () => {
      clearInterval(interval);
      console.log("🔄 [Connection Monitor] Stopped connection checking");
    };
  }, [stompClient, checkConnection]);
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
