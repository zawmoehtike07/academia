package org.zmh.web.academia.chat;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zmh.web.academia.chat.ChatDto.*;
import org.zmh.web.academia.security.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getHistory(groupId, principal.getId(), page, size));
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<MessageResponse> editMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId,
            @PathVariable Long messageId,
            @Valid @RequestBody EditMessageRequest req) {
        return ResponseEntity.ok(chatService.editMessage(groupId, messageId, principal.getId(), req));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId,
            @PathVariable Long messageId) {
        chatService.deleteMessage(groupId, messageId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
