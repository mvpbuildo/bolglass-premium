import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;
    console.log(`[i18n] Loading config for locale: ${locale}`);

    // Ensure that a valid locale is used
    if (!locale || !['en', 'de', 'pl'].includes(locale)) {
        console.warn(`[i18n] Invalid locale detected: ${locale}, falling back to 'pl'`);
        locale = 'pl';
    }

    try {
        const messages = (await import(`../../messages/${locale}.json`)).default;
        console.log(`[i18n] Successfully loaded messages for: ${locale}`);
        return {
            locale,
            messages
        };
    } catch (error) {
        console.error(`[i18n] ERROR loading messages for ${locale}:`, error);
        // Fallback to empty messages to prevent total crash
        return {
            locale,
            messages: {}
        };
    }
});
