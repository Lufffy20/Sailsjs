module.exports.cron = {
    myFirstJob: {
        schedule: '* * * * *', // Run every minute
        onTick: async function () {
            sails.log.info('[CRON] Starting Check Expired Carts Job...');
            try {
                await sails.helpers.checkExpiredCarts();
                sails.log.info('[CRON] Check Expired Carts Job Completed.');
            } catch (err) {
                sails.log.error('[CRON] Check Expired Carts Job Failed:', err);
            }
        }
    }
};
