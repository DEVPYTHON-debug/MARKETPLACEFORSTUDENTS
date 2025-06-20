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
  Plus
} from "lucide-react";

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  isActive: boolean;
  orderId?: string;
  gigId?: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats = [] } = useQuery({
    queryKey: ["/api/chats"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chats", selectedChatId, "messages"],
    enabled: !!selectedChatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { chatId: string; content: string }) => {
      return await apiRequest("POST", `/api/chats/${data.chatId}/messages`, {
        content: data.content
      });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/chats", selectedChatId, "messages"] });
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
    if (!messageInput.trim() || !selectedChatId) return;
    
    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: messageInput.trim()
    });
  };

  const filteredChats = chats.filter((chat: Chat) =>
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChat = chats.find((chat: Chat) => chat.id === selectedChatId);

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
          <div className="lg:col-span-1">
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
                        <div className="w-10 h-10 neon-gradient rounded-full flex items-center justify-center text-white font-medium">
                          {chat.participants[0]?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium truncate">
                              Chat #{chat.id.slice(0, 8)}
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
          <div className="lg:col-span-2">
            {selectedChatId ? (
              <Card className="bg-card-bg border-gray-800 h-full flex flex-col">
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
                      <div className="w-10 h-10 neon-gradient rounded-full flex items-center justify-center text-white font-medium">
                        {selectedChat?.participants[0]?.[0] || '?'}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Chat #{selectedChatId.slice(0, 8)}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {selectedChat?.participants.length || 0} participants
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
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message: Message) => {
                      const isOwnMessage = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'neon-gradient text-white'
                                : 'bg-gray-800 text-gray-200'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-gray-200' : 'text-gray-400'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No messages yet</p>
                        <p className="text-gray-500 text-sm">Start the conversation!</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-gray-800 p-4">
                  <div className="flex space-x-3">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-900 border-gray-700 focus:border-neon-blue"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
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