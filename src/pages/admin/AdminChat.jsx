import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const AdminChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const adminId = 1;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        'Access-Control-Allow-Origin': '*'
      },
      debug: function (str) {
        console.log('🔄 [Admin STOMP]:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ [Admin] Connected to WebSocket');
        
        // Subscribe to private messages
        const privateSubscription = client.subscribe(`/user/${adminId}/queue/private`, (message) => {
          console.log('📨 [Admin] Received private message:', message);
          onMessageReceived(message);
        });
        console.log('✅ [Admin] Subscribed to private messages', privateSubscription);

        // Subscribe to public channel
        const publicSubscription = client.subscribe('/topic/messages', (message) => {
          console.log('📨 [Admin] Received public message:', message);
          onMessageReceived(message);
        });
        console.log('✅ [Admin] Subscribed to public messages', publicSubscription);

        loadUsers();
      },
      onDisconnect: () => {
        console.log('❌ [Admin] Disconnected from WebSocket');
      },
      onStompError: (frame) => {
        console.error('❌ [Admin] STOMP error:', frame);
      }
    });

    try {
      console.log('🔄 [Admin] Activating connection...');
      client.activate();
      setStompClient(client);
    } catch (error) {
      console.error('❌ [Admin] Connection failed:', error);
    }

    return () => {
      if (client && client.connected) {
        try {
          client.unsubscribe(`/user/${adminId}/queue/private`);
          client.unsubscribe('/topic/messages');
          client.deactivate();
          console.log('✅ [Admin] Cleaned up WebSocket connection');
        } catch (error) {
          console.error('❌ [Admin] Cleanup error:', error);
        }
      }
    };
  }, []);
  useEffect(() => {
    if (selectedUser) {
      console.log("🔄 [Admin] Selected user changed:", selectedUser.username);
      
      // Load messages first
      loadMessages(selectedUser.id).then(() => {
        // Then mark messages as read
        console.log("🔄 [Admin] Marking messages as read after loading");
        markMessagesAsRead(selectedUser.id);
      });
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/chat/chat-users/${adminId}`);
      const usersWithLastMessage = await Promise.all(
        response.data.map(async (user) => {
          const lastMessage = await getLastMessage(user.id);
          const unreadCount = await getUnreadCount(user.id);
          return {
            ...user,
            lastMessage: lastMessage?.message || 'Chưa có tin nhắn',
            unread: unreadCount
          };
        })
      );
      setUsers(usersWithLastMessage);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const getLastMessage = async (userId) => {
    try {
      const response = await axios.get(`/api/chat/last-message/${userId}/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting last message:', error);
      return null;
    }
  };

  const getUnreadCount = async (userId) => {
    try {
      const response = await axios.get(`/api/chat/unread/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  };
  const loadMessages = async (userId) => {
    try {
      console.log("🔄 [Admin] Loading messages for user:", userId);
      const response = await axios.get(`http://localhost:8080/api/chat/messages/${userId}/${adminId}`);
      console.log("✅ [Admin] Loaded messages:", response.data);
      setMessages(response.data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('❌ [Admin] Error loading messages:', error);
      setMessages([]); // Reset messages if error
    }
  };
  const markMessagesAsRead = async (userId) => {
    try {
      console.log("🔄 [Admin] Marking messages as read for user:", userId);
      await axios.post(`http://localhost:8080/api/chat/read/${adminId}/${userId}`);
      console.log("✅ [Admin] Messages marked as read");

      // Update unread count in users list
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.id === userId) {
            console.log("✅ [Admin] Resetting unread count for user:", user.username);
            return { ...user, unread: 0 };
          }
          return user;
        });
      });

      // Also update messages to mark them as read
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.senderId === userId && !msg.isRead) {
            console.log("✅ [Admin] Marking message as read:", msg);
            return { ...msg, isRead: true };
          }
          return msg;
        });
      });
    } catch (error) {
      console.error('❌ [Admin] Error marking messages as read:', error);
    }
  };
  const onMessageReceived = useCallback((payload) => {
    try {
      console.log("🔵 [Admin Message Received] Raw payload:", payload);
      const message = JSON.parse(payload.body);
      console.log("🔵 [Admin Message Received] Parsed message:", message);
      console.log("ℹ️ [Admin] Current selected user:", selectedUser);

      // Luôn cập nhật danh sách người dùng trước
      setUsers(prevUsers => {
        console.log("🔄 [Admin] Updating users list with message:", message);
        return prevUsers.map(user => {
          if (user.id === message.senderId || user.id === message.receiverId) {
            const isCurrentChat = selectedUser?.id === user.id;
            const updatedUser = {
              ...user,
              lastMessage: message.message,
              unread: isCurrentChat ? 0 : (user.unread || 0) + 1,
              lastMessageTime: message.sentAt
            };
            console.log("🔄 [Admin] Updated user data:", updatedUser);
            return updatedUser;
          }
          return user;
        }).sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
          return timeB - timeA;
        });
      });

      // Always verify that the message involves selectedUser if we have one
      if (selectedUser) {
        console.log("🔍 [Admin] Checking message relevance:", {
          selectedUserId: selectedUser.id,
          senderId: message.senderId,
          receiverId: message.receiverId
        });

        // Check if this message belongs to the current chat
        const isRelevantToCurrentChat = 
          message.senderId === selectedUser.id || 
          message.receiverId === selectedUser.id;

        if (isRelevantToCurrentChat) {
          console.log("✅ [Admin] Message is for current chat. Adding to messages.");
          
          setMessages(prev => {
            // Check for duplicate
            const isDuplicate = prev.some(msg => 
              (message.id && msg.id === message.id) ||
              (message.localId && msg.localId === message.localId)
            );

            if (isDuplicate) {
              console.log("🔴 [Admin] Duplicate message detected:", message);
              return prev;
            }

            // Add message and sort
            const newMessages = [...prev, message].sort((a, b) => 
              new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
            );

            console.log("✅ [Admin] Messages updated:", newMessages);
            setTimeout(scrollToBottom, 100);
            return newMessages;
          });

          // If we received a message from the selected user, mark it as read
          if (message.senderId === selectedUser.id) {
            markMessagesAsRead(selectedUser.id);
          }
        } else {
          console.log("ℹ️ [Admin] Message not for current chat:", {
            selectedUserId: selectedUser.id,
            messageInfo: {
              senderId: message.senderId,
              receiverId: message.receiverId
            }
          });
        }
      } else {
        console.log("ℹ️ [Admin] No user selected, skipping message display");
      }
    } catch (error) {
      console.error("❌ [Admin Error] Failed to process message:", error, error.stack);
    }
  }, [selectedUser, scrollToBottom, markMessagesAsRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log("🟡 [Admin Send] Starting send process...");

    if (!newMessage.trim() || !selectedUser || !stompClient) {
      console.log("🔴 [Admin Send Blocked] Missing requirements:", {
        hasMessage: !!newMessage.trim(),
        messageContent: newMessage,
        hasSelectedUser: !!selectedUser,
        hasStompClient: !!stompClient,
        stompState: stompClient?.state
      });
      return;
    }

    try {
      const localId = Date.now().toString();
      const messageData = {
        senderId: adminId,
        receiverId: selectedUser.id,
        senderName: 'Admin',
        receiverName: selectedUser.username,
        message: newMessage.trim(),
        sentAt: new Date().toISOString(),
        localId: localId,
        isRead: false
      };

      console.log("🟡 [Admin Send] Message data:", messageData);
      console.log("🟡 [Admin Send] WebSocket state:", {
        connected: stompClient.connected,
        state: stompClient.state
      });

      // Thêm tin nhắn vào state ngay lập tức
      setMessages(prev => {
        console.log("✅ [Admin Send] Adding message to local state");
        return [...prev, messageData];
      });
      
      setNewMessage("");
      console.log("✅ [Admin Send] Input cleared");
      
      setTimeout(() => {
        scrollToBottom();
        console.log("✅ [Admin Send] Scrolled to bottom");
      }, 100);

      // Gửi tin nhắn qua WebSocket
      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messageData),
        headers: { 
          'content-type': 'application/json'
        }
      });
      console.log("✅ [Admin Send] Message published to WebSocket");

      // Cập nhật last message trong list user
      setUsers(prevUsers => {
        console.log("✅ [Admin Send] Updating users list with new message");
        return prevUsers.map(user => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              lastMessage: messageData.message
            };
          }
          return user;
        });
      });
    } catch (error) {
      console.error("❌ [Admin Send Error] Failed to send message:", error);
      console.error("❌ [Admin Send Error] Stack trace:", error.stack);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold">Quản lý chat</h1>
        </div>
        
        <div className="flex h-[calc(100vh-200px)]">
          {/* User List */}
          <div className="w-1/3 border-r">
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="overflow-y-auto h-full">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{user.username}</h3>
                        {user.unread > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                            {user.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="font-semibold text-gray-600">
                      {selectedUser.username}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedUser.username}</h2>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === adminId ? 'justify-end' : 'justify-start'
                      } mb-4`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.senderId === adminId
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800 shadow-sm'
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
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Chọn người dùng để bắt đầu chat
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;