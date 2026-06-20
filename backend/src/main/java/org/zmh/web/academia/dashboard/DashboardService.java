package org.zmh.web.academia.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zmh.web.academia.group.GroupMemberRepository;
import org.zmh.web.academia.session.StudySession;
import org.zmh.web.academia.session.StudySessionRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final StudySessionRepository sessionRepository;
    private final GroupMemberRepository groupMemberRepository;

    public DashboardDto.DashboardResponse getDashboard(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd   = todayStart.plusDays(1);

        LocalDateTime weekStart  = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();

        // ---- Today ----
        long todaySeconds  = nullToZero(sessionRepository.sumSecondsToday(userId, todayStart, todayEnd));
        long sessionsToday = sessionRepository.countSessionsToday(userId, todayStart, todayEnd);

        // ---- Week ----
        long weekSeconds = nullToZero(sessionRepository.sumSecondsThisWeek(userId, weekStart));
        long weekDays    = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(weekStart.toLocalDate(), today) + 1);

        // ---- Month ----
        long monthSeconds = nullToZero(sessionRepository.sumSecondsThisMonth(userId, monthStart));
        long monthDays    = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(monthStart.toLocalDate(), today) + 1);

        // ---- Total ----
        long totalSeconds  = nullToZero(sessionRepository.sumSecondsTotal(userId));
        long totalSessions = sessionRepository.countByUserId(userId);
        long groupsJoined  = groupMemberRepository.countByUserId(userId);

        // ---- Streaks ----
        int[] streaks = calculateStreaks(userId, now);
        int currentStreak = streaks[0];
        int longestStreak = streaks[1];

        // ---- Charts ----
        DashboardDto.ChartData charts = buildChartData(userId, now, today);

        return new DashboardDto.DashboardResponse(
                todaySeconds, sessionsToday,
                weekSeconds, weekSeconds / weekDays,
                monthSeconds, monthSeconds / monthDays,
                currentStreak, longestStreak,
                totalSeconds, totalSessions, groupsJoined,
                charts
        );
    }

    // ---- streak logic ----
    private int[] calculateStreaks(Long userId, LocalDateTime now) {
        LocalDateTime since = now.minusDays(365);
        List<StudySession> sessions = sessionRepository.findCompletedSince(userId, since);

        Set<LocalDate> studyDays = sessions.stream()
                .map(s -> s.getStartedAt().toLocalDate())
                .collect(Collectors.toSet());

        LocalDate today = now.toLocalDate();
        int current = 0;
        LocalDate cursor = today;
        while (studyDays.contains(cursor)) {
            current++;
            cursor = cursor.minusDays(1);
        }

        int longest = 0;
        int run = 0;
        List<LocalDate> sorted = new ArrayList<>(studyDays);
        Collections.sort(sorted);
        LocalDate prev = null;
        for (LocalDate d : sorted) {
            if (prev != null && d.equals(prev.plusDays(1))) {
                run++;
            } else {
                run = 1;
            }
            longest = Math.max(longest, run);
            prev = d;
        }

        return new int[]{current, longest};
    }

    // ---- chart data ----
    private DashboardDto.ChartData buildChartData(Long userId, LocalDateTime now, LocalDate today) {
        // Last 7 days
        LocalDateTime sevenDaysAgo = today.minusDays(6).atStartOfDay();
        List<StudySession> recent = sessionRepository.findCompletedSince(userId, sevenDaysAgo);

        Map<LocalDate, Long> byDay = recent.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getStartedAt().toLocalDate(),
                        Collectors.summingLong(StudySession::getActualSecondsStudied)));

        List<DashboardDto.DayEntry> daily = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            daily.add(new DashboardDto.DayEntry(d.toString(), byDay.getOrDefault(d, 0L)));
        }

        // Last 4 weeks
        LocalDateTime fourWeeksAgo = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .minusWeeks(3).atStartOfDay();
        List<StudySession> weeklyData = sessionRepository.findCompletedSince(userId, fourWeeksAgo);

        List<DashboardDto.WeekEntry> weekly = new ArrayList<>();
        for (int w = 3; w >= 0; w--) {
            LocalDate wStartDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).minusWeeks(w);
            LocalDateTime wStart = wStartDate.atStartOfDay();
            LocalDateTime wEnd   = wStart.plusWeeks(1);
            long wSeconds = weeklyData.stream()
                    .filter(s -> !s.getStartedAt().isBefore(wStart) && s.getStartedAt().isBefore(wEnd))
                    .mapToLong(StudySession::getActualSecondsStudied).sum();
            weekly.add(new DashboardDto.WeekEntry(wStartDate.toString(), wSeconds));
        }

        // Last 12 months
        LocalDateTime twelveMonthsAgo = today.minusMonths(11).withDayOfMonth(1).atStartOfDay();
        List<StudySession> annual = sessionRepository.findCompletedSince(userId, twelveMonthsAgo);

        List<DashboardDto.MonthEntry> monthly = new ArrayList<>();
        for (int m = 11; m >= 0; m--) {
            LocalDate mDate = today.minusMonths(m);
            LocalDateTime mStart = mDate.withDayOfMonth(1).atStartOfDay();
            LocalDateTime mEnd   = mStart.plusMonths(1);
            long mSeconds = annual.stream()
                    .filter(s -> !s.getStartedAt().isBefore(mStart) && s.getStartedAt().isBefore(mEnd))
                    .mapToLong(StudySession::getActualSecondsStudied).sum();
            monthly.add(new DashboardDto.MonthEntry(mDate.getMonth().name() + " " + mDate.getYear(), mSeconds));
        }

        return new DashboardDto.ChartData(daily, weekly, monthly);
    }

    private long nullToZero(Long val) {
        return val == null ? 0L : val;
    }
}
