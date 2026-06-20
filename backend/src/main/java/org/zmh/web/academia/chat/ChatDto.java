package org.zmh.web.academia.chat;

public class ChatDto {

    // Sent by client over WebSocket
    public record SendMessageRequest(String content, MessageType messageType) {}

    // Sent to all subscribers
    public record MessageResponse(
            Long id,
            Long groupId,
            Long senderId,
            String senderUsername,
            String content,
            String messageType,
            boolean edited,
            String createdAt,
            String updatedAt
    ) {}

    public record EditMessageRequest(String content) {}
}
