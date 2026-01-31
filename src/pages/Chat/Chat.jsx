
import React, { useState, useRef, useEffect } from 'react';

const ChatApp = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! How's it going?",
      sender: "John Doe",
      time: "10:30 AM",
      isOwn: false,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      text: "Going great! Just working on some new projects. How about you?",
      sender: "You",
      time: "10:32 AM",
      isOwn: true,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 3,
      text: "Same here! Been coding all morning. Want to grab coffee later?",
      sender: "John Doe",
      time: "10:33 AM",
      isOwn: false,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    }
  ]);

  const [contacts] = useState([
    {
      id: 1,
      name: "John Doe",
      lastMessage: "Want to grab coffee later?",
      time: "10:33 AM",
      unread: 0,
      online: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      lastMessage: "Thanks for the help!",
      time: "9:45 AM",
      unread: 2,
      online: true,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Mike Johnson",
      lastMessage: "See you tomorrow",
      time: "Yesterday",
      unread: 0,
      online: false,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Emily Davis",
      lastMessage: "Perfect! Let's do it",
      time: "Yesterday",
      unread: 1,
      online: true,
      avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Alex Chen",
      lastMessage: "The project looks amazing!",
      time: "Monday",
      unread: 0,
      online: false,
      avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=50&h=50&fit=crop&crop=face"
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: "You",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=40&h=40&fit=crop&crop=face"
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simulate someone typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replies = [
          "That sounds awesome! 😊",
          "Great idea! Let's do it",
          "I'm excited about this!",
          "Perfect timing!",
          "Looking forward to it! 🚀"
        ];
        const reply = {
          id: Date.now() + 1,
          text: replies[Math.floor(Math.random() * replies.length)],
          sender: activeContact.name,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
          avatar: activeContact.avatar
        };
        setMessages(prev => [...prev, reply]);
      }, 2000);
    }
  };

  const selectContact = (contact) => {
    setActiveContact(contact);
    // Simulate loading messages for the selected contact
    setMessages([
      {
        id: 1,
        text: `Hey! This is ${contact.name}`,
        sender: contact.name,
        time: "10:30 AM",
        isOwn: false,
        avatar: contact.avatar
      },
      {
        id: 2,
        text: "Hi there! Nice to meet you",
        sender: "You",
        time: "10:32 AM",
        isOwn: true,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=40&h=40&fit=crop&crop=face"
      }
    ]);
  };

  return (
    <div className="vh-100 d-flex bg-light mt-6">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header p-3 border-bottom">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=50&h=50&fit=crop&crop=face" 
                alt="Profile" 
                className="rounded-circle me-3"
                style={{ width: '45px', height: '45px', border: '2px solid #fff', objectFit: 'cover' }}
              />
              <div className="text-white">
                <h6 className="mb-0">Your Name</h6>
                <small className="opacity-75">Online</small>
              </div>
            </div>
            <button 
              className="btn btn-link text-white p-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0">
              <i className="fas fa-search text-white-50"></i>
            </span>
            <input
              type="text"
              className="form-control search-input border-start-0"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="contacts-list flex-grow-1 overflow-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`contact-item p-3 d-flex align-items-center ${
                activeContact.id === contact.id ? 'active' : ''
              }`}
              onClick={() => selectContact(contact)}
            >
              <div className="position-relative me-3">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="rounded-circle"
                  style={{ width: '50px', height: '50px', border: '2px solid rgba(255,255,255,0.3)', objectFit: 'cover' }}
                />
                {contact.online && (
                  <span
                    className="position-absolute bottom-0 end-0 bg-success rounded-circle"
                    style={{ width: '14px', height: '14px', border: '2px solid green' }}
                  ></span>
                )}
              </div>
              <div className="flex-grow-1 text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{contact.name}</h6>
                  <small className="opacity-75">{contact.time}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <p className="mb-0 text-truncate opacity-75" style={{ maxWidth: '70%', fontSize: '0.85rem' }}>
                    {contact.lastMessage}
                  </p>
                  {contact.unread > 0 && (
                    <span className="badge bg-success rounded-pill" >
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Chat Header */}
        <div className="chat-header p-3 d-flex align-items-center bg-white shadow-sm">
          {!sidebarOpen && (
            <button 
              className="btn btn-lin me-3 p-0"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="fas fa-bars text-black"></i>
            </button>
          )}
          <img 
            src={activeContact.avatar} 
            alt="Avatar" 
            className="rounded-circle me-3"
            style={{ width: '50px', height: '50px', border: '2px solid #dee2e6', objectFit: 'cover' }}
          />
          <div className="flex-grow-1">
            <h5 className="mb-0 text-dark">{activeContact.name}</h5>
            <small className="text-muted">
              {activeContact.online ? (
                <>
                  <i className="fas fa-circle text-success me-1" style={{ fontSize: '0.6rem' }}></i>
                  Online
                </>
              ) : 'Last seen recently'}
            </small>
          </div>
          <div className="d-flex">
            <button className="btn  text-dark">
              <i className="fas fa-phone"></i>
            </button>
            <button className="btn  text-dark">
              <i className="fas fa-video"></i>
            </button>
            <button className="btn  text-dark">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container flex-grow-1 p-4 overflow-auto bg-light">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`d-flex mb-4 ${message.isOwn ? 'justify-content-end' : 'justify-content-start'}`}
            >
              {!message.isOwn && (
                <img
                  src={message.avatar}
                  alt="Avatar"
                  className="rounded-circle me-2 align-self-end"
                  style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                />
              )}
              <div className="message-content" style={{ maxWidth: '70%' }}>
                {!message.isOwn && (
                  <small className="text-muted ms-2">{message.sender}</small>
                )}
                <div
                  className={`message-bubble p-3 ${message.isOwn ? 'own-message' : 'other-message'}`}
                >
                  {message.text}
                </div>
                <small className={`text-muted mt-1 d-block ${message.isOwn ? 'text-end me-2' : 'text-start ms-2'}`}>
                  {message.time}
                </small>
              </div>
              {message.isOwn && (
                <img
                  src={message.avatar}
                  alt="Avatar"
                  className="rounded-circle ms-2 align-self-end"
                  style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                />
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="d-flex justify-content-start mb-4">
              <img
                src={activeContact.avatar}
                alt="Avatar"
                className="rounded-circle me-2 align-self-end"
                style={{ width: '38px', height: '38px', objectFit: 'cover' }}
              />
              <div className="typing-bubble p-3">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="message-input p-3 bg-white border-top">
          <form onSubmit={handleSendMessage} className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <i className="fas fa-plus"></i>
            </button>
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="btn  rounded-circle d-flex align-items-center text-white justify-content-center"
              disabled={!newMessage.trim()}
              style={{ width: '40px', height: '40px' , background: "linear-gradient(135deg, #333 0%, #033 100%)"}}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>

      <style jsx={"true"}>{`
        .sidebar {
          width: 350px;
          background: linear-gradient(135deg, #333 0%, #FFF 100%);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }
        
        .sidebar-closed {
          margin-left: -350px;
        }
        
        .sidebar-header {
          background: rgba(0,0,0,0.1);
        }
        
        .contact-item {
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          transition: background-color 0.2s;
        }
        
        .contact-item:hover, .contact-item.active {
          background-color: rgba(255,255,255,0.1);
        }
        
        .search-input {
          background-color: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          color: white;
        }
        
        .search-input::placeholder {
          color: rgba(255,255,255,0.6);
        }
        
        .search-input:focus {
          box-shadow: 0 0 0 0.2rem rgba(255,255,255,0.1);
        }
        
        .input-group-text {
          background-color: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        
        .message-bubble {
          border-radius: 20px;
          word-wrap: break-word;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .own-message {
          background-color: #333;
          color: white;
          border-bottom-right-radius: 5px;
        }
        
        .other-message {
          background-color: white;
          color: #333;
          border-bottom-left-radius: 5px;
          border: 1px solid #dee2e6;
        }
        
        .typing-bubble {
          background-color: white;
          border-radius: 20px;
          border-bottom-left-radius: 5px;
          border: 1px solid #dee2e6;
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          background: #6c757d;
          border-radius: 50%;
          display: inline-block;
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .messages-container {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
        }
        
        /* Custom scrollbar */
        .contacts-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .contacts-list::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        
        .contacts-list::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }
        
        .contacts-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.4);
        }
        
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            z-index: 1000;
          }
          
          .sidebar-closed {
            margin-left: -350px;
          }
          
          .message-content {
            max-width: 85%;
          }
        }
      `}</style>

      {/* Bootstrap Icons CDN for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
    </div>
  );
};

export default ChatApp;