(async function () {
    if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
        // The wake lock sentinel.
        let wakeLock = null;

        // Function that attempts to request a screen wake lock.
        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => {
                    console.log('[wakeLock] Screen Wake Lock was released');
                });
                console.log('[wakeLock] Screen Wake Lock is active');
                // …and release it again after 5s.
                // window.setTimeout(() => {
                //     wakeLock.release();
                //     wakeLock = null;
                // }, 5000);
            } catch (err) {
                console.error(`[wakeLock] ${err.name}, ${err.message}`);
            }
        };

        // Request a screen wake lock…
        await requestWakeLock();

        const handleVisibilityChange = () => {
            console.log(`[wakeLock] document.visibilityState: ${document.visibilityState}`); // 'visible' or 'hidden'
            
            if (wakeLock !== null && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
        console.log('[wakeLock] Browser not supported');
    }
})();

