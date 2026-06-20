package org.zmh.web.academia.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByGroupIdOrderByCreatedAtDesc(Long groupId, Pageable pageable);
}
