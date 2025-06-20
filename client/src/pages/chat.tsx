import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import BottomNav from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Search,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Plus,
  Paperclip,
  Image,
  X
} from "lucide-react";

interface Chat {
  id: string;
  participants: string[];
  participantDetails?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    isVerified: boolean;
  }[];
  lastMessage: string;
  lastMessageAt: string;
  isActive: boolean;
  orderId?: string;
  gigId?: string;
  serviceId?: string;
  advertisementId?: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
  createdAt: string;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chats = [] } = useQuery<Chat[]>({
    queryKey: ["/api/chats"],
    refetchInterval: 3000, // Refresh every 3 seconds for real-time updates
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/chats", selectedChatId, "messages"],
    queryFn: async () => {
      if (!selectedChatId) return [];
      const response = await fetch(`/api/chats/${selectedChatId}/messages`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedChatId,
    refetchInterval: 2000, // Refresh messages every 2 seconds
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Helper functions
  const getOtherParticipant = (chat: Chat) => {
    if (!chat.participantDetails) {
      return null;
    }
    return chat.participantDetails.find(participant => participant.id !== user?.id);
  };

  const getOtherParticipantInitial = (chat: Chat) => {
    const otherParticipant = getOtherParticipant(chat);
    if (otherParticipant) {
      return `${otherParticipant.firstName?.charAt(0) || ''}${otherParticipant.lastName?.charAt(0) || ''}`.toUpperCase() || '?';
    }
    const fallbackId = chat.participants.find(id => id !== user?.id);
    return fallbackId ? fallbackId.charAt(0).toUpperCase() : '?';
  };

  const getChatTitle = (chat: Chat) => {
    const otherParticipant = getOtherParticipant(chat);
    if (otherParticipant) {
      return `${otherParticipant.firstName || 'Unknown'} ${otherParticipant.lastName || 'User'}`;
    }
    
    if (chat.serviceId) return 'Service Chat';
    if (chat.gigId) return 'Gig Chat';
    if (chat.advertisementId) return 'Marketplace Chat';
    if (chat.orderId) return 'Order Chat';
    return `Chat #${chat.id.slice(0, 8)}`;
  };

  const getChatSubtitle = (chat: Chat | null) => {
    if (!chat) return '';
    
    if (chat.serviceId) return 'Service Discussion';
    if (chat.gigId) return 'Gig Discussion';
    if (chat.advertisementId) return 'Marketplace Chat';
    if (chat.orderId) return 'Order Chat';
    return 'Direct Message';
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { chatId: string; content: string; file?: File }) => {
      if (data.file) {
        const formData = new FormData();
        formData.append("content", data.content);
        formData.append("file", data.file);
        
        const response = await fetch(`/api/chats/${data.chatId}/messages`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to send message with file");
        }
        
        return response.json();
      } else {
        return await apiRequest("POST", `/api/chats/${data.chatId}/messages`, {
          content: data.content
        });
      }
    },
    onSuccess: () => {
      setMessageInput("");
      setSelectedFile(null);
      setShowAttachmentMenu(false);
      // Force immediate refresh of messages
      queryClient.invalidateQueries({ queryKey: ["/api/chats", selectedChatId, "messages"] });
      queryClient.refetchQueries({ queryKey: ["/api/chats", selectedChatId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if ((!messageInput.trim() && !selectedFile) || !selectedChatId) return;
    
    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: messageInput.trim() || (selectedFile ? `Shared a ${selectedFile.type.includes('image') ? 'photo' : 'file'}` : ''),
      file: selectedFile || undefined
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachmentMenu(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredChats = chats.filter((chat: Chat) =>
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChat = chats.find((chat: Chat) => chat.id === selectedChatId) || null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg pb-20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat List */}
          <div className={`lg:col-span-1 ${selectedChatId ? 'hidden lg:block' : 'block'}`}>
            <Card className="bg-card-bg border-gray-800 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-neon-blue" />
                    Chats
                  </CardTitle>
                  <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-900 border-gray-700 pl-10 focus:border-neon-blue"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto space-y-2 p-4">
                {filteredChats.length > 0 ? (
                  filteredChats.map((chat: Chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChatId === chat.id
                          ? "bg-neon-blue bg-opacity-20 border border-neon-blue border-opacity-30"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          {getOtherParticipant(chat)?.profileImage ? (
                            <img 
                              src={getOtherParticipant(chat)?.profileImage} 
                              alt={getChatTitle(chat)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full neon-gradient flex items-center justify-center text-white font-medium">
                              {getOtherParticipantInitial(chat)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium truncate">
                              {getChatTitle(chat)}
                            </p>
                            <span className="text-gray-400 text-xs">
                              {chat.lastMessageAt ? formatTime(chat.lastMessageAt) : 'New'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm truncate">
                            {chat.lastMessage || "No messages yet"}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {chat.orderId && (
                              <Badge variant="outline" className="text-xs bg-green-500 bg-opacity-20 text-green-400">
                                Order
                              </Badge>
                            )}
                            {chat.gigId && (
                              <Badge variant="outline" className="text-xs bg-orange-500 bg-opacity-20 text-orange-400">
                                Gig
                              </Badge>
                            )}
                            {chat.serviceId && (
                              <Badge variant="outline" className="text-xs bg-blue-500 bg-opacity-20 text-blue-400">
                                Service
                              </Badge>
                            )}
                            {chat.advertisementId && (
                              <Badge variant="outline" className="text-xs bg-purple-500 bg-opacity-20 text-purple-400">
                                Marketplace
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No conversations yet</p>
                    <p className="text-gray-500 text-sm">Start by placing an order or posting a gig</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className={`lg:col-span-2 ${selectedChatId ? 'block' : 'hidden lg:block'} flex flex-col h-[calc(100vh-6rem)]`}>
            {selectedChatId ? (
              <Card className="bg-card-bg border-gray-800 flex flex-col h-full min-h-0">
                {/* Chat Header */}
                <CardHeader className="border-b border-gray-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedChatId(null)}
                        className="lg:hidden p-2 hover:bg-gray-800"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        {selectedChat && getOtherParticipant(selectedChat)?.profileImage ? (
                          <img 
                            src={getOtherParticipant(selectedChat)?.profileImage} 
                            alt={getChatTitle(selectedChat)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full neon-gradient flex items-center justify-center text-white font-medium">
                            {selectedChat ? getOtherParticipantInitial(selectedChat) : '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {selectedChat ? getChatTitle(selectedChat) : 'Chat'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {getChatSubtitle(selectedChat)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[calc(100vh-200px)]">
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((message: Message) => {
                      const isOwnMessage = message.senderId === user?.id;
                      const otherParticipant = selectedChat ? getOtherParticipant(selectedChat) : null;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwnMessage && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              {otherParticipant?.profileImage ? (
                                <img 
                                  src={otherParticipant.profileImage} 
                                  alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-neon-blue to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                                  {otherParticipant ? 
                                    `${otherParticipant.firstName?.charAt(0) || ''}${otherParticipant.lastName?.charAt(0) || ''}`.toUpperCase() || '?' 
                                    : '?'
                                  }
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                            <div
                              className={`px-4 py-3 rounded-2xl relative ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-neon-blue to-blue-600 text-white rounded-br-md'
                                  : 'bg-gray-800 text-gray-200 rounded-bl-md'
                              }`}
                            >
                              {message.attachmentUrl && (
                                <div className="mb-2">
                                  {message.attachmentType?.includes('image') ? (
                                    <div className="relative group">
                                      <img 
                                        src={message.attachmentUrl} 
                                        alt="Shared image"
                                        className="max-w-xs max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover border border-gray-600"
                                        onClick={() => window.open(message.attachmentUrl, '_blank')}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="bg-black bg-opacity-70 rounded-full p-2">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-60 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                                      <div className="flex items-center space-x-2">
                                        <Paperclip className="w-4 h-4 text-neon-blue" />
                                        <span className="text-sm text-white">
                                          {message.attachmentUrl?.split('/').pop()?.split('-').slice(2).join('-') || 'File'}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => window.open(message.attachmentUrl, '_blank')}
                                          className="h-6 px-2 text-xs text-neon-blue hover:bg-neon-blue hover:text-black"
                                        >
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = message.attachmentUrl!;
                                            link.download = message.attachmentUrl?.split('/').pop() || 'file';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}
                                          className="h-6 px-2 text-xs text-green-400 hover:bg-green-400 hover:text-black"
                                        >
                                          Download
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {message.content && message.content.trim() && (
                                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              )}
                            </div>
                            
                            <p className={`text-xs mt-1 px-2 ${
                              isOwnMessage ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                          
                          {isOwnMessage && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              {user?.profileImageUrl ? (
                                <img 
                                  src={user.profileImageUrl} 
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-neon-orange to-orange-600 flex items-center justify-center text-white text-xs font-medium">
                                  {`${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'ME'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-md">
                        <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">No messages yet</p>
                        <p className="text-gray-500 text-sm mb-4">Start the conversation with {selectedChat ? getChatTitle(selectedChat) : 'this user'}!</p>
                        <div className="bg-gray-800 rounded-lg p-4 text-left">
                          <p className="text-gray-300 text-sm mb-2">💡 Chat Tips:</p>
                          <ul className="text-gray-400 text-xs space-y-1">
                            <li>• Be clear about your requirements</li>
                            <li>• Ask about pricing and timeline</li>
                            <li>• Share relevant details about your project</li>
                            <li>• Keep communication professional</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-gray-800 p-4 flex-shrink-0 sticky bottom-0 bg-gray-900 z-10">
                  {/* File Preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-neon-blue" />
                          <span className="text-sm text-gray-300">{selectedFile.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeSelectedFile}
                          className="p-1 hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 items-end">
                    {/* Attachment Button */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="p-2 hover:bg-gray-800 text-gray-400 hover:text-neon-blue"
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      
                      {showAttachmentMenu && (
                        <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setShowAttachmentMenu(false);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-700 text-gray-300"
                          >
                            <Image className="w-4 h-4" />
                            <span className="text-sm">Photo</span>
                          </button>
                          <button
                            onClick={() => {
                              fileInputRef.current?.click();
                              setShowAttachmentMenu(false);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-700 text-gray-300"
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">File</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="hidden"
                    />
                    
                    {/* Message Input */}
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder={selectedFile ? "Add a message..." : "Type a message..."}
                      className="flex-1 bg-gray-900 border-gray-700 focus:border-neon-blue"
                    />
                    
                    {/* Send Button */}
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!messageInput.trim() && !selectedFile) || sendMessageMutation.isPending}
                      className="neon-gradient hover:shadow-neon-blue transition-all"
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-card-bg border-gray-800 h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-400">
                    Choose a chat from the sidebar to start messaging
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}