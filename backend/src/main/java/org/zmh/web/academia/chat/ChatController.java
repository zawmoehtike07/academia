package org.zmh.web.academia.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.zmh.web.academia.chat.ChatDto.*;
import org.zmh.web.academia.security.UserPrincipal;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.security.Principal;

/**
 * WebSocket chat controller.
 * Clients connect to /ws and publish to /app/chat/{groupId}
 * Messages are broadcast to /topic/group/{groupId}
 */
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat/{groupId}")
    public void sendMessage(
            @DestinationVariable Long groupId,
            @Payload SendMessageRequest req,
            Principal principal) {
        UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
        UserPrincipal user = (UserPrincipal) auth.getPrincipal();
        chatService.sendMessage(groupId, user.getId(), req);
    }
}
