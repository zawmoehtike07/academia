package org.zmh.web.academia.session;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zmh.web.academia.session.SessionDto.*;
import org.zmh.web.academia.security.UserPrincipal;

@RestController
@RequestMapping("/api/study-sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studySessionService;

    @PostMapping("/start")
    public ResponseEntity<SessionResponse> start(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody StartSessionRequest req) {
        return ResponseEntity.ok(studySessionService.startSession(principal.getId(), req));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<SessionResponse> end(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody EndSessionRequest req) {
        return ResponseEntity.ok(studySessionService.endSession(id, principal.getId(), req));
    }

    @GetMapping("/active")
    public ResponseEntity<SessionResponse> getActive(@AuthenticationPrincipal UserPrincipal principal) {
        return studySessionService.getActiveSession(principal.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
