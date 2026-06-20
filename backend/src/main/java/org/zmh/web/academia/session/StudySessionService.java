package org.zmh.web.academia.session;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zmh.web.academia.exception.BadRequestException;
import org.zmh.web.academia.exception.ResourceNotFoundException;
import org.zmh.web.academia.group.Group;
import org.zmh.web.academia.group.GroupRepository;
import org.zmh.web.academia.session.SessionDto.*;
import org.zmh.web.academia.user.User;
import org.zmh.web.academia.user.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    @Transactional
    public SessionResponse startSession(Long userId, StartSessionRequest req) {
        // Enforce one active session
        Optional<StudySession> existing = sessionRepository.findByUserIdAndSessionStatus(userId, SessionStatus.ACTIVE);
        if (existing.isPresent()) {
            throw new BadRequestException("You already have an active study session. End it before starting a new one.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = null;
        if (req.groupId() != null) {
            group = groupRepository.findById(req.groupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        }

        StudySession session = StudySession.builder()
                .user(user)
                .group(group)
                .sessionType(req.sessionType())
                .sessionStatus(SessionStatus.ACTIVE)
                .plannedStudySeconds(req.plannedStudySeconds())
                .plannedBreakSeconds(req.plannedBreakSeconds())
                .startedAt(LocalDateTime.now())
                .build();

        return toResponse(sessionRepository.save(session));
    }

    @Transactional
    public SessionResponse endSession(Long sessionId, Long userId, EndSessionRequest req) {
        StudySession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getUser().getId().equals(userId)) {
            throw new BadRequestException("Not your session");
        }
        if (session.getSessionStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Session is already ended");
        }
        if (req.endStatus() == SessionStatus.ACTIVE) {
            throw new BadRequestException("End status cannot be ACTIVE");
        }

        session.setSessionStatus(req.endStatus());
        session.setActualSecondsStudied(req.actualSecondsStudied());
        session.setEndedAt(LocalDateTime.now());

        return toResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public Optional<SessionResponse> getActiveSession(Long userId) {
        return sessionRepository.findByUserIdAndSessionStatus(userId, SessionStatus.ACTIVE)
                .map(this::toResponse);
    }

    private SessionResponse toResponse(StudySession s) {
        return new SessionResponse(
                s.getId(),
                s.getUser().getId(),
                s.getGroup() != null ? s.getGroup().getId() : null,
                s.getSessionType().name(),
                s.getSessionStatus().name(),
                s.getPlannedStudySeconds(),
                s.getPlannedBreakSeconds(),
                s.getStartedAt().toString(),
                s.getEndedAt() != null ? s.getEndedAt().toString() : null,
                s.getActualSecondsStudied()
        );
    }
}
