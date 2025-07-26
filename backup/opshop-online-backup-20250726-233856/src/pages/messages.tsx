import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus,
  User,
  Clock,
  CheckCircle,
  Circle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  productId?: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  receiver?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  product?: {
    id: number;
    title: string;
  };
}

interface Conversation {
  otherUser: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}

export default function Messages() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  useEffect(() => {
    document.title = "Messages - Opshop Online";
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to view messages. Logging in...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/messages/conversations"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false,
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", selectedConversation],
    enabled: isAuthenticated && !!selectedConversation,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
    retry: false,
  });

  // Fetch all users for new message
  const { data: allUsers } = useQuery({
    queryKey: ["/api/users/search"],
    enabled: isAuthenticated && showNewMessageModal,
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content, productId }: { receiverId: string; content: string; productId?: number }) => {
      return apiRequest("POST", "/api/messages", { receiverId, content, productId });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedConversation] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationUserId: string) => {
      return apiRequest("PUT", `/api/messages/mark-read/${conversationUserId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: newMessage.trim(),
    });
  };

  const handleConversationSelect = (userId: string) => {
    setSelectedConversation(userId);
    markAsReadMutation.mutate(userId);
  };

  const getUserDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.email.split('@')[0];
  };

  const filteredConversations = conversations?.filter((conv: Conversation) =>
    getUserDisplayName(conv.otherUser).toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Messages</h1>
          <Button
            onClick={() => setShowNewMessageModal(true)}
            size="sm"
            className="ml-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredConversations?.length > 0 ? (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation: Conversation) => (
                      <div
                        key={conversation.otherUser.id}
                        onClick={() => handleConversationSelect(conversation.otherUser.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                          selectedConversation === conversation.otherUser.id ? "bg-blue-50 border-l-4 border-l-primary" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.otherUser.profileImageUrl} />
                            <AvatarFallback>
                              {getUserDisplayName(conversation.otherUser).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {getUserDisplayName(conversation.otherUser)}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                            {conversation.lastMessage && (
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start messaging other users!</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {conversations?.find((c: Conversation) => c.otherUser.id === selectedConversation) && 
                      getUserDisplayName(conversations.find((c: Conversation) => c.otherUser.id === selectedConversation).otherUser)
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[500px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : messages?.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message: Message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.senderId === user?.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-gray-100"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <p className="text-xs opacity-70">
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </p>
                                {message.senderId === user?.id && (
                                  <div className="text-xs opacity-70">
                                    {message.isRead ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : (
                                      <Circle className="h-3 w-3" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 min-h-[80px] resize-none"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[500px]">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the left to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}