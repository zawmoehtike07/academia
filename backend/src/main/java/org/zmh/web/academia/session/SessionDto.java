package org.zmh.web.academia.session;

import jakarta.validation.constraints.NotNull;

public class SessionDto {

    public record StartSessionRequest(
            @NotNull SessionType sessionType,
            Long groupId,
            Integer plannedStudySeconds,
            Integer plannedBreakSeconds
    ) {}

    public record EndSessionRequest(
            @NotNull int actualSecondsStudied,
            @NotNull SessionStatus endStatus    // COMPLETED or ABANDONED
    ) {}

    public record SessionResponse(
            Long id,
            Long userId,
            Long groupId,
            String sessionType,
            String sessionStatus,
            Integer plannedStudySeconds,
            Integer plannedBreakSeconds,
            String startedAt,
            String endedAt,
            int actualSecondsStudied
    ) {}
}
