package org.zmh.web.academia.dashboard;

import java.util.List;

public class DashboardDto {

    public record DashboardResponse(
            // Today
            long todaySeconds,
            long sessionsCompletedToday,
            // Week
            long weekSeconds,
            long weekAverageSecondsPerDay,
            // Month
            long monthSeconds,
            long monthAverageSecondsPerDay,
            // Streaks
            int currentStreakDays,
            int longestStreakDays,
            // Overall
            long totalSeconds,
            long totalSessions,
            long groupsJoined,
            // Charts
            ChartData charts
    ) {}

    public record ChartData(
            List<DayEntry> daily,
            List<WeekEntry> weekly,
            List<MonthEntry> monthly
    ) {}

    public record DayEntry(String date, long seconds) {}
    public record WeekEntry(String label, long seconds) {}
    public record MonthEntry(String month, long seconds) {}
}
