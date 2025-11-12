import React, { useState } from 'react';
import { MessageSquare, Send, Search, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample conversations data
  const conversations = [
    {
      id: 1,
      name: 'John Smith',
      avatar: 'JS',
      lastMessage: 'Thanks for the update on my credit report',
      timestamp: '10:30 AM',
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Hi, I wanted to check on my credit repair status', time: '9:00 AM' },
        { id: 2, sender: 'me', text: 'Hello John! I\'ve reviewed your file and have some good news.', time: '9:15 AM' },
        { id: 3, sender: 'them', text: 'That sounds great! What\'s the update?', time: '9:30 AM' },
        { id: 4, sender: 'me', text: 'We successfully disputed 3 items and they\'ve been removed from your report.', time: '10:00 AM' },
        { id: 5, sender: 'them', text: 'Thanks for the update on my credit report', time: '10:30 AM' }
      ]
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Can we schedule a call tomorrow?',
      timestamp: 'Yesterday',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'Can we schedule a call tomorrow?', time: 'Yesterday' }
      ]
    },
    {
      id: 3,
      name: 'Mike Williams',
      avatar: 'MW',
      lastMessage: 'Document received, thank you',
      timestamp: '2 days ago',
      unread: 0,
      online: true,
      messages: [
        { id: 1, sender: 'me', text: 'I\'ve sent over the documents you requested.', time: '2 days ago' },
        { id: 2, sender: 'them', text: 'Document received, thank you', time: '2 days ago' }
      ]
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      // In a real app, this would send to backend
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 bg-white border-r">
        {/* Search Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b ${
                selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  conv.online ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {conv.avatar}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{conv.name}</h3>
                  <span className="text-xs text-gray-500">{conv.timestamp}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white p-4 border-b flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                selectedConversation.online ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                {selectedConversation.avatar}
              </div>
              <div className="ml-3">
                <h2 className="font-semibold text-gray-900">{selectedConversation.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedConversation.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {selectedConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender === 'me' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-800'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`text-xs mt-1 flex items-center gap-1 ${
                    msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{msg.time}</span>
                    {msg.sender === 'me' && (
                      <CheckCheck className="w-3 h-3" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white p-4 border-t">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Select a conversation</h3>
            <p className="text-gray-500 mt-2">Choose a conversation from the left to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;