/**
 * Calculate live membership duration from a joinedAt timestamp or date.
 * Handles Firestore Timestamp, Date object, ISO string, or {_seconds} object.
 */
export const getMembershipDuration = (joinedAtInput) => {
    // Default safe fallback if joinedAt is null/invalid
    const safeDefault = {
        years: 0,
        months: 0,
        days: 0,
        totalDays: 0,
        formattedString: 'Today! Welcome to the community!',
        joinedDate: 'Recently'
    };

    if (!joinedAtInput) return safeDefault;

    let startDate;

    try {
        if (typeof joinedAtInput.toDate === 'function') {
            startDate = joinedAtInput.toDate();
        } else if (joinedAtInput instanceof Date) {
            startDate = joinedAtInput;
        } else if (typeof joinedAtInput === 'number') {
            startDate = new Date(joinedAtInput);
        } else if (typeof joinedAtInput === 'string') {
            startDate = new Date(joinedAtInput);
        } else if (joinedAtInput._seconds || joinedAtInput.seconds) {
            const secs = joinedAtInput._seconds || joinedAtInput.seconds;
            startDate = new Date(secs * 1000);
        } else {
            return safeDefault;
        }
    } catch {
        return safeDefault;
    }

    if (!startDate || isNaN(startDate.getTime())) {
        return safeDefault;
    }

    const now = new Date();
    if (startDate > now) {
        // If timestamp is slightly in future due to clock drift
        startDate = now;
    }

    const diffTime = Math.abs(now - startDate);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Formatted joined date (e.g., "15 August 2024")
    const joinedDateStr = startDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Calendar diff calculation
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();

    if (days < 0) {
        months -= 1;
        // Days in previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    // Format string construction
    let formattedString = '';

    if (totalDays === 0) {
        formattedString = 'Today! Welcome to the community!';
    } else if (totalDays === 1) {
        formattedString = '1 day';
    } else if (totalDays < 30) {
        formattedString = `${totalDays} days`;
    } else if (years === 0) {
        if (days === 0) {
            formattedString = `${months} ${months === 1 ? 'month' : 'months'}`;
        } else {
            formattedString = `${months} ${months === 1 ? 'month' : 'months'}, ${days} ${days === 1 ? 'day' : 'days'}`;
        }
    } else {
        const yStr = `${years} ${years === 1 ? 'year' : 'years'}`;
        const mStr = months > 0 ? `, ${months} ${months === 1 ? 'month' : 'months'}` : '';
        const dStr = days > 0 ? `, ${days} ${days === 1 ? 'day' : 'days'}` : '';
        formattedString = `${yStr}${mStr}${dStr}`;
    }

    return {
        years,
        months,
        days,
        totalDays,
        formattedString,
        joinedDate: joinedDateStr
    };
};

/**
 * Calculate highest membership milestone achieved based on total days.
 */
export const getMilestone = (totalDays) => {
    if (typeof totalDays !== 'number' || totalDays < 30) {
        return null;
    }

    const milestones = [
        { minDays: 1095, label: '3 Year Member', emoji: '💎' },
        { minDays: 730, label: '2 Year Member', emoji: '👑' },
        { minDays: 365, label: '1 Year Member', emoji: '🏆' },
        { minDays: 180, label: '6 Month Member', emoji: '⭐' },
        { minDays: 30, label: '1 Month Member', emoji: '🎉' }
    ];

    for (const m of milestones) {
        if (totalDays >= m.minDays) {
            return { label: m.label, emoji: m.emoji };
        }
    }

    return null;
};
