import { MessageRecord } from '@/types/records';
import { supabase } from '@lib/supabase';
import { ListingService } from '@services/listings/listingsService';
import { UserService } from '@services/user/userService';
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
    // Gets current user's chat IDs
    const { data: participations, error: pError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', userId);
    if (pError) throw pError;

    const chatIdList = (participations ?? [])
      .map(p => p.chat_id)
      .filter((id): id is string => !!id);


    return this.getChatPreviewsByIds(chatIdList, userId);
  },

  /**
   * Returns all city chats (for admins).
   */
  async getAllCityChats(): Promise<ChatPreview[]> {
    const { cityChatIdMap } = await import("@lib/office-cities");
    const recognizedChatIds = Object.values(cityChatIdMap);

    const { data: locations, error } = await supabase
      .from('locations')
      .select('chat_id')
      .in('chat_id', recognizedChatIds);

    if (error) throw error;

    const cityChatIds = (locations ?? []).map(l => l.chat_id) as string[];
    const user = await UserService.getCurrentUser();
    return this.getChatPreviewsByIds(cityChatIds, user.userId);
  },

  /**
   * Returns the display picture for a chat by its ID.
   * Resolves based on listing enquiry, city chat, or 1-on-1 participant.
   */
  async getChatDisplayPictureById(chatId: string, userId: string): Promise<any | null> {
    // Fetch Chat Metadata
    const chat = await this.getChatMetadata(chatId);

    // Case: Listing Enquiry -> First listing image
    if (chat.listingId) {
      try {
        const listingData = await ListingService.fetchListingById(chat.listingId);
        return listingData.mediaUrls?.[0] || null;
      } catch (e) {
        console.error(`[ChatService] Failed to load listing for picture ${chat.listingId}:`, e);
      }
    }

    // Case: City Chat -> City icon
    const { cityChatIdMap, getCityImageById } = await import("@lib/office-cities");
    const cityId = Object.keys(cityChatIdMap).find(cid => cityChatIdMap[cid] === chatId);
    if (cityId) {
      return getCityImageById(cityId);
    }

    // Case: 1-on-1 Chat -> Other user profile picture
    if (chat.participantIds.length === 2) {
      const otherUserId = chat.participantIds.find(id => id !== userId);
      if (otherUserId) {
        try {
          const otherUser = await UserService.getUserRecord(otherUserId);
          return otherUser.avatarUrl || null;
        } catch (e) {
          console.error(`[ChatService] Failed to load user for picture ${otherUserId}:`, e);
        }
      }
    }

    return null;
  },

  /**
   * Internal helper to fetch previews for a list of chat IDs
   */
  async getChatPreviewsByIds(chatIdList: string[], userId: string): Promise<ChatPreview[]> {
    if (chatIdList.length === 0) return [];

    // Fetch basic chat rows
    const { data: chatRows, error: chatError } = await supabase
      .from('chats')
      .select('id, display_name, listing_id, last_message_id')
      .in('id', chatIdList);
    if (chatError) throw chatError;

    // Get the latest message details and listing metadata for each chat
    const previews = await Promise.all((chatRows ?? []).map(async chat => {
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let listingTitle = null;
      let listingPrice = null;

      if (chat.listing_id) {
        try {
          const listingData = await ListingService.fetchListingById(chat.listing_id);
          listingTitle = listingData.title;
          listingPrice = listingData.price;
        } catch (err) { throw err }
      }

      const displayPicture = await this.getChatDisplayPictureById(chat.id, userId);

      return {
        id: chat.id,
        displayName: chat.display_name,
        listingId: chat.listing_id,
        listingTitle,
        listingPrice,
        displayPicture,
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.created_at ?? null,
        lastMessengerId: lastMsg?.sender_id ?? null,
      } as ChatPreview;
    }));

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
      const otherUserId = data.user_id;
      try {
        const otherUser = await UserService.getUserRecord(otherUserId);
        return otherUser.avatarUrl || null;
      } catch (e) {
        console.error(`[ChatService] Failed to load user ${otherUserId}:`, e);
        return null;
      }
    }
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
      .insert({
        listing_id: dto.listingId && dto.listingId !== "" ? dto.listingId : null,
        last_message_id: null // Explicitly ensure this is null on creation
      })
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
    // Insert the message into the table
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .insert({
        chat_id: dto.chatId,
        sender_id: dto.senderId,
        content: dto.content,
      })
      .select('id')
      .single();

    if (msgError) {
      throw msgError;
    }

    // Update the chat's last message reference to keep the chats table metadata in sync
    const { error: updateError } = await supabase
      .from('chats')
      .update({ last_message_id: msgData.id })
      .eq('id', dto.chatId);

    if (updateError) {
      throw updateError;
    }
  },

  /**
   * Gets an existing chat between two users, or creates one if it doesn't exist.
   * TODO: Differentiate between casual chats and listing enquiries.
   */
  async getOrCreateChat(dto: { currentUserId: string, otherUserId: string, listingId?: string }): Promise<{ id: string }> {
    // 1. Get all chats the current user is in
    const { data: userChats, error: fetchError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', dto.currentUserId);

    if (fetchError) throw fetchError;

    const chatIds = (userChats ?? []).map(c => c.chat_id);

    if (chatIds.length > 0) {
      // 2. Find chats from that list where the other user is also a participant
      // and the listing_id matches the provided one (or is null if none provided)
      let query = supabase
        .from('chat_participants')
        .select('chat_id, chats!inner(id, listing_id)')
        .in('chat_id', chatIds)
        .eq('user_id', dto.otherUserId);

      if (dto.listingId) {
        query = query.eq('chats.listing_id', dto.listingId);
      } else {
        query = query.is('chats.listing_id', null);
      }

      const { data: matches, error: matchError } = await query;
      if (matchError) throw matchError;

      if (matches && matches.length > 0) {
        // If multiple chats found (e.g. a group chat and a private chat both having listing_id=null)
        // we want to find the one that is strictly 1-on-1 (2 participants)
        for (const match of matches) {
          const { count, error: countError } = await supabase
            .from('chat_participants')
            .select('user_id', { count: 'exact', head: true })
            .eq('chat_id', match.chat_id);

          if (!countError && count === 2) {
            return { id: match.chat_id };
          }
        }

        // If we found a match with a listingId, it's almost certainly the one we want
        if (dto.listingId) {
          return { id: matches[0].chat_id };
        }
      }
    }

    // 3. Create new chat if no suitable existing one found
    const chatId = await this.createChat({
      participantIds: [dto.currentUserId, dto.otherUserId],
      listingId: dto.listingId,
    });

    return { id: chatId };
  },

};