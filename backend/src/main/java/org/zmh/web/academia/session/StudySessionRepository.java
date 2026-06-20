package org.zmh.web.academia.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    Optional<StudySession> findByUserIdAndSessionStatus(Long userId, SessionStatus status);

    long countByUserId(Long userId);

    List<StudySession> findByUserIdOrderByStartedAtDesc(Long userId);

    @Query("SELECT SUM(s.actualSecondsStudied) FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.sessionStatus = org.zmh.web.academia.session.SessionStatus.COMPLETED " +
           "AND s.startedAt >= :dayStart AND s.startedAt < :dayEnd")
    Long sumSecondsToday(@Param("userId") Long userId,
                         @Param("dayStart") LocalDateTime dayStart,
                         @Param("dayEnd") LocalDateTime dayEnd);

    @Query("SELECT SUM(s.actualSecondsStudied) FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.sessionStatus = org.zmh.web.academia.session.SessionStatus.COMPLETED " +
           "AND s.startedAt >= :weekStart")
    Long sumSecondsThisWeek(@Param("userId") Long userId, @Param("weekStart") LocalDateTime weekStart);

    @Query("SELECT SUM(s.actualSecondsStudied) FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.sessionStatus = org.zmh.web.academia.session.SessionStatus.COMPLETED " +
           "AND s.startedAt >= :monthStart")
    Long sumSecondsThisMonth(@Param("userId") Long userId, @Param("monthStart") LocalDateTime monthStart);

    @Query("SELECT COUNT(s) FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.sessionStatus = org.zmh.web.academia.session.SessionStatus.COMPLETED " +
           "AND s.startedAt >= :dayStart AND s.startedAt < :dayEnd")
    long countSessionsToday(@Param("userId") Long userId,
                            @Param("dayStart") LocalDateTime dayStart,
                            @Param("dayEnd") LocalDateTime dayEnd);

    @Query("SELECT SUM(s.actualSecondsStudied) FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.sessionStatus = org.zmh.web.academia.session.SessionStatus.COMPLETED")
    Long sumSecondsTotal(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT s.group.id) FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.group IS NOT NULL")
    long countDistinctGroupsStudied(@Param("userId") Long userId);

    @Query("SELECT s FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.sessionStatus = org.zmh.web.academia.session.SessionStatus.COMPLETED " +
           "AND s.startedAt >= :since ORDER BY s.startedAt ASC")
    List<StudySession> findCompletedSince(
            @Param("userId") Long userId,
            @Param("since") LocalDateTime since);
}
