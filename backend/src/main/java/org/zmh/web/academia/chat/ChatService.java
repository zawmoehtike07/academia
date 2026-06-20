package org.zmh.web.academia.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zmh.web.academia.chat.ChatDto.*;
import org.zmh.web.academia.exception.BadRequestException;
import org.zmh.web.academia.exception.ForbiddenException;
import org.zmh.web.academia.exception.ResourceNotFoundException;
import org.zmh.web.academia.group.Group;
import org.zmh.web.academia.group.GroupMemberRepository;
import org.zmh.web.academia.group.GroupRepository;
import org.zmh.web.academia.user.User;
import org.zmh.web.academia.user.UserRepository;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponse sendMessage(Long groupId, Long userId, SendMessageRequest req) {
        requireMember(groupId, userId);
        if (req.content() == null || req.content().isBlank()) {
            throw new BadRequestException("Message content cannot be empty");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MessageType msgType = req.messageType() != null ? req.messageType() : MessageType.USER_MESSAGE;

        Message message = Message.builder()
                .group(group)
                .sender(sender)
                .content(req.content().trim())
                .messageType(msgType)
                .build();

        message = messageRepository.save(message);
        MessageResponse response = toResponse(message);

        // Broadcast to all group subscribers
        messagingTemplate.convertAndSend("/topic/groups/" + groupId, response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getHistory(Long groupId, Long userId, int page, int size) {
        requireMember(groupId, userId);
        List<MessageResponse> messages = messageRepository
                .findByGroupIdOrderByCreatedAtDesc(groupId, PageRequest.of(page, size))
                .stream()
                .map(this::toResponse)
                .toList();
        // Reverse to chronological order
        List<MessageResponse> result = new java.util.ArrayList<>(messages);
        Collections.reverse(result);
        return result;
    }

    @Transactional
    public MessageResponse editMessage(Long groupId, Long messageId, Long userId, EditMessageRequest req) {
        requireMember(groupId, userId);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getSender().getId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own messages");
        }
        if (req.content() == null || req.content().isBlank()) {
            throw new BadRequestException("Message content cannot be empty");
        }
        message.setContent(req.content().trim());
        message.setEdited(true);
        message = messageRepository.save(message);

        MessageResponse response = toResponse(message);
        messagingTemplate.convertAndSend("/topic/groups/" + groupId, response);
        return response;
    }

    @Transactional
    public void deleteMessage(Long groupId, Long messageId, Long userId) {
        requireMember(groupId, userId);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        boolean isSender = message.getSender().getId().equals(userId);
        boolean isOwner = message.getGroup().getOwner() != null &&
                message.getGroup().getOwner().getId().equals(userId);
        if (!isSender && !isOwner) {
            throw new ForbiddenException("You cannot delete this message");
        }
        messageRepository.delete(message);
        messagingTemplate.convertAndSend("/topic/groups/" + groupId,
                new MessageResponse(messageId, groupId, null, null, null, null, false, null, null));
    }

    private void requireMember(Long groupId, Long userId) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new ForbiddenException("You are not a member of this group");
        }
    }

    private MessageResponse toResponse(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getGroup().getId(),
                m.getSender().getId(),
                m.getSender().getUsername(),
                m.getContent(),
                m.getMessageType().name(),
                m.isEdited(),
                m.getCreatedAt().toString(),
                m.getUpdatedAt().toString()
        );
    }
}
