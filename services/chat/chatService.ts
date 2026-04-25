import { MessageRecord } from '@/types/records';
import { supabase } from '@lib/supabase';
import {
  ChatMetadata,
  ChatPreview,
  CreateChatDTO,
  GetMessagesDTO,
  SendMessageDTO
} from './types';

export const ChatService = {
  /**
   * Returns all chat previews for the messages screen.
   * For regular users, this is based on participation.
   */
  async getChats(userId: string): Promise<ChatPreview[]> {
    // Gets all user's chat IDs
    const { data: participations, error: pError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', userId);
    if (pError) throw pError;

    const chatIdList = (participations ?? [])
      .map(p => p.chat_id)
      .filter((id): id is string => !!id);

    return this.getChatPreviewsByIds(chatIdList);
  },

  /**
   * Returns all city chats (for admins).
   */
  async getAllCityChats(): Promise<ChatPreview[]> {
    const { cityChatIdMap } = await import("@lib/office-cities");
    const cityChatIds = Object.values(cityChatIdMap);
    return this.getChatPreviewsByIds(cityChatIds);
  },

  /**
   * Internal helper to fetch previews for a list of chat IDs
   */
  async getChatPreviewsByIds(chatIdList: string[]): Promise<ChatPreview[]> {
    if (chatIdList.length === 0) return [];

    // Fetch the basic chat rows
    const { data: chatRows, error: chatError } = await supabase
      .from('chats')
      .select('id, display_name, listing_id, last_message_id')
      .in('id', chatIdList);

    if (chatError) throw chatError;

    // For each chat, fetch the latest message details and participant count
    const previews = await Promise.all((chatRows ?? []).map(async chat => {
      // 1. Fetch participant count
      const { count } = await supabase
        .from('chat_participants')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chat.id);

      if ((count ?? 0) < 2) return null;

      // 2. Fetch the latest message
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        id: chat.id,
        displayName: chat.display_name ?? null,
        listingId: chat.listing_id ?? null,
        displayPicture: null,
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.created_at ?? null,
        lastMessengerId: lastMsg?.sender_id ?? null,
      } as ChatPreview;
    }));

    // Filter out chats that were skipped (null)
    return (previews.filter(p => p !== null) as ChatPreview[]);
  },


  /**
   * Returns the raw metadata for a single chat.
   */
  async getChatMetadata(chatId: string): Promise<ChatMetadata> {
    // Gets chat ID, name, listing ID, and participant IDs
    const { data, error } = await supabase
      .from('chats')
      .select('id, display_name, listing_id, participants:chat_participants(user_id)')
      .eq('id', chatId)
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Chat not found.');


    const participantIds = data?.participants.map((p: any) => p.user_id);
    const isGroupChat = (participantIds?.length ?? 0) > 2;
    return {
      id: data.id,
      displayName: data.display_name ?? null,
      displayPicture: null,
      listingId: data.listing_id ?? null,
      participantIds: participantIds!,
      participantCount: participantIds?.length ?? 0,
      isGroupChat,
    };
  },

  async getChatPicture(chatId: string, isGroupChat: boolean, userId: string, citiesByRegion?: import("@/types/locations").RegionCities[]): Promise<string | null> {
    // Check if this chat is a city chat
    // citiesByRegion must be provided for city chat lookup
    if (citiesByRegion) {
      const { getCityByChatId } = await import("@lib/office-cities");
      const city = getCityByChatId(chatId, citiesByRegion);
      if (city?.imagePath) return city.imagePath;
    }
    if (!isGroupChat) {
      // For 1-on-1 chats, use the other participant's profile picture
      const { data, error } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', userId)
        .single();

      if (error || !data) return null;
      // Fetches the other user's avatar_url
      const otherUserId = data.user_id;
      const { data: otherUserProfilePic, error: userError } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', otherUserId)
        .single();
      if (userError || !otherUserProfilePic) return null;
      return otherUserProfilePic.avatar_url ?? null;
    }
    // For group chats that are not city chats, return null
    return null;
  },

  /**
   * Returns all messages for a chat in ascending chronological order.
   */
  async getMessages(dto: GetMessagesDTO): Promise<MessageRecord[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', dto.chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((msg): MessageRecord => ({
      id: msg.id,
      chatId: msg.chat_id,
      senderId: msg.sender_id,
      content: msg.content,
      createdAt: msg.created_at,
    }));
  },

  /**
   * Creates a new chat.
   */
  async createChat(dto: CreateChatDTO): Promise<string> {
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .insert({ listing_id: dto.listingId })
      .select()
      .single();

    if (chatError || !chatData) throw new Error(chatError?.message ?? 'Failed to create chat.');

    const participants = dto.participantIds.map(uid => ({
      chat_id: chatData.id,
      user_id: uid,
    }));

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participants);

    if (participantsError) throw participantsError;

    return chatData.id;
  },

  /**
   * Inserts a message and updates the parent chat's metadata.
   */
  async sendMessage(dto: SendMessageDTO): Promise<void> {
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .insert({
        chat_id: dto.chatId,
        sender_id: dto.senderId,
        content: dto.content,
        listing_id: dto.listingId as any,
      })
      .select('id')
      .single();

    if (msgError || !msgData) throw msgError;

    const { error: updateError } = await supabase
      .from('chats')
      .update({ last_message_id: msgData.id, last_message_at: new Date().toISOString() })
      .eq('id', dto.chatId);

    if (updateError) throw updateError;
  },

  /**
   * Gets an existing chat between two users for a listing, or creates one if it doesn't exist.
   */
  async getOrCreateChat(dto: { currentUserId: string, otherUserId: string, listingId?: string }): Promise<{ success: boolean, data?: { id: string }, error?: string }> {
    try {
      // 1. Check for existing chat
      // This is a bit complex in Supabase without a RPC or a specific table for 1-on-1 chats.
      // We'll search for chats where both users are participants and listing matches.

      const { data: existingChats, error: fetchError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', dto.currentUserId);

      if (fetchError) throw fetchError;

      const chatIds = (existingChats ?? []).map(c => c.chat_id);

      if (chatIds.length > 0) {
        const { data: match, error: matchError } = await supabase
          .from('chat_participants')
          .select('chat_id, chats!inner(*)')
          .in('chat_id', chatIds)
          .eq('user_id', dto.otherUserId)
          .eq('chats.listing_id', dto.listingId || "")
          .limit(1)
          .maybeSingle();
        if (matchError) throw matchError;
        if (match) {
          return { success: true, data: { id: match.chat_id } };
        }
      }

      // 2. Create new chat if not found
      const chatId = await this.createChat({
        participantIds: [dto.currentUserId, dto.otherUserId],
        listingId: dto.listingId?.toString(),
      });

      return { success: true, data: { id: chatId } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  /**
   * Assigns a user to the city group chat for their office location.
   * Finds or creates a city_chat for the given city name, then adds the user as a participant.
   */
  async assignToCityGroupChat(userId: string, cityName: string): Promise<{ success: boolean; chatId?: string; error?: string }> {
    try {
      const chatName = `${cityName} Chat`;

      // Find existing city chat by name
      const { data: existingChat, error: findError } = await supabase
        .from("chats")
        .select("id")
        .eq("display_name", chatName)
        .maybeSingle();

      if (findError) throw findError;

      let chatId: string;

      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create a new city_chat
        const { data: newChat, error: createError } = await supabase
          .from("chats")
          .insert({ display_name: chatName })
          .select("id")
          .single();

        if (createError || !newChat) throw createError ?? new Error("Failed to create city chat.");
        chatId = newChat.id;
      }

      // Add user as participant (upsert to avoid duplicates)
      const { error: participantError } = await supabase
        .from("chat_participants")
        .upsert({ chat_id: chatId, user_id: userId }, { onConflict: "chat_id,user_id" });

      if (participantError) throw participantError;

      return { success: true, chatId };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

};