import React, { useState, useEffect, useRef } from 'react';
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
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Admin Connected to WebSocket');
        client.subscribe(`/user/${adminId}/queue/messages`, onMessageReceived);
        client.subscribe('/topic/messages', onMessageReceived);
        loadUsers();
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        try {
          if (client.connected) {
            client.unsubscribe(`/user/${adminId}/queue/messages`);
            client.unsubscribe('/topic/messages');
            client.deactivate();
          }
        } catch (error) {
          console.error('Error cleaning up WebSocket:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
      // Mark messages as read when selecting a user
      markMessagesAsRead(selectedUser.id);
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
      const response = await axios.get(`/api/chat/messages/${userId}/${adminId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (userId) => {
    try {
      await axios.post(`/api/chat/read/${adminId}/${userId}`);
      // Update unread count in users list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, unread: 0 } : user
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const onMessageReceived = (payload) => {
    try {
      const message = JSON.parse(payload.body);
      console.log('Admin received message:', message);

      // Update messages if chatting with relevant user
      if (selectedUser && 
          (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
        setMessages(prev => {
          // Only check for exact message ID match
          const exists = prev.some(m => m.id === message.id);
          
          if (!exists) {
            console.log('Adding new message to chat:', message);
            const newMessages = [...prev, message];
            return newMessages.sort((a, b) => 
              new Date(a.sentAt || Date.now()) - new Date(b.sentAt || Date.now())
            );
          }
          return prev;
        });
        setTimeout(scrollToBottom, 100);
      }

      // Always update user list with latest message
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === message.senderId || user.id === message.receiverId) {
            const isCurrentChat = selectedUser?.id === user.id;
            console.log('Updating user chat:', user.id);
            return {
              ...user,
              lastMessage: message.message,
              unread: isCurrentChat ? 0 : (user.unread || 0) + 1
            };
          }
          return user;
        })
      );
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !stompClient) return;

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

      console.log('Admin sending message:', messageData);

      // Thêm tin nhắn vào state ngay lập tức
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);

      // Gửi tin nhắn qua WebSocket
      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messageData),
        headers: { 
          'content-type': 'application/json'
        }
      });

      // Cập nhật last message trong list user
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              lastMessage: messageData.message
            };
          }
          return user;
        })
      );
    } catch (error) {
      console.error('Error sending message:', error);
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
                        {user.username}
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